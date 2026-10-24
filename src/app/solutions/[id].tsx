import { useMemo, useState } from "react";
import { Dimensions, Modal, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, FileDown, FileText, Target, X } from "lucide-react-native";
import { useAttempt, qStates, QCOLOR, type QState } from "@/hooks/useAttempt";
import { formatDuration, useIdToken } from "@/lib/testClient";
import { LETTERS, type AnswerLetter } from "@/lib/testTypes";
import { useAuth } from "@/providers/AuthProvider";
import { palette, slate, useTheme } from "@/lib/theme";
import { Header, Page } from "@/components/Screen";
import { RequireLogin } from "@/components/RequireLogin";
import { PageImage, QuestionImage } from "@/components/QuestionImage";
import { PdfViewer } from "@/components/PdfViewer";
import { Btn, EmptyState, Loader, T, Tap } from "@/components/ui";

const { width: W } = Dimensions.get("window");
type Filter = "all" | "correct" | "wrong" | "skipped" | "marked";
const STATE_LABEL: Record<QState, string> = { correct: "Correct", wrong: "Incorrect", skipped: "Unattempted", bonus: "Bonus", nokey: "Not scored" };

export default function SolutionsScreen() {
    const { id, q } = useLocalSearchParams<{ id: string; q?: string }>();
    return (
        <Page>
            <RequireLogin withBack>
                <SolutionsBody id={id} startQ={q ? Number(q) : null} />
            </RequireLogin>
        </Page>
    );
}

