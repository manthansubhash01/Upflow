"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useSearchParams } from "next/navigation";
import { Plus, Search, Shield, Star } from "lucide-react";
import {
  clearWorkspaceInvitations,
  fetchWorkspaceMembers,
  inviteMember,
  promoteWorkspaceMember,
  type WorkspaceMemberProfile,
} from "@/app/lib/workspaceApi";
import PendingJoinRequests from "@/app/components/workspace/PendingJoinRequests";

const shortId = (id: string) => `${id.slice(0, 6)}...${id.slice(-4)}`;

export default function WorkspaceMembersPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const workspaceId = params.id;

  const [members, setMembers] = useState<WorkspaceMemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openInvite, setOpenInvite] = useState(
    searchParams.get("invite") === "1",
  );
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [clearingInvites, setClearingInvites] = useState(false);

  const [promotingId, setPromotingId] = useState("");

  const closeInviteModal = () => {
    setOpenInvite(false);
    setInviteLink("");
    setInviteError("");
    setInviteMessage("");
  };

  const filtered = useMemo(
    () =>
      members.filter((member) =>
        `${member.name} ${member.email} ${member.userId} ${member.role}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [members, query],
  );

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setMembers(await fetchWorkspaceMembers(workspaceId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load workspace members",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [workspaceId]);

  const handleInvite = async () => {
    setInviteError("");
    setInviteMessage("");
    setInviteLink("");
    setInviteLoading(true);
    try {
      const response = await inviteMember({ email, workspaceId, role });
      if (!response.success) {
        throw new Error(response.error || "Failed to send invitation");
      }

      const result = response.data;
      if (result?.inviteLink) {
        setInviteLink(result.inviteLink);
      }

      if (result?.emailSent) {
        setInviteMessage(
          result.reusedExisting
            ? "Pending invitation found and email re-sent successfully."
            : "Invitation sent successfully.",
        );
      } else {
        if (result?.emailError) {
          setInviteError(`Email delivery failed: ${result.emailError}`);
        }

        setInviteMessage(
          result?.reusedExisting
            ? "A pending invitation already existed. Email delivery failed, but you can use the invite link below."
            : "Invitation created. Email delivery failed, but you can use the invite link below.",
        );
      }

      setEmail("");
      await load();
    } catch (err) {
      setInviteError(
        err instanceof Error ? err.message : "Failed to send invitation",
      );
    } finally {
      setInviteLoading(false);
    }
  };

  const handlePromote = async (memberId: string) => {
    setPromotingId(memberId);
    try {
      const response = await promoteWorkspaceMember({ workspaceId, memberId });
      if (!response.success) {
        throw new Error(response.error || "Failed to promote member");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to promote member");
    } finally {
      setPromotingId("");
    }
  };

  const handleClearInvitations = async () => {
    const confirmed = window.confirm(
      "This will remove all pending invitations for this workspace. Continue?",
    );

    if (!confirmed) {
      return;
    }

    setClearingInvites(true);
    setInviteError("");
    setInviteMessage("");
    setInviteLink("");

    try {
      const response = await clearWorkspaceInvitations(workspaceId);
      if (!response.success) {
        throw new Error(response.error || "Failed to clear invitations");
      }

      const expiredCount = response.data?.expiredCount || 0;
      setInviteMessage(
        expiredCount > 0
          ? `Expired ${expiredCount} pending invitation${expiredCount === 1 ? "" : "s"}.`
          : "No pending invitations were found.",
      );

      await load();
    } catch (err) {
      setInviteError(
        err instanceof Error ? err.message : "Failed to clear invitations",
      );
    } finally {
      setClearingInvites(false);
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
            Members
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Invite and manage workspace members.
          </p>
        </div>
        <button
          onClick={() => setOpenInvite(true)}
          className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3d258f]"
        >
          <Plus className="h-4 w-4" /> Invite Member
        </button>
        <button
          onClick={() => void handleClearInvitations()}
          disabled={clearingInvites}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-70"
        >
          {clearingInvites ? "Clearing..." : "Clear Pending Invites"}
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search members by name, email or id"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-violet-300"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          Loading members...
        </div>
      ) : null}
      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[1.3fr_1.3fr_0.7fr_1fr] border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-slate-200">
            {filtered.map((member) => (
              <div
                key={member.userId}
                className="grid grid-cols-[1.3fr_1.3fr_0.7fr_1fr] items-center px-5 py-4 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-700 text-xs font-semibold text-white">
                    {(member.name || member.userId).slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {member.name || shortId(member.userId)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {shortId(member.userId)}
                    </p>
                  </div>
                </div>
                <span className="text-slate-600">{member.email || "-"}</span>
                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${member.role === "ADMIN" ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-700"}`}
                >
                  {member.role}
                </span>
                <div className="flex items-center gap-2">
                  {member.role === "MEMBER" ? (
                    <button
                      onClick={() => void handlePromote(member.userId)}
                      disabled={promotingId === member.userId}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-70"
                    >
                      <Star className="h-3.5 w-3.5" />
                      {promotingId === member.userId
                        ? "Promoting..."
                        : "Promote"}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500">
                      <Shield className="h-3.5 w-3.5" /> Admin
                    </span>
                  )}
                </div>
              </div>
            ))}

            {filtered.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-500">
                No members found.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <PendingJoinRequests workspaceId={workspaceId} />

      <AnimatePresence>
        {openInvite ? (
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
                    Invite Member
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                    Send workspace invitation
                  </h3>
                </div>
                <button
                  onClick={closeInviteModal}
                  className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600"
                >
                  Close
                </button>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">
                    Email
                  </span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300"
                    placeholder="name@example.com"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Role
                  </span>
                  <select
                    value={role}
                    onChange={(event) =>
                      setRole(event.target.value as "ADMIN" | "MEMBER")
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </label>
              </div>
              {inviteError ? (
                <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {inviteError}
                </p>
              ) : null}
              {inviteMessage ? (
                <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  {inviteMessage}
                </p>
              ) : null}
              {inviteLink ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                    Invite Link
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      readOnly
                      value={inviteLink}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                    />
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(inviteLink);
                          setInviteMessage("Invite link copied to clipboard.");
                        } catch {
                          setInviteError("Failed to copy invite link.");
                        }
                      }}
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              ) : null}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeInviteModal}
                  className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleInvite()}
                  disabled={inviteLoading || !email.trim()}
                  className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {inviteLoading ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
