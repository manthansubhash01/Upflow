import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  workspaces: Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false, default: "" },
    workspaces: [{ type: Schema.Types.ObjectId, ref: "Workspace" }],
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<IUser>("User", userSchema);
