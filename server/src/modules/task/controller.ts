import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { createResponse } from "../../utils/apiResponse";
import { TaskService } from "./service";

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    const task = await this.taskService.createTask(req.userId!, req.body);
    res.status(201).json(createResponse("Task created", task));
  };

  getProjectTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    const tasks = await this.taskService.getProjectTasks(
      req.userId!,
      String(req.params.projectId),
    );
    res.status(200).json(createResponse("Tasks fetched", tasks));
  };

  updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
    const task = await this.taskService.updateTask(
      req.userId!,
      String(req.params.id),
      req.body,
    );
    res.status(200).json(createResponse("Task updated", task));
  };
}
