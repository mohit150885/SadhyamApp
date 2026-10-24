import { auth } from "./firebase";
import { WEBSITE_URL } from "./config";

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

export async function idToken(): Promise<string> {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new ApiError("Please log in to continue.", 401);
    return token;
}

/** Calls an API route of the website with the student's Firebase ID token. */
export async function apiFetch<T = unknown>(path: string, init?: { method?: string; json?: unknown; auth?: boolean; signal?: AbortSignal }): Promise<T> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (init?.auth !== false) {
        const token = await auth.currentUser?.getIdToken();
        if (token) headers.Authorization = `Bearer ${token}`;
        else if (init?.auth === true) throw new ApiError("Please log in to continue.", 401);
    }
    if (init?.json !== undefined) headers["Content-Type"] = "application/json";
    let res: Response;
    try {
        res = await fetch(`${WEBSITE_URL}${path}`, {
            method: init?.method ?? "GET",
            headers,
            body: init?.json !== undefined ? JSON.stringify(init.json) : undefined,
            signal: init?.signal,
        });
    } catch {
        throw new ApiError("No internet connection. Please check your network and try again.", 0);
    }
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) throw new ApiError(data.error || `Request failed (${res.status})`, res.status);
    return data as T;
}

/** Uint8Array → base64 (no Buffer in React Native). */
export function bytesToBase64(bytes: Uint8Array): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let out = "";
    let i = 0;
    for (; i + 2 < bytes.length; i += 3) {
        const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        out += chars[(n >> 18) & 63] + chars[(n >> 12) & 63] + chars[(n >> 6) & 63] + chars[n & 63];
    }
    const rest = bytes.length - i;
    if (rest === 1) {
        const n = bytes[i] << 16;
        out += chars[(n >> 18) & 63] + chars[(n >> 12) & 63] + "==";
    } else if (rest === 2) {
        const n = (bytes[i] << 16) | (bytes[i + 1] << 8);
        out += chars[(n >> 18) & 63] + chars[(n >> 12) & 63] + chars[(n >> 6) & 63] + "=";
    }
    return out;
}