function SolutionsBody({ id, startQ }: { id: string; startQ: number | null }) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const { user } = useAuth();
    const token = useIdToken();
    const { data, error } = useAttempt(id);
    const [filter, setFilter] = useState<Filter>("all");
    const [current, setCurrent] = useState<number | null>(startQ);
    const [paper, setPaper] = useState(false);
    const [pdf, setPdf] = useState(false);
    const states = useMemo(() => (data ? qStates(data) : {}), [data]);
    const solutions = useMemo(() => data?.solutions ?? [], [data]);
    const marked = useMemo(() => new Set(data?.attempt.marked ?? []), [data]);

    if (error) return <EmptyState title="Solutions not available" description={error} />;
    if (!data) return <Loader label="Loading solutions…" />;
    if (!data.solutionsAvailable || !data.solutions)
        return (
            <>
                <Header title="Solutions" />
                <EmptyState title="Solutions are not available" description="Your teacher has not opened the solutions for this test yet." action={<Btn title="Back to result" onPress={() => router.replace(`/result/${id}`)} />} />
            </>
        );

    const list = solutions.filter((x) => {
        if (filter === "all") return true;
        if (filter === "marked") return marked.has(x.n);
        if (filter === "correct") return states[x.n] === "correct" || states[x.n] === "bonus";
        return states[x.n] === filter;
    });
    const n = current && list.some((x) => x.n === current) ? current : list[0]?.n;
    const q = solutions.find((x) => x.n === n);
    const idx = list.findIndex((x) => x.n === n);
    const letters = LETTERS.slice(0, data.test.options || 4);
    const given = q ? (data.attempt.answers[String(q.n)] as AnswerLetter | undefined) : undefined;
    const st: QState = q ? (states[q.n] ?? "skipped") : "skipped";
    const pageSize = (p: number) => ({ w: data.pages?.[p - 1]?.w ?? 1400, h: data.pages?.[p - 1]?.h ?? 1980 });
    const time = q ? (data.attempt.timeSpent[String(q.n)] ?? 0) : 0;
    const counts: Record<Filter, number> = {
        all: solutions.length,
        correct: solutions.filter((x) => states[x.n] === "correct" || states[x.n] === "bonus").length,
        wrong: solutions.filter((x) => states[x.n] === "wrong").length,
        skipped: solutions.filter((x) => states[x.n] === "skipped").length,
        marked: solutions.filter((x) => marked.has(x.n)).length,
    };

    return (
        <View style={{ flex: 1 }}>
            <Header
                title="Solutions"
                subtitle={data.test.title}
                right={
                    data.test.hasSolutionPdf ? (
                        <Tap haptic onPress={() => setPdf(true)} style={{ flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 2, borderColor: theme.brand, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}>
                            <FileDown size={15} color={theme.brand} />
                            <T w="bold" size={12} color={theme.brand}>
                                PDF
                            </T>
                        </Tap>
                    ) : null
                }
            />
            <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, padding: 12 }} style={{ backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: slate[100] }}>
                    {(
                        [
                            ["all", "All"],
                            ["correct", "Correct"],
                            ["wrong", "Incorrect"],
                            ["skipped", "Unattempted"],
                            ["marked", "Marked"],
                        ] as const
                    ).map(([k, l]) => (
                        <Tap
                            key={k}
                            haptic
                            onPress={() => {
                                setFilter(k);
                                setCurrent(null);
                            }}
                            style={{ paddingHorizontal: 14, height: 34, justifyContent: "center", borderRadius: 17, backgroundColor: filter === k ? theme.navy : slate[100] }}
                        >
                            <T w="bold" size={12} color={filter === k ? "#fff" : slate[600]}>
                                {l} ({counts[k]})
                            </T>
                        </Tap>
                    ))}
                </ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 12, paddingVertical: 8 }} style={{ backgroundColor: slate[50] }}>
                    {list.map((x) => {
                        const s = states[x.n] ?? "skipped";
                        const on = x.n === n;
                        return (
                            <Tap key={x.n} onPress={() => setCurrent(x.n)} style={{ width: 36, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: QCOLOR[s].bg, borderWidth: on ? 2 : 0, borderColor: theme.navy }}>
                                <T w="bold" size={12} color={QCOLOR[s].fg}>
                                    {x.n}
                                </T>
                            </Tap>
                        );
                    })}
                </ScrollView>
            </View>

            {!q ? (
                <EmptyState title="No questions in this filter" />
            ) : (
                <>
                    <ScrollView key={q.n} contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 30 }}>
                        <Animated.View entering={FadeIn.duration(250)} style={{ gap: 14 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <T w="black" size={17} color={slate[900]}>
                                    Question {q.n}
                                </T>
                                <View style={{ backgroundColor: QCOLOR[st].bg, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 3 }}>
                                    <T w="bold" size={11} color={QCOLOR[st].fg}>
                                        {STATE_LABEL[st]}
                                    </T>
                                </View>
                                <View style={{ flex: 1 }} />
                                <Clock size={13} color={slate[500]} />
                                <T size={12} color={slate[500]}>
                                    {formatDuration(time)}
                                </T>
                            </View>
                            {data.test.mode === "crop" && q.segments.length && token ? (
                                <View style={{ backgroundColor: "#fff", borderRadius: 14, overflow: "hidden" }}>
                                    <QuestionImage testId={data.attempt.testId} token={token} segments={q.segments} pageSize={pageSize} width={W - 28} />
                                </View>
                            ) : (
                                <Tap onPress={() => setPaper(true)} style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fff", borderRadius: 14, padding: 14 }}>
                                    <FileText size={18} color={theme.brand} />
                                    <T w="semibold" size={14} color={slate[700]} style={{ flex: 1 }}>
                                        See question {q.n} in the question paper
                                    </T>
                                    <ChevronRight size={18} color={slate[400]} />
                                </Tap>
                            )}
                            <View style={{ gap: 8 }}>
                                {letters.map((l) => {
                                    const isKey = q.answer === l;
                                    const isMine = given === l;
                                    return (
                                        <View key={l} style={{ flexDirection: "row", alignItems: "center", gap: 12, height: 54, borderRadius: 14, borderWidth: 2, paddingHorizontal: 12, borderColor: isKey ? palette.emerald500 : isMine ? "#f87171" : slate[200], backgroundColor: isKey ? palette.emerald50 : isMine ? palette.red50 : "#fff" }}>
                                            <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: isKey ? palette.emerald500 : isMine ? palette.red500 : "transparent", borderWidth: isKey || isMine ? 0 : 2, borderColor: slate[300] }}>
                                                <T w="black" size={14} color={isKey || isMine ? "#fff" : slate[500]}>
                                                    {l}
                                                </T>
                                            </View>
                                            <T w="bold" size={14} color={slate[700]} style={{ flex: 1 }}>
                                                Option ({l.toLowerCase()})
                                            </T>
                                            {isKey ? (
                                                <T w="black" size={12} color={palette.emerald700}>
                                                    Correct answer
                                                </T>
                                            ) : null}
                                            {isMine && !isKey ? (
                                                <T w="black" size={12} color={palette.red600}>
                                                    Your answer
                                                </T>
                                            ) : null}
                                            {isMine && isKey ? <CheckCircle2 size={18} color={palette.emerald600} /> : null}
                                        </View>
                                    );
                                })}
                            </View>
                            {!q.answer && !q.bonus ? (
                                <T w="semibold" size={12} color={slate[500]}>
                                    This question was not scored.
                                </T>
                            ) : null}
                            {q.bonus ? (
                                <T w="semibold" size={12} color={palette.blue700}>
                                    Bonus question — full marks to everyone who attempted it.
                                </T>
                            ) : null}
                            {q.explanation ? (
                                <View style={{ borderRadius: 14, borderWidth: 1, borderColor: palette.amber200, backgroundColor: "#fffbeb", padding: 14 }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                        <Target size={16} color="#78350f" />
                                        <T w="black" size={14} color="#78350f">
                                            Explanation
                                        </T>
                                    </View>
                                    <T size={14} color={slate[700]} lh={1.6}>
                                        {q.explanation}
                                    </T>
                                </View>
                            ) : null}
                        </Animated.View>
                    </ScrollView>
                    <View style={{ flexDirection: "row", gap: 10, padding: 12, paddingBottom: insets.bottom + 12, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: slate[200] }}>
                        <Btn variant="ghost" style={{ flex: 1, backgroundColor: slate[100] }} title="Previous" icon={<ChevronLeft size={16} color={slate[600]} />} disabled={idx <= 0} onPress={() => setCurrent(list[idx - 1].n)} />
                        <Btn variant="dark" style={{ flex: 1 }} title="Next" iconRight={<ChevronRight size={16} color="#fff" />} disabled={idx >= list.length - 1} onPress={() => setCurrent(list[idx + 1].n)} />
                    </View>
                </>
            )}

            <Modal visible={paper} animationType="slide" onRequestClose={() => setPaper(false)}>
                <View style={{ flex: 1, backgroundColor: slate[200] }}>
                    <Header title="Question paper" right={<Tap onPress={() => setPaper(false)} style={{ padding: 6 }}><X size={22} color={slate[700]} /></Tap>} back={false} />
                    <ScrollView contentContainerStyle={{ padding: 8, gap: 8 }}>
                        {(data.pages ?? []).map((p, i) => (p.has && token ? <PageImage key={i} testId={data.attempt.testId} token={token} page={i + 1} size={pageSize(i + 1)} width={W - 16} /> : null))}
                    </ScrollView>
                </View>
            </Modal>

            <Modal visible={pdf} animationType="slide" onRequestClose={() => setPdf(false)}>
                <View style={{ flex: 1 }}>
                    <Header title="Detailed solutions" back={false} right={<Tap onPress={() => setPdf(false)} style={{ padding: 6 }}><X size={22} color={slate[700]} /></Tap>} />
                    {pdf ? <PdfViewer endpoint={`/api/attempts/${encodeURIComponent(id)}/solution-file`} watermark={user?.email || ""} /> : null}
                </View>
            </Modal>
        </View>
    );
}
