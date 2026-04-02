import mongoose, { Document, Schema, Types } from "mongoose";

export type WorkspaceRole = "ADMIN" | "MEMBER";
export type WorkspaceDiscoverability = "PUBLIC" | "PRIVATE";

interface WorkspaceMember {
  userId: Types.ObjectId;
  role: WorkspaceRole;
}

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  logo?: string | null;
  discoverability: WorkspaceDiscoverability;
  ownerId: Types.ObjectId;
  members: WorkspaceMember[];
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    logo: { type: String, default: null },
    discoverability: {
      type: String,
      enum: ["PUBLIC", "PRIVATE"],
      default: "PUBLIC",
    },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["ADMIN", "MEMBER"], default: "MEMBER" },
      },
    ],
  },
  { timestamps: true },
);

workspaceSchema.index({ discoverability: 1, name: 1 });

export const WorkspaceModel = mongoose.model<IWorkspace>(
  "Workspace",
  workspaceSchema,
);
