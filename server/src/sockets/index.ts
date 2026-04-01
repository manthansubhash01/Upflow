import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { WorkspaceModel } from "../modules/workspace/model";
import { SocketManager } from "./socketManager";

interface JwtPayload {
  userId: string;
}

export const configureSocket = (io: Server): void => {
  const socketManager = SocketManager.getInstance();

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;

    if (!token) {
      next(new Error("Unauthorized"));
      return;
    }

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;

    if (process.env.NODE_ENV === "development") {
      console.log("[BACKEND SOCKET] connected", socket.id);
    }

    socketManager.registerUserSocket(userId, socket.id);
    socket.join(`user:${userId}`);

    socket.on("register-user", (incomingUserId: string) => {
      if (!incomingUserId || incomingUserId !== userId) {
        return;
      }

      socketManager.registerUserSocket(incomingUserId, socket.id);
    });

    socket.on("joinWorkspace", async (workspaceId: string) => {
      const isMember = await WorkspaceModel.exists({
        _id: workspaceId,
        "members.userId": userId,
      });

      if (!isMember) {
        return;
      }

      socket.join(`workspace:${workspaceId}`);
    });

    socket.on("disconnect", () => {
      if (process.env.NODE_ENV === "development") {
        console.log("[BACKEND SOCKET] disconnected", socket.id);
      }

      socketManager.removeSocket(socket.id);
    });
  });

  socketManager.initialize(io);
};
