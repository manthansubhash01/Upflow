"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Search,
  ChevronDown,
  FolderKanban,
  Home,
  Inbox,
  LogOut,
  Menu,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { useAuth } from "@/app/components/AuthProvider";
import { fetchWorkspaces, type WorkspaceRecord } from "@/app/lib/workspaceApi";
import { useNotifications } from "@/app/components/workspace/NotificationsProvider";

interface WorkspaceShellProps {
  workspaceId: string;
  title: string;
  description?: string;
  children: ReactNode;
}

const navItems = [
  { label: "Dashboard", href: "", icon: Home },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Members", href: "/members", icon: Users },
  { label: "Inbox", href: "/inbox", icon: Inbox },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function WorkspaceShell({
  workspaceId,
  title,
  description,
  children,
}: WorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    notifications,
    unreadCount,
    toastMessage,
    clearToast,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const normalizedWorkspaceId =
    workspaceId && workspaceId !== "undefined" ? workspaceId : "";

  useEffect(() => {
    const load = async () => {
      const next = await fetchWorkspaces();
      setWorkspaces(next);
    };
    void load();
  }, []);

  const currentWorkspace = useMemo(
    () =>
      workspaces.find((workspace) => workspace.id === normalizedWorkspaceId) ||
      null,
    [workspaces, normalizedWorkspaceId],
  );

  useEffect(() => {
    if (normalizedWorkspaceId) return;
    if (!workspaces.length) return;

    const firstWorkspaceId = workspaces[0]?.id;
    if (firstWorkspaceId) {
      router.replace(`/workspace/${firstWorkspaceId}`);
      return;
    }

    router.replace("/workspace");
  }, [normalizedWorkspaceId, workspaces, router]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = window.setTimeout(() => clearToast(), 3500);
    return () => window.clearTimeout(timeout);
  }, [clearToast, toastMessage]);

  const activePath = (suffix: string) => {
    const target = suffix
      ? `/workspace/${normalizedWorkspaceId}${suffix}`
      : `/workspace/${normalizedWorkspaceId}`;
    return pathname === target || pathname.startsWith(`${target}/`);
  };

  const handleNotificationToggle = useCallback(() => {
    setNotificationOpen((open) => !open);
  }, []);

  useEffect(() => {
    if (!notificationOpen) {
      return;
    }

    const targetWorkspaceId = normalizedWorkspaceId || undefined;
    void markAllAsRead(targetWorkspaceId);
  }, [markAllAsRead, normalizedWorkspaceId, notificationOpen]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(244,208,255,0.8),transparent_30%),radial-gradient(circle_at_top_right,rgba(205,228,255,0.9),transparent_28%),linear-gradient(180deg,#fbf7ff_0%,#f5f0ff_38%,#f8fbff_100%)] text-slate-800">
      <div
        className="mx-auto flex min-h-screen gap-4 px-4 py-4 lg:px-6"
        style={{ maxWidth: 1600 }}
      >
        <aside
          className="hidden shrink-0 flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/75 shadow-[0_24px_70px_rgba(95,63,153,0.12)] backdrop-blur-xl lg:flex"
          style={{ width: 280 }}
        >
          <div className="border-b border-slate-200/80 p-4">
            <button
              type="button"
              onClick={() => setWorkspaceOpen((open) => !open)}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-violet-200 hover:bg-violet-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-sm font-semibold text-white">
                  {(currentWorkspace?.name || "W").slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {currentWorkspace?.name || "Workspace"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {currentWorkspace
                      ? `${currentWorkspace.members.length} members`
                      : "No workspace selected"}
                  </p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>

            <AnimatePresence>
              {workspaceOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-3 space-y-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg"
                >
                  {workspaces.length > 0 ? (
                    workspaces.map((workspace) => (
                      <button
                        key={workspace.id}
                        type="button"
                        onClick={() =>
                          router.push(`/workspace/${workspace.id}`)
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-50"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
                          {workspace.name.slice(0, 1).toUpperCase()}
                        </span>
                        <span className="flex-1">
                          <span className="block font-medium text-slate-900">
                            {workspace.name}
                          </span>
                          <span className="block text-xs text-slate-500">
                            {workspace.members.length} members
                          </span>
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-xs text-slate-500">
                      No workspaces found yet.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => router.push("/workspace/create")}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-violet-700 transition hover:bg-violet-50"
                  >
                    <Plus className="h-4 w-4" />
                    Create workspace
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/workspaces/join")}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Join workspace
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const href = normalizedWorkspaceId
                ? `/workspace/${normalizedWorkspaceId}${item.href}`
                : "/workspace";
              const active = activePath(item.href);
              const showInboxUnreadBadge =
                item.label === "Inbox" && unreadCount > 0;
              return (
                <Link
                  key={item.label}
                  href={href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-brand-100 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  {showInboxUnreadBadge ? (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-200/80 p-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-700 text-sm font-semibold text-white">
                  {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user?.name || "Current user"}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {user?.email || "user@upflow.app"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3d258f]"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="relative z-40 overflow-visible rounded-[28px] border border-white/80 bg-white/75 px-4 py-4 shadow-[0_24px_70px_rgba(95,63,153,0.1)] backdrop-blur-xl">
            <div className="flex items-center gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileNavOpen((open) => !open)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">
                  Workspace
                </p>
                <h1 className="text-lg font-semibold text-slate-900">
                  {title}
                </h1>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 lg:mt-0 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative max-w-md flex-1">
                <input
                  placeholder="Search..."
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 pl-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-300"
                />
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              <div className="flex items-center gap-3 self-end lg:self-auto">
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleNotificationToggle}
                    className="relative rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 transition hover:bg-slate-50"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 ? (
                      <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    ) : null}
                  </button>

                  <AnimatePresence>
                    {notificationOpen ? (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 z-70 mt-2 w-82.5 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.15)]"
                      >
                        <p className="px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Notifications
                        </p>
                        <div className="mt-1 max-h-80 space-y-1 overflow-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <button
                                key={notification.id}
                                type="button"
                                onClick={async () => {
                                  setNotificationOpen(false);
                                  await markAsRead(notification.id);
                                  const destination = notification.taskId
                                    ? `/workspace/${notification.workspaceId}/projects/${notification.projectId}?task=${notification.taskId}`
                                    : `/workspace/${notification.workspaceId}/projects/${notification.projectId}`;
                                  router.push(destination);
                                }}
                                className="w-full rounded-xl px-3 py-2 text-left transition hover:bg-slate-50"
                              >
                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-600">
                                  {notification.title}
                                </p>
                                <p className="text-sm font-medium text-slate-900">
                                  {notification.message}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {new Date(
                                    notification.createdAt,
                                  ).toLocaleString()}
                                </p>
                              </button>
                            ))
                          ) : (
                            <p className="px-3 py-4 text-sm text-slate-500">
                              No notifications yet.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
                <button className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  {currentWorkspace?.name || title}
                </button>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-sm font-semibold text-brand-700">
                  {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          <div className="relative z-10 flex-1">
            <main className="min-w-0 rounded-3xl border border-white/80 bg-white/78 p-4 shadow-[0_24px_70px_rgba(95,63,153,0.08)] backdrop-blur-xl sm:p-6">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-500">
                    Workspace
                  </p>
                  <h2 className="mt-1 text-3xl font-semibold tracking-[-0.05em] text-slate-900 sm:text-4xl">
                    {currentWorkspace?.name || title}
                  </h2>
                  {description ? (
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                      {description}
                    </p>
                  ) : null}
                </div>
                <div className="hidden items-center gap-2 lg:flex">
                  <button
                    onClick={() =>
                      router.push(
                        normalizedWorkspaceId
                          ? `/workspace/${normalizedWorkspaceId}/members?invite=1`
                          : "/workspace",
                      )
                    }
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Invite
                  </button>
                  <button
                    onClick={() =>
                      router.push(
                        normalizedWorkspaceId
                          ? `/workspace/${normalizedWorkspaceId}/projects?create=1`
                          : "/workspace",
                      )
                    }
                    className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3d258f]"
                  >
                    New Project
                  </button>
                </div>
              </div>
              {children}
            </main>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileNavOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/35 p-4 lg:hidden"
          >
            <motion.div
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              className="h-full rounded-[28px] border border-white/80 bg-white p-4 shadow-[0_24px_70px_rgba(95,63,153,0.18)]"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">
                    Workspace
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {currentWorkspace?.name || "Workspace"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  Close
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const href = normalizedWorkspaceId
                    ? `/workspace/${normalizedWorkspaceId}${item.href}`
                    : "/workspace";
                  const active = activePath(item.href);
                  const showInboxUnreadBadge =
                    item.label === "Inbox" && unreadCount > 0;
                  return (
                    <Link
                      key={item.label}
                      href={href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${
                        active
                          ? "bg-brand-100 text-brand-700"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{item.label}</span>
                      {showInboxUnreadBadge ? (
                        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.2)]"
          >
            <p className="text-sm text-slate-800">{toastMessage}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
