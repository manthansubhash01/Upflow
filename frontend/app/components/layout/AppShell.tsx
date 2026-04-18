"use client";

import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(244,208,255,0.75),transparent_34%),radial-gradient(circle_at_top_right,rgba(200,229,255,0.75),transparent_30%),linear-gradient(180deg,#fbf7ff_0%,#f6f1ff_38%,#f8fbff_100%)] text-slate-800">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
