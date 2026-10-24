import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/providers/AuthProvider";
import type { Order } from "@/lib/models";
import { toMillis } from "@/lib/utils";

const NONE: Order[] = [];

/** The signed-in student's orders, newest first (live from Firestore). */
export function useMyOrders() {
    const { user, loading: authLoading } = useAuth();
    const uid = user?.uid ?? null;
    const [state, setState] = useState<{ uid: string | null; orders: Order[] }>({ uid: null, orders: NONE });

    useEffect(() => {
        if (!uid) return;
        const q = query(collection(db, "orders"), where("userId", "==", uid));
        return onSnapshot(
            q,
            (snap) =>
                setState({
                    uid,
                    orders: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order).sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)),
                }),
            () => setState({ uid, orders: NONE })
        );
    }, [uid]);

    const ready = !authLoading && (!uid || state.uid === uid);
    return { orders: uid && state.uid === uid ? state.orders : NONE, loading: !ready };
}

/** "kind:id" keys the student has paid for / is waiting to pay for. Updates live when the website marks an order paid. */
export function useEnrollments() {
    const { orders, loading } = useMyOrders();
    const owned = useMemo(() => {
        const s = new Set<string>();
        orders.filter((o) => o.status === "paid").forEach((o) => o.items?.forEach((i) => s.add(`${i.kind}:${i.id}`)));
        return s;
    }, [orders]);
    const pending = useMemo(() => {
        const s = new Set<string>();
        orders.filter((o) => o.status === "pending").forEach((o) => o.items?.forEach((i) => s.add(`${i.kind}:${i.id}`)));
        return s;
    }, [orders]);
    return { owned, pending, orders, loading };
}
