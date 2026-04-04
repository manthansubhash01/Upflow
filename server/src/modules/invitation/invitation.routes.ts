import { Router } from "express";
import { Container } from "../../container";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const invitationRoutes = Router();
const { invitationController } = Container.getInstance();

invitationRoutes.get(
  "/invitation/:token",
  asyncHandler(invitationController.getInvitation),
);

invitationRoutes.use(authMiddleware);
invitationRoutes.post(
  "/invite",
  asyncHandler(invitationController.createInvitation),
);
invitationRoutes.post(
  "/accept-invite",
  asyncHandler(invitationController.acceptInvitation),
);
invitationRoutes.delete(
  "/:workspaceId/invitations",
  asyncHandler(invitationController.clearWorkspaceInvitations),
);

export { invitationRoutes };
