"use client";

import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { NotificationsProvider } from "@/app/components/workspace/NotificationsProvider";
import WorkspaceShell from "@/app/components/workspace/WorkspaceShell";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ id: string }>();
  const workspaceId = params?.id || "";

  return (
    <ProtectedRoute>
      <NotificationsProvider>
        <WorkspaceShell
          workspaceId={workspaceId}
          title={workspaceId || "Workspace"}
          description="A clean Linear-style workspace for projects, tasks, members, and inbox."
        >
          {children}
        </WorkspaceShell>
      </NotificationsProvider>
    </ProtectedRoute>
  );
}
