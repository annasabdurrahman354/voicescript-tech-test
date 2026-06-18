const API_BASE = "/api";

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(API_BASE + path, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data as T;
}
