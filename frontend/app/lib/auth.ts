const TOKEN_KEY = "upflow_auth_token";
const USER_KEY = "upflow_auth_user";

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  organizationId?: string;
  [key: string]: unknown;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
}

/**
 * Save auth token to localStorage
 */
export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Get auth token from localStorage
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Save user to localStorage
 */
export function saveUser(user: User): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

/**
 * Get user from localStorage
 */
export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

/**
 * Clear auth from localStorage
 */
export function clearAuth(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getToken() && !!getUser();
}

/**
 * Verify token validity with backend
 */
export async function verifyToken(token: string): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    return json.data || null;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}
