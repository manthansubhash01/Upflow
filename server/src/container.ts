import { AuthController } from "./modules/auth/controller";
import { AuthService } from "./modules/auth/service";
import { CommentController } from "./modules/comment/controller";
import { CommentService } from "./modules/comment/service";
import { InvitationController } from "./modules/invitation/invitation.controller";
import { InvitationService } from "./modules/invitation/invitation.service";
import { JoinRequestController } from "./modules/joinRequest/controller";
import { JoinRequestService } from "./modules/joinRequest/service";
import { NotificationController } from "./modules/notification/controller";
import { NotificationService } from "./modules/notification/service";
import { ProjectController } from "./modules/project/controller";
import { ProjectService } from "./modules/project/service";
import { TaskController } from "./modules/task/controller";
import { TaskService } from "./modules/task/service";
import { WorkspaceController } from "./modules/workspace/controller";
import { WorkspaceService } from "./modules/workspace/service";

export class Container {
  private static instance: Container;

  readonly authController: AuthController;
  readonly workspaceController: WorkspaceController;
  readonly invitationController: InvitationController;
  readonly joinRequestController: JoinRequestController;
  readonly notificationController: NotificationController;
  readonly projectController: ProjectController;
  readonly taskController: TaskController;
  readonly commentController: CommentController;

  private constructor() {
    const authService = new AuthService();
    const workspaceService = new WorkspaceService();
    const invitationService = new InvitationService();
    const joinRequestService = new JoinRequestService();
    const notificationService = new NotificationService();
    const projectService = new ProjectService();
    const taskService = new TaskService();
    const commentService = new CommentService();

    this.authController = new AuthController(authService);
    this.workspaceController = new WorkspaceController(workspaceService);
    this.invitationController = new InvitationController(invitationService);
    this.joinRequestController = new JoinRequestController(joinRequestService);
    this.notificationController = new NotificationController(
      notificationService,
    );
    this.projectController = new ProjectController(projectService);
    this.taskController = new TaskController(taskService);
    this.commentController = new CommentController(commentService);
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }

    return Container.instance;
  }
}
