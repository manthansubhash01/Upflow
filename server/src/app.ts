import cors from "cors";
import express from "express";
import { Router } from "express";
import { env } from "./config/env";
import { errorMiddleware } from "./middleware/error.middleware";
import { authRoutes } from "./modules/auth/routes";
import { commentRoutes } from "./modules/comment/routes";
import { invitationRoutes } from "./modules/invitation/invitation.routes";
import { joinRequestRoutes } from "./modules/joinRequest/routes";
import { notificationRoutes } from "./modules/notification/routes";
import { projectRoutes } from "./modules/project/routes";
import { taskRoutes } from "./modules/task/routes";
import { workspaceRoutes } from "./modules/workspace/routes";
import { authMiddleware } from "./middleware/auth.middleware";
import { asyncHandler } from "./utils/asyncHandler";
import { Container } from "./container";

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Server healthy" });
});

const apiRouter = Router();
const { authController, invitationController } = Container.getInstance();

app.get("/auth/google", asyncHandler(authController.googleOAuth));
app.get("/auth/google/callback", asyncHandler(authController.googleCallback));
app.get("/api/auth/google", asyncHandler(authController.googleOAuth));
app.get(
  "/api/auth/google/callback",
  asyncHandler(authController.googleCallback),
);

apiRouter.use("/auth", authRoutes);
apiRouter.use("/workspace", workspaceRoutes);
apiRouter.use("/workspace", invitationRoutes);
apiRouter.use(joinRequestRoutes);
apiRouter.post(
  "/workspaces/:workspaceId/invite",
  authMiddleware,
  asyncHandler(invitationController.createInvitationForWorkspace),
);
apiRouter.get(
  "/invitations/:token",
  asyncHandler(invitationController.getInvitation),
);
apiRouter.post(
  "/invitations/accept",
  authMiddleware,
  asyncHandler(invitationController.acceptInvitation),
);
apiRouter.use("/project", projectRoutes);
apiRouter.use("/task", taskRoutes);
apiRouter.use("/notification", notificationRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.use("/comment", commentRoutes);

// Keep direct routes for backward compatibility while supporting frontend /api rewrites.
app.use(apiRouter);
app.use("/api", apiRouter);

app.use(errorMiddleware);

export { app };
