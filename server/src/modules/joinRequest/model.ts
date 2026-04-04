import mongoose, { Document, Schema, Types } from "mongoose";

export type JoinRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface IJoinRequest extends Document {
  workspaceId: Types.ObjectId;
  userId: Types.ObjectId;
  requestedBy: Types.ObjectId;
  status: JoinRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const joinRequestSchema = new Schema<IJoinRequest>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
  },
  { timestamps: true },
);

joinRequestSchema.index(
  { workspaceId: 1, userId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "PENDING" } },
);

export const JoinRequestModel = mongoose.model<IJoinRequest>(
  "WorkspaceJoinRequest",
  joinRequestSchema,
);
