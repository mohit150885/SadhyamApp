/* eslint-disable react-hooks/preserve-manual-memoization -- the exam runner opts out of the React Compiler ("use no memo"): timers, refs and autosave are managed by hand */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, AppState, BackHandler, Dimensions, Modal, Pressable, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useKeepAwake } from "expo-keep-awake";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeIn, FadeInDown, SlideInDown, SlideInRight, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { Check, ChevronLeft, ChevronRight, Info, LayoutGrid, Lock, X, ZoomIn, ZoomOut } from "lucide-react-native";
import { apiFetch } from "@/lib/api";
import { formatDuration, useIdToken, type TestDetail } from "@/lib/testClient";
import { LETTERS, type AnswerLetter, type AttemptState } from "@/lib/testTypes";
import { formatDate } from "@/lib/utils";
import { palette, shadow, slate, useTheme } from "@/lib/theme";
import { useAuth } from "@/providers/AuthProvider";
import { Header, Body, Page, goBack } from "@/components/Screen";
import { RequireLogin } from "@/components/RequireLogin";
import { Btn, Card, EmptyState, Loader, Notice, T, Tap } from "@/components/ui";
import { PageImage, QuestionImage } from "@/components/QuestionImage";
import { Legend, PaletteBtn, type QStatus } from "@/components/exam/palette";

const { width: W } = Dimensions.get("window");

type Loaded = {
    test: TestDetail;
    status: "open" | "upcoming" | "closed";
    access: boolean;
    attempts: { id: string; attemptNo: number; status: string; deadline: number; score: number | null; maxScore: number | null; submittedAt: number | null }[];
    serverNow: number;
};

export default function TestScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return (
        <RequireLogin title="Log in to take this test" withBack>
            <TestRoot testId={id} />
        </RequireLogin>
    );
}

function TestRoot({ testId }: { testId: string }) {
    const [data, setData] = useState<Loaded | null>(null);
    const [error, setError] = useState("");
    const [session, setSession] = useState<{ attempt: AttemptState; offset: number } | null>(null);
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        apiFetch<Loaded>(`/api/tests/${encodeURIComponent(testId)}`, { auth: true })
            .then(setData)
            .catch((e) => setError(e instanceof Error ? e.message : "Could not load the test"));
    }, [testId]);

    const start = async () => {
        setStarting(true);
        setError("");
        try {
            const r = await apiFetch<{ attempt: AttemptState; serverNow: number }>(`/api/tests/${encodeURIComponent(testId)}/start`, { method: "POST", auth: true });
            setSession({ attempt: r.attempt, offset: r.serverNow - Date.now() });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Could not start the test");
        } finally {
            setStarting(false);
        }
    };

    if (error && !data)
        return (
            <Page>
                <Header title="Test" />
                <EmptyState title="Test unavailable" description={error} action={<Btn title="Go back" onPress={() => goBack()} />} />
            </Page>
        );
    if (!data) return <Loader label="Loading test…" />;
    if (session) return <ExamRunner test={data.test} initial={session.attempt} offset={session.offset} />;
    return <Instructions data={data} onStart={start} starting={starting} error={error} />;
}

/* ------------------------------------------------------------------ */
/* Instructions                                                        */
/* ------------------------------------------------------------------ */

