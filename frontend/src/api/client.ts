export const BASE_URL = 'http://localhost:3001/api';

/**
 * A native fetch wrapper that throws an error object shaped like an Axios error
 * so that our existing error handlers (e.g. err.response?.data?.error) keep working.
 */
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = new Headers(options?.headers);
  if (!headers.has('Content-Type') && options?.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    throw {
      response: {
        data: data || { error: response.statusText }
      }
    };
  }

  return data as T;
}
