import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { apiFetch, idToken } from "./api";
import { WEBSITE_URL } from "./config";
import { useAuth } from "@/providers/AuthProvider";
import type { AttemptResult, AttemptState, Segment, TestSummary } from "./testTypes";

export type TestListItem = TestSummary & {
    status: "open" | "upcoming" | "closed";
    access: boolean;
    attempts: { id: string; attemptNo: number; status: string; startedAt: number; deadline: number; submittedAt: number | null; score: number | null; maxScore: number | null }[];
};

export type TestDetail = TestSummary & {
    instructions: string;
    options: number;
    mode: "crop" | "pages";
    solutionsVisibility: string;
    hasSolutionPdf: boolean;
    pages: { w: number; h: number; has: boolean }[];
    questions: { n: number; segments: Segment[] }[];
};

export type AttemptView = {
    attempt: AttemptState;
    serverNow: number;
    test: TestSummary & { options: number; mode: "crop" | "pages"; solutionsVisibility: string; hasSolutionPdf: boolean };
    stats?: { rank: number; candidates: number; percentile: number; average: number; topper: number; leaderboard: { rank: number; name: string; score: number; timeSec: number; me: boolean }[] };
    solutionsAvailable?: boolean;
    solutions?: { n: number; segments: Segment[]; answer: string | null; explanation: string; bonus: boolean }[] | null;
    pages?: { w: number; h: number; has: boolean }[];
};

export type { AttemptResult };

/** Tests of one series (with the student's access + attempts when signed in). */
export function useSeriesTests(seriesId: string | null) {
    const { user, loading: authLoading } = useAuth();
    const [state, setState] = useState<{ key: string; items: TestListItem[]; owned?: boolean; error: string } | null>(null);
    const key = `${seriesId ?? "*"}:${user?.uid ?? "guest"}`;

    const load = useCallback(() => {
        const url = seriesId ? `/api/tests?series=${encodeURIComponent(seriesId)}` : "/api/tests";
        return apiFetch<{ items: TestListItem[]; owned?: boolean }>(url, { auth: user ? true : false })
            .then((d) => setState({ key, items: d.items ?? [], owned: d.owned, error: "" }))
            .catch((e) => setState({ key, items: [], error: e instanceof Error ? e.message : "Could not load tests" }));
    }, [key, seriesId, user]);

    useEffect(() => {
        if (authLoading) return;
        void load();
        const sub = AppState.addEventListener("change", (s) => s === "active" && void load());
        return () => sub.remove();
    }, [authLoading, load]);

    const ready = state?.key === key;
    return { items: ready ? state.items : [], owned: ready ? state.owned : undefined, error: ready ? state.error : "", loading: !ready, reload: load };
}

/** Protected question-paper page image: URL + auth header (React Native images can send headers). */
export function pageSource(testId: string, page: number, token: string) {
    return { uri: `${WEBSITE_URL}/api/tests/${encodeURIComponent(testId)}/page/${page}`, headers: { Authorization: `Bearer ${token}` } };
}

/** A fresh ID token for image requests (refreshed every 45 minutes during long tests). */
export function useIdToken() {
    const [token, setToken] = useState("");
    useEffect(() => {
        let alive = true;
        const get = () =>
            idToken()
                .then((t) => alive && setToken(t))
                .catch(() => undefined);
        void get();
        const t = setInterval(get, 45 * 60_000);
        return () => {
            alive = false;
            clearInterval(t);
        };
    }, []);
    return token;
}

export function formatDuration(sec: number) {
    const s = Math.max(0, Math.floor(sec));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    return h ? `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function humanDuration(sec: number) {
    const m = Math.round(sec / 60);
    if (m < 1) return `${Math.max(0, Math.round(sec))} sec`;
    const h = Math.floor(m / 60);
    return h ? `${h} hr ${m % 60} min` : `${m} min`;
}