function Instructions({ data, onStart, starting, error }: { data: Loaded; onStart: () => void; starting: boolean; error: string }) {
    const theme = useTheme();
    const { test, access, status, attempts } = data;
    const [agree, setAgree] = useState(false);
    const open = attempts.find((a) => a.status === "in-progress");
    const used = attempts.length;
    const exhausted = !open && test.maxAttempts > 0 && used >= test.maxAttempts;
    const latest = attempts.find((a) => a.status === "submitted");
    const negPart = test.marksWrong > 0 ? `${test.marksWrong} mark(s) will be deducted for every wrong answer.` : "There is no negative marking.";
    const lines = [
        `The test contains ${test.questionCount} questions for a total of ${test.totalMarks} marks.`,
        `You have ${test.durationMin} minutes. The timer at the top shows the time left; the test is submitted automatically when it reaches zero.`,
        `Each correct answer carries ${test.marksCorrect} mark(s). ${negPart} Unanswered questions get 0.`,
        ...(test.sections.length > 1 ? [`The paper has ${test.sections.length} sections. Use the section tabs to move between them; you can switch at any time.`] : []),
        ...(test.mode === "pages" ? ["Read the questions on the question-paper pages and mark your answers on the answer sheet."] : []),
        "Your answers are saved on this phone instantly and on our server every few seconds. If the app closes, open the test again to resume.",
        ...test.instructions.split("\n").map((l) => l.trim()).filter((l) => l),
    ];

    let action: React.ReactNode;
    if (!access)
        action = (
            <>
                <Notice tone="amber" icon={<Lock size={16} color={palette.amber800} />}>
                    This test is locked. Enroll in the test series to attempt it.
                </Notice>
                <Btn full title="View Test Series" onPress={() => router.replace(`/test-series/${encodeURIComponent(test.seriesId)}`)} />
            </>
        );
    else if (open)
        action = (
            <>
                <Notice tone="amber">You have this test in progress. Your answers were saved; the timer kept running while you were away.</Notice>
                <Btn full size="lg" title="Resume Test" loading={starting} onPress={onStart} style={{ backgroundColor: palette.amber500 }} />
            </>
        );
    else if (status === "upcoming") action = <Notice tone="blue">This test opens on {formatDate(test.availableFrom, true)}.</Notice>;
    else if (status === "closed") action = <Notice tone="amber">This test is closed.</Notice>;
    else if (exhausted) action = <Notice tone="amber">You have used all {test.maxAttempts} attempt(s) for this test.</Notice>;
    else
        action = (
            <>
                <Tap onPress={() => setAgree((v) => !v)} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                    <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: agree ? theme.brand : slate[300], backgroundColor: agree ? theme.brand : "#fff", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                        {agree ? <Check size={14} color="#fff" strokeWidth={3} /> : null}
                    </View>
                    <T size={13} color={slate[700]} lh={1.45} style={{ flex: 1 }}>
                        I have read and understood the instructions. I am ready to begin.
                    </T>
                </Tap>
                <Btn full size="lg" title={used ? "Start Re-attempt" : "Start Test"} loading={starting} disabled={!agree} onPress={onStart} />
                {test.maxAttempts > 0 ? (
                    <T size={12} color={slate[500]} center>
                        Attempt {used + 1} of {test.maxAttempts}
                    </T>
                ) : null}
            </>
        );

    return (
        <Page>
            <Header title={test.title} subtitle="Instructions" dark />
            <Body contentStyle={{ gap: 14 }}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                    {[
                        ["Questions", test.questionCount],
                        ["Total marks", test.totalMarks],
                        ["Duration", `${test.durationMin} min`],
                        ["Negative", test.marksWrong > 0 ? `−${test.marksWrong}` : "None"],
                    ].map(([k, v], i) => (
                        <Animated.View key={String(k)} entering={FadeInDown.delay(i * 60).duration(400)} style={{ width: (W - 32 - 10) / 2, backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: slate[200], padding: 14, alignItems: "center" }}>
                            <T w="black" size={22} color={theme.navy}>
                                {v}
                            </T>
                            <T size={12} color={slate[500]}>
                                {k}
                            </T>
                        </Animated.View>
                    ))}
                </View>
                {test.sections.length > 1 ? (
                    <Card padded={false}>
                        {test.sections.map((s, i) => (
                            <View key={s.name + s.from} style={{ flexDirection: "row", padding: 12, borderTopWidth: i ? 1 : 0, borderTopColor: slate[100], gap: 8 }}>
                                <T w="bold" size={13} color={slate[900]} style={{ flex: 1 }}>
                                    {s.name}
                                </T>
                                <T size={12} color={slate[600]}>
                                    Q{s.from}–{s.to} • +{s.marksCorrect} / −{s.marksWrong}
                                </T>
                            </View>
                        ))}
                    </Card>
                ) : null}
                <Card style={{ gap: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Info size={18} color={theme.brand} />
                        <T w="black" size={16} color={slate[900]}>
                            General Instructions
                        </T>
                    </View>
                    {lines.map((l, i) => (
                        <View key={i} style={{ flexDirection: "row", gap: 8 }}>
                            <T w="bold" size={14} color={theme.brand}>
                                {i + 1}.
                            </T>
                            <T size={14} color={slate[700]} lh={1.5} style={{ flex: 1 }}>
                                {l}
                            </T>
                        </View>
                    ))}
                </Card>
                <Card style={{ gap: 12 }}>
                    <T w="black" size={16} color={slate[900]}>
                        Question palette
                    </T>
                    <Legend />
                </Card>
                <Card style={{ gap: 12 }}>
                    {action}
                    {error ? <Notice tone="red">{error}</Notice> : null}
                </Card>
                {latest ? (
                    <Tap onPress={() => router.push(`/result/${latest.id}`)} style={{ flexDirection: "row", alignItems: "center", backgroundColor: palette.emerald50, borderColor: palette.emerald100, borderWidth: 1, borderRadius: 16, padding: 16 }}>
                        <T w="bold" size={14} color={palette.emerald800} style={{ flex: 1 }}>
                            Last result: {latest.score} / {latest.maxScore}
                        </T>
                        <ChevronRight size={18} color={palette.emerald800} />
                    </Tap>
                ) : null}
            </Body>
        </Page>
    );
}

/* ------------------------------------------------------------------ */
/* Runner                                                              */
/* ------------------------------------------------------------------ */

type Progress = { answers: Record<string, AnswerLetter>; marked: number[]; visited: number[]; timeSpent: Record<string, number>; lastQ: number; savedAt: number };
const localKey = (id: string) => `sadhyam-attempt-${id}`;

function ExamRunner({ test, initial, offset }: { test: TestDetail; initial: AttemptState; offset: number }) {
    "use no memo"; // timers, refs and autosave are managed by hand here
    useKeepAwake();
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const { user, profile } = useAuth();
    const token = useIdToken();
    const numbers = useMemo(() => test.questions.map((q) => q.n), [test.questions]);
    const letters = LETTERS.slice(0, test.options || 4);

    const [answers, setAnswers] = useState<Record<string, AnswerLetter>>(initial.answers);
    const [marked, setMarked] = useState<Set<number>>(() => new Set(initial.marked));
    const [visited, setVisited] = useState<Set<number>>(() => new Set([...initial.visited, initial.lastQ || numbers[0]]));
    const [current, setCurrent] = useState<number>(numbers.includes(initial.lastQ) ? initial.lastQ : numbers[0]);
    const timeSpent = useRef<Record<string, number>>({ ...initial.timeSpent });
    const [now, setNow] = useState(() => Date.now() + offset);
    const [qTime, setQTime] = useState(0);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [submitting, setSubmitting] = useState<"" | "manual" | "auto">("");
    const [saveState, setSaveState] = useState<"saved" | "saving" | "offline">("saved");
    const [submitError, setSubmitError] = useState("");
    const [view, setView] = useState<"paper" | "sheet">("sheet");
    const dirty = useRef(false);
    const submittedRef = useRef(false);
    const restored = useRef(false);

    // Restore the newer of: server copy or the copy saved on this phone.
    useEffect(() => {
        AsyncStorage.getItem(localKey(initial.id))
            .then((raw) => {
                const local = raw ? (JSON.parse(raw) as Progress) : null;
                if (local && local.savedAt > initial.savedAt) {
                    setAnswers(local.answers);
                    setMarked(new Set(local.marked));
                    setVisited(new Set(local.visited));
                    if (numbers.includes(local.lastQ)) setCurrent(local.lastQ);
                    timeSpent.current = { ...local.timeSpent };
                }
            })
            .catch(() => undefined)
            .finally(() => {
                restored.current = true;
            });
    }, [initial.id, initial.savedAt, numbers]);

    const remaining = Math.max(0, Math.floor((initial.deadline - now) / 1000));
    const sections = test.sections;
    const sectionOf = useCallback((n: number) => Math.max(0, sections.findIndex((s) => n >= s.from && n <= s.to)), [sections]);
    const sectionIdx = sectionOf(current);
    const sectionNumbers = sections.length ? numbers.filter((n) => n >= sections[sectionIdx].from && n <= sections[sectionIdx].to) : numbers;

    const statusOf = useCallback(
        (n: number): QStatus => {
            const a = Boolean(answers[String(n)]);
            const m = marked.has(n);
            if (a && m) return "answeredMarked";
            if (m) return "marked";
            if (a) return "answered";
            return visited.has(n) ? "notAnswered" : "notVisited";
        },
        [answers, marked, visited]
    );
    const countsFor = (list: number[]) => {
        const c: Record<QStatus, number> = { answered: 0, notAnswered: 0, notVisited: 0, marked: 0, answeredMarked: 0 };
        list.forEach((n) => c[statusOf(n)]++);
        return c;
    };

    const snapshot = useCallback((): Progress => ({ answers, marked: [...marked], visited: [...visited], timeSpent: { ...timeSpent.current }, lastQ: current, savedAt: Date.now() }), [answers, marked, visited, current]);
    const snapRef = useRef(snapshot);
    useEffect(() => {
        snapRef.current = snapshot;
    }, [snapshot]);

    // Every change → saved on the phone at once; to the server every few seconds.
    useEffect(() => {
        if (!restored.current) return;
        dirty.current = true;
        AsyncStorage.setItem(localKey(initial.id), JSON.stringify(snapshot())).catch(() => undefined);
    }, [answers, marked, visited, current, initial.id, snapshot]);

    const saveToServer = useCallback(async () => {
        if (submittedRef.current) return;
        const p = snapRef.current();
        dirty.current = false;
        setSaveState("saving");
        try {
            await apiFetch(`/api/attempts/${initial.id}`, { method: "PUT", json: p, auth: true });
            setSaveState("saved");
        } catch {
            dirty.current = true;
            setSaveState("offline");
        }
    }, [initial.id]);

    const currentRef = useRef(current);
    useEffect(() => {
        currentRef.current = current;
        setQTime(timeSpent.current[String(current)] ?? 0);
    }, [current]);

    useEffect(() => {
        let active = AppState.currentState === "active";
        const tick = setInterval(() => {
            setNow(Date.now() + offset);
            if (active) {
                const k = String(currentRef.current);
                timeSpent.current[k] = (timeSpent.current[k] ?? 0) + 1;
                setQTime(timeSpent.current[k]);
            }
        }, 1000);
        const save = setInterval(() => {
            if (dirty.current) void saveToServer();
        }, 8000);
        const sub = AppState.addEventListener("change", (s) => {
            active = s === "active";
            if (s !== "active") {
                AsyncStorage.setItem(localKey(initial.id), JSON.stringify(snapRef.current())).catch(() => undefined);
                void saveToServer();
            } else setNow(Date.now() + offset);
        });
        return () => {
            clearInterval(tick);
            clearInterval(save);
            sub.remove();
        };
    }, [offset, saveToServer, initial.id]);

    const submit = useCallback(
        async (auto: boolean) => {
            if (submittedRef.current) return;
            submittedRef.current = true;
            setConfirmOpen(false);
            setSubmitting(auto ? "auto" : "manual");
            setSubmitError("");
            const p = snapRef.current();
            for (let i = 0; i < 4; i++) {
                try {
                    await apiFetch(`/api/attempts/${initial.id}/submit`, { method: "POST", json: { ...p, auto }, auth: true });
                    await AsyncStorage.removeItem(localKey(initial.id)).catch(() => undefined);
                    router.replace(`/result/${initial.id}`);
                    return;
                } catch (e) {
                    if (i === 3) {
                        submittedRef.current = false;
                        setSubmitting("");
                        setSubmitError(e instanceof Error ? e.message : "Could not submit. Check your internet and try again.");
                    }
                    await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
                }
            }
        },
        [initial.id]
    );

    useEffect(() => {
        if (remaining <= 0 && !submittedRef.current) void submit(true);
    }, [remaining, submit]);

    // Android back button: confirm before leaving (answers stay saved, timer keeps running).
    useEffect(() => {
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            if (paletteOpen) {
                setPaletteOpen(false);
                return true;
            }
            Alert.alert("Leave the test?", "Your answers are saved. The timer keeps running — come back before it ends or the test is submitted automatically.", [
                { text: "Stay", style: "cancel" },
                {
                    text: "Leave",
                    style: "destructive",
                    onPress: () => {
                        void saveToServer();
                        goBack();
                    },
                },
            ]);
            return true;
        });
        return () => sub.remove();
    }, [paletteOpen, saveToServer]);

    const go = useCallback(
        (n: number) => {
            if (!numbers.includes(n)) return;
            setCurrent(n);
            setVisited((v) => (v.has(n) ? v : new Set(v).add(n)));
            setPaletteOpen(false);
        },
        [numbers]
    );
    const idx = numbers.indexOf(current);
    const next = () => go(numbers[Math.min(numbers.length - 1, idx + 1)]);
    const prev = () => go(numbers[Math.max(0, idx - 1)]);
    const choose = (n: number, l: AnswerLetter | null) =>
        setAnswers((a) => {
            const c = { ...a };
            if (l) c[String(n)] = l;
            else delete c[String(n)];
            return c;
        });
    const markNext = () => {
        setMarked((m) => new Set(m).add(current));
        next();
    };
    const saveNext = () => {
        setMarked((m) => {
            if (!m.has(current)) return m;
            const c = new Set(m);
            c.delete(current);
            return c;
        });
        next();
    };

    const qMap = useMemo(() => new Map(test.questions.map((q) => [q.n, q])), [test.questions]);
    const pageSize = (p: number) => ({ w: test.pages[p - 1]?.w ?? 1400, h: test.pages[p - 1]?.h ?? 1980 });
    const q = qMap.get(current);
    const sec = sections[sectionIdx];
    const marks = { c: sec?.marksCorrect ?? test.marksCorrect, w: sec?.marksWrong ?? test.marksWrong };
    const low = remaining <= 300;

    // Pulsing timer in the last 5 minutes.
    const pulse = useSharedValue(1);
    useEffect(() => {
        if (low) pulse.set(withRepeat(withSequence(withTiming(1.08, { duration: 400 }), withTiming(1, { duration: 400 })), -1));
    }, [low, pulse]);
    const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

    if (submitting) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: slate[50], padding: 30 }}>
                <ActivityIndicator size="large" color={theme.brand} />
                <T w="black" size={19} color={slate[900]} center style={{ marginTop: 18 }}>
                    {submitting === "auto" ? "Time is up! Submitting your test…" : "Submitting your test…"}
                </T>
                <T size={14} color={slate[500]} center style={{ marginTop: 6 }}>
                    Please keep the app open.
                </T>
            </View>
        );
    }

    const totals = countsFor(numbers);
    const qWidth = (W - 24) * zoom;

    return (
        <View style={{ flex: 1, backgroundColor: slate[100] }}>
            <StatusBar style="light" />
            {/* Top bar */}
            <View style={{ backgroundColor: theme.navy, paddingTop: insets.top + 6, paddingBottom: 10, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ flex: 1 }}>
                    <T w="black" size={15} color="#fff" numberOfLines={1}>
                        {test.title}
                    </T>
                    <T size={11} color={saveState === "offline" ? palette.amber400 : "rgba(255,255,255,0.6)"}>
                        {saveState === "saving" ? "Saving…" : saveState === "offline" ? "Offline — saved on this phone" : "All answers saved"}
                    </T>
                </View>
                <Animated.View style={[{ flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: low ? palette.red600 : "rgba(255,255,255,0.1)" }, pulseStyle]}>
                    <T w="black" size={16} color="#fff" style={{ fontVariant: ["tabular-nums"] }}>
                        {formatDuration(remaining)}
                    </T>
                </Animated.View>
                {test.mode === "crop" ? (
                    <Tap haptic onPress={() => setPaletteOpen(true)} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }}>
                        <LayoutGrid size={20} color="#fff" />
                    </Tap>
                ) : null}
            </View>

            {sections.length > 1 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: slate[200] }} contentContainerStyle={{ gap: 6, padding: 8 }}>
                    {sections.map((s, i) => {
                        const list = numbers.filter((n) => n >= s.from && n <= s.to);
                        const answered = list.filter((n) => answers[String(n)]).length;
                        const on = i === sectionIdx;
                        return (
                            <Tap key={s.name + s.from} haptic onPress={() => go(list[0])} style={{ flexDirection: "row", gap: 6, alignItems: "center", paddingHorizontal: 12, height: 34, borderRadius: 10, backgroundColor: on ? theme.brand : slate[100] }}>
                                <T w="bold" size={12} color={on ? "#fff" : slate[600]}>
                                    {s.name}
                                </T>
                                <T w="bold" size={10} color={on ? "#fff" : slate[500]}>
                                    {answered}/{list.length}
                                </T>
                            </Tap>
                        );
                    })}
                </ScrollView>
            ) : null}

            {test.mode === "pages" ? (
                <AnswerSheetMode
                    test={test}
                    token={token}
                    view={view}
                    setView={setView}
                    numbers={sectionNumbers}
                    answers={answers}
                    letters={letters}
                    choose={choose}
                    pageSize={pageSize}
                    onSubmit={() => setConfirmOpen(true)}
                />
            ) : (
                <>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: slate[200] }}>
                        <T w="black" size={16} color={slate[900]}>
                            Q {current}
                        </T>
                        <View style={{ backgroundColor: palette.emerald50, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}>
                            <T w="bold" size={12} color={palette.emerald700}>
                                +{marks.c}
                            </T>
                        </View>
                        {marks.w > 0 ? (
                            <View style={{ backgroundColor: palette.red50, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}>
                                <T w="bold" size={12} color={palette.red700}>
                                    −{marks.w}
                                </T>
                            </View>
                        ) : null}
                        <T size={12} color={slate[400]} style={{ flex: 1 }}>
                            ⏱ {formatDuration(qTime)}
                        </T>
                        <Tap onPress={() => setZoom((z) => Math.max(1, Math.round((z - 0.25) * 100) / 100))} style={{ padding: 6 }}>
                            <ZoomOut size={18} color={zoom > 1 ? slate[700] : slate[300]} />
                        </Tap>
                        <T w="bold" size={11} color={slate[500]}>
                            {Math.round(zoom * 100)}%
                        </T>
                        <Tap onPress={() => setZoom((z) => Math.min(2.5, Math.round((z + 0.25) * 100) / 100))} style={{ padding: 6 }}>
                            <ZoomIn size={18} color={slate[700]} />
                        </Tap>
                    </View>

                    <ScrollView key={current} style={{ flex: 1 }} contentContainerStyle={{ padding: 12, paddingBottom: 24 }}>
                        <Animated.View entering={SlideInRight.duration(260)}>
                            <ScrollView horizontal scrollEnabled={zoom > 1} showsHorizontalScrollIndicator={zoom > 1} contentContainerStyle={{ backgroundColor: "#fff", borderRadius: 14, padding: 0, overflow: "hidden" }}>
                                {q && token ? <QuestionImage testId={test.id} token={token} segments={q.segments} pageSize={pageSize} width={qWidth} /> : <Loader full={false} />}
                            </ScrollView>
                            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                                {letters.map((l) => {
                                    const sel = answers[String(current)] === l;
                                    return (
                                        <Tap
                                            key={l}
                                            haptic
                                            scaleTo={0.92}
                                            onPress={() => choose(current, sel ? null : l)}
                                            style={{ flex: 1, height: 58, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: sel ? theme.brand : slate[200], backgroundColor: sel ? theme.brand : "#fff", ...(sel ? shadow.md : shadow.sm), shadowColor: sel ? theme.brand : "#0f172a" }}
                                        >
                                            <T w="black" size={20} color={sel ? "#fff" : slate[700]}>
                                                {l}
                                            </T>
                                        </Tap>
                                    );
                                })}
                            </View>
                            <T size={12} color={slate[500]} center style={{ marginTop: 10 }}>
                                Tap an option to answer • tap again to clear
                            </T>
                        </Animated.View>
                    </ScrollView>

                    {/* Action bar */}
                    <View style={{ backgroundColor: "#fff", paddingHorizontal: 10, paddingTop: 10, paddingBottom: insets.bottom + 10, borderTopWidth: 1, borderTopColor: slate[200], gap: 8, ...shadow.lg }}>
                        {submitError ? <Notice tone="red">{submitError}</Notice> : null}
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <Btn size="sm" variant="soft" title="Mark & Next" fg={palette.violet600} style={{ flex: 1, backgroundColor: "#ede9fe" }} onPress={markNext} />
                            <Btn size="sm" variant="ghost" title="Clear" style={{ backgroundColor: slate[100] }} onPress={() => choose(current, null)} />
                            <Btn size="sm" variant="success" title={idx === numbers.length - 1 ? "Save" : "Save & Next"} style={{ flex: 1.2 }} onPress={saveNext} />
                        </View>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <Tap haptic onPress={prev} disabled={idx <= 0} style={{ width: 48, height: 44, borderRadius: 12, borderWidth: 1, borderColor: slate[200], alignItems: "center", justifyContent: "center", opacity: idx <= 0 ? 0.4 : 1 }}>
                                <ChevronLeft size={22} color={slate[700]} />
                            </Tap>
                            <Btn size="sm" variant="dark" title="Submit Test" style={{ flex: 1, height: 44 }} onPress={() => setConfirmOpen(true)} />
                            <Tap haptic onPress={next} disabled={idx >= numbers.length - 1} style={{ width: 48, height: 44, borderRadius: 12, borderWidth: 1, borderColor: slate[200], alignItems: "center", justifyContent: "center", opacity: idx >= numbers.length - 1 ? 0.4 : 1 }}>
                                <ChevronRight size={22} color={slate[700]} />
                            </Tap>
                        </View>
                    </View>
                </>
            )}

            {/* Palette */}
            <Modal visible={paletteOpen} transparent statusBarTranslucent onRequestClose={() => setPaletteOpen(false)}>
                <View style={{ flex: 1, flexDirection: "row" }}>
                    <Animated.View entering={FadeIn.duration(150)} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(2,20,36,0.5)" }}>
                        <Pressable style={{ flex: 1 }} onPress={() => setPaletteOpen(false)} />
                    </Animated.View>
                    <Animated.View entering={SlideInRight.springify().damping(20)} style={{ marginLeft: "auto", width: Math.min(360, W * 0.88), backgroundColor: "#fff", paddingTop: insets.top + 10, paddingBottom: insets.bottom + 12 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: slate[100] }}>
                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.brand50, alignItems: "center", justifyContent: "center" }}>
                                <T w="black" size={16} color={theme.brand}>
                                    {(profile?.name || user?.displayName || "S").charAt(0).toUpperCase()}
                                </T>
                            </View>
                            <View style={{ flex: 1 }}>
                                <T w="black" size={14} color={slate[900]} numberOfLines={1}>
                                    {profile?.name || user?.displayName || "Student"}
                                </T>
                                <T size={11} color={slate[500]}>
                                    {totals.answered + totals.answeredMarked} of {numbers.length} answered
                                </T>
                            </View>
                            <Tap onPress={() => setPaletteOpen(false)} style={{ padding: 6 }}>
                                <X size={22} color={slate[500]} />
                            </Tap>
                        </View>
                        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
                            <Legend counts={countsFor(sectionNumbers)} />
                            <T w="black" size={12} color={slate[500]} style={{ textTransform: "uppercase", letterSpacing: 0.8 }}>
                                {sec ? sec.name : "Questions"}
                            </T>
                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                                {sectionNumbers.map((n) => (
                                    <PaletteBtn key={n} n={n} status={statusOf(n)} current={n === current} onPress={() => go(n)} size={42} />
                                ))}
                            </View>
                        </ScrollView>
                        <View style={{ paddingHorizontal: 16 }}>
                            <Btn
                                full
                                variant="dark"
                                title="Submit Test"
                                onPress={() => {
                                    setPaletteOpen(false);
                                    setConfirmOpen(true);
                                }}
                            />
                        </View>
                    </Animated.View>
                </View>
            </Modal>

            {/* Confirm submit */}
            <Modal visible={confirmOpen} transparent statusBarTranslucent onRequestClose={() => setConfirmOpen(false)}>
                <View style={{ flex: 1, justifyContent: "flex-end" }}>
                    <Animated.View entering={FadeIn.duration(150)} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(2,20,36,0.55)" }}>
                        <Pressable style={{ flex: 1 }} onPress={() => setConfirmOpen(false)} />
                    </Animated.View>
                    <Animated.View entering={SlideInDown.springify().damping(18)} style={{ backgroundColor: "#fff", borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 22, paddingBottom: insets.bottom + 20, gap: 14 }}>
                        <T w="black" size={21} color={slate[900]}>
                            Submit your test?
                        </T>
                        <T size={14} color={slate[600]}>
                            Time left: <T w="black" size={14} color={slate[900]}>{formatDuration(remaining)}</T>. You can’t change answers after submitting.
                        </T>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                            {[
                                ["Answered", totals.answered + totals.answeredMarked, palette.emerald600, palette.emerald50],
                                ["Not answered", totals.notAnswered, palette.red600, palette.red50],
                                ["Not visited", totals.notVisited, slate[600], slate[100]],
                                ["Marked", totals.marked + totals.answeredMarked, palette.violet600, "#ede9fe"],
                            ].map(([k, v, fg, bg]) => (
                                <View key={String(k)} style={{ width: (W - 44 - 8) / 2, backgroundColor: String(bg), borderRadius: 14, padding: 12 }}>
                                    <T w="black" size={22} color={String(fg)}>
                                        {v}
                                    </T>
                                    <T w="semibold" size={12} color={String(fg)}>
                                        {k}
                                    </T>
                                </View>
                            ))}
                        </View>
                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <Btn variant="ghost" title="Keep going" style={{ flex: 1, backgroundColor: slate[100] }} onPress={() => setConfirmOpen(false)} />
                            <Btn title="Submit" style={{ flex: 1 }} onPress={() => void submit(false)} />
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

