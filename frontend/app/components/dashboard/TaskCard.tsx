"use client";

import { StatsIcon } from "@/app/components/common/Icons";

export type TaskCardData = {
  id: string;
  title: string;
  projectTitle?: string;
  description?: string;
  priority?: string;
  status?: string;
  dueDate?: string;
  memberColors?: string[];
};

interface TaskCardProps {
  card: TaskCardData;
  onAdvance: (card: TaskCardData) => void;
  advancing: boolean;
}

function DotAvatar({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-6 w-6 rounded-full border-2 border-white"
      style={{ backgroundColor: color }}
    />
  );
}

function dueLabel(rawDate?: string) {
  if (!rawDate) return "No date";
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return "No date";
  const diffDays = Math.floor((date.getTime() - Date.now()) / 86400000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function TaskCard({
  card,
  onAdvance,
  advancing,
}: TaskCardProps) {
  const done = card.status === "DONE";

  return (
    <article className="rounded-2xl border border-[#ebe8f3] bg-white p-4 shadow-[0_8px_20px_rgba(43,45,92,0.06)]">
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#afb3c2]">
        {card.projectTitle}
      </p>
      <h4 className="mt-1 line-clamp-2 text-[20px] font-semibold leading-[1.08] text-[#2a2e42]">
        {card.title}
      </h4>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#8f94a8]">
        {card.description || "No description"}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="rounded-md bg-[#f0e9ff] px-2 py-1 text-[10px] font-semibold text-[#8a6cf1]">
          {card.priority}
        </span>
        <div className="flex -space-x-2">
          {card.memberColors?.map((color: string, index: number) => (
            <DotAvatar key={`${card.id}-${index}`} color={color} />
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-[#969bb0]">
        <p className="inline-flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <StatsIcon className="h-3.5 w-3.5 text-[#a0a6bb]" />
            <span>1</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <StatsIcon className="h-3.5 w-3.5 text-[#a0a6bb]" />
            <span>1</span>
          </span>
        </p>
        <p className={done ? "font-semibold text-[#86bf58]" : ""}>
          {done ? "✓ " : ""}
          {dueLabel(card.dueDate)}
        </p>
      </div>

      {!done ? (
        <button
          onClick={() => onAdvance(card)}
          disabled={advancing}
          className="mt-3 w-full rounded-lg border border-[#e7e3f1] bg-[#faf9ff] px-3 py-2 text-xs font-semibold text-brand-500 transition hover:bg-[#f0ebff] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {advancing ? "Updating..." : "Move Forward"}
        </button>
      ) : null}
    </article>
  );
}
