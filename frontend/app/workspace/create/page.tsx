"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { apiPost } from "@/app/lib/api";

export default function CreateWorkspacePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discoverability, setDiscoverability] = useState<"PUBLIC" | "PRIVATE">(
    "PUBLIC",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiPost<{ id?: string; _id?: string }>(
        "/api/workspace",
        { name, description, discoverability },
      );
      const workspaceId = response.data?.id || response.data?._id;
      if (!response.success || !workspaceId) {
        throw new Error(response.error || "Failed to create workspace");
      }
      router.push(`/workspace/${workspaceId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create workspace",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,#f2e8ff,#f7f9ff_40%,#eef7ff)] px-6 py-10">
        <div className="w-full max-w-xl rounded-[28px] border border-white/80 bg-white/90 p-8 shadow-[0_24px_70px_rgba(95,63,153,0.14)] backdrop-blur-xl sm:p-10">
          <p className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
            Create Workspace
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-900 sm:text-4xl">
            Create a new workspace
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Set up a clean workspace for your team and projects.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Workspace name
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300"
                placeholder="workspace-1"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Description
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300"
                placeholder="Optional workspace description"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Workspace Discoverability
              </span>
              <select
                value={discoverability}
                onChange={(event) =>
                  setDiscoverability(event.target.value as "PUBLIC" | "PRIVATE")
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300"
              >
                <option value="PUBLIC">Public / Discoverable</option>
                <option value="PRIVATE">Private / Invite Only</option>
              </select>
            </label>
            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
            <button
              disabled={loading}
              className="w-full rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3d258f] disabled:opacity-70"
            >
              {loading ? "Creating..." : "Create Workspace"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            You can also join an existing workspace from the join screen.
          </p>
        </div>
      </main>
    </ProtectedRoute>
  );
}
