"use client";

import { motion } from "framer-motion";
import { Building2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";

const options = [
  {
    title: "Create New Workspace",
    description: "Start a fresh workspace for your team and projects.",
    cta: "Create Workspace",
    href: "/workspace/create",
    icon: Building2,
  },
  {
    title: "Join Existing Workspace",
    description: "Search and request access to an existing workspace.",
    cta: "Join Workspace",
    href: "/workspaces/join",
    icon: Search,
  },
];

export default function WorkspaceIndexPage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,#f2e8ff,#f7f9ff_40%,#eef7ff)] px-6 py-10">
        <div className="w-full max-w-5xl rounded-[30px] border border-white/80 bg-white/90 p-7 shadow-[0_24px_70px_rgba(95,63,153,0.14)] backdrop-blur-xl sm:p-10">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
              Workspace Setup
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-900 sm:text-4xl">
              Choose how you want to start
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              Create a workspace or join an existing one by sending an access
              request.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {options.map((option, index) => {
              const Icon = option.icon;
              return (
                <motion.button
                  key={option.title}
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: index * 0.05 }}
                  onClick={() => router.push(option.href)}
                  className="group text-left rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_18px_45px_rgba(95,63,153,0.14)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-slate-900">
                    {option.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {option.description}
                  </p>
                  <span className="mt-6 inline-flex rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition group-hover:border-violet-200 group-hover:text-violet-700">
                    {option.cta}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
