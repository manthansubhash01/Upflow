import { Router } from "express";
import { Container } from "../../container";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const joinRequestRoutes = Router();
const { joinRequestController } = Container.getInstance();

joinRequestRoutes.use(authMiddleware);

joinRequestRoutes.get(
  "/workspaces/search",
  asyncHandler(joinRequestController.searchWorkspaces),
);
joinRequestRoutes.post(
  "/workspaces/:workspaceId/request",
  asyncHandler(joinRequestController.requestToJoin),
);
joinRequestRoutes.get(
  "/workspaces/:workspaceId/requests",
  asyncHandler(joinRequestController.listPendingWorkspaceRequests),
);
joinRequestRoutes.post(
  "/join-requests/:requestId/accept",
  asyncHandler(joinRequestController.acceptRequest),
);
joinRequestRoutes.post(
  "/join-requests/:requestId/reject",
  asyncHandler(joinRequestController.rejectRequest),
);

export { joinRequestRoutes };
