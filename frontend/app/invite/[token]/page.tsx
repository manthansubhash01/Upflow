"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { apiGet, apiPost } from "@/app/lib/api";
import { useAuth } from "@/app/components/AuthProvider";

export default function InviteTokenPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { token: authToken, user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [invite, setInvite] = useState<{
    workspaceName: string;
    workspaceId: string;
    email: string;
    role: string;
    status: "PENDING" | "ACCEPTED" | "EXPIRED";
    hasAccount: boolean;
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await apiGet<{
        invitation: {
          workspaceName: string;
          workspaceId: string;
          email: string;
          role: string;
          status: "PENDING" | "ACCEPTED" | "EXPIRED";
          hasAccount: boolean;
        };
      }>(`/api/invitations/${token}`);
      if (!response.success || !response.data?.invitation) {
        setError(response.error || "Invitation not found");
      } else {
        setInvite(response.data.invitation);
      }
      setLoading(false);
    };
    void load();
  }, [token]);

  useEffect(() => {
    const autoJoin = async () => {
      if (!invite || !user || !authToken || loading || authLoading || error) {
        return;
      }

      setJoining(true);

      const acceptResponse = await apiPost<{ workspaceId: string }>(
        "/api/invitations/accept",
        { token },
        { authToken },
      );

      if (acceptResponse.success && acceptResponse.data?.workspaceId) {
        router.replace(`/workspace/${acceptResponse.data.workspaceId}`);
        return;
      }

      setError(
        acceptResponse.error ||
          "This invitation could not be accepted for the current account.",
      );
      setJoining(false);
    };

    void autoJoin();
  }, [authLoading, authToken, error, invite, loading, router, token, user]);

  if (loading || authLoading || joining) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,#f2e8ff,#f7f9ff_40%,#eef7ff)] px-6">
        <div className="rounded-[28px] border border-white/80 bg-white/90 px-6 py-5 text-sm text-slate-600 shadow-[0_24px_70px_rgba(95,63,153,0.14)]">
          {joining ? "Joining workspace..." : "Verifying invitation..."}
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,#f2e8ff,#f7f9ff_40%,#eef7ff)] px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl rounded-[28px] border border-white/80 bg-white/90 p-8 shadow-[0_24px_70px_rgba(95,63,153,0.14)] backdrop-blur-xl sm:p-10"
      >
        <p className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
          Workspace Invite
        </p>
        {error ? (
          <>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-900">
              Invitation unavailable
            </h1>
            <p className="mt-3 text-sm text-slate-600">{error}</p>
            <p className="mt-3 text-sm text-slate-600">
              If you still need access, ask a workspace admin to send a new invite.
            </p>
          </>
        ) : invite ? (
          <>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-900">
              You have been invited to join {invite.workspaceName}
            </h1>
            <p className="mt-4 text-sm text-slate-600">
              Invited email: {invite.email}
            </p>
            <p className="mt-2 text-sm text-slate-600">Role: {invite.role}</p>
            {invite.status === "ACCEPTED" ? (
              <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
                This invitation has already been accepted. Login with the invited
                account to open the workspace.
              </div>
            ) : null}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {invite.hasAccount
                ? "Login to join workspace"
                : "Create account to join workspace"}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() =>
                  router.push(
                    `/${invite.hasAccount ? "login" : "signup"}?inviteToken=${token}`,
                  )
                }
                className="rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3d258f]"
              >
                {invite.hasAccount ? "Go to login" : "Go to signup"}
              </button>
              <button
                onClick={() => router.push("/")}
                className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to home
              </button>
            </div>
          </>
        ) : null}
      </motion.div>
    </main>
  );
}
