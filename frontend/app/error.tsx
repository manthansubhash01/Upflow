"use client";

import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-lg rounded-3xl border border-rose-200 bg-white p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-slate-900">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Please refresh the page.
          </p>
          <p className="mt-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error.message || "Unexpected error"}
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-5 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
