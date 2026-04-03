import { Router } from "express";
import { Container } from "../../container";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const notificationRoutes = Router();
const { notificationController } = Container.getInstance();

notificationRoutes.use(authMiddleware);
notificationRoutes.get(
  "/",
  asyncHandler(notificationController.listNotifications),
);
notificationRoutes.patch(
  "/read-all",
  asyncHandler(notificationController.markAllRead),
);
notificationRoutes.patch(
  "/:notificationId/read",
  asyncHandler(notificationController.markRead),
);

export { notificationRoutes };
