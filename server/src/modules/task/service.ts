import mongoose from "mongoose";
import { z } from "zod";
import { ApiError } from "../../utils/ApiError";
import { SocketManager } from "../../sockets/socketManager";
import { UserModel } from "../auth/model";
import { NotificationModel } from "../notification/model";
import { WorkspaceModel } from "../workspace/model";
import { ProjectModel } from "../project/model";
import { TaskModel } from "./model";

const createTaskSchema = z.object({
  title: z.string().min(1),
  projectId: z.string().min(1),
  workspaceId: z.string().min(1),
  assignedTo: z.string().nullable().optional(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "DONE"]).default("BACKLOG"),
  dueDate: z.string().datetime().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  assignedTo: z.string().nullable().optional(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "DONE"]).optional(),
  dueDate: z.string().datetime().optional(),
});

export class TaskService {
  private readonly sockets = SocketManager.getInstance();

  private async createAssignmentNotification(params: {
    assignedUserId: string;
    assignedByName: string;
    workspaceId: string;
    projectId: string;
    projectName?: string;
    taskId: string;
    taskTitle: string;
  }) {
    const notification = await NotificationModel.create({
      user: new mongoose.Types.ObjectId(params.assignedUserId),
      type: "TASK_ASSIGNED",
      title: "New Task Assigned",
      message: `${params.assignedByName} assigned you the task \"${params.taskTitle}\"`,
      workspaceId: new mongoose.Types.ObjectId(params.workspaceId),
      projectId: new mongoose.Types.ObjectId(params.projectId),
      taskId: new mongoose.Types.ObjectId(params.taskId),
      isRead: false,
    });

    const payload = {
      _id: notification.id,
      id: notification.id,
      type: "TASK_ASSIGNED",
      title: notification.title,
      message: notification.message,
      workspaceId: params.workspaceId,
      projectId: params.projectId,
      project: params.projectName
        ? {
            id: params.projectId,
            name: params.projectName,
          }
        : undefined,
      taskId: params.taskId,
      task: {
        id: params.taskId,
        title: params.taskTitle,
      },
      taskTitle: params.taskTitle,
      isRead: false,
      createdAt: notification.createdAt.toISOString(),
    };

    this.sockets.emitToUser(params.assignedUserId, "notification:new", payload);

    // Backward compatibility for older frontend listeners.
    this.sockets.emitToUser(params.assignedUserId, "task-assigned", payload);
  }

  async createTask(userId: string, payload: unknown) {
    const data = createTaskSchema.parse(payload);

    const hasWorkspaceAccess = await WorkspaceModel.exists({
      _id: data.workspaceId,
      "members.userId": userId,
    });

    if (!hasWorkspaceAccess) {
      throw new ApiError(403, "You do not have access to this workspace");
    }

    const project = await ProjectModel.findOne({
      _id: data.projectId,
      workspaceId: data.workspaceId,
    });

    if (!project) {
      throw new ApiError(404, "Project not found in workspace");
    }

    if (data.assignedTo) {
      const isProjectMember = project.members.some(
        (memberId) => memberId.toString() === data.assignedTo,
      );

      if (!isProjectMember) {
        throw new ApiError(400, "Assigned user must be a project member");
      }
    }

    const task = await TaskModel.create({
      title: data.title,
      projectId: data.projectId,
      workspaceId: data.workspaceId,
      assignedTo: data.assignedTo || undefined,
      status: data.status,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });

    await task.populate({ path: "assignedTo", select: "name email" });

    if (data.assignedTo) {
      const actor = await UserModel.findById(userId).select("name").lean();

      await this.createAssignmentNotification({
        assignedUserId: data.assignedTo,
        assignedByName: actor?.name || "Someone",
        workspaceId: data.workspaceId,
        projectId: data.projectId,
        projectName: project.name,
        taskId: task.id,
        taskTitle: task.title,
      });
    }

    this.sockets.emitToWorkspace(data.workspaceId, "taskCreated", task);

    return task;
  }

  async getProjectTasks(userId: string, projectId: string) {
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    const hasWorkspaceAccess = await WorkspaceModel.exists({
      _id: project.workspaceId,
      "members.userId": userId,
    });

    if (!hasWorkspaceAccess) {
      throw new ApiError(403, "You do not have access to this workspace");
    }

    return TaskModel.find({ projectId, workspaceId: project.workspaceId })
      .populate({ path: "assignedTo", select: "name email" })
      .sort({ updatedAt: -1 });
  }

  async updateTask(userId: string, taskId: string, payload: unknown) {
    const data = updateTaskSchema.parse(payload);

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

    const project = await ProjectModel.findById(task.projectId).select(
      "members name",
    );
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    if (data.assignedTo) {
      const isProjectMember = project.members.some(
        (memberId) => memberId.toString() === data.assignedTo,
      );

      if (!isProjectMember) {
        throw new ApiError(400, "Assigned user must be a project member");
      }
    }

    const previousAssignedTo = task.assignedTo?.toString() || null;

    if (data.title !== undefined) task.title = data.title;
    if (data.assignedTo !== undefined) {
      task.assignedTo = data.assignedTo
        ? new mongoose.Types.ObjectId(data.assignedTo)
        : undefined;
    }
    if (data.status !== undefined) task.status = data.status;
    if (data.dueDate !== undefined) task.dueDate = new Date(data.dueDate);

    await task.save();
    const nextAssignedTo = task.assignedTo?.toString() || null;
    await task.populate({ path: "assignedTo", select: "name email" });

    if (nextAssignedTo && nextAssignedTo !== previousAssignedTo) {
      const actor = await UserModel.findById(userId).select("name").lean();

      await this.createAssignmentNotification({
        assignedUserId: nextAssignedTo,
        assignedByName: actor?.name || "Someone",
        workspaceId: task.workspaceId.toString(),
        projectId: task.projectId.toString(),
        projectName: project.name,
        taskId: task.id,
        taskTitle: task.title,
      });
    }

    this.sockets.emitToWorkspace(
      task.workspaceId.toString(),
      "taskUpdated",
      task,
    );

    return task;
  }
}
