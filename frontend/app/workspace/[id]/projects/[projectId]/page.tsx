"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Columns3,
  List,
  MessageSquareText,
  Paperclip,
  SquareKanban,
  Users,
} from "lucide-react";
import { useAuth } from "@/app/components/AuthProvider";
import ProjectCalendar from "@/app/components/projects/project-calendar";
import ProjectProgressChart from "@/app/components/projects/project-progress-chart";
import { getSocket } from "@/app/lib/socket";
import {
  addMembersToProject,
  createTask,
  fetchWorkspaceMembers,
  fetchProjectTasks,
  fetchProjects,
  toTaskRecord,
  type ProjectRecord,
  type TaskRecord,
  type TaskStatus,
  type WorkspaceMemberProfile,
  updateTask,
} from "@/app/lib/workspaceApi";

const tabs = ["Dashboard", "Tasks", "Members", "Calendar"] as const;
type TaskView = "board" | "list";
type BoardLane = "Backlog" | "Todo" | "In Progress" | "Completed";

const laneToStatus: Record<BoardLane, TaskStatus> = {
  Backlog: "BACKLOG",
  Todo: "TODO",
  "In Progress": "IN_PROGRESS",
  Completed: "DONE",
};

const statusToLane: Record<TaskStatus, BoardLane> = {
  BACKLOG: "Backlog",
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Completed",
};

const laneTone: Record<BoardLane, string> = {
  Backlog: "border-amber-300",
  Todo: "border-violet-300",
  "In Progress": "border-sky-300",
  Completed: "border-emerald-300",
};

