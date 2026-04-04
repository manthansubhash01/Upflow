import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { createResponse } from "../../utils/apiResponse";
import { InvitationService } from "./invitation.service";

export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  createInvitation = async (req: AuthRequest, res: Response): Promise<void> => {
    const { email, workspaceId, role } = req.body as {
      email: string;
      workspaceId: string;
      role: "ADMIN" | "MEMBER";
    };

    const result = await this.invitationService.createInvitation(
      email,
      workspaceId,
      req.userId!,
      role,
    );

    const message = result.emailSent
      ? "Invitation sent successfully"
      : "Invitation created, but email delivery failed";

    res.status(201).json(createResponse(message, result));
  };

  createInvitationForWorkspace = async (
    req: AuthRequest,
    res: Response,
  ): Promise<void> => {
    const { email, role } = req.body as {
      email: string;
      role: "ADMIN" | "MEMBER";
    };

    const result = await this.invitationService.createInvitationForWorkspace(
      email,
      role,
      String(req.params.workspaceId),
      req.userId!,
    );

    const message = result.emailSent
      ? "Invitation sent successfully"
      : "Invitation created, but email delivery failed";

    res.status(201).json(createResponse(message, result));
  };

  getInvitation = async (req: Request, res: Response): Promise<void> => {
    const invitation = await this.invitationService.getInvitationByToken(
      String(req.params.token),
    );

    res.status(200).json(createResponse("Invitation verified", { invitation }));
  };

  acceptInvitation = async (req: AuthRequest, res: Response): Promise<void> => {
    const { token } = req.body as { token: string };
    const result = await this.invitationService.acceptInvitation(token, req.userId!);

    res.status(200).json(createResponse("Invitation accepted", result));
  };

  clearWorkspaceInvitations = async (
    req: AuthRequest,
    res: Response,
  ): Promise<void> => {
    const result = await this.invitationService.clearWorkspaceInvitations(
      req.userId!,
      String(req.params.workspaceId),
    );

    res.status(200).json(createResponse("Pending invitations expired", result));
  };
}
