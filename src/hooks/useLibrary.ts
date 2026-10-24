import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { apiFetch } from "@/lib/api";
import type { OrderLine } from "@/lib/models";
import { useAuth } from "@/providers/AuthProvider";

export type Access = { url?: string; note?: string; hasPdf?: boolean };
export type LibItem = OrderLine & { orderedAt: number; orderId: string };
export type Library = {
    items: LibItem[];
    pending: (OrderLine & { orderId: string; orderNumber: string })[];
    access: Record<string, Access>;
    progress: Record<string, { tests: number; done: number }>;
};

/**
 * The student's purchases, read by the website server from paid orders.
 * Reloads whenever the app comes back to the foreground — e.g. after the
 * student finished paying on the website in the browser.
 */
export function useLibrary() {
    const { user, loading: authLoading } = useAuth();
    const uid = user?.uid ?? "";
    const [state, setState] = useState<{ uid: string; data: Library | null; error: string } | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        if (!uid) return;
        return apiFetch<Library>("/api/my/library", { auth: true })
            .then((data) => setState({ uid, data, error: "" }))
            .catch((e) => setState((s) => ({ uid, data: s?.uid === uid ? s.data : null, error: e instanceof Error ? e.message : "Could not load your purchases" })));
    }, [uid]);

    useEffect(() => {
        if (authLoading || !uid) return;
        void load();
        const sub = AppState.addEventListener("change", (s) => {
            if (s === "active") void load();
        });
        return () => sub.remove();
    }, [uid, authLoading, load]);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    }, [load]);

    const ready = state?.uid === uid;
    return {
        data: ready ? state.data : null,
        error: ready ? state.error : "",
        loading: Boolean(uid) && (!ready || (!state?.data && !state?.error)),
        refreshing,
        refresh,
    };
}
