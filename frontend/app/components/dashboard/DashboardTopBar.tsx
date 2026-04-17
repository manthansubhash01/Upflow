"use client";

import {
  BellIcon,
  BoardIcon,
  CalendarIcon,
  ClearIcon,
  ListIcon,
  SearchIcon,
  MoreIcon,
} from "@/app/components/common/Icons";

interface DashboardTopBarProps {
  viewMode: string;
  onViewModeChange: (mode: string) => void;
  onCreateTask: () => void;
  onOpenProfile: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  userInitial?: string;
}

export default function DashboardTopBar({
  viewMode,
  onViewModeChange,
  onCreateTask,
  onOpenProfile,
  searchQuery,
  onSearchQueryChange,
  userInitial = "U",
}: DashboardTopBarProps) {
  const tabs = [
    { id: "list", label: "List", icon: ListIcon },
    { id: "board", label: "Board", icon: BoardIcon },
    { id: "calendar", label: "Calendar", icon: CalendarIcon },
  ];

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eceaf4] px-6 py-4">
      <div className="flex items-center gap-3 text-[#6f7388]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onViewModeChange(tab.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[15px] font-semibold transition ${
                viewMode === tab.id
                  ? "bg-[#ece6ff] text-[#6d51e2]"
                  : "text-[#6f7388] hover:bg-[#f3f0ff]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-[#e7e3f1] bg-white px-3 py-2 text-sm text-[#8d93a8]">
          <SearchIcon className="h-4 w-4 text-[#9ca2b7]" />
          <input
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search tasks"
            className="min-w-28 bg-transparent text-sm text-[#606782] outline-none placeholder:text-[#a4a9bb]"
            aria-label="Search tasks"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchQueryChange("")}
              className="inline-flex h-5 w-5 items-center justify-center rounded border border-[#ece7f6] text-[#9da3b8] transition hover:bg-[#f4f0ff]"
              title="Clear search"
              aria-label="Clear search"
            >
              <ClearIcon className="h-3 w-3" />
            </button>
          ) : null}
        </div>
        <button
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e1ef] bg-white text-[#9ca1b5] transition hover:bg-[#f4f0ff]"
          aria-label="Notifications"
        >
          <BellIcon className="h-4 w-4" />
        </button>
        <button
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e1ef] bg-white text-[#9ca1b5] transition hover:bg-[#f4f0ff]"
          aria-label="More options"
        >
          <MoreIcon className="h-4 w-4" />
        </button>
        <button
          onClick={onOpenProfile}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#e2d0a0] text-[11px] font-semibold text-[#4f3c1a] transition hover:brightness-95"
          title="Open profile"
          aria-label="Open profile"
        >
          {userInitial}
        </button>
        <button
          onClick={onCreateTask}
          className="rounded-xl bg-[#7f57ee] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(91,67,186,0.3)]"
        >
          New Task +
        </button>
      </div>
    </header>
  );
}
