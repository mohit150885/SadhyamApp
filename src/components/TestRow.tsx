import { View } from "react-native";
import { router } from "expo-router";
import { BarChart3, CalendarClock, CheckCircle2, Clock, FileText, Lock, PlayCircle, RotateCcw, Timer } from "lucide-react-native";
import type { TestListItem } from "@/lib/testClient";
import { palette, slate, useTheme } from "@/lib/theme";
import { formatDate } from "@/lib/utils";
import { T, Tap } from "./ui";

function Action({ label, icon, bg, fg = "#fff", onPress, border }: { label: string; icon?: React.ReactNode; bg: string; fg?: string; onPress?: () => void; border?: string }) {
    const body = (
        <View style={{ height: 38, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, borderRadius: 10, backgroundColor: bg, borderWidth: border ? 2 : 0, borderColor: border }}>
            {icon}
            <T w="bold" size={13} color={fg}>
                {label}
            </T>
        </View>
    );
    return onPress ? (
        <Tap haptic onPress={onPress}>
            {body}
        </Tap>
    ) : (
        body
    );
}

/** One test in a series: details, last score and the right action (start / resume / result / locked). */
export function TestRow({ t }: { t: TestListItem }) {
    const theme = useTheme();
    const inProgress = t.attempts.find((a) => a.status === "in-progress");
    const done = t.attempts.filter((a) => a.status === "submitted");
    const latest = done[0];
    const canRetake = t.status === "open" && (!t.maxAttempts || t.attempts.length < t.maxAttempts);
    const open = () => router.push(`/test/${encodeURIComponent(t.id)}`);

    let action: React.ReactNode;
    if (!t.access) action = <Action label="Locked" icon={<Lock size={14} color={slate[500]} />} bg={slate[100]} fg={slate[500]} />;
    else if (inProgress) action = <Action label="Resume" icon={<PlayCircle size={16} color="#fff" />} bg={palette.amber500} onPress={open} />;
    else if (t.status === "upcoming") action = <Action label={`Opens ${formatDate(t.availableFrom, true)}`} icon={<CalendarClock size={14} color={palette.blue700} />} bg={palette.blue50} fg={palette.blue700} />;
    else if (latest)
        action = (
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                <Action label="Result" icon={<BarChart3 size={16} color="#fff" />} bg={palette.emerald600} onPress={() => router.push(`/result/${encodeURIComponent(latest.id)}`)} />
                {canRetake ? <Action label="Reattempt" icon={<RotateCcw size={15} color={slate[700]} />} bg="#fff" fg={slate[700]} border={slate[200]} onPress={open} /> : null}
            </View>
        );
    else if (t.status === "closed") action = <Action label="Closed" bg={slate[100]} fg={slate[500]} />;
    else action = <Action label={t.free ? "Attempt Free" : "Start Test"} icon={<PlayCircle size={16} color="#fff" />} bg={theme.brand} onPress={open} />;

    return (
        <View style={{ padding: 14, gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: latest ? palette.emerald50 : t.access ? theme.brand50 : slate[100] }}>
                    {latest ? <CheckCircle2 size={22} color={palette.emerald600} /> : <FileText size={22} color={t.access ? theme.brand : slate[400]} />}
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <T w="extrabold" size={15} color={slate[900]} lh={1.3}>
                            {t.title}
                        </T>
                        {t.free ? (
                            <View style={{ backgroundColor: palette.blue50, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1 }}>
                                <T w="extrabold" size={10} color={palette.blue700}>
                                    FREE
                                </T>
                            </View>
                        ) : null}
                    </View>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 10, rowGap: 2, marginTop: 4 }}>
                        <T size={12} color={slate[500]}>
                            {t.questionCount} Qs
                        </T>
                        <T size={12} color={slate[500]}>
                            {t.totalMarks} Marks
                        </T>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                            <Timer size={12} color={slate[500]} />
                            <T size={12} color={slate[500]}>
                                {t.durationMin} min
                            </T>
                        </View>
                        {t.marksWrong > 0 ? (
                            <T size={12} color={slate[500]}>
                                −{t.marksWrong} negative
                            </T>
                        ) : null}
                        {t.availableTo && t.status !== "closed" ? (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                                <Clock size={12} color={slate[500]} />
                                <T size={12} color={slate[500]}>
                                    Closes {formatDate(t.availableTo, true)}
                                </T>
                            </View>
                        ) : null}
                    </View>
                    {latest && latest.score !== null ? (
                        <T w="bold" size={12} color={palette.emerald700} style={{ marginTop: 4 }}>
                            Last score: {latest.score} / {latest.maxScore}
                            {done.length > 1 ? ` • ${done.length} attempts` : ""}
                        </T>
                    ) : null}
                </View>
            </View>
            <View style={{ paddingLeft: 58 }}>{action}</View>
        </View>
    );
}
