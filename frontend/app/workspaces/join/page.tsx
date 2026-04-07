"use client";

import Link from "next/link";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import JoinWorkspaceSearch from "@/app/components/workspace/JoinWorkspaceSearch";

export default function JoinWorkspacePage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f2e8ff,#f7f9ff_40%,#eef7ff)] px-6 py-10">
        <div className="mx-auto w-full max-w-4xl rounded-[28px] border border-white/80 bg-white/90 p-7 shadow-[0_24px_70px_rgba(95,63,153,0.14)] backdrop-blur-xl sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
                Join Workspace
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-900 sm:text-4xl">
                Find and request access
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Search discoverable workspaces and request to join.
              </p>
            </div>
            <Link
              href="/workspace"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back
            </Link>
          </div>

          <div className="mt-8">
            <JoinWorkspaceSearch />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
