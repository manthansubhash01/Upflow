import { Router } from "express";
import { Container } from "../../container";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const projectRoutes = Router();
const { projectController } = Container.getInstance();

projectRoutes.use(authMiddleware);
projectRoutes.post("/", asyncHandler(projectController.createProject));
projectRoutes.get(
  "/:workspaceId",
  asyncHandler(projectController.getWorkspaceProjects),
);
projectRoutes.post(
  "/:projectId/members",
  asyncHandler(projectController.addProjectMembers),
);

export { projectRoutes };
