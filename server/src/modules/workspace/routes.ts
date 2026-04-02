import { Router } from "express";
import { Container } from "../../container";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const workspaceRoutes = Router();
const { workspaceController } = Container.getInstance();

workspaceRoutes.use(authMiddleware);
workspaceRoutes.post("/", asyncHandler(workspaceController.createWorkspace));
workspaceRoutes.get("/", asyncHandler(workspaceController.listWorkspaces));
workspaceRoutes.patch(
  "/:workspaceId",
  asyncHandler(workspaceController.updateWorkspaceSettings),
);
workspaceRoutes.get(
  "/:workspaceId/members",
  asyncHandler(workspaceController.getWorkspaceMembers),
);
workspaceRoutes.get(
  "/:workspaceId/activity",
  asyncHandler(workspaceController.getWorkspaceActivity),
);
workspaceRoutes.post(
  "/promote",
  asyncHandler(workspaceController.promoteMember),
);

export { workspaceRoutes };
