import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProject extends Document {
  name: string;
  workspaceId: Types.ObjectId;
  members: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

export const ProjectModel = mongoose.model<IProject>("Project", projectSchema);
