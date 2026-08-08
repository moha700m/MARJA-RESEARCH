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

async function request<T = unknown>(url: string, options: RequestOptions): Promise<ApiResponse<T>> {
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
