import { useEffect, useState } from "react";
import { Dimensions, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { Easing, FadeInDown, useAnimatedProps, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Award, BookOpenCheck, CheckCircle2, Clock, Crosshair, MinusCircle, RotateCcw, Trophy, Users, XCircle } from "lucide-react-native";
import { useAttempt, qStates, QCOLOR } from "@/hooks/useAttempt";
import { humanDuration } from "@/lib/testClient";
import { formatDate } from "@/lib/utils";
import { palette, shadow, slate, useTheme } from "@/lib/theme";
import { goBack } from "@/components/Screen";
import { RequireLogin } from "@/components/RequireLogin";
import { Btn, Card, EmptyState, Loader, T, Tap } from "@/components/ui";

const { width: W } = Dimensions.get("window");
const ACircle = Animated.createAnimatedComponent(Circle);

export default function ResultScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return (
        <RequireLogin withBack>
            <ResultBody id={id} />
        </RequireLogin>
    );
}

function ScoreRing({ pct, score, max, color }: { pct: number; score: number; max: number; color: string }) {
    const r = 64;
    const c = 2 * Math.PI * r;
    const p = useSharedValue(0);
    const [shown, setShown] = useState(0);
    useEffect(() => {
        p.set(withDelay(300, withTiming(Math.min(100, Math.max(0, pct)) / 100, { duration: 1400, easing: Easing.out(Easing.cubic) })));
        const start = Date.now();
        const t = setInterval(() => {
            const f = Math.min(1, (Date.now() - start - 300) / 1400);
            if (f > 0) setShown(Math.round(score * (1 - Math.pow(1 - f, 3)) * 100) / 100);
            if (f >= 1) clearInterval(t);
        }, 30);
        return () => clearInterval(t);
    }, [pct, score, p]);
    const props = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - p.value) }));
    return (
        <View style={{ width: 170, height: 170, alignItems: "center", justifyContent: "center" }}>
            <Svg width={170} height={170} viewBox="0 0 160 160" style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
                <Circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={14} />
                <ACircle cx="80" cy="80" r={r} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" strokeDasharray={c} animatedProps={props} />
            </Svg>
            <T w="black" size={36} color="#fff">
                {shown}
            </T>
            <T size={12} color="rgba(255,255,255,0.7)">
                out of {max}
            </T>
        </View>
    );
}

