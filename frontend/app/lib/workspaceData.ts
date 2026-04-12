export interface WorkspaceTask {
  id: string;
  title: string;
  status?: "TODO" | "IN_PROGRESS" | "DONE" | string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | string;
  assigneeId?: string;
  dueDate?: string;
}

export interface WorkspaceProject {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  tasks: WorkspaceTask[];
}

export type AccessUser = {
  id?: string | null;
  role?: string | null;
};

const ADMIN_ROLES = new Set(["OWNER", "ADMIN", "WORKSPACE_ADMIN"]);

export const demoWorkspaces: WorkspaceProject[] = [
  {
    id: "proj-1",
    title: "AI Workspace Launch",
    description: "Build MVP for centralized project intelligence",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
    tasks: [
      {
        id: "task-1",
        title: "Define onboarding UX",
        status: "TODO",
        priority: "HIGH",
        assigneeId: "user-1",
      },
      {
        id: "task-2",
        title: "Implement auth and session",
        status: "IN_PROGRESS",
        priority: "HIGH",
        assigneeId: "user-2",
      },
      {
        id: "task-3",
        title: "QA release checklist",
        status: "DONE",
        priority: "MEDIUM",
        assigneeId: "user-3",
      },
    ],
  },
  {
    id: "proj-2",
    title: "Onboarding Automation",
    description: "Automate employee onboarding workflows",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35).toISOString(),
    tasks: [
      {
        id: "task-4",
        title: "Define workflow triggers",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        assigneeId: "user-1",
      },
    ],
  },
];

export async function fetchWorkspaces(
  organizationId: string,
  token?: string | null,
): Promise<WorkspaceProject[]> {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const response = await fetch(`/api/projects/${organizationId}`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load workspaces.");
  }

  const json = await response.json();
  return Array.isArray(json.data) ? json.data : [];
}

export function isAdminRole(role?: string | null): boolean {
  if (!role) {
    return false;
  }

  return ADMIN_ROLES.has(role.toUpperCase());
}

export function filterProjectsByAccess(
  projects: WorkspaceProject[],
  user: AccessUser,
): WorkspaceProject[] {
  if (isAdminRole(user.role)) {
    return projects;
  }

  if (!user.id) {
    return [];
  }

  return projects.filter((project) =>
    (project.tasks || []).some((task) => task.assigneeId === user.id),
  );
}

export function getWorkspaceById(
  workspaces: WorkspaceProject[],
  id: string,
): WorkspaceProject | undefined {
  return workspaces.find((workspace) => workspace.id === id);
}

export function getProjectById(
  projects: WorkspaceProject[],
  id: string,
): WorkspaceProject | undefined {
  return projects.find((project) => project.id === id);
}
