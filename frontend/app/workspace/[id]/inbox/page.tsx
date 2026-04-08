"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useNotifications } from "@/app/components/workspace/NotificationsProvider";

function formatTimeAgo(value: string): string {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return "Just now";
  }

  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (diffSeconds < 60) {
    return "Just now";
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function WorkspaceInboxPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const workspaceId = params.id;
  const { notifications, refreshNotifications, markAsRead } =
    useNotifications();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const workspaceNotifications = useMemo(
    () =>
      notifications
        .filter((entry) => entry.workspaceId === workspaceId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [notifications, workspaceId],
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        await refreshNotifications(workspaceId);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load notifications",
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [refreshNotifications, workspaceId]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">
          Workspace Inbox
        </p>
        <h2 className="mt-1 text-3xl font-semibold tracking-[-0.05em] text-slate-900">
          Notifications
        </h2>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          Loading notifications...
        </div>
      ) : null}
      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {workspaceNotifications.length > 0 ? (
            workspaceNotifications.map((item) => {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={async () => {
                    await markAsRead(item.id);
                    router.push(
                      `/workspace/${workspaceId}/projects/${item.projectId}?task=${item.taskId}`,
                    );
                  }}
                  className={`flex w-full items-start gap-4 border-b px-5 py-4 text-left transition hover:bg-slate-50 last:border-0 ${
                    item.isRead
                      ? "border-slate-200 bg-white"
                      : "border-violet-200 bg-violet-50"
                  }`}
                >
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      {!item.isRead ? (
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-violet-600" />
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {item.message}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Project: {item.project?.name || "Unknown project"}
                      {item.task?.title ? ` • Task: ${item.task.title}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatTimeAgo(item.createdAt)}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <Bell className="h-5 w-5" />
              </div>
              <p className="text-base font-semibold text-slate-900">
                No notifications yet
              </p>
              <p className="text-sm text-slate-500">
                Recent workspace events will appear here.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
