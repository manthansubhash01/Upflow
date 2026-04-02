import mongoose from "mongoose";
import { z } from "zod";
import { ApiError } from "../../utils/ApiError";
import { UserModel } from "../auth/model";
import { CommentModel } from "../comment/model";
import { InvitationModel } from "../invitation/invitation.model";
import { JoinRequestModel } from "../joinRequest/model";
import { ProjectModel } from "../project/model";
import { TaskModel } from "../task/model";
import { WorkspaceModel, WorkspaceRole } from "./model";

const createWorkspaceSchema = z.object({
  name: z.string().min(2),
  description: z.string().trim().max(500).optional().default(""),
  discoverability: z.enum(["PUBLIC", "PRIVATE"]).optional().default("PUBLIC"),
});

const updateWorkspaceSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(2).optional(),
  description: z.string().trim().max(500).optional(),
  discoverability: z.enum(["PUBLIC", "PRIVATE"]).optional(),
});

const promoteMemberSchema = z.object({
  workspaceId: z.string().min(1),
  memberId: z.string().min(1),
});

const workspaceIdSchema = z.object({
  workspaceId: z.string().min(1),
});

export class WorkspaceService {
  constructor() {}

  private async assertWorkspaceAccess(userId: string, workspaceId: string) {
    const workspace = await WorkspaceModel.findOne({
      _id: workspaceId,
      "members.userId": userId,
    });

    if (!workspace) {
      throw new ApiError(403, "You do not have access to this workspace");
    }

    return workspace;
  }

