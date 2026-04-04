import mongoose, { Document, Schema, Types } from "mongoose";
import type { WorkspaceRole } from "../workspace/model";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED";

export interface IInvitation extends Document {
  email: string;
  workspaceId: Types.ObjectId;
  invitedBy: Types.ObjectId;
  role: WorkspaceRole;
  token: string;
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const invitationSchema = new Schema<IInvitation>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["ADMIN", "MEMBER"], default: "MEMBER" },
    token: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "EXPIRED"],
      default: "PENDING",
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

invitationSchema.index({ email: 1, workspaceId: 1, status: 1 });

export const InvitationModel = mongoose.model<IInvitation>(
  "Invitation",
  invitationSchema,
);
