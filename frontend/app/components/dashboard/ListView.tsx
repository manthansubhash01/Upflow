"use client";

import { ArrowRightIcon } from "@/app/components/common/Icons";

function nextStatusLabel(status: string) {
  if (status === "TODO") return "Move to In Progress";
  if (status === "IN_PROGRESS") return "Move to Done";
  return "Completed";
}

function dueLabel(rawDate: string) {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ListView({
  tasks,
  onAdvanceTask,
  updatingTaskId,
}: any) {
  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-[#e8e4f1] bg-white">
      <div className="grid grid-cols-[2.2fr_1fr_1fr_1fr_1fr] gap-3 border-b border-[#efebf6] bg-[#faf9ff] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#7c8197]">
        <p>Task</p>
        <p>Project</p>
        <p>Status</p>
        <p>Due</p>
        <p>Action</p>
      </div>

      <div className="divide-y divide-[#f1edf7]">
        {tasks?.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[#8f94a8]">
            No tasks in this workspace.
          </div>
        ) : null}

        {tasks?.map((task: any) => (
          <div
            key={task.id}
            className="grid grid-cols-[2.2fr_1fr_1fr_1fr_1fr] items-center gap-3 px-4 py-3 text-sm text-[#2f3248]"
          >
            <div>
              <p className="font-semibold">{task.title}</p>
              <p className="text-xs text-[#8f94a8]">
                {task.description || "No description"}
              </p>
            </div>
            <p>{task.projectTitle}</p>
            <p>
              <span className="rounded-md bg-[#f0e9ff] px-2 py-1 text-xs font-semibold text-[#7a5ce8]">
                {task.status}
              </span>
            </p>
            <p>{dueLabel(task.dueDate)}</p>
            <div>
              <button
                onClick={() => onAdvanceTask(task)}
                disabled={task.status === "DONE" || updatingTaskId === task.id}
                className="inline-flex items-center gap-2 rounded-lg border border-[#e5dff4] bg-[#faf9ff] px-3 py-1.5 text-xs font-semibold text-[#5f3bd6] transition hover:bg-[#f3efff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowRightIcon className="h-3.5 w-3.5" />
                {updatingTaskId === task.id
                  ? "Updating..."
                  : nextStatusLabel(task.status)}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
