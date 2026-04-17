"use client";

interface DashboardWorkspaceHeaderProps {
  workspaceTitle: string;
  taskCount: number;
  viewMode: string;
  onShare?: () => void;
}

const avatarPalette = ["#67b2ea", "#f2c15d", "#a57cf0", "#d0a06f"];

function modeLabel(mode: string): string {
  if (mode === "board") return "Board";
  if (mode === "calendar") return "Calendar";
  return "List";
}

export default function DashboardWorkspaceHeader({
  workspaceTitle,
  taskCount,
  viewMode,
  onShare,
}: DashboardWorkspaceHeaderProps) {
  return (
    <div className="px-6 py-5">
      <p className="text-sm text-[#8f94a8]">
        Workspace / {workspaceTitle || "No Workspace"} / {modeLabel(viewMode)}
      </p>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-[48px] font-semibold leading-none text-[#232741]">
            {workspaceTitle || "Team Board"}
          </h2>
          <div className="flex -space-x-2">
            {avatarPalette.map((color, index) => (
              <span
                key={`${workspaceTitle}-avatar-${index}`}
                className="inline-block h-6 w-6 rounded-full border-2 border-white"
                style={{ backgroundColor: color }}
              />
            ))}
            <span className="inline-flex h-6 w-8 items-center justify-center rounded-full border-2 border-white bg-[#ececf4] text-xs text-[#666d85]">
              +{Math.max(taskCount, 1)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onShare}
          className="rounded-xl border border-[#e7e3f1] bg-white px-3 py-2 text-sm text-[#707791]"
        >
          Share
        </button>
      </div>
    </div>
  );
}
