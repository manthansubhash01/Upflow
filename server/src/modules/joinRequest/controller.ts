import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { createResponse } from "../../utils/apiResponse";
import { JoinRequestService } from "./service";

export class JoinRequestController {
  constructor(private readonly joinRequestService: JoinRequestService) {}

  searchWorkspaces = async (req: AuthRequest, res: Response): Promise<void> => {
    const workspaces = await this.joinRequestService.searchWorkspaces(
      req.userId!,
      {
        q: req.query.q,
      },
    );

    res.status(200).json(createResponse("Workspaces fetched", workspaces));
  };

  requestToJoin = async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await this.joinRequestService.requestToJoin(
      req.userId!,
      String(req.params.workspaceId),
    );

    res.status(201).json(createResponse("Join request submitted", result));
  };

  listPendingWorkspaceRequests = async (
    req: AuthRequest,
    res: Response,
  ): Promise<void> => {
    const requests = await this.joinRequestService.listPendingWorkspaceRequests(
      req.userId!,
      String(req.params.workspaceId),
    );

    res
      .status(200)
      .json(createResponse("Pending join requests fetched", requests));
  };

  acceptRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await this.joinRequestService.acceptRequest(
      req.userId!,
      String(req.params.requestId),
    );

    res.status(200).json(createResponse("Join request accepted", result));
  };

  rejectRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await this.joinRequestService.rejectRequest(
      req.userId!,
      String(req.params.requestId),
    );

    res.status(200).json(createResponse("Join request rejected", result));
  };
}