function ResultBody({ id }: { id: string }) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const { data, error, reload } = useAttempt(id);
    if (error) return <EmptyState title="Result not available" description={error} action={<Btn variant="outline" title="Try again" onPress={reload} />} />;
    if (!data) return <Loader label="Loading your result…" />;
    const { attempt, test, stats } = data;
    if (attempt.status !== "submitted" || !attempt.result)
        return <EmptyState title="This test is still in progress" description="Finish and submit the test to see your result." action={<Btn title="Resume Test" onPress={() => router.replace(`/test/${attempt.testId}`)} />} />;
    const r = attempt.result;
    const pct = r.maxScore ? Math.max(0, (r.score / r.maxScore) * 100) : 0;
    const total = test.questionCount;
    const states = qStates(data);
    const nums = data.solutions?.map((q) => q.n) ?? Array.from({ length: total }, (_, i) => i + 1);
    const canRetake = !test.maxAttempts || attempt.attemptNo < test.maxAttempts;

    return (
        <View style={{ flex: 1, backgroundColor: slate[50] }}>
            <StatusBar style="light" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
                <LinearGradient colors={[theme.navy, theme.navy800]} style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 26 }}>
                    <Tap onPress={() => (router.canGoBack() ? goBack() : router.replace(`/series/${attempt.seriesId}`))} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }}>
                        <ArrowLeft size={20} color="#fff" />
                    </Tap>
                    <T w="black" size={22} color="#fff" style={{ marginTop: 12 }}>
                        {test.title}
                    </T>
                    <T size={12} color="rgba(255,255,255,0.7)" style={{ marginTop: 3 }}>
                        Attempt {attempt.attemptNo} • Submitted {formatDate(attempt.submittedAt, true)}
                        {attempt.autoSubmitted ? " (auto-submitted)" : ""}
                    </T>
                    <View style={{ alignItems: "center", marginTop: 18 }}>
                        <ScoreRing pct={pct} score={r.score} max={r.maxScore} color={theme.brand} />
                    </View>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
                        {[
                            [<Trophy key="t" size={15} color="rgba(255,255,255,0.7)" />, "Rank", stats ? `${stats.rank}` : "—", stats ? `of ${stats.candidates}` : ""],
                            [<Users key="u" size={15} color="rgba(255,255,255,0.7)" />, "Percentile", stats ? `${stats.percentile}` : "—", ""],
                            [<Crosshair key="c" size={15} color="rgba(255,255,255,0.7)" />, "Accuracy", `${r.accuracy}%`, ""],
                            [<Clock key="k" size={15} color="rgba(255,255,255,0.7)" />, "Time", humanDuration(r.timeTakenSec), `of ${test.durationMin} min`],
                        ].map(([icon, label, value, sub], i) => (
                            <Animated.View key={String(label)} entering={FadeInDown.delay(500 + i * 90).duration(450)} style={{ width: (W - 32 - 10) / 2, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.05)", padding: 12 }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                    {icon}
                                    <T w="semibold" size={12} color="rgba(255,255,255,0.7)">
                                        {label}
                                    </T>
                                </View>
                                <T w="black" size={21} color="#fff" style={{ marginTop: 4 }}>
                                    {value}{" "}
                                    <T w="semibold" size={11} color="rgba(255,255,255,0.6)">
                                        {sub}
                                    </T>
                                </T>
                            </Animated.View>
                        ))}
                    </View>
                </LinearGradient>

                <View style={{ padding: 16, gap: 14 }}>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                        {data.solutionsAvailable ? (
                            <Btn style={{ flex: 1 }} title="View Solutions" icon={<BookOpenCheck size={18} color="#fff" />} onPress={() => router.push(`/solutions/${attempt.id}`)} />
                        ) : (
                            <View style={{ flex: 1, backgroundColor: slate[100], borderRadius: 12, padding: 12, justifyContent: "center" }}>
                                <T w="semibold" size={12} color={slate[600]}>
                                    {test.solutionsVisibility === "after-end" ? `Solutions open after the test closes${test.availableTo ? ` (${formatDate(test.availableTo, true)})` : ""}` : "Solutions are not shared for this test"}
                                </T>
                            </View>
                        )}
                        {canRetake ? <Btn variant="outline" title="Reattempt" icon={<RotateCcw size={16} color={theme.brand} />} onPress={() => router.replace(`/test/${attempt.testId}`)} /> : null}
                    </View>

                    <Card>
                        <T w="black" size={16} color={slate[900]} style={{ marginBottom: 12 }}>
                            Score breakdown
                        </T>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            {[
                                [palette.emerald50, palette.emerald700, <CheckCircle2 key="a" size={18} color={palette.emerald700} />, "Correct", r.correct, `+${r.positive} marks`],
                                [palette.red50, palette.red700, <XCircle key="b" size={18} color={palette.red700} />, "Wrong", r.wrong, `−${r.negative} marks`],
                                [slate[50], slate[600], <MinusCircle key="c" size={18} color={slate[600]} />, "Skipped", r.skipped, "0 marks"],
                            ].map(([bg, fg, icon, label, v, sub]) => (
                                <View key={String(label)} style={{ flex: 1, backgroundColor: String(bg), borderRadius: 14, padding: 10 }}>
                                    {icon}
                                    <T w="black" size={22} color={String(fg)} style={{ marginTop: 4 }}>
                                        {String(v)}
                                    </T>
                                    <T w="bold" size={11} color={String(fg)}>
                                        {String(label)}
                                    </T>
                                    <T size={10} color={String(fg)} style={{ opacity: 0.8 }}>
                                        {String(sub)}
                                    </T>
                                </View>
                            ))}
                        </View>
                        <View style={{ flexDirection: "row", height: 12, borderRadius: 6, overflow: "hidden", backgroundColor: slate[100], marginTop: 14 }}>
                            <View style={{ width: `${(r.correct / Math.max(1, total)) * 100}%`, backgroundColor: palette.emerald500 }} />
                            <View style={{ width: `${(r.wrong / Math.max(1, total)) * 100}%`, backgroundColor: palette.red500 }} />
                        </View>
                        <T size={12} color={slate[500]} style={{ marginTop: 6 }}>
                            Attempted {r.attempted} of {total} questions ({Math.round((r.attempted / Math.max(1, total)) * 100)}%)
                        </T>
                    </Card>

                    <Card>
                        <T w="black" size={16} color={slate[900]} style={{ marginBottom: 12 }}>
                            You vs others
                        </T>
                        {stats ? (
                            <View style={{ gap: 12 }}>
                                {(
                                    [
                                        ["You", r.score, theme.brand],
                                        ["Average", stats.average, slate[400]],
                                        ["Topper", stats.topper, palette.emerald500],
                                    ] as [string, number, string][]
                                ).map(([label, value, color]) => (
                                    <View key={label}>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                                            <T w="bold" size={12} color={slate[700]}>
                                                {label}
                                            </T>
                                            <T w="bold" size={12} color={slate[700]}>
                                                {value} / {r.maxScore}
                                            </T>
                                        </View>
                                        <View style={{ height: 10, borderRadius: 5, backgroundColor: slate[100], overflow: "hidden" }}>
                                            <View style={{ height: "100%", borderRadius: 5, backgroundColor: color, width: `${Math.max(0, Math.min(100, (value / Math.max(1, r.maxScore)) * 100))}%` }} />
                                        </View>
                                    </View>
                                ))}
                                <T size={11} color={slate[500]}>
                                    Based on {stats.candidates} student{stats.candidates > 1 ? "s" : ""}’ first attempts.
                                </T>
                            </View>
                        ) : (
                            <T size={13} color={slate[500]}>
                                Comparison will appear as more students attempt.
                            </T>
                        )}
                    </Card>

                    {r.sections.length > 0 ? (
                        <Card padded={false}>
                            <T w="black" size={16} color={slate[900]} style={{ padding: 16, paddingBottom: 8 }}>
                                Section-wise analysis
                            </T>
                            {r.sections.map((s) => (
                                <View key={s.name} style={{ paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: slate[100] }}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                        <T w="bold" size={14} color={slate[900]}>
                                            {s.name}
                                        </T>
                                        <T w="black" size={14} color={theme.navy}>
                                            {s.score} / {s.maxScore}
                                        </T>
                                    </View>
                                    <T size={12} color={slate[500]} style={{ marginTop: 2 }}>
                                        ✓ {s.correct} • ✗ {s.wrong} • – {s.skipped} • {s.attempted ? Math.round((s.correct / s.attempted) * 100) : 0}% accuracy • {humanDuration(s.timeSec)}
                                    </T>
                                </View>
                            ))}
                        </Card>
                    ) : null}

                    <Card>
                        <T w="black" size={16} color={slate[900]} style={{ marginBottom: 12 }}>
                            Question-wise status
                        </T>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                            {nums.map((n) => {
                                const s = states[n] ?? "skipped";
                                return (
                                    <Tap key={n} disabled={!data.solutionsAvailable} onPress={() => router.push(`/solutions/${attempt.id}?q=${n}`)} style={{ width: 38, height: 34, borderRadius: 8, backgroundColor: QCOLOR[s].bg, alignItems: "center", justifyContent: "center" }}>
                                        <T w="bold" size={12} color={QCOLOR[s].fg}>
                                            {n}
                                        </T>
                                    </Tap>
                                );
                            })}
                        </View>
                    </Card>

                    {stats && stats.leaderboard.length ? (
                        <Card style={{ gap: 8 }}>
                            <T w="black" size={16} color={slate[900]} style={{ marginBottom: 4 }}>
                                Leaderboard
                            </T>
                            {stats.leaderboard.map((l, i) => (
                                <Animated.View key={l.rank} entering={FadeInDown.delay(i * 50).duration(350)} style={{ flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: l.me ? theme.brand50 : slate[50], borderWidth: l.me ? 1 : 0, borderColor: theme.brand200 }}>
                                    <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: l.rank === 1 ? palette.amber400 : l.rank <= 3 ? slate[300] : "#fff", ...shadow.sm }}>
                                        {l.rank === 1 ? (
                                            <Award size={15} color="#fff" />
                                        ) : (
                                            <T w="black" size={12} color={slate[700]}>
                                                {l.rank}
                                            </T>
                                        )}
                                    </View>
                                    <T w="bold" size={14} color={slate[800]} style={{ flex: 1 }} numberOfLines={1}>
                                        {l.me ? "You" : l.name}
                                    </T>
                                    <T w="black" size={14} color={theme.navy}>
                                        {l.score}
                                    </T>
                                </Animated.View>
                            ))}
                        </Card>
                    ) : null}
                </View>
            </ScrollView>
        </View>
    );
}
