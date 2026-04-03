import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { createResponse } from "../../utils/apiResponse";
import { NotificationService } from "./service";

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  listNotifications = async (
    req: AuthRequest,
    res: Response,
  ): Promise<void> => {
    const notifications = await this.notificationService.listNotifications(
      req.userId!,
      req.query,
    );

    res
      .status(200)
      .json(createResponse("Notifications fetched", notifications));
  };

  markAllRead = async (req: AuthRequest, res: Response): Promise<void> => {
    const workspaceId =
      typeof req.body?.workspaceId === "string"
        ? req.body.workspaceId
        : undefined;

    const result = await this.notificationService.markAllRead(
      req.userId!,
      workspaceId,
    );

    res
      .status(200)
      .json(createResponse("Notifications marked as read", result));
  };

  markRead = async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await this.notificationService.markNotificationRead(
      req.userId!,
      String(req.params.notificationId),
    );

    res.status(200).json(createResponse("Notification marked as read", result));
  };
}
