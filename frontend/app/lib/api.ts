import axios, { AxiosRequestConfig, Method } from "axios";
import { getToken } from "./auth";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

type ApiOptions = {
  headers?: Record<string, string>;
  authToken?: string;
};

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  withCredentials: true,
  timeout: 10000,
});

export async function apiCall<T = unknown>(
  method: Method,
  endpoint: string,
  body?: unknown,
  options: ApiOptions = {},
): Promise<ApiResponse<T>> {
  const token = options.authToken || getToken();

  const requestConfig: AxiosRequestConfig = {
    method,
    url: endpoint,
    data: body,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  };

  try {
    const response = await apiClient.request(requestConfig);
    const payload = response.data;

    return {
      success: true,
      data: (payload?.data ?? payload) as T,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return {
          success: false,
          error: "Request timeout. Please try again.",
        };
      }

      const message =
        (
          error.response?.data as
            | { message?: string; error?: string }
            | undefined
        )?.message ||
        (
          error.response?.data as
            | { message?: string; error?: string }
            | undefined
        )?.error ||
        error.message ||
        "An error occurred";

      return {
        success: false,
        error: message,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

export function apiGet<T = unknown>(endpoint: string, options?: ApiOptions) {
  return apiCall<T>("GET", endpoint, undefined, options);
}

export function apiPost<T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: ApiOptions,
) {
  return apiCall<T>("POST", endpoint, body, options);
}

export function apiPut<T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: ApiOptions,
) {
  return apiCall<T>("PUT", endpoint, body, options);
}

export function apiDelete<T = unknown>(endpoint: string, options?: ApiOptions) {
  return apiCall<T>("DELETE", endpoint, undefined, options);
}
