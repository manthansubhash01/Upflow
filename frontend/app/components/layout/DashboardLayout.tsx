"use client";

import React, { ReactNode } from "react";
import SideNavigation from "./SideNavigation";
import TopBar from "./TopBar";
import { useAuth } from "@/app/components/AuthProvider";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";

interface DashboardLayoutProps {
  children: ReactNode;
  workspaceId?: string;
  projectId?: string;
}

export default function DashboardLayout({
  children,
  workspaceId,
  projectId,
}: DashboardLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
        <TopBar user={user} />
        <div className="flex flex-1 overflow-hidden">
          <SideNavigation
            workspaceId={workspaceId}
            projectId={projectId}
            onLogout={logout}
          />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
