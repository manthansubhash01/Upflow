import mongoose, { Document, Schema, Types } from "mongoose";

export interface IComment extends Document {
  taskId: Types.ObjectId;
  userId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

export const CommentModel = mongoose.model<IComment>("Comment", commentSchema);
