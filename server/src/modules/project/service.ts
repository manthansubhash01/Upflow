import mongoose from "mongoose";
import { z } from "zod";
import { ApiError } from "../../utils/ApiError";
import { WorkspaceModel } from "../workspace/model";
import { ProjectModel } from "./model";

const createProjectSchema = z.object({
  name: z.string().min(2),
  workspaceId: z.string().min(1),
  members: z.array(z.string()).default([]),
});

const addProjectMembersSchema = z.object({
  projectId: z.string().min(1),
  members: z.array(z.string().min(1)).min(1),
});

export class ProjectService {
  async createProject(userId: string, payload: unknown) {
    const data = createProjectSchema.parse(payload);

    const isMember = await WorkspaceModel.exists({
      _id: data.workspaceId,
      "members.userId": userId,
    });

    if (!isMember) {
      throw new ApiError(403, "You do not have access to this workspace");
    }

    const memberIds = data.members.map((id) => new mongoose.Types.ObjectId(id));

    return ProjectModel.create({
      name: data.name,
      workspaceId: data.workspaceId,
      members: [...memberIds, new mongoose.Types.ObjectId(userId)],
    });
  }

  async getWorkspaceProjects(userId: string, workspaceId: string) {
    const isMember = await WorkspaceModel.exists({
      _id: workspaceId,
      "members.userId": userId,
    });

    if (!isMember) {
      throw new ApiError(403, "You do not have access to this workspace");
    }

    const projects = await ProjectModel.find({ workspaceId }).populate(
      "members",
      "name email",
    );

    return projects;
  }

  async addProjectMembers(userId: string, payload: unknown) {
    const data = addProjectMembersSchema.parse(payload);

    const project = await ProjectModel.findById(data.projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    const workspace = await WorkspaceModel.findById(project.workspaceId).select(
      "members",
    );
    if (!workspace) {
      throw new ApiError(404, "Workspace not found");
    }

    const requesterIsWorkspaceMember = workspace.members.some(
      (member) => member.userId.toString() === userId,
    );

    if (!requesterIsWorkspaceMember) {
      throw new ApiError(403, "You do not have access to this workspace");
    }

    const workspaceMemberIds = new Set(
      workspace.members.map((member) => member.userId.toString()),
    );

    const invalidMemberIds = data.members.filter(
      (memberId) => !workspaceMemberIds.has(memberId),
    );

    if (invalidMemberIds.length > 0) {
      throw new ApiError(
        400,
        "One or more selected users are not members of this workspace",
      );
    }

    const membersToAdd = data.members.map(
      (id) => new mongoose.Types.ObjectId(id),
    );

    project.members = [
      ...project.members,
      ...membersToAdd.filter(
        (memberId) =>
          !project.members.some(
            (existingMemberId) =>
              existingMemberId.toString() === memberId.toString(),
          ),
      ),
    ];

    await project.save();

    await project.populate("members", "name email");

    return project;
  }
}
