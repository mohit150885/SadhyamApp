import { ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Compass, Eye, Heart } from "lucide-react-native";
import { useContent } from "@/hooks/useContent";
import { Header } from "@/components/Screen";
import { PageHero, localOr } from "@/components/Hero";
import { CtaSection, Section } from "@/components/sections";
import { Btn, Loader, SectionHeading, SmartImage, T } from "@/components/ui";
import { openLink } from "@/lib/links";
import { slate, TONES, useTheme } from "@/lib/theme";

export default function AboutScreen() {
    const theme = useTheme();
    const { data, loading } = useContent("about");
    if (loading) return <Loader />;
    const v = data.sectionVisibility;
    return (
        <View style={{ flex: 1, backgroundColor: slate[50] }}>
            <Header title="About Us" dark />
            <ScrollView showsVerticalScrollIndicator={false}>
                {v.hero ? (
                    <PageHero eyebrow={data.hero.eyebrow} title={data.hero.title} description={data.hero.description} banners={data.hero.bannerImages}>
                        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                            {data.hero.primaryButton?.text ? <Btn title={data.hero.primaryButton.text} onPress={() => openLink(data.hero.primaryButton.link)} /> : null}
                            {data.hero.secondaryButton?.text ? <Btn variant="glass" title={data.hero.secondaryButton.text} onPress={() => openLink(data.hero.secondaryButton.link)} /> : null}
                        </View>
                    </PageHero>
                ) : null}

                {v.story ? (
                    <Section>
                        <SectionHeading title={data.story.title} />
                        <View style={{ gap: 12 }}>
                            {data.story.paragraphs.map((p, i) => (
                                <T key={i} size={15} color={slate[600]} lh={1.7}>
                                    {p}
                                </T>
                            ))}
                        </View>
                        {data.story.image ? <SmartImage src={localOr(data.story.image)} style={{ width: "100%", height: 200, borderRadius: 18, marginTop: 18 }} /> : null}
                    </Section>
                ) : null}

                {v.stats ? (
                    <Section tone="muted">
                        <View style={{ gap: 12 }}>
                            {[data.mission, data.vision].map((m, i) => (
                                <Animated.View key={m.title} entering={FadeInDown.delay(i * 100).duration(450)} style={{ backgroundColor: i ? "#fff" : theme.navy, borderRadius: 18, padding: 18, borderWidth: i ? 1 : 0, borderColor: slate[200] }}>
                                    {i ? <Eye size={24} color={theme.brand} /> : <Compass size={24} color={theme.brand} />}
                                    <T w="black" size={18} color={i ? slate[900] : "#fff"} style={{ marginTop: 8 }}>
                                        {m.title}
                                    </T>
                                    <T size={14} color={i ? slate[600] : "rgba(255,255,255,0.75)"} lh={1.6} style={{ marginTop: 4 }}>
                                        {m.text}
                                    </T>
                                </Animated.View>
                            ))}
                        </View>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
                            {data.stats.map((s) => (
                                <View key={s.label} style={{ flexGrow: 1, minWidth: "45%", backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: slate[200], padding: 14 }}>
                                    <T w="black" size={22} color={theme.brand}>
                                        {s.value}
                                    </T>
                                    <T w="semibold" size={12} color={slate[500]}>
                                        {s.label}
                                    </T>
                                </View>
                            ))}
                        </View>
                    </Section>
                ) : null}

                {v.whyChoose ? (
                    <Section>
                        <SectionHeading title="Why Choose Us" />
                        <View style={{ gap: 10 }}>
                            {data.whyChoose.map((w, i) => {
                                const c = TONES[w.tone] ?? TONES.orange;
                                return (
                                    <View key={`${w.title}-${i}`} style={{ flexDirection: "row", gap: 12, backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: slate[200], padding: 14 }}>
                                        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.soft, alignItems: "center", justifyContent: "center" }}>
                                            <Heart size={18} color={c.fg} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <T w="extrabold" size={15} color={slate[900]}>
                                                {w.title}
                                            </T>
                                            <T size={13} color={slate[500]} lh={1.5} style={{ marginTop: 2 }}>
                                                {w.description}
                                            </T>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </Section>
                ) : null}

                {v.timeline ? (
                    <Section tone="muted">
                        <SectionHeading title="Our Journey" />
                        {data.timeline.map((t, i) => (
                            <Animated.View key={t.year} entering={FadeInDown.delay(i * 80).duration(420)} style={{ flexDirection: "row", gap: 14 }}>
                                <View style={{ alignItems: "center" }}>
                                    <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: theme.brand, alignItems: "center", justifyContent: "center" }}>
                                        <T w="black" size={12} color="#fff">
                                            {t.year}
                                        </T>
                                    </View>
                                    {i < data.timeline.length - 1 ? <View style={{ width: 2, flex: 1, backgroundColor: theme.brand200, minHeight: 20 }} /> : null}
                                </View>
                                <View style={{ flex: 1, paddingBottom: 18, paddingTop: 6 }}>
                                    <T w="extrabold" size={15} color={slate[900]}>
                                        {t.title}
                                    </T>
                                    <T size={13} color={slate[500]} lh={1.5} style={{ marginTop: 2 }}>
                                        {t.description}
                                    </T>
                                </View>
                            </Animated.View>
                        ))}
                    </Section>
                ) : null}

                {v.values ? (
                    <Section>
                        <SectionHeading title="Our Values" />
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                            {data.values.map((val) => (
                                <View key={val.title} style={{ flexGrow: 1, minWidth: "45%", maxWidth: "50%", backgroundColor: theme.brand50, borderRadius: 16, padding: 14 }}>
                                    <T w="extrabold" size={15} color={slate[900]}>
                                        {val.title}
                                    </T>
                                    <T size={12} color={slate[600]} lh={1.5} style={{ marginTop: 4 }}>
                                        {val.description}
                                    </T>
                                </View>
                            ))}
                        </View>
                    </Section>
                ) : null}
                {v.cta ? <CtaSection /> : null}
            </ScrollView>
        </View>
    );
}
