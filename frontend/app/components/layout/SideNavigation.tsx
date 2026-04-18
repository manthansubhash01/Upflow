"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  Home,
  FolderOpen,
  Users,
  Mail,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/app/components/AuthProvider";

interface SideNavigationProps {
  workspaceId?: string;
  onLogout: () => void;
}

export default function SideNavigation({
  workspaceId = "workspace-1",
  onLogout,
}: SideNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const navItems = [
    {
      href: `/workspace/${workspaceId}`,
      label: "Dashboard",
      icon: Home,
      exact: true,
    },
    {
      href: `/workspace/${workspaceId}/projects`,
      label: "Projects",
      icon: FolderOpen,
    },
    {
      href: `/workspace/${workspaceId}/members`,
      label: "Members",
      icon: Users,
    },
    {
      href: `/inbox`,
      label: "Inbox",
      icon: Mail,
    },
    {
      href: `/workspace/${workspaceId}/settings`,
      label: "Settings",
      icon: Settings,
    },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white">
      <div className="flex h-full flex-col">
        {/* Workspace Switcher */}
        <div className="border-b border-slate-200 p-4">
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-xs font-bold text-white">
                U
              </div>
              <span className="text-sm font-semibold">Workspace</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </button>

          {showWorkspaceMenu && (
            <div className="mt-2 space-y-1 rounded-lg border border-slate-200 bg-white p-2">
              <button
                onClick={() => router.push("/workspace/create")}
                className="block w-full rounded px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50"
              >
                + Create workspace
              </button>
              <button
                onClick={() => router.push("/workspace/join")}
                className="block w-full rounded px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50"
              >
                Join workspace
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-violet-100 text-violet-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-slate-200 p-4">
          <div className="mb-4 flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-medium text-slate-900">
                {user?.name || user?.email}
              </p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              onLogout();
              router.push("/");
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
