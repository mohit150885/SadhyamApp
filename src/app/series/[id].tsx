import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { FileText, Lock } from "lucide-react-native";
import { useTestSeries } from "@/hooks/useContent";
import { useSeriesTests } from "@/lib/testClient";
import { Body, Header, Page } from "@/components/Screen";
import { RequireLogin } from "@/components/RequireLogin";
import { TestRow } from "@/components/TestRow";
import { Btn, EmptyState, Loader, Notice, T, styles } from "@/components/ui";
import { palette, slate, useTheme } from "@/lib/theme";

export default function SeriesScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { items: series } = useTestSeries();
    const info = series.find((s) => s.id === id);
    return (
        <Page>
            <Header title={info?.title || "Test Series"} subtitle="Your tests" />
            <RequireLogin>
                <SeriesBody id={id} />
            </RequireLogin>
        </Page>
    );
}

function SeriesBody({ id }: { id: string }) {
    const theme = useTheme();
    const { items, owned, loading, error, reload } = useSeriesTests(id);
    const done = items.filter((t) => t.attempts.some((a) => a.status === "submitted")).length;
    const pct = items.length ? Math.round((done / items.length) * 100) : 0;
    if (loading) return <Loader label="Loading tests…" />;
    return (
        <Body onRefresh={reload} contentStyle={{ gap: 14 }}>
            {error ? (
                <EmptyState title="Could not load tests" description={error} action={<Btn variant="outline" title="Try again" onPress={reload} />} />
            ) : items.length === 0 ? (
                <EmptyState icon={<FileText size={44} color={slate[300]} />} title="No tests yet" description="Tests will appear here as they are released." />
            ) : (
                <>
                    <Animated.View entering={FadeInDown.duration(400)} style={{ backgroundColor: theme.navy, borderRadius: 20, padding: 18 }}>
                        <T w="semibold" size={13} color="rgba(255,255,255,0.7)">
                            Your progress
                        </T>
                        <T w="black" size={26} color="#fff" style={{ marginTop: 2 }}>
                            {done} <T w="bold" size={15} color="rgba(255,255,255,0.7)">of {items.length} tests attempted</T>
                        </T>
                        <View style={{ height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.12)", marginTop: 12, overflow: "hidden" }}>
                            <View style={{ width: `${pct}%`, height: "100%", backgroundColor: theme.brand, borderRadius: 4 }} />
                        </View>
                    </Animated.View>
                    {owned === false ? (
                        <Notice tone="amber" icon={<Lock size={16} color={palette.amber800} />}>
                            You haven’t bought this series yet. Free tests are open; the rest unlock after enrolment.
                        </Notice>
                    ) : null}
                    {owned === false ? <Btn variant="outline" title="View test series" onPress={() => router.push(`/test-series/${encodeURIComponent(id)}`)} /> : null}
                    <View style={[styles.card, { overflow: "hidden" }]}>
                        {items.map((t, i) => (
                            <Animated.View key={t.id} entering={FadeInDown.delay(Math.min(i, 8) * 50).duration(380)} style={{ borderTopWidth: i ? 1 : 0, borderTopColor: slate[100] }}>
                                <TestRow t={t} />
                            </Animated.View>
                        ))}
                    </View>
                </>
            )}
        </Body>
    );
}
