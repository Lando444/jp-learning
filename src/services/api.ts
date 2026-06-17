const DEFAULT_API_BASE_URL = 'http://localhost:4000/api';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? DEFAULT_API_BASE_URL;

let authToken: string | null = null;

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  skipAuth?: boolean;
};

export function setAuthToken(token: string | null) {
  authToken = token;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken && !options.skipAuth) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? '请求失败');
  }

  return payload.data as T;
}

export { API_BASE_URL };
