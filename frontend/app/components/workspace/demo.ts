export type WorkspaceDemo = {
  id: string;
  name: string;
  initials: string;
  role: string;
};

export type WorkspaceMetric = {
  label: string;
  value: string;
  tone: "violet" | "sky" | "emerald" | "amber";
};

export type WorkspaceProject = {
  id: string;
  title: string;
  description: string;
  goal: string;
  lead: string;
  progress: number;
  targetDate: string;
  status: string;
  members: string[];
};

export type WorkspaceTask = {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High";
  comments: number;
  status: "Todo" | "In Progress" | "Done";
};

export type WorkspaceMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  projects: number;
  joined: string;
  avatar: string;
};

export type NotificationItem = {
  id: string;
  icon: "task" | "comment" | "invite" | "project" | "admin";
  message: string;
  time: string;
  unread?: boolean;
};

export const demoWorkspaces: WorkspaceDemo[] = [
  { id: "workspace-1", name: "workspace-1", initials: "W", role: "Admin" },
  { id: "kalaparty", name: "kalaparty", initials: "K", role: "Member" },
];

export const workspaceMetrics: WorkspaceMetric[] = [
  { label: "Total Projects", value: "8", tone: "violet" },
  { label: "Total Tasks", value: "42", tone: "sky" },
  { label: "Completed Tasks", value: "18", tone: "emerald" },
  { label: "Members", value: "5", tone: "amber" },
];

export const recentProjects: WorkspaceProject[] = [
  {
    id: "sesd",
    title: "SESD",
    description: "A focused product effort for the current sprint.",
    goal: "Ship the first usable release for the team.",
    lead: "Manthan Ziman",
    progress: 65,
    targetDate: "2026-05-15",
    status: "In Progress",
    members: ["MZ", "JP", "SR"],
  },
  {
    id: "onboarding",
    title: "Onboarding Automation",
    description: "Automate employee onboarding workflows.",
    goal: "Reduce manual setup by 80%.",
    lead: "Sarah Smith",
    progress: 42,
    targetDate: "2026-06-10",
    status: "In Progress",
    members: ["SS", "AM"],
  },
  {
    id: "mobile",
    title: "Mobile App Redesign",
    description: "Complete UX overhaul for iOS and Android.",
    goal: "Modernize key task and inbox flows.",
    lead: "Mike Johnson",
    progress: 28,
    targetDate: "2026-07-20",
    status: "Planning",
    members: ["MJ", "AV", "DP", "KL"],
  },
];

export const projectTasks: WorkspaceTask[] = [
  {
    id: "task-1",
    title: "Design system components",
    description: "Polish the primary dashboard cards and sidebar states.",
    assignee: "Sarah Smith",
    dueDate: "Apr 20",
    priority: "High",
    comments: 3,
    status: "In Progress",
  },
  {
    id: "task-2",
    title: "Backend API setup",
    description: "Connect auth, workspaces, and task routes.",
    assignee: "Mike Johnson",
    dueDate: "Apr 25",
    priority: "High",
    comments: 1,
    status: "Todo",
  },
  {
    id: "task-3",
    title: "Database schema",
    description: "Finalize project and invitation schemas.",
    assignee: "Manthan Ziman",
    dueDate: "Apr 10",
    priority: "Medium",
    comments: 2,
    status: "Done",
  },
  {
    id: "task-4",
    title: "Inbox notifications",
    description: "Build notification feed and read states.",
    assignee: "Aditi Verma",
    dueDate: "Apr 28",
    priority: "Medium",
    comments: 4,
    status: "In Progress",
  },
  {
    id: "task-5",
    title: "Project list filter",
    description: "Add search and filter controls to projects page.",
    assignee: "Priya Shah",
    dueDate: "Apr 30",
    priority: "Low",
    comments: 0,
    status: "Todo",
  },
];

export const workspaceMembers: WorkspaceMember[] = [
  {
    id: "u1",
    name: "Manthan Ziman",
    email: "manthanziman01@gmail.com",
    role: "Admin",
    projects: 8,
    joined: "Apr 8",
    avatar: "M",
  },
  {
    id: "u2",
    name: "Sarah Smith",
    email: "sarah@example.com",
    role: "Member",
    projects: 5,
    joined: "Apr 8",
    avatar: "S",
  },
  {
    id: "u3",
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "Member",
    projects: 3,
    joined: "Apr 8",
    avatar: "M",
  },
  {
    id: "u4",
    name: "Aditi Verma",
    email: "aditi@example.com",
    role: "Member",
    projects: 2,
    joined: "Apr 9",
    avatar: "A",
  },
];

export const notifications: NotificationItem[] = [
  {
    id: "n1",
    icon: "task",
    message: "Sarah assigned you Task #142",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "n2",
    icon: "comment",
    message: "John commented on AI Workspace Launch",
    time: "1 day ago",
  },
  {
    id: "n3",
    icon: "project",
    message: "You were invited to Project SESD",
    time: "2 days ago",
  },
  {
    id: "n4",
    icon: "invite",
    message: "Invitation accepted by Michael",
    time: "3 days ago",
  },
  {
    id: "n5",
    icon: "admin",
    message: "You were promoted to admin",
    time: "4 days ago",
  },
];

export const invitationDemo = {
  workspaceName: "kalaparty",
  email: "manthanziman01@gmail.com",
  role: "Member",
  hasAccount: true,
};
