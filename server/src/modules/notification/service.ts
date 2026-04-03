import { z } from "zod";
import { NotificationModel } from "./model";

type PopulatedProject = {
  _id: { toString(): string };
  name: string;
};

type PopulatedTask = {
  _id: { toString(): string };
  title: string;
};

function hasObjectId(value: unknown): value is { _id: { toString(): string } } {
  return typeof value === "object" && value !== null && "_id" in value;
}

function toIdString(value: unknown): string {
  if (hasObjectId(value)) {
    return value._id.toString();
  }

  return String(value);
}

const listNotificationsSchema = z.object({
  workspaceId: z.string().min(1).optional(),
  unread: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .optional()
    .transform((value) => {
      if (typeof value === "boolean") {
        return value;
      }

      if (value === "true") {
        return true;
      }

      if (value === "false") {
        return false;
      }

      return undefined;
    }),
});

export class NotificationService {
  async listNotifications(userId: string, query: unknown) {
    const data = listNotificationsSchema.parse(query || {});

    const filters: Record<string, unknown> = { user: userId };
    if (data.workspaceId) {
      filters.workspaceId = data.workspaceId;
    }
    if (data.unread === true) {
      filters.isRead = false;
    }

    const notifications = await NotificationModel.find(filters)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate({ path: "projectId", select: "name" })
      .populate({ path: "taskId", select: "title" })
      .lean();

    return notifications.map((notification) => {
      const projectRef = notification.projectId as unknown;
      const taskRef = notification.taskId as unknown;

      return {
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        workspaceId: notification.workspaceId.toString(),
        projectId: toIdString(projectRef),
        taskId: toIdString(taskRef),
        project:
          hasObjectId(projectRef) && "name" in projectRef
            ? {
                id: projectRef._id.toString(),
                name: (projectRef as PopulatedProject).name,
              }
            : undefined,
        task:
          hasObjectId(taskRef) && "title" in taskRef
            ? {
                id: taskRef._id.toString(),
                title: (taskRef as PopulatedTask).title,
              }
            : undefined,
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
      };
    });
  }

  async markAllRead(userId: string, workspaceId?: string) {
    const filters: Record<string, unknown> = {
      user: userId,
      isRead: false,
    };

    if (workspaceId) {
      filters.workspaceId = workspaceId;
    }

    const result = await NotificationModel.updateMany(filters, {
      $set: { isRead: true },
    });

    return {
      updatedCount: result.modifiedCount,
    };
  }

  async markNotificationRead(userId: string, notificationId: string) {
    const notification = await NotificationModel.findOneAndUpdate(
      {
        _id: notificationId,
        user: userId,
      },
      {
        $set: { isRead: true },
      },
      { new: true },
    );

    return {
      updated: Boolean(notification),
    };
  }
}
