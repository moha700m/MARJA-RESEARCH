import { supabase } from './supabase';

type ApiResponse<T = unknown> = { data: T };

type RequestOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: unknown;
};

function normalizeCmsEstimate(url: string, data: unknown) {
  if (url !== '/api/requests' || !data || typeof data !== 'object') return data;
  try {
    const raw = localStorage.getItem('marja_public_settings');
    if (!raw) return data;
    const settings = JSON.parse(raw) as { prices?: Record<string, number> };
    const payload = data as Record<string, unknown>;
    const service = String(payload.service ?? '');
    const pages = Number(payload.pages ?? 5);
    const urgency = String(payload.urgency ?? 'normal');
    const base = Number(settings.prices?.[service]);
    if (!Number.isFinite(base)) return data;
    const multiplier = urgency === 'urgent' ? 1.4 : urgency === 'fast' ? 1.2 : 1;
    return {
      ...payload,
      estimate: Math.round((base + Math.max(0, pages - 5) * 8) * multiplier),
    };
  } catch {
    return data;
  }
}

async function supabaseRequest<T>(url: string, options: RequestOptions): Promise<ApiResponse<T> | null> {
  if (url === '/api/requests' && options.method === 'POST') {
    const payload = normalizeCmsEstimate(url, options.data) as Record<string, unknown>;
    const { data, error } = await supabase.functions.invoke('marja-public', { body: { action: 'create', ...payload } });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(String(data.error));
    return { data: { id: String(data.id) } as T };
  }

  if (options.method === 'GET' && url.startsWith('/api/requests/')) {
    const id = decodeURIComponent(url.slice('/api/requests/'.length));
    const { data, error } = await supabase.functions.invoke('marja-public', { body: { action: 'track', id } });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(String(data.error));
    return { data: data as T };
  }

  return null;
}

async function request<T = unknown>(url: string, options: RequestOptions): Promise<ApiResponse<T>> {
  const databaseResponse = await supabaseRequest<T>(url, options);
  if (databaseResponse) return databaseResponse;

  const data = normalizeCmsEstimate(url, options.data);
  const response = await fetch(url, {
    method: options.method,
    headers: data === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: data === undefined ? undefined : JSON.stringify(data),
  });

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try { parsed = JSON.parse(text); }
    catch { parsed = text; }
  }

  if (!response.ok) {
    const message = typeof parsed === 'object' && parsed && 'error' in parsed ? String((parsed as { error: unknown }).error) : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return { data: parsed as T };
}

export const api = {
  get: <T = unknown>(url: string) => request<T>(url, { method: 'GET' }),
  post: <T = unknown>(url: string, data?: unknown) => request<T>(url, { method: 'POST', data }),
  put: <T = unknown>(url: string, data?: unknown) => request<T>(url, { method: 'PUT', data }),
  delete: <T = unknown>(url: string, data?: unknown) => request<T>(url, { method: 'DELETE', data }),
};
