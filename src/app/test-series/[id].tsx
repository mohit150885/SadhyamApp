import { Linking, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { CalendarDays, ClipboardList, Download, Languages, Lock, Star } from "lucide-react-native";
import { useContent, useTestSeries } from "@/hooks/useContent";
import { useEnrollments } from "@/hooks/useOrders";
import { useSeriesTests } from "@/lib/testClient";
import { CheckGrid, DetailBlock, DetailScaffold, EnrollBar, InfoTiles, MetaChip, NotFound, ReviewsSection } from "@/components/detail";
import { TestSeriesCard } from "@/components/cards";
import { Carousel, CtaSection } from "@/components/sections";
import { ItemCountdown, useNow } from "@/components/Countdown";
import { TestRow } from "@/components/TestRow";
import { Accordion, Btn, Loader, Notice, T } from "@/components/ui";
import { palette, slate, useTheme } from "@/lib/theme";
import { formatDate } from "@/lib/utils";

export default function TestSeriesDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = useTheme();
    const { items, loading } = useTestSeries();
    const { data: cfg } = useContent("testSeriesDetails");
    const { data: home } = useContent("home");
    const { owned } = useEnrollments();
    if (loading) return <Loader />;
    const item = items.find((t) => t.id === id);
    if (!item) return <NotFound title="Test series not found" />;
    const s = cfg.sections;
    const structure = item.structure?.length ? item.structure : cfg.defaultStructure;
    const faqs = item.faqs?.length ? item.faqs : cfg.faqs;
    const schedule = item.schedule ?? [];
    const related = items.filter((t) => t.id !== item.id).slice(0, 4);

    return (
        <DetailScaffold
            image={item.image}
            label={item.badge || item.category}
            title={item.title}
            subtitle={item.description}
            sharePath={`/test-series/${item.id}`}
            meta={
                <>
                    <MetaChip icon={<ClipboardList size={14} color={theme.brand} />}>{[item.tests, item.questions].filter((x) => x).join(" • ") || item.type}</MetaChip>
                    <MetaChip icon={<Star size={14} color={palette.amber400} fill={palette.amber400} />}>
                        {item.rating} ({item.reviews})
                    </MetaChip>
                    <MetaChip icon={<Languages size={14} color={theme.brand} />}>{item.language}</MetaChip>
                    <MetaChip icon={<CalendarDays size={14} color={theme.brand} />}>{item.validity}</MetaChip>
                </>
            }
            bottom={<EnrollBar kind="test" id={item.id} title={item.title} price={item.price} oldPrice={item.oldPrice} primary={cfg.primaryButtonText} />}
        >
            <ItemCountdown item={item} box />

            {s.overview.visible ? (
                <DetailBlock title={s.overview.title}>
                    <CheckGrid items={item.features} />
                </DetailBlock>
            ) : null}

            <DetailBlock title="Tests in this Series">
                <SeriesTests seriesId={item.id} enrolled={owned.has(`test:${item.id}`)} />
            </DetailBlock>

            {item.sampleUrl ? <Btn full variant="outline" title="Download Sample Test" icon={<Download size={16} color={theme.brand} />} onPress={() => Linking.openURL(item.sampleUrl!)} /> : null}

            {s.structure.visible && structure.length > 0 ? (
                <DetailBlock title={s.structure.title}>
                    <View style={{ gap: 10 }}>
                        {structure.map((st, i) => (
                            <View key={`${st.title}-${i}`} style={{ flexDirection: "row", gap: 12, borderWidth: 1, borderColor: slate[200], borderRadius: 14, padding: 14 }}>
                                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.brand50, alignItems: "center", justifyContent: "center" }}>
                                    <T w="black" size={13} color={theme.brand}>
                                        {i + 1}
                                    </T>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <T w="extrabold" size={15} color={slate[900]}>
                                        {st.title}
                                    </T>
                                    <T size={13} color={slate[500]} style={{ marginTop: 2 }}>
                                        {st.details}
                                    </T>
                                </View>
                            </View>
                        ))}
                    </View>
                </DetailBlock>
            ) : null}

            {s.schedule.visible && schedule.length > 0 ? (
                <DetailBlock title={s.schedule.title}>
                    <View style={{ gap: 0 }}>
                        {schedule.map((r, i) => (
                            <ScheduleRow key={i} r={r} last={i === schedule.length - 1} />
                        ))}
                    </View>
                </DetailBlock>
            ) : null}

            {s.whyTake.visible ? (
                <DetailBlock title={s.whyTake.title} dark>
                    <InfoTiles items={cfg.whyTake} dark />
                </DetailBlock>
            ) : null}

            {s.testimonials.visible ? <ReviewsSection title={s.testimonials.title} kind="test" itemId={item.id} itemTitle={item.title} fallback={home.testimonials.items} /> : null}

            {s.faqs.visible && faqs.length > 0 ? (
                <DetailBlock title={s.faqs.title}>
                    <Accordion items={faqs.map((f) => ({ title: f.question, body: f.answer }))} />
                </DetailBlock>
            ) : null}

            {related.length > 0 ? (
                <View>
                    <T w="black" size={18} color={slate[900]} style={{ marginBottom: 12, marginLeft: 2 }}>
                        More Test Series
                    </T>
                    <Carousel data={related} itemWidth={290} keyOf={(c) => c.id} render={(c) => <TestSeriesCard item={c} />} />
                </View>
            ) : null}
            <View style={{ marginHorizontal: -14 }}>
                <CtaSection />
            </View>
        </DetailScaffold>
    );
}

