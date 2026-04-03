import mongoose, { Document, Schema, Types } from "mongoose";

export type NotificationType = "TASK_ASSIGNED";

export interface INotification extends Document {
  user: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  workspaceId: Types.ObjectId;
  projectId: Types.ObjectId;
  taskId: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["TASK_ASSIGNED"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<INotification>(
  "Notification",
  notificationSchema,
);