/* ------------------------------------------------------------------ */
/* Answer-sheet mode (scanned papers: full pages + OMR sheet)          */
/* ------------------------------------------------------------------ */

function AnswerSheetMode({
    test,
    token,
    view,
    setView,
    numbers,
    answers,
    letters,
    choose,
    pageSize,
    onSubmit,
}: {
    test: TestDetail;
    token: string;
    view: "paper" | "sheet";
    setView: (v: "paper" | "sheet") => void;
    numbers: number[];
    answers: Record<string, AnswerLetter>;
    letters: AnswerLetter[];
    choose: (n: number, l: AnswerLetter | null) => void;
    pageSize: (p: number) => { w: number; h: number };
    onSubmit: () => void;
}) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const answered = numbers.filter((n) => answers[String(n)]).length;
    return (
        <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", backgroundColor: "#fff", padding: 8, gap: 8, borderBottomWidth: 1, borderBottomColor: slate[200] }}>
                {(["paper", "sheet"] as const).map((v) => (
                    <Tap key={v} haptic onPress={() => setView(v)} style={{ flex: 1, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: view === v ? theme.brand : slate[100] }}>
                        <T w="bold" size={13} color={view === v ? "#fff" : slate[600]}>
                            {v === "paper" ? "Question Paper" : `Answer Sheet (${answered}/${numbers.length})`}
                        </T>
                    </Tap>
                ))}
            </View>
            {view === "paper" ? (
                <ScrollView contentContainerStyle={{ padding: 8, gap: 8 }}>
                    {test.pages.map((p, i) => (p.has && token ? <PageImage key={i} testId={test.id} token={token} page={i + 1} size={pageSize(i + 1)} width={W - 16} /> : null))}
                </ScrollView>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 12, gap: 6 }}>
                    {numbers.map((n) => (
                        <View key={n} style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }}>
                            <T w="black" size={14} color={slate[800]} style={{ width: 36 }}>
                                {n}.
                            </T>
                            {letters.map((l) => {
                                const sel = answers[String(n)] === l;
                                return (
                                    <Tap key={l} haptic onPress={() => choose(n, sel ? null : l)} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: sel ? theme.brand : slate[300], backgroundColor: sel ? theme.brand : "#fff", alignItems: "center", justifyContent: "center" }}>
                                        <T w="black" size={14} color={sel ? "#fff" : slate[600]}>
                                            {l}
                                        </T>
                                    </Tap>
                                );
                            })}
                        </View>
                    ))}
                </ScrollView>
            )}
            <View style={{ backgroundColor: "#fff", padding: 10, paddingBottom: insets.bottom + 10, borderTopWidth: 1, borderTopColor: slate[200] }}>
                <Btn full variant="dark" title="Submit Test" onPress={onSubmit} />
            </View>
        </View>
    );
}
