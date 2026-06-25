/**
 * Centralized API Client for StudyFlow
 */

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const LOCAL_BASE_URL = "/api";

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
};

function buildUrl(baseUrl: string, endpoint: string, params?: Record<string, string>) {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const url = baseUrl.startsWith("http")
    ? new URL(`${baseUrl}${normalizedEndpoint}`)
    : new URL(
        `${baseUrl}${normalizedEndpoint}`,
        typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
      );

  if (params) {
    Object.keys(params).forEach((key) => {
      url.searchParams.append(key, params[key]);
    });
  }

  return url;
}

async function request<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", headers = {}, body, params } = options;

  const url = buildUrl(baseUrl, endpoint, params);

  // Define default headers
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...headers,
  };

  // Get auth token from localStorage if it exists
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("studyflow_auth_token")
      : null;
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers: defaultHeaders,
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    const response = await fetch(url.toString(), config);

    // Handle specific status codes
    if (response.status === 401) {
      // Unauthorized - handle logout or token refresh if needed
      console.warn("Unauthorized request - potential session expiry");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `API request failed with status ${response.status}`,
      );
    }

    // Handle empty responses
    if (response.status === 204) return {} as T;

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export const apiClient = {
  get: <T>(
    endpoint: string,
    params?: Record<string, string>,
    headers?: Record<string, string>,
  ) => request<T>(BACKEND_BASE_URL, endpoint, { method: "GET", params, headers }),

  post: <T>(endpoint: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(BACKEND_BASE_URL, endpoint, { method: "POST", body, headers }),

  put: <T>(endpoint: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(BACKEND_BASE_URL, endpoint, { method: "PATCH", body, headers }),

  patch: <T>(endpoint: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(BACKEND_BASE_URL, endpoint, { method: "PATCH", body, headers }),

  delete: <T>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(BACKEND_BASE_URL, endpoint, { method: "DELETE", headers }),
};

export const localApiClient = {
  get: <T>(
    endpoint: string,
    params?: Record<string, string>,
    headers?: Record<string, string>,
  ) => request<T>(LOCAL_BASE_URL, endpoint, { method: "GET", params, headers }),

  post: <T>(endpoint: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(LOCAL_BASE_URL, endpoint, { method: "POST", body, headers }),

  put: <T>(endpoint: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(LOCAL_BASE_URL, endpoint, { method: "PATCH", body, headers }),

  patch: <T>(endpoint: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(LOCAL_BASE_URL, endpoint, { method: "PATCH", body, headers }),

  delete: <T>(endpoint: string, headers?: Record<string, string>) =>
    request<T>(LOCAL_BASE_URL, endpoint, { method: "DELETE", headers }),
};
