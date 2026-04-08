"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import {
  fetchWorkspaces,
  updateWorkspaceSettings,
} from "@/app/lib/workspaceApi";

export default function WorkspaceSettingsPage() {
  const params = useParams<{ id: string }>();
  const workspaceId = params.id;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discoverability, setDiscoverability] = useState<"PUBLIC" | "PRIVATE">(
    "PUBLIC",
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const discoverabilityCopy = useMemo(
    () =>
      discoverability === "PUBLIC"
        ? "Workspace can be discovered via join search"
        : "Workspace is invite only and hidden from join search",
    [discoverability],
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const allWorkspaces = await fetchWorkspaces();
        const workspace = allWorkspaces.find(
          (entry) => entry.id === workspaceId,
        );
        if (!workspace) {
          setError("Workspace not found");
          return;
        }

        setName(workspace.name);
        setDescription(workspace.description || "");
        setDiscoverability(workspace.discoverability || "PUBLIC");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load workspace settings",
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [workspaceId]);

  const onSave = async () => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await updateWorkspaceSettings(workspaceId, {
        name,
        description,
        discoverability,
      });

      if (!response.success) {
        throw new Error(
          response.error || "Failed to update workspace settings",
        );
      }

      setMessage("Workspace settings updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update workspace settings",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">
          Workspace
        </p>
        <h2 className="mt-1 text-3xl font-semibold tracking-[-0.05em] text-slate-900">
          Settings
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Manage workspace name, admins, and invitations.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          whileHover={{ y: -2 }}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900">
            Workspace details
          </h3>
          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Loading settings...</p>
          ) : null}
          <div className="mt-5 space-y-4">
            <label className="space-y-2 block">
              <span className="text-sm font-medium text-slate-700">
                Workspace name
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300"
              />
            </label>
            <label className="space-y-2 block">
              <span className="text-sm font-medium text-slate-700">
                Description
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300"
              />
            </label>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">
                Workspace Discoverability
              </p>
              <div className="rounded-2xl border border-slate-200 p-2">
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setDiscoverability("PUBLIC")}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      discoverability === "PUBLIC"
                        ? "bg-white text-brand-700 shadow-sm"
                        : "text-slate-600"
                    }`}
                  >
                    Public / Discoverable
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscoverability("PRIVATE")}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      discoverability === "PRIVATE"
                        ? "bg-white text-brand-700 shadow-sm"
                        : "text-slate-600"
                    }`}
                  >
                    Private / Invite Only
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500">{discoverabilityCopy}</p>
            </div>
          </div>
          {error ? (
            <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => void onSave()}
              disabled={saving || loading}
              className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </motion.section>

        <section className="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-red-900">Danger zone</h3>
          <p className="mt-2 text-sm text-red-800">
            Delete workspace or manage access carefully.
          </p>
          <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white">
            <Trash2 className="h-4 w-4" /> Delete Workspace
          </button>
        </section>
      </div>
    </div>
  );
}
