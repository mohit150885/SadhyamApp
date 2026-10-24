import { useMemo, useState } from "react";
import { Dimensions, ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Users } from "lucide-react-native";
import { useFaculty } from "@/hooks/useContent";
import { Header } from "@/components/Screen";
import { PageHero, localOr } from "@/components/Hero";
import { CtaSection, Section, StatsBar } from "@/components/sections";
import { FacultyCard } from "@/components/cards";
import { EmptyState, Loader, SectionHeading, SmartImage, T, Tap } from "@/components/ui";
import { slate, useTheme } from "@/lib/theme";

const { width: W } = Dimensions.get("window");

export default function FacultyScreen() {
    const theme = useTheme();
    const { items, page, loading } = useFaculty();
    const tabs = useMemo(() => (page.subjects.length ? page.subjects : ["All Faculty"]), [page.subjects]);
    const [tab, setTab] = useState(tabs[0]);
    const shown = useMemo(() => (tab === tabs[0] ? items : items.filter((f) => f.subject.toLowerCase().includes(tab.toLowerCase()))), [items, tab, tabs]);
    if (loading) return <Loader />;
    const v = page.sectionVisibility;
    return (
        <View style={{ flex: 1, backgroundColor: slate[50] }}>
            <Header title="Faculty" dark />
            <ScrollView showsVerticalScrollIndicator={false}>
                {v.hero ? <PageHero title={page.hero.title} description={page.hero.description} banners={page.hero.bannerImages} highlights={page.hero.highlights} eyebrow={page.hero.eyebrow} /> : null}
                {v.stats ? <StatsBar items={page.stats.map((s, i) => ({ ...s, icon: ["Users", "Award", "GraduationCap", "Trophy"][i % 4] }))} /> : null}
                {v.subjects && tabs.length > 1 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: slate[100] }} contentContainerStyle={{ gap: 8, padding: 12 }}>
                        {tabs.map((t) => (
                            <Tap key={t} haptic onPress={() => setTab(t)} style={{ paddingHorizontal: 14, height: 36, justifyContent: "center", borderRadius: 10, borderWidth: 1, borderColor: t === tab ? theme.brand : slate[200], backgroundColor: t === tab ? theme.brand : "#fff" }}>
                                <T w="bold" size={13} color={t === tab ? "#fff" : slate[600]}>
                                    {t}
                                </T>
                            </Tap>
                        ))}
                    </ScrollView>
                ) : null}
                {v.items ? (
                    <Section tone="muted">
                        <SectionHeading title="Meet Our Faculty" description="Learn from subject experts with a passion for teaching." />
                        {shown.length ? (
                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                                {shown.map((f, i) => (
                                    <Animated.View key={f.id} entering={FadeInDown.delay(Math.min(i, 8) * 60).duration(420)} style={{ width: (W - 32 - 12) / 2 }}>
                                        <FacultyCard member={f} />
                                    </Animated.View>
                                ))}
                            </View>
                        ) : (
                            <EmptyState icon={<Users size={44} color={slate[300]} />} title="No faculty in this subject yet" />
                        )}
                    </Section>
                ) : null}
                {v.intro && page.intro.title ? (
                    <Section>
                        <SectionHeading title={page.intro.title} />
                        <T size={14} color={slate[600]} lh={1.65}>
                            {page.intro.text}
                        </T>
                        {page.intro.image ? (
                            <View style={{ marginTop: 16, borderRadius: 18, overflow: "hidden" }}>
                                <SmartImage src={localOr(page.intro.image)} style={{ width: "100%", height: 190 }} />
                                {page.intro.badge ? (
                                    <View style={{ position: "absolute", left: 12, bottom: 12, backgroundColor: theme.brand, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 }}>
                                        <T w="bold" size={12} color="#fff">
                                            {page.intro.badge}
                                        </T>
                                    </View>
                                ) : null}
                            </View>
                        ) : null}
                    </Section>
                ) : null}
                {v.cta ? <CtaSection /> : null}
            </ScrollView>
        </View>
    );
}
