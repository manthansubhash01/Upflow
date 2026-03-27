import http from "http";
import { Server } from "socket.io";
import { app } from "./app";
import { Database } from "./config/database";
import { env } from "./config/env";
import { configureSocket } from "./sockets";

const startServer = async (): Promise<void> => {
  await Database.getInstance().connect();

  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  configureSocket(io);

  httpServer.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