export default function ProjectDetailPage() {
  const params = useParams<{ id: string; projectId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user } = useAuth();
  const workspaceId = params.id;
  const projectId = params.projectId;
  const taskId = searchParams.get("task")?.trim() || "";

  const [tab, setTab] = useState<(typeof tabs)[number]>("Dashboard");
  const [taskView, setTaskView] = useState<TaskView>("board");

  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const [error, setError] = useState("");
  const lastInvalidTaskIdRef = useRef<string | null>(null);
  const pendingTaskIds = useRef<Set<string>>(new Set());

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("BACKLOG");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskAssigneeSearch, setNewTaskAssigneeSearch] = useState("");
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState<string | null>(
    null,
  );
  const [showAssigneeSuggestions, setShowAssigneeSuggestions] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);

  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<
    WorkspaceMemberProfile[]
  >([]);
  const [loadingWorkspaceMembers, setLoadingWorkspaceMembers] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [addingMembers, setAddingMembers] = useState(false);
  const [memberModalError, setMemberModalError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [projects, projectTasks, members] = await Promise.all([
        fetchProjects(workspaceId),
        fetchProjectTasks(projectId),
        fetchWorkspaceMembers(workspaceId),
      ]);

      const targetProject =
        projects.find((item) => item.id === projectId) || null;

      const memberById = new Map(
        members.map((member) => [member.userId, member]),
      );

      const enrichedProject = targetProject
        ? {
            ...targetProject,
            members: targetProject.members.map((member) => {
              if (member.name && member.name !== "Unknown") {
                return member;
              }

              const workspaceMember = memberById.get(member.id);
              if (!workspaceMember) {
                return member;
              }

              return {
                id: member.id,
                name: workspaceMember.name,
                email: member.email || workspaceMember.email,
              };
            }),
          }
        : null;

      setWorkspaceMembers(members);
      setProject(enrichedProject);
      setTasks(projectTasks);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load project details",
      );
    } finally {
      setLoading(false);
    }
  }, [projectId, workspaceId]);

  useEffect(() => {
    if (!loading) {
      setTimedOut(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setTimedOut(true);
      setError("Page took too long to load. Please retry.");
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedTask = useMemo(
    () => tasks.find((entry) => entry.id === taskId) || null,
    [taskId, tasks],
  );

  useEffect(() => {
    if (!taskId || loading) {
      if (!taskId) {
        lastInvalidTaskIdRef.current = null;
      }
      return;
    }

    if (selectedTask) {
      if (tab !== "Tasks") {
        setTab("Tasks");
      }
      return;
    }

    if (lastInvalidTaskIdRef.current === taskId) {
      return;
    }

    lastInvalidTaskIdRef.current = taskId;
    setError("The selected task is no longer available.");
    router.replace(`/workspace/${workspaceId}/projects/${projectId}`);
  }, [loading, projectId, router, selectedTask, tab, taskId, workspaceId]);

  useEffect(() => {
    if (!token || !user?.id || !workspaceId || !projectId) {
      return;
    }

    const socket = getSocket(token);
    if (!socket.connected) {
      socket.connect();
    }
    const registerAndJoin = () => {
      socket.emit("register-user", user.id);
      socket.emit("joinWorkspace", workspaceId);
    };

    registerAndJoin();

    const onTaskCreated = (payload: {
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
    }) => {
      const mapped = toTaskRecord(payload);
      if (mapped.projectId !== projectId) {
        return;
      }

      // If we already added this task optimistically, skip the socket echo.
      if (pendingTaskIds.current.has(mapped.id)) {
        pendingTaskIds.current.delete(mapped.id);
        return;
      }

      setTasks((current) => {
        if (current.some((task) => task.id === mapped.id)) {
          return current;
        }
        return [mapped, ...current];
      });
    };

    const onTaskUpdated = (payload: {
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
    }) => {
      const mapped = toTaskRecord(payload);
      if (mapped.projectId !== projectId) {
        return;
      }

      setTasks((current) =>
        current.map((task) => (task.id === mapped.id ? mapped : task)),
      );
    };

    const onTaskDeleted = (payload: {
      id?: string;
      _id?: string;
      projectId?: string;
    }) => {
      const deletedTaskId = payload.id || payload._id;
      if (!deletedTaskId) {
        return;
      }

      if (payload.projectId && payload.projectId !== projectId) {
        return;
      }

      setTasks((current) =>
        current.filter((task) => task.id !== deletedTaskId),
      );
    };

    const onConnect = () => {
      registerAndJoin();
      setError((current) => (current.startsWith("Realtime") ? "" : current));
    };

    const onDisconnect = () => {
      setError("Realtime disconnected. Reconnecting...");
    };

    const onReconnect = () => {
      registerAndJoin();
      void load();
    };

    socket.on("taskCreated", onTaskCreated);
    socket.on("taskUpdated", onTaskUpdated);
    socket.on("taskDeleted", onTaskDeleted);
    socket.on("task-deleted", onTaskDeleted);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.io.on("reconnect", onReconnect);

    return () => {
      socket.off("taskCreated", onTaskCreated);
      socket.off("taskUpdated", onTaskUpdated);
      socket.off("taskDeleted", onTaskDeleted);
      socket.off("task-deleted", onTaskDeleted);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.io.off("reconnect", onReconnect);
    };
  }, [load, projectId, token, user?.id, workspaceId]);

  const openTaskFromContext = useCallback(
    (nextTaskId: string) => {
      setTab("Tasks");
      router.push(
        `/workspace/${workspaceId}/projects/${projectId}?task=${nextTaskId}`,
      );
    },
    [projectId, router, workspaceId],
  );

  const backlog = tasks.filter((task) => task.status === "BACKLOG");
  const todo = tasks.filter((task) => task.status === "TODO");
  const inProgress = tasks.filter((task) => task.status === "IN_PROGRESS");
  const done = tasks.filter((task) => task.status === "DONE");

  const boardColumns = useMemo(() => {
    return (["Backlog", "Todo", "In Progress", "Completed"] as const).map(
      (lane) => ({
        lane,
        items: tasks.filter((task) => statusToLane[task.status] === lane),
      }),
    );
  }, [tasks]);

  const moveTask = async (taskId: string, lane: BoardLane) => {
    const status = laneToStatus[lane];
    const previousTasks = tasks;
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, status } : task)),
    );

    const response = await updateTask(taskId, { status });
    if (!response.success) {
      setTasks(previousTasks);
      setError(response.error || "Failed to move task");
      return;
    }

    if (response.data) {
      const mapped = toTaskRecord(response.data);
      setTasks((current) =>
        current.map((task) => (task.id === mapped.id ? mapped : task)),
      );
    }
  };

  const handleDropTask = (
    event: React.DragEvent<HTMLDivElement>,
    lane: BoardLane,
  ) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/plain");
    if (!taskId) {
      return;
    }

    void moveTask(taskId, lane);
  };

  const handleAssignTask = async (taskId: string, assigneeId: string) => {
    const nextAssignedTo = assigneeId || null;

    const response = await updateTask(taskId, {
      assignedTo: nextAssignedTo,
    });

    if (!response.success) {
      setError(response.error || "Failed to update assignee");
      return;
    }

    if (response.data) {
      const mapped = toTaskRecord(response.data);
      setTasks((current) =>
        current.map((task) => (task.id === mapped.id ? mapped : task)),
      );
      return;
    }

    await load();
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    setCreatingTask(true);
    try {
      const dueDate = newTaskDueDate
        ? new Date(newTaskDueDate).toISOString()
        : undefined;
      const response = await createTask({
        title: newTaskTitle,
        projectId,
        workspaceId,
        assignedTo: newTaskAssigneeId,
        status: newTaskStatus,
        dueDate,
      });
      if (!response.success) {
        throw new Error(response.error || "Failed to create task");
      }
      setNewTaskTitle("");
      setNewTaskDueDate("");
      setNewTaskStatus("BACKLOG");
      setNewTaskAssigneeId(null);
      setNewTaskAssigneeSearch("");

      if (response.data) {
        const mapped = toTaskRecord(response.data);
        // Register this id so the socket echo doesn't duplicate the task.
        pendingTaskIds.current.add(mapped.id);
        setTasks((current) => {
          if (current.some((t) => t.id === mapped.id)) return current;
          return [mapped, ...current];
        });
      } else {
        await load();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setCreatingTask(false);
    }
  };

  const openAddMemberModal = async () => {
    setIsAddMemberModalOpen(true);
    setMemberSearch("");
    setSelectedMemberIds([]);
    setMemberModalError("");
    setLoadingWorkspaceMembers(true);

    try {
      const members = await fetchWorkspaceMembers(workspaceId);
      setWorkspaceMembers(members);
    } catch (err) {
      setMemberModalError(
        err instanceof Error ? err.message : "Failed to load workspace members",
      );
    } finally {
      setLoadingWorkspaceMembers(false);
    }
  };

  const closeAddMemberModal = () => {
    setIsAddMemberModalOpen(false);
    setMemberSearch("");
    setSelectedMemberIds([]);
    setMemberModalError("");
  };

  const currentProjectMemberIds = new Set(
    (project?.members || []).map((member) => member.id),
  );
  const availableWorkspaceMembers = workspaceMembers.filter(
    (member) => !currentProjectMemberIds.has(member.userId),
  );

  const selectedMembers = selectedMemberIds
    .map((selectedId) =>
      availableWorkspaceMembers.find((member) => member.userId === selectedId),
    )
    .filter((member): member is WorkspaceMemberProfile => Boolean(member));

  const suggestionMembers = memberSearch.trim()
    ? availableWorkspaceMembers
        .filter(
          (member) =>
            !selectedMemberIds.includes(member.userId) &&
            member.name.toLowerCase().includes(memberSearch.toLowerCase()),
        )
        .slice(0, 8)
    : [];

  const assignableProjectMembers = project?.members || [];
  const selectedAssignee = assignableProjectMembers.find(
    (member) => member.id === newTaskAssigneeId,
  );

  const assigneeSuggestions = newTaskAssigneeSearch.trim()
    ? assignableProjectMembers
        .filter((member) =>
          `${member.name} ${member.email || ""}`
            .toLowerCase()
            .includes(newTaskAssigneeSearch.toLowerCase()),
        )
        .slice(0, 8)
    : assignableProjectMembers.slice(0, 8);

  const addSelectedMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev : [...prev, memberId],
    );
    setMemberSearch("");
  };

  const removeSelectedMember = (memberId: string) => {
    setSelectedMemberIds((prev) => prev.filter((id) => id !== memberId));
  };

  const handleAddMembersToProject = async () => {
    if (selectedMemberIds.length === 0) {
      return;
    }

    setAddingMembers(true);
    setMemberModalError("");

    try {
      const response = await addMembersToProject(projectId, selectedMemberIds);
      if (!response.success) {
        throw new Error(response.error || "Failed to add members to project");
      }

      await load();
      closeAddMemberModal();
    } catch (err) {
      setMemberModalError(
        err instanceof Error ? err.message : "Failed to add members to project",
      );
    } finally {
      setAddingMembers(false);
    }
  };

  if (loading) {
    if (timedOut) {
      return (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          <p className="font-semibold">Page took too long to load.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setTimedOut(false);
                void load();
              }}
              className="rounded-full bg-brand-700 px-4 py-2 text-xs font-semibold text-white"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-800"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Loading project details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="rounded-3xl border border-slate-300 bg-white p-6 text-sm text-slate-600">
        Project not found in this workspace.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">
              Project
            </p>
            <h2 className="mt-1 text-4xl font-semibold tracking-[-0.04em] text-slate-900">
              {project.name}
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Project ID: {project.id}
            </p>
          </div>
          <div className="rounded-full bg-brand-50 px-4 py-2 text-sm text-brand-700">
            Workspace:{" "}
            <span className="font-semibold">{project.workspaceId}</span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === item
                  ? "bg-brand-700 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {tab === "Dashboard" ? (
        <section className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total Tasks", value: tasks.length, icon: SquareKanban },
              { label: "Completed", value: done.length, icon: CheckCircle2 },
              {
                label: "In Progress",
                value: inProgress.length,
                icon: MessageSquareText,
              },
              { label: "Members", value: project.members.length, icon: Users },
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.label}
                  whileHover={{ y: -2 }}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{metric.label}</p>
                      <p className="mt-1 text-4xl font-semibold tracking-[-0.06em] text-slate-900">
                        {metric.value}
                      </p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
            <div className="min-h-0 w-full min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <ProjectProgressChart
                backlogTasks={backlog.length}
                todoTasks={todo.length}
                inProgressTasks={inProgress.length}
                completedTasks={done.length}
              />
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">
                  Recent Tasks
                </p>
                <div className="mt-4 space-y-3">
                  {tasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      className="border-b border-slate-100 pb-3 text-sm last:border-0 last:pb-0"
                    >
                      <p className="font-medium text-slate-900">{task.title}</p>
                      <p className="text-xs text-slate-500">{task.status}</p>
                    </div>
                  ))}
                  {tasks.length === 0 ? (
                    <p className="text-sm text-slate-500">No tasks yet.</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {tab === "Tasks" ? (
        <section className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">
              Create Task
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input
                value={newTaskTitle}
                onChange={(event) => setNewTaskTitle(event.target.value)}
                placeholder="Task title"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300 sm:col-span-2"
              />
              <select
                value={newTaskStatus}
                onChange={(event) =>
                  setNewTaskStatus(event.target.value as TaskStatus)
                }
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Completed</option>
              </select>
              <input
                type="date"
                value={newTaskDueDate}
                onChange={(event) => setNewTaskDueDate(event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300"
              />
            </div>
            <div className="relative mt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Assign To
              </p>
              <input
                value={
                  selectedAssignee
                    ? selectedAssignee.name
                    : newTaskAssigneeSearch
                }
                onFocus={() => setShowAssigneeSuggestions(true)}
                onChange={(event) => {
                  setNewTaskAssigneeId(null);
                  setNewTaskAssigneeSearch(event.target.value);
                  setShowAssigneeSuggestions(true);
                }}
                placeholder="Search project member..."
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300"
              />
              {showAssigneeSuggestions ? (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-56 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setNewTaskAssigneeId(null);
                      setNewTaskAssigneeSearch("");
                      setShowAssigneeSuggestions(false);
                    }}
                    className="w-full border-b border-slate-100 px-4 py-3 text-left text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Unassigned
                  </button>
                  {assigneeSuggestions.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        setNewTaskAssigneeId(member.id);
                        setNewTaskAssigneeSearch("");
                        setShowAssigneeSuggestions(false);
                      }}
                      className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {member.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {member.email || member.id}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => void handleCreateTask()}
                disabled={creatingTask || !newTaskTitle.trim()}
                className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
              >
                {creatingTask ? "Creating..." : "Add Task"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">
                Task Space
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Switch between board and list view.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                onClick={() => setTaskView("board")}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
                  taskView === "board"
                    ? "bg-brand-700 text-white"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Columns3 className="h-4 w-4" /> Board
              </button>
              <button
                onClick={() => setTaskView("list")}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${
                  taskView === "list"
                    ? "bg-brand-700 text-white"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                <List className="h-4 w-4" /> List
              </button>
            </div>
          </div>

          {taskView === "board" ? (
            <div className="grid gap-4 xl:grid-cols-4">
              {boardColumns.map((column) => (
                <div
                  key={column.lane}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDropTask(event, column.lane)}
                  className={`rounded-3xl border bg-white p-4 shadow-sm ${laneTone[column.lane]}`}
                >
                  <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">
                      {column.lane}
                    </h3>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {column.items.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {column.items.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                        No tasks yet.
                      </div>
                    ) : (
                      column.items.map((task) => (
                        <motion.div
                          key={task.id}
                          whileHover={{ y: -2 }}
                          draggable
                          onDragStart={(event) => {
                            const dragEvent = event as unknown as DragEvent;
                            if (dragEvent?.dataTransfer) {
                              dragEvent.dataTransfer.setData(
                                "text/plain",
                                task.id,
                              );
                            }
                          }}
                          className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
                        >
                          <p className="text-base font-semibold leading-tight text-slate-900">
                            {task.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Assigned to: {task.assignedTo?.name || "Unassigned"}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            {task.id}
                          </p>

                          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <MessageSquareText className="h-3.5 w-3.5" /> -
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Paperclip className="h-3.5 w-3.5" /> -
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-3.5 w-3.5" />{" "}
                              {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString()
                                : "No date"}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            {(
                              [
                                "Backlog",
                                "Todo",
                                "In Progress",
                                "Completed",
                              ] as BoardLane[]
                            ).map((lane) => (
                              <button
                                key={lane}
                                onClick={() => void moveTask(task.id, lane)}
                                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${lane === statusToLane[task.status] ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-600"}`}
                              >
                                {lane}
                              </button>
                            ))}
                          </div>
                          <div className="mt-3">
                            <select
                              value={task.assignedTo?.id || ""}
                              onChange={(event) =>
                                void handleAssignTask(
                                  task.id,
                                  event.target.value,
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-violet-300"
                            >
                              <option value="">Unassigned</option>
                              {project.members.map((member) => (
                                <option key={member.id} value={member.id}>
                                  {member.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="min-w-[700px] grid grid-cols-[1.4fr_0.8fr_1.2fr_1fr_1fr] border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <span>Task</span>
                <span>Status</span>
                <span>Assigned</span>
                <span>Due Date</span>
                <span>Actions</span>
              </div>
              <div className="min-w-[700px] divide-y divide-slate-200">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="grid grid-cols-[1.4fr_0.8fr_1.2fr_1fr_1fr] items-center px-5 py-4 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-500">{task.id}</p>
                    </div>
                    <span className="w-fit rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                      {statusToLane[task.status]}
                    </span>
                    <span className="text-slate-600">
                      {task.assignedTo?.name || "Unassigned"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <CalendarDays className="h-4 w-4" />{" "}
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "No date"}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={task.assignedTo?.id || ""}
                        onChange={(event) =>
                          void handleAssignTask(task.id, event.target.value)
                        }
                        className="rounded-full border border-slate-200 px-2.5 py-1 text-xs"
                      >
                        <option value="">Unassigned</option>
                        {project.members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => void moveTask(task.id, "Backlog")}
                        className="rounded-full border border-slate-200 px-2.5 py-1 text-xs"
                      >
                        Backlog
                      </button>
                      <button
                        onClick={() => void moveTask(task.id, "Todo")}
                        className="rounded-full border border-slate-200 px-2.5 py-1 text-xs"
                      >
                        Todo
                      </button>
                      <button
                        onClick={() => void moveTask(task.id, "In Progress")}
                        className="rounded-full border border-slate-200 px-2.5 py-1 text-xs"
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => void moveTask(task.id, "Completed")}
                        className="rounded-full border border-slate-200 px-2.5 py-1 text-xs"
                      >
                        Completed
                      </button>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-slate-500">
                    No tasks yet.
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </section>
      ) : null}

      {tab === "Members" ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Project Members
            </h3>
            <button
              onClick={() => void openAddMemberModal()}
              className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Add Member
            </button>
          </div>
          {project.members.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {project.members.map((member) => (
                <div
                  key={member.id}
                  className="rounded-[22px] border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="font-semibold text-slate-900">{member.name}</p>
                  {member.email ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {member.email}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No members assigned yet.
            </p>
          )}
        </div>
      ) : null}

      {tab === "Calendar" ? (
        <ProjectCalendar tasks={tasks} onOpenTask={openTaskFromContext} />
      ) : null}

      {isAddMemberModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 px-4">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">
                  Project Members
                </p>
                <h3 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                  Add Project Members
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Add existing workspace members to this project.
                </p>
              </div>
              <button
                onClick={closeAddMemberModal}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            {memberModalError ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {memberModalError}
              </div>
            ) : null}

            {loadingWorkspaceMembers ? (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Loading workspace members...
              </div>
            ) : null}

            {!loadingWorkspaceMembers &&
            availableWorkspaceMembers.length > 0 ? (
              <div className="mt-5 space-y-4">
                <div className="relative">
                  <input
                    value={memberSearch}
                    onChange={(event) => setMemberSearch(event.target.value)}
                    placeholder="Search workspace members..."
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300"
                  />

                  {memberSearch.trim() ? (
                    <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                      {suggestionMembers.length > 0 ? (
                        suggestionMembers.map((member) => (
                          <button
                            key={member.userId}
                            onClick={() => addSelectedMember(member.userId)}
                            className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 hover:bg-slate-50"
                          >
                            <div>
                              <p className="font-semibold text-slate-900">
                                {member.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {member.email || member.userId}
                              </p>
                            </div>
                            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                              Select
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-slate-500">
                          No matching workspace members.
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">
                    Selected Members
                  </p>
                  {selectedMembers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedMembers.map((member) => (
                        <span
                          key={member.userId}
                          className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm text-violet-700"
                        >
                          {member.name}
                          <button
                            onClick={() => removeSelectedMember(member.userId)}
                            className="rounded-full px-1 text-violet-700 hover:bg-violet-100"
                          >
                            x
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      Search and select one or more members.
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={closeAddMemberModal}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => void handleAddMembersToProject()}
                    disabled={selectedMemberIds.length === 0 || addingMembers}
                    className="rounded-full bg-brand-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-70"
                  >
                    {addingMembers ? "Adding..." : "Add to Project"}
                  </button>
                </div>
              </div>
            ) : null}

            {!loadingWorkspaceMembers &&
            availableWorkspaceMembers.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                {workspaceMembers.length <= 1 ? (
                  <>
                    <p className="text-sm font-medium text-slate-900">
                      No workspace members available. Invite someone to
                      continue.
                    </p>
                    <button
                      onClick={() =>
                        router.push(
                          `/workspace/${workspaceId}/members?invite=1`,
                        )
                      }
                      className="mt-3 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Invite Member
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-900">
                      All workspace members are already added to this project.
                    </p>
                    <button
                      onClick={() =>
                        router.push(
                          `/workspace/${workspaceId}/members?invite=1`,
                        )
                      }
                      className="mt-3 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
                    >
                      Invite New Member
                    </button>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
