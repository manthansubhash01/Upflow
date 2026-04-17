"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type WorkspaceItem = {
  id: string;
  title: string;
};

function HomeIcon({ active = false }: { active?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-4 w-4 shrink-0 ${active ? "text-[#6d51e2]" : "text-[#9aa0b5]"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M9.5 20v-5h5v5" />
    </svg>
  );
}

function MembersIcon({ active = false }: { active?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-4 w-4 shrink-0 ${active ? "text-[#6d51e2]" : "text-[#9aa0b5]"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16.5 19a4.5 4.5 0 0 0-9 0" />
      <circle cx="12" cy="8" r="3.25" />
      <path d="M17.5 9.5a2.5 2.5 0 1 1 0 5" />
    </svg>
  );
}

function InboxIcon({ active = false }: { active?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-4 w-4 shrink-0 ${active ? "text-[#6d51e2]" : "text-[#9aa0b5]"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6.5Z" />
      <path d="M4 8.5h16" />
      <path d="M8 13h8" />
      <path d="M10 16h4" />
    </svg>
  );
}

function ProfileIcon({ active = false }: { active?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-4 w-4 shrink-0 ${active ? "text-[#6d51e2]" : "text-[#9aa0b5]"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-[#7b63ea]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19h-12a2.5 2.5 0 0 1-2.5-2.5v-9Z" />
    </svg>
  );
}

function AddIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 17v2.5A1.5 1.5 0 0 1 8.5 21h-4A1.5 1.5 0 0 1 3 19.5v-15A1.5 1.5 0 0 1 4.5 3h4A1.5 1.5 0 0 1 10 4.5V7" />
      <path d="M16 8l4 4-4 4" />
      <path d="M20 12H9" />
    </svg>
  );
}

interface SideNavigationProps {
  workspaces: WorkspaceItem[];
  activeWorkspaceId?: string;
  onSelectWorkspace: (workspaceId: string) => void;
  onCreateWorkspace: () => void;
  onLogout: () => void;
}

export default function SideNavigation({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  onLogout,
}: SideNavigationProps) {
  const pathname = usePathname();
  const navItems = [
    { label: "Projects", href: "/dashboard", icon: HomeIcon },
    { label: "Members", href: "/members", icon: MembersIcon },
    { label: "Inbox", href: "/inbox", icon: InboxIcon },
    { label: "Profile", href: "/profile", icon: ProfileIcon },
  ];

  return (
    <aside className="border-r border-[#e8e6ef] bg-[#f6f5fb] p-5">
      <div className="mb-10 flex items-center gap-3">
        <div className="relative h-8 w-8">
          <span className="absolute left-0 top-1.5 h-4 w-4 rotate-45 rounded-sm bg-[#6f53df]" />
          <span className="absolute left-3.5 top-0 h-3 w-3 rotate-45 rounded-[3px] bg-[#8d7aec]" />
        </div>
        <h1 className="text-[32px] font-semibold leading-none text-[#242741]">
          Upflow
        </h1>
      </div>

      <nav className="space-y-2 text-sm text-[#646b82]">
        {navItems.map((item) => {
          const isActive = item.href ? pathname === item.href : false;
          const Icon = item.icon;

          if (item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition ${
                  isActive
                    ? "bg-[#ebe7fb] font-medium text-[#4d4f66]"
                    : "hover:bg-white"
                }`}
              >
                <Icon active={isActive} />
                {item.label}
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-white"
            >
              <Icon active={false} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-9 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a2a6b9]">
          Workspace
        </p>
        <button
          onClick={onCreateWorkspace}
          className="rounded-lg border border-[#dfd8ef] bg-white px-2 py-1 text-xs font-semibold text-[#6f53df]"
          aria-label="Create workspace"
        >
          <AddIcon />
        </button>
      </div>

      <div className="mt-3 space-y-1.5 text-sm text-[#636a81]">
        {workspaces?.map((workspace) => (
          <button
            key={workspace.id}
            onClick={() => onSelectWorkspace(workspace.id)}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
              workspace.id === activeWorkspaceId
                ? "bg-[#ebe7fb] font-medium text-[#4d4f66]"
                : "hover:bg-white"
            }`}
          >
            <span className="flex items-center gap-2">
              <FolderIcon />
              <span>{workspace.title}</span>
            </span>
            {workspace.id === activeWorkspaceId ? <span>...</span> : null}
          </button>
        ))}
      </div>

      <button
        onClick={onLogout}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#25175a]"
      >
        <LogoutIcon />
        Logout
      </button>
    </aside>
  );
}