function ScheduleRow({ r, last }: { r: { date: string; title: string; topic: string; startsAt?: string; showCountdown?: boolean }; last: boolean }) {
    const theme = useTheme();
    const now = useNow();
    const ms = r.startsAt ? new Date(r.startsAt).getTime() - now : 0;
    const days = Math.floor(ms / 86_400_000);
    const hrs = Math.floor((ms % 86_400_000) / 3_600_000);
    return (
        <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ alignItems: "center" }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: theme.brand, marginTop: 4 }} />
                {!last ? <View style={{ width: 2, flex: 1, backgroundColor: theme.brand100 }} /> : null}
            </View>
            <View style={{ flex: 1, paddingBottom: last ? 0 : 16 }}>
                <T w="extrabold" size={12} color={theme.brand}>
                    {r.date || (r.startsAt ? formatDate(r.startsAt, true) : "")}
                    {r.showCountdown && ms > 0 ? `  •  in ${days > 0 ? `${days}d ` : ""}${hrs}h` : ""}
                </T>
                <T w="extrabold" size={14} color={slate[900]} style={{ marginTop: 2 }}>
                    {r.title}
                </T>
                {r.topic ? (
                    <T size={13} color={slate[500]} style={{ marginTop: 1 }}>
                        {r.topic}
                    </T>
                ) : null}
            </View>
        </View>
    );
}

function SeriesTests({ seriesId, enrolled }: { seriesId: string; enrolled: boolean }) {
    const { items, loading, error } = useSeriesTests(seriesId);
    if (loading) return <Loader full={false} label="Loading tests…" />;
    if (error) return <Notice tone="red">{error}</Notice>;
    if (!items.length)
        return (
            <T size={14} color={slate[500]}>
                Tests will be added here as per the schedule.
            </T>
        );
    const locked = items.filter((t) => !t.access).length;
    return (
        <View>
            {!enrolled && locked > 0 ? (
                <Notice tone="amber" icon={<Lock size={15} color={palette.amber800} />} style={{ marginBottom: 12 }}>
                    Enroll in this test series to unlock {locked === items.length ? "all" : locked} test{locked > 1 ? "s" : ""}.
                </Notice>
            ) : null}
            <View style={{ borderWidth: 1, borderColor: slate[200], borderRadius: 16, overflow: "hidden" }}>
                {items.map((t, i) => (
                    <View key={t.id} style={{ borderTopWidth: i ? 1 : 0, borderTopColor: slate[100] }}>
                        <TestRow t={t} />
                    </View>
                ))}
            </View>
        </View>
    );
}
