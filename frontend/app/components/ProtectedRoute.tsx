"use client";

import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, user, isLoading, restoreSession } = useAuth();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  if (process.env.NODE_ENV === "development") {
    console.count("[PROTECTED ROUTE] render");
    console.log({
      loading: isLoading,
      user,
      pathname: typeof window !== "undefined" ? window.location.pathname : null,
    });
  }

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimedOut(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setTimedOut(true);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/auth?mode=login");
    }
  }, [token, isLoading, router]);

  if (!hydrated) {
    return null;
  }

  if (isLoading) {
    if (process.env.NODE_ENV === "development") {
      console.log("[PROTECTED ROUTE] Still loading");
    }

    if (timedOut) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
          <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-6 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Session restore failed
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              The session is taking too long to restore.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setTimedOut(false);
                  void restoreSession();
                }}
                className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Restoring session...
      </div>
    );
  }

  if (!token) {
    if (process.env.NODE_ENV === "development") {
      console.log("[PROTECTED ROUTE] No user -> redirect login");
    }

    return null;
  }

  return <>{children}</>;
}
