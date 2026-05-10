import { supabase } from './supabase';

// In dev, Vite proxies /api → localhost:3001. In production, set VITE_API_URL to the Railway URL.
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

async function getHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error(
      (err.error as string | undefined) ?? (err.message as string | undefined) ?? res.statusText
    );
  }

  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string)                   => request<T>('GET',    path),
  post:   <T>(path: string, body?: unknown)   => request<T>('POST',   path, body),
  patch:  <T>(path: string, body?: unknown)   => request<T>('PATCH',  path, body),
  delete: <T>(path: string)                   => request<T>('DELETE', path),
};
