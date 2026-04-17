"use client";

import BoardView, { type BoardCard } from "./BoardView";
import DashboardCalendarView from "./DashboardCalendarView";
import DashboardTopBar from "./DashboardTopBar";
import DashboardWorkspaceHeader from "./DashboardWorkspaceHeader";
import ListView from "./ListView";

interface DashboardWorkspaceViewProps {
  workspaceTitle: string;
  taskCount: number;
  viewMode: string;
  onViewModeChange: (mode: string) => void;
  onCreateTask: () => void;
  onOpenProfile: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  userInitial?: string;
  error: string;
  board: Record<string, BoardCard[]>;
  updatingTaskId: string;
  onAdvanceTask: (card: BoardCard) => void | Promise<void>;
  tasks: BoardCard[];
}

export default function DashboardWorkspaceView({
  workspaceTitle,
  taskCount,
  viewMode,
  onViewModeChange,
  onCreateTask,
  onOpenProfile,
  searchQuery,
  onSearchQueryChange,
  userInitial,
  error,
  board,
  updatingTaskId,
  onAdvanceTask,
  tasks,
}: DashboardWorkspaceViewProps) {
  return (
    <section className="flex flex-col bg-[#f4f2fa]">
      <DashboardTopBar
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onCreateTask={onCreateTask}
        onOpenProfile={onOpenProfile}
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        userInitial={userInitial}
      />

      <DashboardWorkspaceHeader
        workspaceTitle={workspaceTitle}
        taskCount={taskCount}
        viewMode={viewMode}
      />

      {error ? (
        <div className="px-6">
          <p className="rounded-xl border border-[#f0d8d8] bg-[#fff4f4] px-4 py-2 text-sm text-[#b65353]">
            {error}
          </p>
        </div>
      ) : null}

      <div className="px-6 pb-6">
        {viewMode === "board" ? (
          <BoardView
            board={board}
            updatingTaskId={updatingTaskId}
            onAdvanceTask={onAdvanceTask}
          />
        ) : viewMode === "list" ? (
          <ListView
            tasks={tasks}
            updatingTaskId={updatingTaskId}
            onAdvanceTask={onAdvanceTask}
          />
        ) : (
          <DashboardCalendarView tasks={tasks} />
        )}
      </div>
    </section>
  );
}
