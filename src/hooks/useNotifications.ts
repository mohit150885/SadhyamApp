import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SiteNotification } from "@/lib/models";
import { toMillis } from "@/lib/utils";

/** Published notifications from the admin panel (the website's header bell). */
export function useNotifications() {
    const [items, setItems] = useState<SiteNotification[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const q = query(collection(db, "notifications"), where("published", "==", true), limit(30));
        return onSnapshot(
            q,
            (snap) => {
                setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SiteNotification).sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)));
                setLoading(false);
            },
            () => setLoading(false)
        );
    }, []);
    return { items, loading };
}

const KEY = "sadhyam_notifications_seen";
let seen = 0;
const listeners = new Set<() => void>();
AsyncStorage.getItem(KEY)
    .then((v) => {
        seen = Number(v) || 0;
        listeners.forEach((l) => l());
    })
    .catch(() => undefined);

export function useSeenNotifications() {
    const value = useSyncExternalStore(
        (l) => {
            listeners.add(l);
            return () => listeners.delete(l);
        },
        () => seen
    );
    const markSeen = useCallback(() => {
        seen = Date.now();
        AsyncStorage.setItem(KEY, String(seen)).catch(() => undefined);
        listeners.forEach((l) => l());
    }, []);
    return { seenAt: value, markSeen };
}
