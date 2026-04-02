import { Router } from "express";
import { Container } from "../../container";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const taskRoutes = Router();
const { taskController } = Container.getInstance();

taskRoutes.use(authMiddleware);
taskRoutes.post("/", asyncHandler(taskController.createTask));
taskRoutes.get(
  "/project/:projectId",
  asyncHandler(taskController.getProjectTasks),
);
taskRoutes.patch("/:id", asyncHandler(taskController.updateTask));

export { taskRoutes };
