export function cn(...parts: (string | false | null | undefined)[]): string {
    return parts.filter(Boolean).join(" ");
}

export function formatINR(value: number | string | undefined): string {
    const n = typeof value === "string" ? Number(value.replace(/[^\d.]/g, "")) : Number(value ?? 0);
    if (!Number.isFinite(n)) return "₹0";
    return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function toNumber(value: unknown, fallback = 0): number {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
        const n = Number(value.replace(/[^\d.]/g, ""));
        return Number.isFinite(n) ? n : fallback;
    }
    return fallback;
}

export function discountPercent(price: number, oldPrice: number): number {
    if (!oldPrice || oldPrice <= price) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function uid(prefix = ""): string {
    const rand = Math.random().toString(36).slice(2, 8);
    return `${prefix}${Date.now().toString(36)}${rand}`;
}

/** Firestore Timestamp | number | Date | {seconds} → epoch millis */
export function toMillis(value: unknown): number {
    if (!value) return 0;
    if (typeof value === "number") return value;
    if (value instanceof Date) return value.getTime();
    if (typeof value === "object") {
        const v = value as { toMillis?: () => number; seconds?: number; _seconds?: number };
        if (typeof v.toMillis === "function") return v.toMillis();
        if (typeof v.seconds === "number") return v.seconds * 1000;
        if (typeof v._seconds === "number") return v._seconds * 1000;
    }
    if (typeof value === "string") {
        const t = Date.parse(value);
        return Number.isNaN(t) ? 0 : t;
    }
    return 0;
}

export function formatDate(value: unknown, withTime = false): string {
    const ms = toMillis(value);
    if (!ms) return "—";
    return new Date(ms).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    });
}

/**
 * Deep-merge saved Firestore content over defaults. Objects merge key by key,
 * arrays and primitives from Firestore replace the default.
 */
export function mergeContent<T>(defaults: T, saved: unknown): T {
    if (saved === undefined || saved === null) return defaults;
    if (defaults === null || typeof defaults !== "object" || Array.isArray(defaults)) {
        return saved as T;
    }
    if (typeof saved !== "object" || Array.isArray(saved)) return defaults;

    const result: Record<string, unknown> = { ...(defaults as Record<string, unknown>) };
    for (const [key, value] of Object.entries(saved as Record<string, unknown>)) {
        if (key === "updatedAt") continue;
        result[key] = key in result ? mergeContent(result[key], value) : value;
    }
    return result as T;
}

/** Exam name from a tab label or slug ("upsc" → "UPSC", "other-exams" → "Other Exams"). */
export function matchExam(value: string, exams: readonly string[]): string | undefined {
    const v = slugify(decodeURIComponent(value));
    return exams.find((e) => slugify(e) === v);
}

export function youtubeEmbed(url?: string): string | null {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}
