"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import {
  User,
  AuthState,
  getToken,
  getUser,
  saveToken,
  saveUser,
  clearAuth,
  verifyToken,
} from "@/app/lib/auth";
import { apiGet, apiPost } from "@/app/lib/api";

const RESTORE_TIMEOUT_MS = 10000;

async function withTimeout<T>(promise: Promise<T>, label: string) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timeout`));
    }, RESTORE_TIMEOUT_MS);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[AUTH] Mounted");
    }

    mountedRef.current = true;

    return () => {
      if (process.env.NODE_ENV === "development") {
        console.log("[AUTH] Unmounted");
      }

      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[AUTH] hydrated");
    }

    setHydrated(true);
  }, []);

  const resolvePostOAuthRedirect = useCallback(async (oauthToken: string) => {
    if (typeof window === "undefined") return;

    const inviteToken = window.localStorage.getItem(
      "upflow_oauth_invite_token",
    );

    if (inviteToken) {
      const inviteResponse = await withTimeout(
        apiPost<{ workspaceId: string }>(
          "/api/invitations/accept",
          { token: inviteToken },
          { authToken: oauthToken },
        ),
        "Invitation acceptance",
      );

      window.localStorage.removeItem("upflow_oauth_invite_token");

      if (inviteResponse.success && inviteResponse.data?.workspaceId) {
        window.location.replace(
          `/workspace/${inviteResponse.data.workspaceId}`,
        );
        return;
      }
    }

    const workspacesResponse = await withTimeout(
      apiGet<Array<{ id?: string; _id?: string }>>("/api/workspace", {
        authToken: oauthToken,
      }),
      "Workspace lookup",
    );

    if (!workspacesResponse.success) {
      window.location.replace("/dashboard");
      return;
    }

    const workspaces = workspacesResponse.data || [];
    if (workspaces.length === 0) {
      window.location.replace("/workspace");
      return;
    }

    const firstWorkspace = workspaces[0];
    const workspaceId = firstWorkspace.id || firstWorkspace._id;
    window.location.replace(
      workspaceId ? `/workspace/${workspaceId}` : "/dashboard",
    );
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[AUTH] restoreSession started");
      }

      // Check URL params for OAuth token
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const oauthToken = params.get("token");
        const oauthUserParam = params.get("user");

        if (process.env.NODE_ENV === "development") {
          console.log("[AUTH] token", oauthToken || getToken());
        }

        if (oauthToken) {
          let resolvedUser = await withTimeout(
            verifyToken(oauthToken),
            "OAuth verification",
          );

          if (!resolvedUser && oauthUserParam) {
            try {
              const parsed = JSON.parse(oauthUserParam) as User;
              if (parsed?.id && parsed?.email) {
                resolvedUser = parsed;
              }
            } catch {
              // Ignore malformed user payload and keep normal flow.
            }
          }

          if (resolvedUser) {
            if (process.env.NODE_ENV === "development") {
              console.log("[AUTH] /auth/me success", resolvedUser);
            }

            setToken(oauthToken);
            setUser(resolvedUser);
            saveToken(oauthToken);
            saveUser(resolvedUser);
            // Clean up URL
            window.history.replaceState({}, "", window.location.pathname);

            if (
              ["/", "/auth", "/login", "/signup"].includes(
                window.location.pathname,
              )
            ) {
              await resolvePostOAuthRedirect(oauthToken);
            }

            return;
          }
        }
      }

      // Check localStorage - just load without verification
      // Verification will happen on first API call if token is invalid
      const storedToken = getToken();
      const storedUser = getUser();

      if (process.env.NODE_ENV === "development") {
        console.log("[AUTH] token", storedToken);
      }

      if (!storedToken) {
        if (process.env.NODE_ENV === "development") {
          console.log("[AUTH] no token -> set loading false");
        }

        if (mountedRef.current) {
          setUser(null);
        }
        return;
      }

      if (storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      } else {
        const response = await withTimeout(
          verifyToken(storedToken),
          "Session verification",
        );

        if (process.env.NODE_ENV === "development") {
          console.log("[AUTH] /auth/me success", response);
        }

        if (response) {
          setToken(storedToken);
          setUser(response);
          saveToken(storedToken);
          saveUser(response);
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error("[AUTH] /auth/me failed", error);
      if (mountedRef.current) {
        setUser(null);
      }
    } finally {
      if (mountedRef.current) {
        if (process.env.NODE_ENV === "development") {
          console.log("[AUTH] setLoading(false)");
        }
        setIsLoading(false);
      }
    }
  }, [resolvePostOAuthRedirect]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void restoreSession();
  }, [hydrated, restoreSession]);

  const login = (nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    saveToken(nextToken);
    saveUser(nextUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    clearAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        login,
        logout,
        restoreSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
