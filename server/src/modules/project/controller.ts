import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { createResponse } from "../../utils/apiResponse";
import { ProjectService } from "./service";

export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  createProject = async (req: AuthRequest, res: Response): Promise<void> => {
    const project = await this.projectService.createProject(
      req.userId!,
      req.body,
    );
    res.status(201).json(createResponse("Project created", project));
  };

  getWorkspaceProjects = async (
    req: AuthRequest,
    res: Response,
  ): Promise<void> => {
    const projects = await this.projectService.getWorkspaceProjects(
      req.userId!,
      String(req.params.workspaceId),
    );
    res.status(200).json(createResponse("Projects fetched", projects));
  };

  addProjectMembers = async (
    req: AuthRequest,
    res: Response,
  ): Promise<void> => {
    const project = await this.projectService.addProjectMembers(req.userId!, {
      projectId: String(req.params.projectId),
      members: req.body?.members,
    });

    res.status(200).json(createResponse("Project members updated", project));
  };
}
