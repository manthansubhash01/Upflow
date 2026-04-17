"use client";

import { MoreIcon } from "@/app/components/common/Icons";
import TaskCard from "./TaskCard";
import type { TaskCardData } from "./TaskCard";

export type BoardCard = TaskCardData & {
  projectId: string;
  projectTitle: string;
  memberColors: string[];
};

interface BoardViewProps {
  board: Record<string, BoardCard[]>;
  onAdvanceTask: (card: BoardCard) => void | Promise<void>;
  updatingTaskId: string;
}

const lanes = [
  { id: "TODO", label: "TODO", tone: "bg-violet-300" },
  { id: "IN_WORK", label: "IN WORK", tone: "bg-sky-300" },
  { id: "QA", label: "QA", tone: "bg-amber-300" },
  { id: "COMPLETED", label: "COMPLETED", tone: "bg-lime-300" },
];

export default function BoardView({
  board,
  onAdvanceTask,
  updatingTaskId,
}: BoardViewProps) {
  return (
    <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-4">
      {lanes.map((lane) => {
        const cards = board[lane.id] || [];
        return (
          <section key={lane.id}>
            <div className="mb-3 flex items-center justify-between text-sm font-semibold text-[#454a60]">
              <p className="tracking-[0.02em]">
                {lane.label}
                <span className="ml-2 rounded-full bg-[#ececf4] px-2 py-0.5 text-xs text-[#72788e]">
                  {cards.length}
                </span>
              </p>
              <div className="flex items-center gap-3">
                <span className={`h-0.5 w-16 rounded-full ${lane.tone}`} />
                <button
                  type="button"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[#b2b6c8] transition hover:bg-[#f3effa] hover:text-[#7b63ea]"
                  aria-label={`${lane.label} options`}
                >
                  <MoreIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {cards.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#dfd8ef] bg-[#faf9ff] px-4 py-6 text-center text-xs text-[#9296ab]">
                  No tasks
                </div>
              ) : null}

              {cards.map((card) => (
                <TaskCard
                  key={card.id}
                  card={card}
                  advancing={updatingTaskId === card.id}
                  onAdvance={(nextCard) => onAdvanceTask(nextCard as BoardCard)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
