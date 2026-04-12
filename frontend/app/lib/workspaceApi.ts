import { apiCall, apiDelete, apiGet, apiPost } from "@/app/lib/api";

export type WorkspaceMember = {
  userId: string;
  role: "ADMIN" | "MEMBER";
};

export type WorkspaceMemberProfile = {
  userId: string;
  role: "ADMIN" | "MEMBER";
  name: string;
  email: string;
};

export type WorkspaceActivityItem = {
  id: string;
  type:
    | "PROJECT"
    | "TASK"
    | "COMMENT"
    | "INVITATION"
    | "JOIN_REQUEST"
    | "TASK_ASSIGNED";
  message: string;
  createdAt?: string;
};

export type WorkspaceRecord = {
  id: string;
  name: string;
  description?: string;
  logo?: string | null;
  discoverability?: "PUBLIC" | "PRIVATE";
  ownerId: string;
  members: WorkspaceMember[];
};

export type WorkspaceSearchRecord = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  logo: string | null;
  hasPendingRequest: boolean;
};

export type PendingJoinRequest = {
  id: string;
  workspaceId: string;
  userId: string;
  status: "PENDING";
  createdAt: string;
  requester: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

export type ProjectMember = {
  id: string;
  name: string;
  email?: string;
};

export type ProjectRecord = {
  id: string;
  name: string;
  workspaceId: string;
  members: ProjectMember[];
  createdAt?: string;
  updatedAt?: string;
};

export type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";

export type TaskAssignee = {
  id: string;
  name: string;
  email?: string;
};

export type TaskRecord = {
  id: string;
  title: string;
  projectId: string;
  workspaceId: string;
  assignedTo?: TaskAssignee | null;
  status: TaskStatus;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type NotificationRecord = {
  id: string;
  type: "TASK_ASSIGNED";
  title: string;
  message: string;
  workspaceId: string;
  projectId: string;
  taskId: string;
  project?: {
    id: string;
    name: string;
  };
  task?: {
    id: string;
    title: string;
  };
  isRead: boolean;
  createdAt: string;
};

const getId = (value: {
  id?: string;
  _id?: string | { $oid?: string; toString?: () => string };
}): string => {
  if (value.id) {
    return value.id;
  }

  if (typeof value._id === "string") {
    return value._id;
  }

  if (value._id && typeof value._id === "object") {
    if (value._id.$oid) {
      return value._id.$oid;
    }

    if (typeof value._id.toString === "function") {
      const casted = value._id.toString();
      if (casted && casted !== "[object Object]") {
        return casted;
      }
    }
  }

  return "";
};

export const toWorkspaceRecord = (value: {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  logo?: string | null;
  discoverability?: "PUBLIC" | "PRIVATE";
  ownerId?: string;
  members?: Array<{ userId?: string; role?: "ADMIN" | "MEMBER" }>;
}): WorkspaceRecord => ({
  id: getId(value),
  name: value.name,
  description: value.description || "",
  logo: value.logo || null,
  discoverability: value.discoverability || "PUBLIC",
  ownerId: value.ownerId || "",
  members: (value.members || []).map((member) => ({
    userId: member.userId || "",
    role: member.role === "ADMIN" ? "ADMIN" : "MEMBER",
  })),
});

export const toProjectRecord = (value: {
  id?: string;
  _id?: string;
  name: string;
  workspaceId: string;
  members?: Array<
    | {
        id?: string;
        _id?: string | { $oid?: string; toString?: () => string };
        name?: string;
        email?: string;
      }
    | string
  >;
  createdAt?: string;
  updatedAt?: string;
}): ProjectRecord => {
  const members = (value.members || []).map((member) => {
    if (typeof member === "string") {
      return { id: member, name: "Unknown", email: "" };
    }
    return {
      id: getId(member as { id?: string; _id?: string }),
      name: (member as { name?: string }).name || "Unknown",
      email: (member as { email?: string }).email || "",
    };
  });

  return {
    id: getId(value),
    name: value.name,
    workspaceId: value.workspaceId,
    members,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
};

export const toTaskRecord = (value: {
  id?: string;
  _id?: string;
  title: string;
  projectId: string;
  workspaceId: string;
  assignedTo?:
    | string
    | {
        id?: string;
        _id?: string;
        name?: string;
        email?: string;
      }
    | null;
  status: TaskStatus;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}): TaskRecord => ({
  id: getId(value),
  title: value.title,
  projectId: value.projectId,
  workspaceId: value.workspaceId,
  assignedTo:
    typeof value.assignedTo === "string"
      ? { id: value.assignedTo, name: "Unknown" }
      : value.assignedTo
        ? {
            id: getId(value.assignedTo),
            name: value.assignedTo.name || "Unknown",
            email: value.assignedTo.email || "",
          }
        : null,
  status: value.status,
  dueDate: value.dueDate,
  createdAt: value.createdAt,
  updatedAt: value.updatedAt,
});

export async function fetchWorkspaces(): Promise<WorkspaceRecord[]> {
  const response = await apiGet<
    Array<{
      id?: string;
      _id?: string;
      name: string;
      description?: string;
      logo?: string | null;
      discoverability?: "PUBLIC" | "PRIVATE";
      ownerId?: string;
      members?: Array<{ userId?: string; role?: "ADMIN" | "MEMBER" }>;
    }>
  >("/api/workspace");
  if (!response.success || !response.data) {
    return [];
  }
  return response.data
    .map(toWorkspaceRecord)
    .filter((workspace) => Boolean(workspace.id));
}

export async function fetchProjects(
  workspaceId: string,
): Promise<ProjectRecord[]> {
  const response = await apiGet<
    Array<{
      id?: string;
      _id?: string;
      name: string;
      workspaceId: string;
      members?: string[];
      createdAt?: string;
      updatedAt?: string;
    }>
  >(`/api/project/${workspaceId}`);
  if (!response.success || !response.data) {
    return [];
  }
  return response.data
    .map(toProjectRecord)
    .filter((project) => Boolean(project.id));
}

export async function fetchWorkspaceMembers(
  workspaceId: string,
): Promise<WorkspaceMemberProfile[]> {
  const response = await apiGet<
    Array<{
      userId: string;
      role: "ADMIN" | "MEMBER";
      name?: string;
      email?: string;
    }>
  >(`/api/workspace/${workspaceId}/members`);
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch workspace members");
  }

  return response.data.map((member) => ({
    userId: member.userId,
    role: member.role,
    name: member.name || "Unknown user",
    email: member.email || "",
  }));
}

export async function fetchWorkspaceActivity(
  workspaceId: string,
): Promise<WorkspaceActivityItem[]> {
  const response = await apiGet<
    Array<{
      id?: string;
      _id?: string;
      type: "PROJECT" | "TASK" | "COMMENT" | "INVITATION" | "JOIN_REQUEST";
      message: string;
      createdAt?: string;
    }>
  >(`/api/workspace/${workspaceId}/activity`);
  if (!response.success || !response.data) {
    return [];
  }

  return response.data.map((entry) => ({
    id: getId(entry),
    type: entry.type,
    message: entry.message,
    createdAt: entry.createdAt,
  }));
}

export async function fetchProjectTasks(
  projectId: string,
): Promise<TaskRecord[]> {
  const response = await apiGet<
    Array<{
      id?: string;
      _id?: string;
      title: string;
      projectId: string;
      workspaceId: string;
      assignedTo?:
        | string
        | {
            id?: string;
            _id?: string;
            name?: string;
            email?: string;
          }
        | null;
      status: TaskStatus;
      dueDate?: string;
      createdAt?: string;
      updatedAt?: string;
    }>
  >(`/api/task/project/${projectId}`);
  if (!response.success || !response.data) {
    return [];
  }
  return response.data.map(toTaskRecord).filter((task) => Boolean(task.id));
}

export async function createProject(payload: {
  name: string;
  workspaceId: string;
  members?: string[];
}) {
  return apiPost<{ id?: string; _id?: string }>("/api/project", payload);
}

export async function addMembersToProject(
  projectId: string,
  members: string[],
) {
  return apiPost<{ id?: string; _id?: string }>(
    `/api/project/${projectId}/members`,
    { members },
  );
}

export async function createTask(payload: {
  title: string;
  projectId: string;
  workspaceId: string;
  assignedTo?: string | null;
  status?: TaskStatus;
  dueDate?: string;
}) {
  return apiPost<{
    id?: string;
    _id?: string;
    title: string;
    projectId: string;
    workspaceId: string;
    assignedTo?:
      | string
      | {
          id?: string;
          _id?: string;
          name?: string;
          email?: string;
        }
      | null;
    status: TaskStatus;
    dueDate?: string;
    createdAt?: string;
    updatedAt?: string;
  }>("/api/task", payload);
}

export async function updateTask(
  taskId: string,
  payload: {
    title?: string;
    assignedTo?: string | null;
    status?: TaskStatus;
    dueDate?: string;
  },
) {
  return apiCall<{
    id?: string;
    _id?: string;
    title: string;
    projectId: string;
    workspaceId: string;
    assignedTo?:
      | string
      | {
          id?: string;
          _id?: string;
          name?: string;
          email?: string;
        }
      | null;
    status: TaskStatus;
    dueDate?: string;
    createdAt?: string;
    updatedAt?: string;
  }>("PATCH", `/api/task/${taskId}`, payload);
}

export async function fetchNotifications(workspaceId?: string) {
  const query = workspaceId
    ? `?workspaceId=${encodeURIComponent(workspaceId)}`
    : "";
  const response = await apiGet<
    Array<{
      id: string;
      type: "TASK_ASSIGNED";
      title: string;
      message: string;
      workspaceId: string;
      projectId: string;
      taskId: string;
      project?: { id: string; name: string };
      task?: { id: string; title: string };
      isRead: boolean;
      createdAt: string;
    }>
  >(`/api/notifications${query}`);

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch notifications");
  }

  return response.data;
}

export async function markNotificationsRead(workspaceId?: string) {
  return apiCall<{ updatedCount: number }>(
    "PATCH",
    "/api/notifications/read-all",
    {
      workspaceId,
    },
  );
}

export async function markNotificationRead(notificationId: string) {
  return apiCall<{ updated: boolean }>(
    "PATCH",
    `/api/notifications/${notificationId}/read`,
  );
}

export async function inviteMember(payload: {
  email: string;
  workspaceId: string;
  role: "ADMIN" | "MEMBER";
}) {
  const { workspaceId, ...body } = payload;
  return apiPost<{
    invitationId: string;
    email: string;
    token: string;
    reusedExisting: boolean;
    emailSent: boolean;
    inviteLink: string;
    providerId?: string;
    emailError?: string;
  }>(`/api/workspaces/${workspaceId}/invite`, body);
}

export async function clearWorkspaceInvitations(workspaceId: string) {
  return apiDelete<{ workspaceId: string; expiredCount: number }>(
    `/api/workspace/${workspaceId}/invitations`,
  );
}

export async function promoteWorkspaceMember(payload: {
  workspaceId: string;
  memberId: string;
}) {
  return apiPost("/api/workspace/promote", payload);
}

export async function searchWorkspaces(query: string) {
  const response = await apiGet<WorkspaceSearchRecord[]>(
    `/api/workspaces/search?q=${encodeURIComponent(query)}`,
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to search workspaces");
  }

  return response.data;
}

export async function requestWorkspaceJoin(workspaceId: string) {
  return apiPost<{ requestId: string; alreadyPending?: boolean }>(
    `/api/workspaces/${workspaceId}/request`,
  );
}

export async function fetchPendingJoinRequests(workspaceId: string) {
  const response = await apiGet<PendingJoinRequest[]>(
    `/api/workspaces/${workspaceId}/requests`,
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch pending join requests");
  }

  return response.data;
}

export async function acceptJoinRequest(requestId: string) {
  return apiPost(`/api/join-requests/${requestId}/accept`);
}

export async function rejectJoinRequest(requestId: string) {
  return apiPost(`/api/join-requests/${requestId}/reject`);
}

export async function updateWorkspaceSettings(
  workspaceId: string,
  payload: {
    name?: string;
    description?: string;
    discoverability?: "PUBLIC" | "PRIVATE";
  },
) {
  return apiCall("PATCH", `/api/workspace/${workspaceId}`, payload);
}
