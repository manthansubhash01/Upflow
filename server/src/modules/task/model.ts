import mongoose, { Document, Schema, Types } from "mongoose";

export type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";

export interface ITask extends Document {
  title: string;
  projectId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  status: TaskStatus;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: ["BACKLOG", "TODO", "IN_PROGRESS", "DONE"],
      default: "BACKLOG",
    },
    dueDate: { type: Date },
  },
  { timestamps: true },
);

export const TaskModel = mongoose.model<ITask>("Task", taskSchema);
