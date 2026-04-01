import mongoose from "mongoose";
import { env } from "./env";

export class Database {
  private static instance: Database;

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }

  async connect(): Promise<void> {
    await mongoose.connect(env.MONGO_URI);
    console.log("MongoDB connected");
  }
}