  async createWorkspace(userId: string, payload: unknown) {
    const data = createWorkspaceSchema.parse(payload);

    const workspace = await WorkspaceModel.create({
      name: data.name,
      description: data.description,
      discoverability: data.discoverability,
      ownerId: userId,
      members: [{ userId, role: "ADMIN" as WorkspaceRole }],
    });

    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { workspaces: workspace._id },
    });

    return workspace;
  }

  async listWorkspaces(userId: string) {
    return WorkspaceModel.find({ "members.userId": userId }).select(
      "name description logo discoverability ownerId members",
    );
  }

  async updateWorkspaceSettings(userId: string, payload: unknown) {
    const data = updateWorkspaceSchema.parse(payload);

    const workspace = await WorkspaceModel.findOne({
      _id: data.workspaceId,
      members: { $elemMatch: { userId, role: "ADMIN" } },
    });

    if (!workspace) {
      throw new ApiError(403, "Only admins can update workspace settings");
    }

    if (data.name !== undefined) {
      workspace.name = data.name;
    }

    if (data.description !== undefined) {
      workspace.description = data.description;
    }

    if (data.discoverability !== undefined) {
      workspace.discoverability = data.discoverability;
    }

    await workspace.save();

    return workspace;
  }

  async promoteMember(userId: string, payload: unknown) {
    const data = promoteMemberSchema.parse(payload);

    const workspace = await WorkspaceModel.findOne({
      _id: data.workspaceId,
      members: { $elemMatch: { userId, role: "ADMIN" } },
    });

    if (!workspace) {
      throw new ApiError(403, "Only admins can promote members");
    }

    const targetMember = workspace.members.find(
      (member) => member.userId.toString() === data.memberId,
    );

    if (!targetMember) {
      throw new ApiError(404, "Member not found in workspace");
    }

    targetMember.role = "ADMIN";
    await workspace.save();

    return {
      workspaceId: workspace.id,
      memberId: data.memberId,
      role: "ADMIN" as WorkspaceRole,
    };
  }

  async getWorkspaceMembers(userId: string, workspaceId: string) {
    const data = workspaceIdSchema.parse({ workspaceId });
    const workspace = await this.assertWorkspaceAccess(
      userId,
      data.workspaceId,
    );

    const memberIds = workspace.members.map((member) =>
      member.userId.toString(),
    );
    const users = await UserModel.find({ _id: { $in: memberIds } }).select(
      "name email",
    );
    const userMap = new Map(users.map((entry) => [entry.id, entry]));

    return workspace.members.map((member) => {
      const memberUserId = member.userId.toString();
      const profile = userMap.get(memberUserId);

      return {
        userId: memberUserId,
        role: member.role,
        name: profile?.name || "Unknown user",
        email: profile?.email || "",
      };
    });
  }

  async getWorkspaceActivity(userId: string, workspaceId: string) {
    const data = workspaceIdSchema.parse({ workspaceId });
    await this.assertWorkspaceAccess(userId, data.workspaceId);

    const [projects, tasks, comments, invitations, joinRequests] =
      await Promise.all([
        ProjectModel.find({ workspaceId: data.workspaceId })
          .sort({ createdAt: -1 })
          .limit(15)
          .select("name createdAt"),
        TaskModel.find({ workspaceId: data.workspaceId })
          .sort({ updatedAt: -1 })
          .limit(20)
          .select("title status updatedAt createdAt"),
        CommentModel.find({ workspaceId: data.workspaceId })
          .sort({ createdAt: -1 })
          .limit(20)
          .select("content userId createdAt"),
        InvitationModel.find({ workspaceId: data.workspaceId })
          .sort({ createdAt: -1 })
          .limit(20)
          .select("email invitedBy status createdAt"),
        JoinRequestModel.find({ workspaceId: data.workspaceId })
          .sort({ createdAt: -1 })
          .limit(20)
          .select("userId status createdAt"),
      ]);

    const actorIds = new Set<string>();
    comments.forEach((entry) => actorIds.add(entry.userId.toString()));
    invitations.forEach((entry) => actorIds.add(entry.invitedBy.toString()));
    joinRequests.forEach((entry) => actorIds.add(entry.userId.toString()));

    const actors = await UserModel.find({ _id: { $in: [...actorIds] } }).select(
      "name",
    );
    const actorMap = new Map(actors.map((entry) => [entry.id, entry.name]));

    const projectEvents = projects.map((project: any) => ({
      id: `project-${project.id}`,
      type: "PROJECT",
      message: `Project \"${project.name}\" was created`,
      createdAt: project.createdAt,
    }));

    const taskEvents = tasks.map((task: any) => ({
      id: `task-${task.id}-${task.updatedAt?.toISOString() || task.createdAt?.toISOString() || ""}`,
      type: "TASK",
      message: `Task \"${task.title}\" is ${task.status.replace("_", " ").toLowerCase()}`,
      createdAt: task.updatedAt || task.createdAt,
    }));

    const commentEvents = comments.map((comment: any) => ({
      id: `comment-${comment.id}`,
      type: "COMMENT",
      message: `${actorMap.get(comment.userId.toString()) || "A member"} commented: ${comment.content}`,
      createdAt: comment.createdAt,
    }));

    const invitationEvents = invitations.map((invitation: any) => ({
      id: `invite-${invitation.id}`,
      type: "INVITATION",
      message: `${actorMap.get(invitation.invitedBy.toString()) || "A member"} invited ${invitation.email} (${invitation.status.toLowerCase()})`,
      createdAt: invitation.createdAt,
    }));

    const joinRequestEvents = joinRequests.map((joinRequest: any) => ({
      id: `join-request-${joinRequest.id}`,
      type: "JOIN_REQUEST",
      message: `${actorMap.get(joinRequest.userId.toString()) || "A user"} requested to join (${joinRequest.status.toLowerCase()})`,
      createdAt: joinRequest.createdAt,
    }));

    return [
      ...projectEvents,
      ...taskEvents,
      ...commentEvents,
      ...invitationEvents,
      ...joinRequestEvents,
    ]
      .filter((entry) => Boolean(entry.createdAt))
      .sort(
        (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0),
      )
      .slice(0, 50)
      .map((entry) => ({
        ...entry,
        createdAt: entry.createdAt?.toISOString(),
      }));
  }
}
