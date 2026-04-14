"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import { getSocket } from "@/app/lib/socket";
import {
  requestWorkspaceJoin,
  searchWorkspaces,
  type WorkspaceSearchRecord,
} from "@/app/lib/workspaceApi";
import WorkspaceSearchCard from "@/app/components/workspace/WorkspaceSearchCard";

type JoinAcceptedPayload = {
  workspaceId: string;
  workspaceName: string;
};

type JoinRejectedPayload = {
  workspaceId: string;
  workspaceName: string;
};

export default function JoinWorkspaceSearch() {
  const router = useRouter();
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WorkspaceSearchRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [requestingId, setRequestingId] = useState("");
  const debounceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const workspaces = await searchWorkspaces(query.trim());
        setResults(workspaces);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to search workspaces",
        );
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const socket = getSocket(token);
    if (!socket.connected) {
      socket.connect();
    }

    const onAccepted = ({
      workspaceId,
      workspaceName,
    }: JoinAcceptedPayload) => {
      setInfo(`Your request to join ${workspaceName} was accepted.`);
      setResults((current) =>
        current.filter((workspace) => workspace.id !== workspaceId),
      );

      if (window.location.pathname === "/workspaces/join") {
        router.push(`/workspace/${workspaceId}`);
      }
    };

    const onRejected = ({
      workspaceId,
      workspaceName,
    }: JoinRejectedPayload) => {
      setInfo(`Your request to join ${workspaceName} was rejected.`);
      setResults((current) =>
        current.map((workspace) =>
          workspace.id === workspaceId
            ? { ...workspace, hasPendingRequest: false }
            : workspace,
        ),
      );
    };

    socket.on("workspace:join-request-accepted", onAccepted);
    socket.on("workspace:join-request-rejected", onRejected);

    return () => {
      socket.off("workspace:join-request-accepted", onAccepted);
      socket.off("workspace:join-request-rejected", onRejected);
    };
  }, [token, router]);

  const handleRequest = async (workspaceId: string) => {
    setRequestingId(workspaceId);
    setError("");
    setInfo("");

    try {
      const response = await requestWorkspaceJoin(workspaceId);
      if (!response.success) {
        throw new Error(response.error || "Failed to send join request");
      }

      setResults((current) =>
        current.map((workspace) =>
          workspace.id === workspaceId
            ? { ...workspace, hasPendingRequest: true }
            : workspace,
        ),
      );
      setInfo("Your request has been sent to workspace admins.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setRequestingId("");
    }
  };

  const hasResults = useMemo(() => results.length > 0, [results]);

  return (
    <div className="space-y-5">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search workspace by name..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-violet-300"
        />
      </label>

      {info ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {info}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-sm text-slate-600">
          Searching workspaces...
        </div>
      ) : null}

      {!loading && !hasResults ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
          <p className="text-base font-semibold text-slate-900">
            No workspaces found
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Try a different search term or ask your admin for an invite link.
          </p>
        </div>
      ) : null}

      <div className="space-y-3">
        {results.map((workspace) => (
          <WorkspaceSearchCard
            key={workspace.id}
            workspace={workspace}
            requesting={requestingId === workspace.id}
            onRequest={handleRequest}
          />
        ))}
      </div>
    </div>
  );
}
