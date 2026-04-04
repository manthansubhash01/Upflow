import mongoose from "mongoose";
import { z } from "zod";
import { ApiError } from "../../utils/ApiError";
import { SocketManager } from "../../sockets/socketManager";
import { UserModel } from "../auth/model";
import { WorkspaceModel } from "../workspace/model";
import { JoinRequestModel } from "./model";

const workspaceIdSchema = z.object({
  workspaceId: z.string().min(1),
});

const requestIdSchema = z.object({
  requestId: z.string().min(1),
});

const searchSchema = z.object({
  q: z.string().trim().max(100).optional().default(""),
});

export class JoinRequestService {
  private readonly sockets = SocketManager.getInstance();

  private async assertWorkspaceAdmin(workspaceId: string, userId: string) {
    const workspace = await WorkspaceModel.findOne({
      _id: workspaceId,
      members: { $elemMatch: { userId, role: "ADMIN" } },
    }).select("name members");

    if (!workspace) {
      throw new ApiError(403, "Only workspace admins can perform this action");
    }

    return workspace;
  }

  async searchWorkspaces(userId: string, query: unknown) {
    const { q } = searchSchema.parse(query);
    const regex = q
      ? new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
      : null;

    const workspaces = await WorkspaceModel.find({
      discoverability: "PUBLIC",
      ...(regex ? { name: regex } : {}),
      members: {
        $not: { $elemMatch: { userId: new mongoose.Types.ObjectId(userId) } },
      },
    })
      .select("name description logo members")
      .sort({ name: 1 })
      .limit(20)
      .lean();

    const workspaceIds = workspaces.map((workspace) => workspace._id);
    const pendingRequests = await JoinRequestModel.find({
      userId: new mongoose.Types.ObjectId(userId),
      workspaceId: { $in: workspaceIds },
      status: "PENDING",
    })
      .select("workspaceId")
      .lean();

    const pendingWorkspaceIds = new Set(
      pendingRequests.map((request) => request.workspaceId.toString()),
    );

    return workspaces.map((workspace) => ({
      id: workspace._id.toString(),
      name: workspace.name,
      description: workspace.description || "",
      memberCount: (workspace.members || []).length,
      logo: workspace.logo || null,
      hasPendingRequest: pendingWorkspaceIds.has(workspace._id.toString()),
    }));
  }

  async requestToJoin(userId: string, workspaceId: string) {
    const parsed = workspaceIdSchema.parse({ workspaceId });

    const workspace = await WorkspaceModel.findById(parsed.workspaceId).select(
      "name discoverability members",
    );

    if (!workspace) {
      throw new ApiError(404, "Workspace not found");
    }

    if (workspace.discoverability !== "PUBLIC") {
      throw new ApiError(403, "This workspace is private and invite-only");
    }

    const isMember = workspace.members.some(
      (member) => member.userId.toString() === userId,
    );

    if (isMember) {
      throw new ApiError(409, "You are already a member of this workspace");
    }

    const existingPendingRequest = await JoinRequestModel.findOne({
      workspaceId: workspace._id,
      userId: new mongoose.Types.ObjectId(userId),
      status: "PENDING",
    });

    if (existingPendingRequest) {
      return {
        requestId: existingPendingRequest.id,
        alreadyPending: true,
      };
    }

    const request = await JoinRequestModel.create({
      workspaceId: workspace._id,
      userId: new mongoose.Types.ObjectId(userId),
      requestedBy: new mongoose.Types.ObjectId(userId),
      status: "PENDING",
    });

    const requester = await UserModel.findById(userId).select("name email");

    if (requester) {
      const adminIds = workspace.members
        .filter((member) => member.role === "ADMIN")
        .map((member) => member.userId.toString());

      adminIds.forEach((adminId) => {
        this.sockets.emitToUser(adminId, "workspace:join-request", {
          requestId: request.id,
          workspaceId: workspace.id,
          workspaceName: workspace.name,
          requester: {
            id: requester.id,
            name: requester.name,
            email: requester.email,
            image: null,
          },
        });
      });
    }

    return {
      requestId: request.id,
      alreadyPending: false,
    };
  }

  async listPendingWorkspaceRequests(userId: string, workspaceId: string) {
    const parsed = workspaceIdSchema.parse({ workspaceId });
    await this.assertWorkspaceAdmin(parsed.workspaceId, userId);

    const requests = await JoinRequestModel.find({
      workspaceId: parsed.workspaceId,
      status: "PENDING",
    })
      .sort({ createdAt: -1 })
      .select("workspaceId userId createdAt status")
      .lean();

    const requesterIds = requests.map((request) => request.userId.toString());
    const users = await UserModel.find({ _id: { $in: requesterIds } }).select(
      "name email",
    );
    const userMap = new Map(users.map((user) => [user.id, user]));

    return requests.map((request) => {
      const requester = userMap.get(request.userId.toString());

      return {
        id: request._id.toString(),
        workspaceId: request.workspaceId.toString(),
        userId: request.userId.toString(),
        status: request.status,
        createdAt: request.createdAt.toISOString(),
        requester: {
          id: requester?.id || request.userId.toString(),
          name: requester?.name || "Unknown user",
          email: requester?.email || "",
          image: null,
        },
      };
    });
  }

  async acceptRequest(userId: string, requestId: string) {
    const parsed = requestIdSchema.parse({ requestId });
    const joinRequest = await JoinRequestModel.findById(parsed.requestId);

    if (!joinRequest) {
      throw new ApiError(404, "Join request not found");
    }

    if (joinRequest.status !== "PENDING") {
      throw new ApiError(409, "This join request is already resolved");
    }

    const workspace = await this.assertWorkspaceAdmin(
      joinRequest.workspaceId.toString(),
      userId,
    );

    const alreadyMember = workspace.members.some(
      (member) => member.userId.toString() === joinRequest.userId.toString(),
    );

    if (!alreadyMember) {
      await WorkspaceModel.updateOne(
        { _id: workspace._id },
        {
          $addToSet: {
            members: {
              userId: joinRequest.userId,
              role: "MEMBER",
            },
          },
        },
      );

      await UserModel.findByIdAndUpdate(joinRequest.userId, {
        $addToSet: { workspaces: workspace._id },
      });
    }

    joinRequest.status = "ACCEPTED";
    await joinRequest.save();

    this.sockets.emitToUser(
      joinRequest.userId.toString(),
      "workspace:join-request-accepted",
      {
        workspaceId: workspace.id,
        workspaceName: workspace.name,
      },
    );

    return {
      requestId: joinRequest.id,
      workspaceId: workspace.id,
      status: joinRequest.status,
      alreadyMember,
    };
  }

  async rejectRequest(userId: string, requestId: string) {
    const parsed = requestIdSchema.parse({ requestId });
    const joinRequest = await JoinRequestModel.findById(parsed.requestId);

    if (!joinRequest) {
      throw new ApiError(404, "Join request not found");
    }

    if (joinRequest.status !== "PENDING") {
      throw new ApiError(409, "This join request is already resolved");
    }

    const workspace = await this.assertWorkspaceAdmin(
      joinRequest.workspaceId.toString(),
      userId,
    );

    joinRequest.status = "REJECTED";
    await joinRequest.save();

    this.sockets.emitToUser(
      joinRequest.userId.toString(),
      "workspace:join-request-rejected",
      {
        workspaceId: workspace.id,
        workspaceName: workspace.name,
      },
    );

    return {
      requestId: joinRequest.id,
      workspaceId: workspace.id,
      status: joinRequest.status,
    };
  }
}
