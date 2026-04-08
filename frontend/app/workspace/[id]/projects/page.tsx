"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Filter, Plus, Search } from "lucide-react";
import {
  createProject,
  fetchProjects,
  type ProjectRecord,
} from "@/app/lib/workspaceApi";

export default function WorkspaceProjectsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaceId = params.id;

  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(
    searchParams.get("create") === "1",
  );
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newName, setNewName] = useState("");
  const [newMembers, setNewMembers] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const loadProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const values = await fetchProjects(workspaceId);
      setProjects(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, [workspaceId]);

  const filtered = useMemo(
    () =>
      projects.filter((project) =>
        project.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [projects, query],
  );

  const handleCreate = async () => {
    setCreateError("");
    setCreating(true);
    try {
      const memberIds = newMembers
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      const response = await createProject({
        name: newName,
        workspaceId,
        members: memberIds,
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to create project");
      }

      setNewName("");
      setNewMembers("");
      setCreateOpen(false);
      await loadProjects();
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create project",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">
            Workspace
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-[-0.05em] text-slate-900">
            Projects
          </h2>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3d258f]"
        >
          <Plus className="h-4 w-4" /> Create Project
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-violet-300"
          />
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
          <Filter className="h-4 w-4" /> Filter
        </button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Loading projects...
        </div>
      ) : null}
      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        filtered.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((project) => (
              <motion.button
                whileHover={{ y: -3 }}
                key={project.id}
                onClick={() =>
                  router.push(
                    `/workspace/${workspaceId}/projects/${project.id}`,
                  )
                }
                className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-violet-200"
              >
                <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-900">
                  {project.name}
                </h3>
                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <p>Project ID: {project.id}</p>
                  <p>Members: {project.members.length}</p>
                  <p>
                    Created:{" "}
                    {project.createdAt
                      ? new Date(project.createdAt).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-base font-medium text-slate-800">
              No projects yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Create your first project to start managing tasks.
            </p>
          </div>
        )
      ) : null}

      <AnimatePresence>
        {createOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-xl rounded-[28px] border border-white/80 bg-white p-6 shadow-[0_30px_80px_rgba(95,63,153,0.18)]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">
                    Create Project
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                    New project
                  </h3>
                </div>
                <button
                  onClick={() => setCreateOpen(false)}
                  className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Project name
                  </span>
                  <input
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300"
                    placeholder="Project title"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Member IDs (comma separated, optional)
                  </span>
                  <input
                    value={newMembers}
                    onChange={(event) => setNewMembers(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300"
                    placeholder="65f..., 65a..."
                  />
                </label>
                {createError ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    {createError}
                  </p>
                ) : null}
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setCreateOpen(false)}
                  className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleCreate()}
                  disabled={creating || !newName.trim()}
                  className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {creating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
