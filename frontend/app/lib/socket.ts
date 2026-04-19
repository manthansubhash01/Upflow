import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentToken = "";

const resolveSocketUrl = () => {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  return "https://upflow-y50u.onrender.com";
};

export function getSocket(token: string): Socket {
  if (!token) {
    throw new Error("Socket token is required");
  }

  if (!socket || currentToken !== token) {
    if (socket) {
      socket.disconnect();
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[SOCKET] URL", resolveSocketUrl());
      console.log("[SOCKET] Creating socket");
    }

    socket = io(resolveSocketUrl(), {
      transports: ["polling", "websocket"],
      auth: { token },
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 5000,
    });

    if (process.env.NODE_ENV === "development") {
      socket.on("connect", () => {
        console.log("[SOCKET] Connected", socket?.id);
      });

      socket.on("disconnect", (reason) => {
        console.log("[SOCKET] Disconnected", reason);
      });

      socket.on("connect_error", (err) => {
        console.error("[SOCKET] Connect error", err);
      });

      socket.io.on("reconnect", () => {
        console.log("[SOCKET] Reconnected");
      });
    }

    currentToken = token;
  }

  return socket;
}
