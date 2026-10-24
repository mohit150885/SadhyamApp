import { useState } from "react";
import { Linking, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { BookOpen, CheckCircle2, CirclePlay, Clock, ExternalLink, FileText, PlayCircle } from "lucide-react-native";
import { useLibrary, type LibItem } from "@/hooks/useLibrary";
import { useAuth } from "@/providers/AuthProvider";
import { usePurchase } from "@/providers/PurchaseProvider";
import { RequireLogin } from "@/components/RequireLogin";
import { Body } from "@/components/Screen";
import { Btn, EmptyState, Loader, Notice, SmartImage, T, Tap } from "@/components/ui";
import type { ProductKind } from "@/lib/models";
import { palette, shadow, slate, useTheme } from "@/lib/theme";
import { formatDate } from "@/lib/utils";

const TABS: { key: ProductKind; label: string; icon: typeof BookOpen; empty: string; explore: string }[] = [
    { key: "course", label: "Courses", icon: CirclePlay, empty: "Courses you enrol in appear here right after payment.", explore: "Explore Courses" },
    { key: "test", label: "Test Series", icon: FileText, empty: "Test series you buy appear here. Open one to attempt its tests.", explore: "Explore Test Series" },
    { key: "material", label: "Material", icon: BookOpen, empty: "Notes and books you buy appear here. Read them right in the app.", explore: "Explore Study Material" },
];

export default function LibraryScreen() {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const { user } = useAuth();
    return (
        <View style={{ flex: 1, backgroundColor: slate[50] }}>
            <StatusBar style="light" />
            <View style={{ backgroundColor: theme.navy, paddingTop: insets.top + 14, paddingBottom: 18, paddingHorizontal: 20 }}>
                <T w="black" size={26} color="#fff" style={{ letterSpacing: -0.5 }}>
                    My <T w="black" size={26} color={theme.brand}>Learning</T>
                </T>
                <T size={13} color="rgba(255,255,255,0.7)" style={{ marginTop: 4 }}>
                    {user ? "Everything you've enrolled in, in one place." : "Your courses, tests and notes live here."}
                </T>
            </View>
            <RequireLogin title="Your library is waiting" text="Log in to see the courses, test series and study material on your account.">
                <LibraryBody />
            </RequireLogin>
        </View>
    );
}

function LibraryBody() {
    const theme = useTheme();
    const params = useLocalSearchParams<{ tab?: string }>();
    const [tab, setTab] = useState<ProductKind>((params.tab as ProductKind) || "course");
    const [seenParam, setSeenParam] = useState(params.tab);
    if (params.tab !== seenParam) {
        setSeenParam(params.tab);
        if (params.tab) setTab(params.tab as ProductKind);
    }
    const { data, loading, error, refresh, refreshing } = useLibrary();
    const { payOrder } = usePurchase();
    const meta = TABS.find((t) => t.key === tab)!;
    const items = (data?.items ?? []).filter((i) => i.kind === tab);
    const pending = (data?.pending ?? []).filter((i) => i.kind === tab);

    return (
        <>
            <View style={{ flexDirection: "row", gap: 8, padding: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: slate[100] }}>
                {TABS.map((t) => {
                    const on = t.key === tab;
                    const n = (data?.items ?? []).filter((i) => i.kind === t.key).length;
                    const Icon = t.icon;
                    return (
                        <Tap key={t.key} haptic onPress={() => setTab(t.key)} style={{ flex: 1, height: 42, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: on ? theme.brand : slate[100] }}>
                            <Icon size={15} color={on ? "#fff" : slate[500]} />
                            <T w="bold" size={12} color={on ? "#fff" : slate[600]}>
                                {t.label}
                                {n ? ` (${n})` : ""}
                            </T>
                        </Tap>
                    );
                })}
            </View>
            <Body onRefresh={refresh} refreshing={refreshing} contentStyle={{ gap: 14 }}>
                {pending.map((p) => (
                    <Tap key={`${p.kind}-${p.id}`} onPress={() => payOrder(p.orderId, p.orderNumber, [`${p.kind}:${p.id}`])}>
                        <Notice tone="amber" icon={<Clock size={18} color={palette.amber800} />}>
                            “{p.title}” is waiting for payment. Tap to complete it on the website.
                        </Notice>
                    </Tap>
                ))}
                {loading ? (
                    <Loader label="Loading your library…" />
                ) : error && !data ? (
                    <EmptyState title="Could not load your purchases" description={error} action={<Btn variant="outline" title="Try again" onPress={refresh} />} />
                ) : items.length === 0 ? (
                    <EmptyState
                        icon={<meta.icon size={44} color={slate[300]} />}
                        title="Nothing here yet"
                        description={meta.empty}
                        action={<Btn title={meta.explore} onPress={() => router.push({ pathname: "/explore", params: { kind: tab } })} />}
                    />
                ) : (
                    items.map((i, idx) => (
                        <Animated.View key={`${i.kind}-${i.id}`} entering={FadeInDown.delay(idx * 70).duration(450)}>
                            <LibraryCard item={i} access={data?.access[`${i.kind}:${i.id}`]} progress={i.kind === "test" ? data?.progress[i.id] : undefined} />
                        </Animated.View>
                    ))
                )}
            </Body>
        </>
    );
}

function LibraryCard({ item: i, access: a, progress: prog }: { item: LibItem; access?: { url?: string; note?: string; hasPdf?: boolean }; progress?: { tests: number; done: number } }) {
    const theme = useTheme();
    const detail = i.kind === "course" ? `/course/${encodeURIComponent(i.id)}` : i.kind === "test" ? `/test-series/${encodeURIComponent(i.id)}` : `/material/${encodeURIComponent(i.id)}`;
    const pct = prog && prog.tests ? Math.round((prog.done / prog.tests) * 100) : 0;
    return (
        <View style={{ backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: slate[200], overflow: "hidden", ...shadow.sm }}>
            <View style={{ flexDirection: "row" }}>
                <SmartImage src={i.image} style={{ width: 110, height: 110 }} />
                <View style={{ flex: 1, padding: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", backgroundColor: palette.emerald50, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <CheckCircle2 size={11} color={palette.emerald700} />
                        <T w="extrabold" size={10} color={palette.emerald700} style={{ textTransform: "uppercase" }}>
                            Enrolled
                        </T>
                    </View>
                    <T w="extrabold" size={15} color={slate[900]} lh={1.3} numberOfLines={2} style={{ marginTop: 6 }}>
                        {i.title}
                    </T>
                    <T size={12} color={slate[500]} style={{ marginTop: 3 }}>
                        Purchased {formatDate(i.orderedAt)}
                    </T>
                </View>
            </View>
            <View style={{ padding: 12, paddingTop: 4 }}>
                {prog && prog.tests > 0 ? (
                    <View style={{ marginBottom: 10 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
                            <T w="bold" size={12} color={slate[600]}>
                                {prog.done} of {prog.tests} tests done
                            </T>
                            <T w="bold" size={12} color={slate[600]}>
                                {pct}%
                            </T>
                        </View>
                        <View style={{ height: 8, borderRadius: 4, backgroundColor: slate[100], overflow: "hidden" }}>
                            <View style={{ width: `${pct}%`, height: "100%", borderRadius: 4, backgroundColor: palette.emerald500 }} />
                        </View>
                    </View>
                ) : null}
                {a?.note ? (
                    <T size={13} color={slate[600]} lh={1.5} style={{ backgroundColor: slate[50], borderRadius: 10, padding: 10, marginBottom: 10 }}>
                        {a.note}
                    </T>
                ) : null}
                <View style={{ flexDirection: "row", gap: 8 }}>
                    {i.kind === "test" ? (
                        <Btn size="sm" style={{ flex: 1 }} title={prog?.done ? "Continue Tests" : "Start Tests"} icon={<PlayCircle size={16} color="#fff" />} onPress={() => router.push(`/series/${encodeURIComponent(i.id)}`)} />
                    ) : i.kind === "material" && a?.hasPdf ? (
                        <Btn size="sm" style={{ flex: 1 }} title="Read PDF" icon={<BookOpen size={16} color="#fff" />} onPress={() => router.push(`/read/${encodeURIComponent(i.id)}`)} />
                    ) : a?.url ? (
                        <Btn size="sm" style={{ flex: 1 }} title={i.kind === "material" ? "Open Material" : "Start Learning"} iconRight={<ExternalLink size={14} color="#fff" />} onPress={() => Linking.openURL(a.url!)} />
                    ) : (
                        <View style={{ flex: 1, height: 40, borderRadius: 12, backgroundColor: slate[100], alignItems: "center", justifyContent: "center" }}>
                            <T w="semibold" size={12} color={slate[500]}>
                                Access details will be shared soon
                            </T>
                        </View>
                    )}
                    {a?.url && (i.kind === "test" || (i.kind === "material" && a.hasPdf)) ? (
                        <Tap onPress={() => Linking.openURL(a.url!)} style={{ width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: slate[200], alignItems: "center", justifyContent: "center" }}>
                            <ExternalLink size={16} color={slate[600]} />
                        </Tap>
                    ) : null}
                    <Tap onPress={() => router.push(detail as never)} style={{ height: 40, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: slate[200], alignItems: "center", justifyContent: "center" }}>
                        <T w="bold" size={13} color={theme.brand}>
                            Details
                        </T>
                    </Tap>
                </View>
            </View>
        </View>
    );
}
