type ApiResponse<T = unknown> = { data: T };

type RequestOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: unknown;
};

async function request<T = unknown>(url: string, options: RequestOptions): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    method: options.method,
    headers: options.data === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: options.data === undefined ? undefined : JSON.stringify(options.data),
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
