import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { AttemptView } from "@/lib/testClient";

export function useAttempt(id: string) {
    const [data, setData] = useState<AttemptView | null>(null);
    const [error, setError] = useState("");
    const load = useCallback(
        () =>
            apiFetch<AttemptView>(`/api/attempts/${encodeURIComponent(id)}`, { auth: true })
                .then((d) => {
                    setData(d);
                    setError("");
                })
                .catch((e) => setError(e instanceof Error ? e.message : "Could not load the result")),
        [id]
    );
    useEffect(() => {
        load();
    }, [load]);
    return { data, error, reload: load };
}

export type QState = "correct" | "wrong" | "skipped" | "bonus" | "nokey";

export function qStates(view: AttemptView): Record<number, QState> {
    const out: Record<number, QState> = {};
    const answers = view.attempt.answers;
    if (view.solutions) {
        for (const q of view.solutions) {
            const g = answers[String(q.n)];
            out[q.n] = !g ? "skipped" : q.bonus ? "bonus" : !q.answer ? "nokey" : g === q.answer ? "correct" : "wrong";
        }
    } else Object.keys(answers).forEach((k) => (out[Number(k)] = "nokey"));
    return out;
}

export const QCOLOR: Record<QState, { bg: string; fg: string }> = {
    correct: { bg: "#10b981", fg: "#fff" },
    wrong: { bg: "#ef4444", fg: "#fff" },
    skipped: { bg: "#f1f5f9", fg: "#475569" },
    bonus: { bg: "#3b82f6", fg: "#fff" },
    nokey: { bg: "#cbd5e1", fg: "#1e293b" },
};
