import mongoose from "mongoose";
import { z } from "zod";
import { ApiError } from "../../utils/ApiError";
import { SocketManager } from "../../sockets/socketManager";
import { TaskModel } from "../task/model";
import { WorkspaceModel } from "../workspace/model";
import { CommentModel } from "./model";

const createCommentSchema = z.object({
  taskId: z.string().min(1),
  content: z.string().min(1),
});

export class CommentService {
  async createComment(userId: string, payload: unknown) {
    const data = createCommentSchema.parse(payload);

    const task = await TaskModel.findById(data.taskId);
    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    const hasWorkspaceAccess = await WorkspaceModel.exists({
      _id: task.workspaceId,
      "members.userId": userId,
    });

    if (!hasWorkspaceAccess) {
      throw new ApiError(403, "You do not have access to this workspace");
    }

    const comment = await CommentModel.create({
      taskId: task._id,
      userId: new mongoose.Types.ObjectId(userId),
      workspaceId: task.workspaceId,
      content: data.content,
    });

    SocketManager.getInstance().emitToWorkspace(
      task.workspaceId.toString(),
      "commentAdded",
      comment,
    );

    return comment;
  }

  async getTaskComments(userId: string, taskId: string) {
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new ApiError(404, "Task not found");
    }

    const hasWorkspaceAccess = await WorkspaceModel.exists({
      _id: task.workspaceId,
      "members.userId": userId,
    });

    if (!hasWorkspaceAccess) {
      throw new ApiError(403, "You do not have access to this workspace");
    }

    return CommentModel.find({ taskId, workspaceId: task.workspaceId }).sort({
      createdAt: 1,
    });
  }
}
