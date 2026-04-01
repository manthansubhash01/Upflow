import { Server } from "socket.io";

export class SocketManager {
  private static instance: SocketManager;
  private io: Server | null = null;
  private connectedUsers = new Map<string, string>();

  private constructor() {}

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }

    return SocketManager.instance;
  }

  initialize(io: Server): void {
    this.io = io;
  }

  registerUserSocket(userId: string, socketId: string): void {
    this.connectedUsers.set(userId, socketId);
  }

  removeSocket(socketId: string): void {
    for (const [userId, registeredSocketId] of this.connectedUsers.entries()) {
      if (registeredSocketId === socketId) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  emitToWorkspace(workspaceId: string, event: string, payload: unknown): void {
    if (!this.io) {
      return;
    }

    this.io.to(`workspace:${workspaceId}`).emit(event, payload);
  }

  emitToUser(userId: string, event: string, payload: unknown): void {
    if (!this.io) {
      return;
    }

    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, payload);
      return;
    }

    this.io.to(`user:${userId}`).emit(event, payload);
  }
}
