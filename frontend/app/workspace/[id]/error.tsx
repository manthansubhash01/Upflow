"use client";

import { useEffect } from "react";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Workspace route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-3xl border border-rose-200 bg-white p-8 shadow-xl">
        <h2 className="text-xl font-semibold text-slate-900">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          We could not render this workspace view. You can retry without
          restarting the app.
        </p>
        <p className="mt-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error.message || "Unexpected error"}
        </p>
        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Refresh page
          </button>
        </div>
      </div>
    </div>
  );
}
