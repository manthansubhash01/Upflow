"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FolderKanban,
  MessageSquareText,
  Users,
} from "lucide-react";
import {
  fetchProjects,
  fetchProjectTasks,
  fetchWorkspaceActivity,
  fetchWorkspaceMembers,
  type ProjectRecord,
  type WorkspaceActivityItem,
  type WorkspaceMemberProfile,
} from "@/app/lib/workspaceApi";
import { useAuth } from "@/app/components/AuthProvider";

type DashboardMetric = {
  label: string;
  value: number;
  tone: "violet" | "sky" | "emerald" | "amber";
};

export default function WorkspaceDashboardPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const workspaceId = params.id;

  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [members, setMembers] = useState<WorkspaceMemberProfile[]>([]);
  const [activity, setActivity] = useState<WorkspaceActivityItem[]>([]);
  const [taskCountByProject, setTaskCountByProject] = useState<
    Record<string, number>
  >({});
  const [completedTaskCount, setCompletedTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [workspaceProjects, workspaceMembers, workspaceActivity] =
          await Promise.all([
            fetchProjects(workspaceId),
            fetchWorkspaceMembers(workspaceId),
            fetchWorkspaceActivity(workspaceId),
          ]);

        setProjects(workspaceProjects);
        setMembers(workspaceMembers);
        setActivity(workspaceActivity);

        const projectTaskEntries = await Promise.all(
          workspaceProjects.map(async (project) => {
            const tasks = await fetchProjectTasks(project.id);
            return {
              projectId: project.id,
              total: tasks.length,
              completed: tasks.filter((task) => task.status === "DONE").length,
            };
          }),
        );

        setTaskCountByProject(
          Object.fromEntries(
            projectTaskEntries.map((entry) => [entry.projectId, entry.total]),
          ),
        );
        setCompletedTaskCount(
          projectTaskEntries.reduce((sum, entry) => sum + entry.completed, 0),
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load workspace data",
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [workspaceId]);

  const metrics = useMemo<DashboardMetric[]>(() => {
    const totalProjects = projects.length;
    const totalTasks = Object.values(taskCountByProject).reduce(
      (sum, count) => sum + count,
      0,
    );

    return [
      { label: "Total Projects", value: totalProjects, tone: "violet" },
      { label: "Total Tasks", value: totalTasks, tone: "sky" },
      { label: "Completed Tasks", value: completedTaskCount, tone: "emerald" },
      { label: "Members", value: members.length, tone: "amber" },
    ];
  }, [projects, taskCountByProject, members.length, completedTaskCount]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          Loading workspace data...
        </div>
      ) : null}
      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <motion.div
                key={metric.label}
                whileHover={{ y: -2 }}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm text-slate-500">{metric.label}</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="text-3xl font-semibold tracking-[-0.05em] text-slate-900">
                    {metric.value}
                  </p>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${metric.tone === "violet" ? "bg-brand-100 text-brand-700" : metric.tone === "sky" ? "bg-sky-100 text-sky-700" : metric.tone === "emerald" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {metric.label === "Total Projects" ? (
                      <FolderKanban className="h-5 w-5" />
                    ) : metric.label === "Total Tasks" ? (
                      <Clock3 className="h-5 w-5" />
                    ) : metric.label === "Completed Tasks" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Users className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold tracking-[-0.03em] text-slate-900">
                  Projects
                </h3>
                <button
                  onClick={() =>
                    router.push(`/workspace/${workspaceId}/projects`)
                  }
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:underline"
                >
                  View all <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              {projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.slice(0, 5).map((project) => (
                    <motion.button
                      whileHover={{ y: -2 }}
                      key={project.id}
                      onClick={() =>
                        router.push(
                          `/workspace/${workspaceId}/projects/${project.id}`,
                        )
                      }
                      className="w-full rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-violet-200"
                    >
                      <h4 className="text-base font-semibold text-slate-900">
                        {project.name}
                      </h4>
                      <p className="mt-1 text-sm text-slate-600">
                        Tasks: {taskCountByProject[project.id] || 0}
                      </p>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                  No projects yet. Create your first project.
                </div>
              )}
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-semibold tracking-[-0.03em] text-slate-900">
                Activity Feed
              </h3>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                {activity.length > 0 ? (
                  <div className="space-y-4">
                    {activity.slice(0, 6).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                      >
                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                          <MessageSquareText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {item.message}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString()
                              : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No activity yet.</p>
                )}
              </div>
            </section>
          </div>

          <div className="rounded-3xl border border-dashed border-violet-200 bg-violet-50/60 p-5 text-sm text-slate-600">
            Logged in as{" "}
            <span className="font-semibold text-slate-900">
              {user?.name || "Current user"}
            </span>{" "}
            in{" "}
            <span className="font-semibold text-slate-900">{workspaceId}</span>.
          </div>
        </>
      ) : null}
    </div>
  );
}
