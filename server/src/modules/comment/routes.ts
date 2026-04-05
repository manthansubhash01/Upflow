import { Router } from "express";
import { Container } from "../../container";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const commentRoutes = Router();
const { commentController } = Container.getInstance();

commentRoutes.use(authMiddleware);
commentRoutes.post("/", asyncHandler(commentController.createComment));
commentRoutes.get(
  "/task/:taskId",
  asyncHandler(commentController.getTaskComments),
);

export { commentRoutes };
