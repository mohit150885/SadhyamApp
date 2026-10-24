import { useState } from "react";
import { Animated, Dimensions, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Megaphone } from "lucide-react-native";
import { pickFeatured, useContent, useCourses, useFaculty, useStudyMaterials, useTestSeries, useToppers } from "@/hooks/useContent";
import { HomeHero } from "@/components/Hero";
import { HomeHeader, SOLID_AT } from "@/components/HomeHeader";
import { AppFooter, Carousel, CtaSection, Section, StatsBar } from "@/components/sections";
import { CourseCard, FacultyCard, FeatureCard, MaterialCard, ResultCard, TestimonialCard, TestSeriesCard } from "@/components/cards";
import { Loader, SectionHeading, T, Tap } from "@/components/ui";
import { openLink } from "@/lib/links";
import { slate, useTheme } from "@/lib/theme";

const { width: W } = Dimensions.get("window");
const CARD_W = Math.min(310, W * 0.8);

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const { data, loading } = useContent("home");
    const { data: global } = useContent("global");
    const courses = useCourses();
    const tests = useTestSeries();
    const materials = useStudyMaterials();
    const faculty = useFaculty();
    const toppers = useToppers();
    // Built-in Animated (native driver) drives the header fade; the listener only flips `solid`.
    const [scrollY] = useState(() => new Animated.Value(0));
    const [solid, setSolid] = useState(false);
    const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
        listener: (e: { nativeEvent: { contentOffset: { y: number } } }) => {
            const next = e.nativeEvent.contentOffset.y > SOLID_AT;
            setSolid((s) => (s === next ? s : next));
        },
    });

    if (loading) return <Loader label="Loading…" />;
    const v = data.sectionVisibility;
    const ann = global.announcement;

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <HomeHeader scrollY={scrollY} solid={solid} />
            <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 0 }}>
                {v.hero ? <HomeHero data={data.hero} topInset={insets.top} /> : <View style={{ height: insets.top + 70, backgroundColor: theme.navy }} />}

                {ann?.enabled && ann.text ? (
                    <Tap onPress={() => openLink(ann.link)} style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: theme.brand, paddingHorizontal: 16, paddingVertical: 11 }}>
                        <Megaphone size={16} color="#fff" />
                        <T w="bold" size={13} color="#fff" style={{ flex: 1 }}>
                            {ann.text}
                        </T>
                    </Tap>
                ) : null}

                {v.stats ? <StatsBar items={data.stats.items.map((s) => ({ icon: s.iconName, value: s.big, label: s.small }))} /> : null}

                {v.features ? (
                    <Section delay={100}>
                        <SectionHeading title={data.features.title} description={data.features.description} />
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                            {data.features.items.map((f, i) => (
                                <FeatureCard key={`${f.title}-${i}`} icon={f.iconName} tone={f.tone} title={f.title} text={f.text} style={{ width: (W - 32 - 12) / 2 }} />
                            ))}
                        </View>
                        {data.features.decoration ? (
                            <View style={{ alignItems: "center", marginTop: 22, transform: [{ rotate: "-3deg" }] }}>
                                <T w="script" size={24} color={slate[800]} style={{ opacity: 0.85 }}>
                                    {data.features.decoration}
                                </T>
                                <View style={{ width: 90, height: 4, borderRadius: 2, backgroundColor: theme.brand, marginTop: 2 }} />
                            </View>
                        ) : null}
                    </Section>
                ) : null}

                {v.courses && courses.items.length > 0 ? (
                    <Section tone="muted" delay={150}>
                        <SectionHeading title={data.courses.title} description={data.courses.description} action="View all" onAction={() => openLink(data.courses.actionLink)} accent={false} />
                        <Carousel data={pickFeatured(courses.items, data.courses.count)} itemWidth={CARD_W} keyOf={(c) => c.id} render={(c) => <CourseCard course={c} />} />
                    </Section>
                ) : null}

                {v.tests && tests.items.length > 0 ? (
                    <Section delay={200}>
                        <SectionHeading title={data.tests.title} description={data.tests.description} action="View all" onAction={() => openLink(data.tests.actionLink)} accent={false} />
                        <Carousel data={pickFeatured(tests.items, data.tests.count)} itemWidth={CARD_W} keyOf={(t) => t.id} render={(t) => <TestSeriesCard item={t} />} />
                    </Section>
                ) : null}

                {v.materials && materials.items.length > 0 ? (
                    <Section tone="muted" delay={250}>
                        <SectionHeading title={data.materials.title} description={data.materials.description} action="View all" onAction={() => openLink(data.materials.actionLink)} accent={false} />
                        <Carousel data={pickFeatured(materials.items, data.materials.count)} itemWidth={CARD_W} keyOf={(m) => m.id} render={(m) => <MaterialCard item={m} />} />
                    </Section>
                ) : null}

                {v.faculty && faculty.items.length > 0 ? (
                    <Section tone="muted" delay={300}>
                        <SectionHeading title={data.faculty.title} description={data.faculty.description} action="View all" onAction={() => router.push("/faculty")} />
                        <Carousel data={pickFeatured(faculty.items, data.faculty.count)} itemWidth={Math.min(200, W * 0.5)} keyOf={(f) => f.id} render={(f) => <FacultyCard member={f} />} />
                    </Section>
                ) : null}

                {v.results && toppers.items.length > 0 ? (
                    <Section delay={350}>
                        <SectionHeading title={data.results.title} description={data.results.description} action="View all" onAction={() => router.push("/results")} />
                        <View style={{ gap: 12 }}>
                            {pickFeatured(toppers.items, data.results.count).map((t) => (
                                <ResultCard key={t.id} topper={t} />
                            ))}
                        </View>
                    </Section>
                ) : null}

                {v.testimonials && data.testimonials.items.length > 0 ? (
                    <Section tone="muted" delay={400}>
                        <SectionHeading title={data.testimonials.title} description={data.testimonials.description} />
                        <Carousel data={[...data.testimonials.items]} itemWidth={CARD_W} keyOf={(t, i) => `${t.name}-${i}`} render={(t) => <TestimonialCard t={t} />} />
                    </Section>
                ) : null}

                {v.cta ? <CtaSection /> : null}
                <AppFooter />
            </Animated.ScrollView>
        </View>
    );
}
