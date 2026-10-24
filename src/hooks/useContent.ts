import { useMemo, useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { defaultSiteContent, type AllSiteContent, type ContentKey } from "@/lib/siteContent";
import { mergeContent } from "@/lib/utils";
import type { Topper } from "@/lib/models";
import { asArray, normalizeCourse, normalizeFaculty, normalizeMaterial, normalizeTest } from "@/lib/catalog";

/*
 * Same model as the website: one live Firestore subscription per
 * site_content/<page> document, deep-merged over the built-in defaults.
 * The last copy is also kept on the phone so the app opens instantly
 * (and works offline) on the next launch.
 */

type Snapshot = { raw: unknown; loaded: boolean; error: string | null };
type Entry = { snapshot: Snapshot; listeners: Set<() => void>; started: boolean };

const entries = new Map<string, Entry>();
const LOAD_TIMEOUT_MS = 4000;
const CACHE_PREFIX = "sadhyam_content_v1:";

function getEntry(key: string): Entry {
    let entry = entries.get(key);
    if (!entry) {
        entry = { snapshot: { raw: undefined, loaded: false, error: null }, listeners: new Set(), started: false };
        entries.set(key, entry);
    }
    return entry;
}

function set(entry: Entry, next: Partial<Snapshot>) {
    entry.snapshot = { ...entry.snapshot, ...next };
    entry.listeners.forEach((l) => l());
}

function start(key: string, entry: Entry) {
    if (entry.started) return;
    entry.started = true;
    let live = false;

    AsyncStorage.getItem(CACHE_PREFIX + key)
        .then((cached) => {
            if (!live && cached) set(entry, { raw: JSON.parse(cached), loaded: true });
        })
        .catch(() => undefined);

    const timer = setTimeout(() => {
        if (!entry.snapshot.loaded) set(entry, { loaded: true });
    }, LOAD_TIMEOUT_MS);

    onSnapshot(
        doc(db, "site_content", key),
        (snap) => {
            clearTimeout(timer);
            live = true;
            const raw = snap.exists() ? normalizeFirestore(snap.data()) : undefined;
            set(entry, { raw, loaded: true, error: null });
            AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(raw ?? null)).catch(() => undefined);
        },
        (err) => {
            clearTimeout(timer);
            set(entry, { loaded: true, error: err.message });
        }
    );
}

/** Starts loading the most-used documents while the launch animation plays. */
export function prefetchContent(keys: ContentKey[]) {
    keys.forEach((k) => start(k, getEntry(k)));
}

export function useContent<K extends ContentKey>(key: K) {
    const entry = getEntry(key);
    const snap = useSyncExternalStore(
        (listener) => {
            entry.listeners.add(listener);
            start(key, entry);
            return () => entry.listeners.delete(listener);
        },
        () => entry.snapshot
    );
    const data = useMemo(() => mergeContent(defaultSiteContent[key], snap.raw ?? undefined) as AllSiteContent[K], [key, snap.raw]);
    return { data, loading: !snap.loaded, error: snap.error };
}

/** Firestore Timestamps → millis, so cached JSON and live data look the same. */
function normalizeFirestore(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(normalizeFirestore);
    if (value && typeof value === "object") {
        const v = value as { toMillis?: () => number };
        if (typeof v.toMillis === "function") return v.toMillis();
        const out: Record<string, unknown> = {};
        for (const [k, val] of Object.entries(value)) out[k] = normalizeFirestore(val);
        return out;
    }
    return value;
}

const isPublished = (item: { published?: boolean; id?: string }) => item.published !== false && Boolean(item.id);

export function useCourses() {
    const { data, loading } = useContent("courses");
    const items = useMemo(() => asArray<Record<string, unknown>>(data.items).map(normalizeCourse).filter(isPublished), [data.items]);
    return { items, page: data, loading };
}

export function useTestSeries() {
    const { data, loading } = useContent("testSeries");
    const items = useMemo(() => asArray<Record<string, unknown>>(data.items).map(normalizeTest).filter(isPublished), [data.items]);
    return { items, page: data, loading };
}

export function useStudyMaterials() {
    const { data, loading } = useContent("studyMaterial");
    const items = useMemo(() => asArray<Record<string, unknown>>(data.items).map(normalizeMaterial).filter(isPublished), [data.items]);
    return { items, page: data, loading };
}

export function useFaculty() {
    const { data, loading } = useContent("faculty");
    const items = useMemo(() => asArray<Record<string, unknown>>(data.items).map(normalizeFaculty).filter(isPublished), [data.items]);
    return { items, page: data, loading };
}

export function useToppers() {
    const { data, loading } = useContent("results");
    const items = useMemo(() => asArray<Topper>(data.toppers).filter((t) => t && t.name), [data.toppers]);
    return { items, page: data, loading };
}

/** Featured items first, then the rest, limited to `count`. */
export function pickFeatured<T extends { featured?: boolean }>(items: T[], count: number): T[] {
    const featured = items.filter((i) => i.featured);
    const rest = items.filter((i) => !i.featured);
    return [...featured, ...rest].slice(0, Math.max(0, count || 4));
}
