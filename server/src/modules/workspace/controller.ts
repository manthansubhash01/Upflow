import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { createResponse } from "../../utils/apiResponse";
import { WorkspaceService } from "./service";

export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  createWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
    const workspace = await this.workspaceService.createWorkspace(
      req.userId!,
      req.body,
    );
    res.status(201).json(createResponse("Workspace created", workspace));
  };

  listWorkspaces = async (req: AuthRequest, res: Response): Promise<void> => {
    const workspaces = await this.workspaceService.listWorkspaces(req.userId!);
    res.status(200).json(createResponse("Workspaces fetched", workspaces));
  };

  updateWorkspaceSettings = async (
    req: AuthRequest,
    res: Response,
  ): Promise<void> => {
    const workspace = await this.workspaceService.updateWorkspaceSettings(
      req.userId!,
      {
        workspaceId: String(req.params.workspaceId),
        ...req.body,
      },
    );

    res.status(200).json(createResponse("Workspace updated", workspace));
  };

  promoteMember = async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await this.workspaceService.promoteMember(
      req.userId!,
      req.body,
    );
    res.status(200).json(createResponse("Member promoted", result));
  };

  getWorkspaceMembers = async (
    req: AuthRequest,
    res: Response,
  ): Promise<void> => {
    const members = await this.workspaceService.getWorkspaceMembers(
      req.userId!,
      String(req.params.workspaceId),
    );
    res.status(200).json(createResponse("Workspace members fetched", members));
  };

  getWorkspaceActivity = async (
    req: AuthRequest,
    res: Response,
  ): Promise<void> => {
    const activity = await this.workspaceService.getWorkspaceActivity(
      req.userId!,
      String(req.params.workspaceId),
    );
    res
      .status(200)
      .json(createResponse("Workspace activity fetched", activity));
  };
}
