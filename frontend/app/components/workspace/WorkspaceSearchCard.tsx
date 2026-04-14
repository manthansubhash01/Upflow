"use client";

import Image from "next/image";
import { Users } from "lucide-react";
import type { WorkspaceSearchRecord } from "@/app/lib/workspaceApi";

interface WorkspaceSearchCardProps {
  workspace: WorkspaceSearchRecord;
  requesting: boolean;
  onRequest: (workspaceId: string) => void;
}

export default function WorkspaceSearchCard({
  workspace,
  requesting,
  onRequest,
}: WorkspaceSearchCardProps) {
  const pending = workspace.hasPendingRequest;

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {workspace.logo ? (
            <Image
              src={workspace.logo}
              alt={workspace.name}
              width={44}
              height={44}
              className="h-11 w-11 rounded-2xl border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-sm font-semibold text-brand-700">
              {workspace.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {workspace.name}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {workspace.description || "No description yet."}
            </p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
              <Users className="h-3.5 w-3.5" />
              {workspace.memberCount} member
              {workspace.memberCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRequest(workspace.id)}
          disabled={requesting || pending}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            pending
              ? "border border-amber-200 bg-amber-50 text-amber-700"
              : "bg-brand-700 text-white hover:bg-[#3d258f] disabled:opacity-70"
          }`}
        >
          {pending
            ? "Pending Approval"
            : requesting
              ? "Sending..."
              : "Request to Join"}
        </button>
      </div>
    </article>
  );
}
