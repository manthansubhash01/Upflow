import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { createResponse } from "../../utils/apiResponse";
import { CommentService } from "./service";

export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  createComment = async (req: AuthRequest, res: Response): Promise<void> => {
    const comment = await this.commentService.createComment(
      req.userId!,
      req.body,
    );
    res.status(201).json(createResponse("Comment created", comment));
  };

  getTaskComments = async (req: AuthRequest, res: Response): Promise<void> => {
    const comments = await this.commentService.getTaskComments(
      req.userId!,
      String(req.params.taskId),
    );
    res.status(200).json(createResponse("Comments fetched", comments));
  };
}
