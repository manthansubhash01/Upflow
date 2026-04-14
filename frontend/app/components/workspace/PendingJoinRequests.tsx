"use client";

import { useEffect, useState } from "react";
import {
  acceptJoinRequest,
  fetchPendingJoinRequests,
  rejectJoinRequest,
  type PendingJoinRequest,
} from "@/app/lib/workspaceApi";

interface PendingJoinRequestsProps {
  workspaceId: string;
}

const formatDateTime = (value: string) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export default function PendingJoinRequests({
  workspaceId,
}: PendingJoinRequestsProps) {
  const [requests, setRequests] = useState<PendingJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const next = await fetchPendingJoinRequests(workspaceId);
        setRequests(next);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load pending requests",
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [workspaceId]);

  const takeAction = async (
    requestId: string,
    decision: "accept" | "reject",
  ) => {
    setActionId(requestId);
    setError("");

    try {
      const response =
        decision === "accept"
          ? await acceptJoinRequest(requestId)
          : await rejectJoinRequest(requestId);

      if (!response.success) {
        throw new Error(
          response.error ||
            `Failed to ${decision === "accept" ? "accept" : "reject"} request`,
        );
      }

      setRequests((current) =>
        current.filter((request) => request.id !== requestId),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${decision === "accept" ? "accept" : "reject"} request`,
      );
    } finally {
      setActionId("");
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Pending Join Requests
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Review and approve access requests for this workspace.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void (async () => {
              setLoading(true);
              setError("");

              try {
                const next = await fetchPendingJoinRequests(workspaceId);
                setRequests(next);
              } catch (err) {
                setError(
                  err instanceof Error
                    ? err.message
                    : "Failed to load pending requests",
                );
              } finally {
                setLoading(false);
              }
            })();
          }}
          className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Loading pending requests...
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!loading && !error && requests.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
          No pending join requests.
        </div>
      ) : null}

      {!loading && requests.length > 0 ? (
        <div className="mt-4 space-y-3">
          {requests.map((request) => (
            <article
              key={request.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-sm font-semibold text-brand-700">
                  {(request.requester.name || request.requester.email)
                    .slice(0, 1)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {request.requester.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {request.requester.email}
                  </p>
                  <p className="text-xs text-slate-500">
                    Requested at {formatDateTime(request.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void takeAction(request.id, "reject")}
                  disabled={actionId === request.id}
                  className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-70"
                >
                  {actionId === request.id ? "Working..." : "Reject"}
                </button>
                <button
                  type="button"
                  onClick={() => void takeAction(request.id, "accept")}
                  disabled={actionId === request.id}
                  className="rounded-full bg-brand-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#3d258f] disabled:opacity-70"
                >
                  {actionId === request.id ? "Working..." : "Accept"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
