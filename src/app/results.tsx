import { useMemo, useState } from "react";
import { Dimensions, Linking, ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { PlayCircle, Trophy } from "lucide-react-native";
import { useContent, useToppers } from "@/hooks/useContent";
import { Header } from "@/components/Screen";
import { PageHero } from "@/components/Hero";
import { Carousel, CtaSection, Section, StatsBar } from "@/components/sections";
import { TestimonialCard, TopperCard } from "@/components/cards";
import { EmptyState, Loader, SectionHeading, SmartImage, T, Tap } from "@/components/ui";
import { slate, useTheme } from "@/lib/theme";

const { width: W } = Dimensions.get("window");

export default function ResultsScreen() {
    const theme = useTheme();
    const { items: toppers, page, loading } = useToppers();
    const { data: home } = useContent("home");
    const [tab, setTab] = useState<string>(page.examTabs[0]);
    const shown = useMemo(() => (tab === page.examTabs[0] ? toppers : toppers.filter((t) => t.category === tab || t.exam.toLowerCase().includes(tab.toLowerCase()))), [toppers, tab, page.examTabs]);
    if (loading) return <Loader />;
    const v = page.sectionVisibility;
    return (
        <View style={{ flex: 1, backgroundColor: slate[50] }}>
            <Header title="Results" dark />
            <ScrollView showsVerticalScrollIndicator={false}>
                {v.hero ? <PageHero eyebrow={page.hero.eyebrow} title={page.hero.title} description={page.hero.description} banners={page.hero.bannerImages} highlights={page.hero.highlights} /> : null}
                {v.stats ? <StatsBar items={page.stats.map((s, i) => ({ ...s, icon: ["Trophy", "Award", "GraduationCap", "Users"][i % 4] }))} /> : null}
                {v.toppers ? (
                    <Section tone="muted">
                        <SectionHeading title="Our Toppers" />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 14 }}>
                            {page.examTabs.map((t) => (
                                <Tap key={t} haptic onPress={() => setTab(t)} style={{ paddingHorizontal: 14, height: 36, justifyContent: "center", borderRadius: 10, borderWidth: 1, borderColor: t === tab ? theme.brand : slate[200], backgroundColor: t === tab ? theme.brand : "#fff" }}>
                                    <T w="bold" size={13} color={t === tab ? "#fff" : slate[600]}>
                                        {t}
                                    </T>
                                </Tap>
                            ))}
                        </ScrollView>
                        {shown.length ? (
                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                                {shown.map((t, i) => (
                                    <Animated.View key={t.id} entering={FadeInDown.delay(Math.min(i, 8) * 60).duration(420)} style={{ width: (W - 32 - 12) / 2 }}>
                                        <TopperCard topper={t} />
                                    </Animated.View>
                                ))}
                            </View>
                        ) : (
                            <EmptyState icon={<Trophy size={42} color={slate[300]} />} title="No results for this exam yet" />
                        )}
                    </Section>
                ) : null}
                {v.videos && page.videos.length ? (
                    <Section>
                        <SectionHeading title="Hear From Our Toppers" />
                        <Carousel
                            data={[...page.videos]}
                            itemWidth={Math.min(300, W * 0.78)}
                            keyOf={(x, i) => `${x.title}-${i}`}
                            render={(vid) => (
                                <Tap onPress={() => vid.videoUrl && Linking.openURL(vid.videoUrl)} style={{ borderRadius: 18, overflow: "hidden", backgroundColor: theme.navy }}>
                                    <SmartImage src={vid.thumbnail} style={{ width: "100%", height: 170 }} />
                                    <LinearGradient colors={["transparent", "rgba(2,6,23,0.85)"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120 }} />
                                    <View style={{ position: "absolute", top: 55, alignSelf: "center", width: 54, height: 54, borderRadius: 27, backgroundColor: theme.brand, alignItems: "center", justifyContent: "center" }}>
                                        <PlayCircle size={30} color="#fff" />
                                    </View>
                                    <View style={{ position: "absolute", left: 14, right: 14, bottom: 12 }}>
                                        <T w="extrabold" size={14} color="#fff" numberOfLines={2}>
                                            {vid.title}
                                        </T>
                                        <T w="semibold" size={12} color="rgba(255,255,255,0.75)">
                                            {vid.name} • {vid.rank}
                                        </T>
                                    </View>
                                </Tap>
                            )}
                        />
                    </Section>
                ) : null}
                {v.yearlyResults && page.yearly.length ? (
                    <Section tone="muted">
                        <SectionHeading title="Year-wise Results" />
                        <View style={{ gap: 10 }}>
                            {page.yearly.map((y) => (
                                <View key={y.year} style={{ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: slate[200], padding: 14 }}>
                                    <View style={{ width: 62, height: 62, borderRadius: 16, backgroundColor: theme.navy, alignItems: "center", justifyContent: "center" }}>
                                        <T w="black" size={17} color="#fff">
                                            {y.year}
                                        </T>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <T w="black" size={22} color={theme.brand}>
                                            {y.selections}
                                        </T>
                                        <T size={13} color={slate[500]}>
                                            {y.note}
                                        </T>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </Section>
                ) : null}
                {v.testimonials && home.testimonials.items.length ? (
                    <Section>
                        <SectionHeading title={home.testimonials.title} description={home.testimonials.description} />
                        <Carousel data={[...home.testimonials.items]} itemWidth={Math.min(300, W * 0.8)} keyOf={(t, i) => `${t.name}-${i}`} render={(t) => <TestimonialCard t={t} />} />
                    </Section>
                ) : null}
                {v.cta ? <CtaSection /> : null}
            </ScrollView>
        </View>
    );
}
