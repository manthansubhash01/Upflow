import crypto from "crypto";
import mongoose from "mongoose";
import { z } from "zod";
import { ApiError } from "../../utils/ApiError";
import { EmailService } from "../../utils/email";
import { UserModel } from "../auth/model";
import { WorkspaceModel } from "../workspace/model";
import { InvitationModel } from "./invitation.model";

const invitationBodySchema = z.object({
  email: z.string().email(),
  workspaceId: z.string().min(1),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

const tokenSchema = z.object({
  token: z.string().min(1),
});

const workspaceIdSchema = z.object({
  workspaceId: z.string().min(1),
});

export class InvitationService {
  private readonly emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async createInvitation(
    email: string,
    workspaceId: string,
    invitedBy: string,
    role: "ADMIN" | "MEMBER",
  ) {
    const data = invitationBodySchema.parse({
      email,
      workspaceId,
      role,
    });

    const workspace = await WorkspaceModel.findById(data.workspaceId);
    if (!workspace) {
      throw new ApiError(404, "Workspace not found");
    }

    const inviter = await UserModel.findById(invitedBy);
    if (!inviter) {
      throw new ApiError(404, "Inviter not found");
    }

    const isAdmin = workspace.members.some(
      (member) =>
        member.userId.toString() === invitedBy && member.role === "ADMIN",
    );

    if (!isAdmin) {
      throw new ApiError(403, "Only admins can invite users");
    }

    const normalizedEmail = data.email.toLowerCase();
    const existingMember = await UserModel.findOne({
      email: normalizedEmail,
      workspaces: workspace._id,
    });

    if (existingMember) {
      throw new ApiError(409, "User is already a member of this workspace");
    }

    const existingPendingInvitation = await InvitationModel.findOne({
      email: normalizedEmail,
      workspaceId: workspace._id,
      status: "PENDING",
    });

    if (existingPendingInvitation) {
      const resendResult = await this.emailService.sendInviteEmail({
        to: normalizedEmail,
        workspaceName: workspace.name,
        inviterName: inviter.name,
        inviterEmail: inviter.email,
        token: existingPendingInvitation.token,
      });

      return {
        invitationId: existingPendingInvitation.id,
        email: normalizedEmail,
        token: existingPendingInvitation.token,
        reusedExisting: true,
        ...resendResult,
      };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await InvitationModel.create({
      email: normalizedEmail,
      workspaceId: workspace._id,
      invitedBy: new mongoose.Types.ObjectId(invitedBy),
      role,
      token,
      status: "PENDING",
      expiresAt,
    });

    const deliveryResult = await this.emailService.sendInviteEmail({
      to: normalizedEmail,
      workspaceName: workspace.name,
      inviterName: inviter.name,
      inviterEmail: inviter.email,
      token,
    });

    return {
      invitationId: invitation.id,
      email: invitation.email,
      token,
      reusedExisting: false,
      ...deliveryResult,
    };
  }

  async createInvitationForWorkspace(
    email: string,
    role: "ADMIN" | "MEMBER",
    workspaceId: string,
    invitedBy: string,
  ) {
    return this.createInvitation(email, workspaceId, invitedBy, role);
  }

  async getInvitationByToken(token: string) {
    const data = tokenSchema.parse({ token });
    const invitation = await InvitationModel.findOne({ token: data.token });

    if (!invitation) {
      throw new ApiError(404, "Invitation not found");
    }

    if (invitation.status === "EXPIRED") {
      await this.expireInvitation(data.token);
      throw new ApiError(410, "Invitation expired");
    }

    if (
      invitation.status === "PENDING" &&
      invitation.expiresAt.getTime() < Date.now()
    ) {
      await this.expireInvitation(data.token);
      throw new ApiError(410, "Invitation expired");
    }

    const workspace = await WorkspaceModel.findById(invitation.workspaceId).select(
      "name",
    );

    if (!workspace) {
      throw new ApiError(404, "Workspace not found");
    }

    const invitedUser = await UserModel.findOne({
      email: invitation.email,
    });

    return {
      email: invitation.email,
      workspaceName: workspace.name,
      workspaceId: workspace.id,
      role: invitation.role,
      status: invitation.status,
      hasAccount: Boolean(invitedUser),
    };
  }

  async acceptInvitation(token: string, userId: string) {
    const data = tokenSchema.parse({ token });

    const invitation = await InvitationModel.findOne({ token: data.token });

    if (!invitation) {
      throw new ApiError(404, "Invitation not found");
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new ApiError(403, "Invitation email does not match current user");
    }

    const workspace = await WorkspaceModel.findById(invitation.workspaceId);
    if (!workspace) {
      throw new ApiError(404, "Workspace not found");
    }

    if (invitation.status === "EXPIRED") {
      throw new ApiError(410, "Invitation expired");
    }

    if (
      invitation.status === "PENDING" &&
      invitation.expiresAt.getTime() < Date.now()
    ) {
      await this.expireInvitation(data.token);
      throw new ApiError(410, "Invitation expired");
    }

    if (invitation.status === "ACCEPTED") {
      const memberAlreadyInWorkspace = workspace.members.some(
        (member) => member.userId.toString() === userId,
      );

      if (!memberAlreadyInWorkspace) {
        await WorkspaceModel.updateOne(
          { _id: invitation.workspaceId },
          {
            $addToSet: {
              members: {
                userId: new mongoose.Types.ObjectId(userId),
                role: invitation.role,
              },
            },
          },
        );

        await UserModel.findByIdAndUpdate(userId, {
          $addToSet: { workspaces: invitation.workspaceId },
        });
      }

      return {
        workspaceId: invitation.workspaceId.toString(),
        accepted: true,
        alreadyMember: memberAlreadyInWorkspace,
      };
    }

    const alreadyMember = workspace.members.some(
      (member) => member.userId.toString() === userId,
    );

    if (alreadyMember) {
      invitation.status = "ACCEPTED";
      await invitation.save();

      return {
        workspaceId: invitation.workspaceId.toString(),
        accepted: true,
        alreadyMember: true,
      };
    }

    await WorkspaceModel.updateOne(
      { _id: invitation.workspaceId },
      {
        $addToSet: {
          members: {
            userId: new mongoose.Types.ObjectId(userId),
            role: invitation.role,
          },
        },
      },
    );

    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { workspaces: invitation.workspaceId },
    });

    invitation.status = "ACCEPTED";
    await invitation.save();

    return {
      workspaceId: invitation.workspaceId.toString(),
      accepted: true,
      alreadyMember: false,
    };
  }

  async clearWorkspaceInvitations(userId: string, workspaceId: string) {
    const data = workspaceIdSchema.parse({ workspaceId });

    const workspace = await WorkspaceModel.findOne({
      _id: data.workspaceId,
      members: { $elemMatch: { userId, role: "ADMIN" } },
    });

    if (!workspace) {
      throw new ApiError(403, "Only admins can clear invitations");
    }

    const result = await InvitationModel.updateMany(
      {
        workspaceId: workspace._id,
        status: "PENDING",
      },
      {
        $set: { status: "EXPIRED" },
      },
    );

    return {
      workspaceId: workspace.id,
      expiredCount: result.modifiedCount || 0,
    };
  }

  async expireInvitation(token: string) {
    const data = tokenSchema.parse({ token });
    const invitation = await InvitationModel.findOne({ token: data.token });

    if (!invitation) {
      throw new ApiError(404, "Invitation not found");
    }

    invitation.status = "EXPIRED";
    await invitation.save();

    return invitation;
  }
}
