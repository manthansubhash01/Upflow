"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/app/components/AuthProvider";
import { apiGet, apiPost } from "@/app/lib/api";

type AuthMode = "login" | "signup";

interface AuthFormProps {
  initialMode?: AuthMode;
  showTabs?: boolean;
}

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z
  .object({
    name: z.string().min(2, "Full name is required"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

type WorkspaceRecord = {
  id?: string;
  _id?: string;
};

export default function AuthForm({
  initialMode = "login",
  showTabs = true,
}: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("inviteToken");

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const resolvePostAuthRedirect = async (token: string): Promise<string> => {
    if (inviteToken) {
      const inviteResponse = await apiPost<{ workspaceId: string }>(
        "/api/invitations/accept",
        { token: inviteToken },
        { authToken: token },
      );

      if (!inviteResponse.success || !inviteResponse.data?.workspaceId) {
        throw new Error(
          inviteResponse.error || "Invitation could not be accepted.",
        );
      }

      return `/workspace/${inviteResponse.data.workspaceId}`;
    }

    const workspaceResponse = await apiGet<WorkspaceRecord[]>(
      "/api/workspace",
      {
        authToken: token,
      },
    );

    if (!workspaceResponse.success) {
      throw new Error(workspaceResponse.error || "Could not load workspaces");
    }

    const workspaces = workspaceResponse.data || [];
    if (workspaces.length === 0) {
      return "/workspace";
    }

    const firstWorkspace = workspaces[0];
    const workspaceId = firstWorkspace.id || firstWorkspace._id;
    return workspaceId ? `/workspace/${workspaceId}` : "/dashboard";
  };

  const persistInviteTokenForOAuth = () => {
    if (inviteToken && typeof window !== "undefined") {
      window.localStorage.setItem("upflow_oauth_invite_token", inviteToken);
    }
  };

  const handleAuth = async (payload: {
    endpoint: string;
    body: Record<string, string>;
  }) => {
    setIsSubmitting(true);
    setError("");

    try {
      const authResponse = await apiPost<{
        token: string;
        user: { id: string; name: string; email: string };
      }>(payload.endpoint, payload.body);

      if (!authResponse.success || !authResponse.data) {
        throw new Error(authResponse.error || "Authentication failed.");
      }

      login(authResponse.data.token, authResponse.data.user);
      const redirectPath = await resolvePostAuthRedirect(
        authResponse.data.token,
      );
      router.push(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (values: LoginValues) => {
    await handleAuth({
      endpoint: "/api/auth/login",
      body: { email: values.email, password: values.password },
    });
  };

  const handleSignupSubmit = async (values: SignupValues) => {
    await handleAuth({
      endpoint: "/api/auth/signup",
      body: {
        name: values.name,
        email: values.email,
        password: values.password,
      },
    });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f2e8ff,#f7f9ff_40%,#eef7ff)] px-6 py-10 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="rounded-[28px] border border-white/80 bg-white/70 p-7 shadow-[0_24px_70px_rgba(95,63,153,0.14)] backdrop-blur-xl sm:p-10"
        >
          <p className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
            Upflow Access
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-slate-900 sm:text-5xl">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-4 max-w-md text-base text-slate-600">
            Manage workspaces, projects, and tasks in one clean flow.
          </p>
          {inviteToken ? (
            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              Invite token detected. After authentication, you will be joined to
              the workspace automatically.
            </div>
          ) : null}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.06 }}
          className="rounded-[28px] border border-white/80 bg-white p-7 shadow-[0_24px_70px_rgba(95,63,153,0.14)] sm:p-10"
        >
          {showTabs ? (
            <div className="relative mb-6 grid grid-cols-2 rounded-full bg-[#f2effb] p-1">
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 360, damping: 34 }}
                className="absolute top-1 bottom-1 rounded-full bg-white shadow-sm"
                style={{
                  left: mode === "login" ? "4px" : "calc(50% + 0px)",
                  width: "calc(50% - 4px)",
                }}
              />
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`relative z-10 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  mode === "login" ? "text-brand-700" : "text-slate-500"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`relative z-10 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  mode === "signup" ? "text-brand-700" : "text-slate-500"
                }`}
              >
                Signup
              </button>
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    {...loginForm.register("email")}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
                    placeholder="you@company.com"
                  />
                  {loginForm.formState.errors.email?.message ? (
                    <p className="mt-1 text-xs text-rose-600">
                      {loginForm.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="block text-sm font-semibold text-slate-700">
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-xs font-medium text-violet-600 hover:underline"
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <input
                    type="password"
                    {...loginForm.register("password")}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
                    placeholder="At least 6 characters"
                  />
                  {loginForm.formState.errors.password?.message ? (
                    <p className="mt-1 text-xs text-rose-600">
                      {loginForm.formState.errors.password.message}
                    </p>
                  ) : null}
                </div>

                {error ? (
                  <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3d258f] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Please wait..." : "Login to Upflow"}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="signup-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                onSubmit={signupForm.handleSubmit(handleSignupSubmit)}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Full name
                  </label>
                  <input
                    {...signupForm.register("name")}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
                    placeholder="Enter your full name"
                  />
                  {signupForm.formState.errors.name?.message ? (
                    <p className="mt-1 text-xs text-rose-600">
                      {signupForm.formState.errors.name.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    {...signupForm.register("email")}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
                    placeholder="you@company.com"
                  />
                  {signupForm.formState.errors.email?.message ? (
                    <p className="mt-1 text-xs text-rose-600">
                      {signupForm.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    {...signupForm.register("password")}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
                    placeholder="At least 6 characters"
                  />
                  {signupForm.formState.errors.password?.message ? (
                    <p className="mt-1 text-xs text-rose-600">
                      {signupForm.formState.errors.password.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    {...signupForm.register("confirmPassword")}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
                    placeholder="Retype your password"
                  />
                  {signupForm.formState.errors.confirmPassword?.message ? (
                    <p className="mt-1 text-xs text-rose-600">
                      {signupForm.formState.errors.confirmPassword.message}
                    </p>
                  ) : null}
                </div>

                {error ? (
                  <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3d258f] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Please wait..." : "Create Upflow Account"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-600">
                  Or continue with
                </span>
              </div>
            </div>

            <a
              href={`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/api/auth/google`}
              onClick={persistInviteTokenForOAuth}
              className="w-full rounded-full border-2 border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                ></path>
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                ></path>
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                ></path>
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                ></path>
              </svg>
              Google
            </a>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 text-sm text-slate-600">
            <Link
              href={`/auth?${mode === "login" ? "mode=signup" : "mode=login"}${inviteToken ? `&inviteToken=${inviteToken}` : ""}`}
              className="text-violet-600 hover:underline"
            >
              {mode === "login"
                ? "Need an account? Sign up"
                : "Already have an account? Login"}
            </Link>
            <Link href="/" className="text-slate-500 hover:underline">
              Back to home
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
