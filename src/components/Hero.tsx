import { useEffect, useState, type ReactNode } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { ArrowRight, CheckCircle2, CirclePlay } from "lucide-react-native";
import { useContent } from "@/hooks/useContent";
import { useTheme } from "@/lib/theme";
import { openLink } from "@/lib/links";
import { SmartImage, T, Tap } from "./ui";

const { width: SCREEN_W } = Dimensions.get("window");

/** The default banners also ship inside the app so the hero looks right even offline. */
const LOCAL: Record<string, number> = {
    "/banner1.png": require("@/assets/images/banner1.jpg"),
    "/banner2.png": require("@/assets/images/banner2.jpg"),
    "/parliament.jpg": require("@/assets/images/parliament.jpg"),
};
export const localOr = (src: string): string | number => LOCAL[src] ?? src;

export function useBanners(own?: readonly string[]) {
    const { data: home } = useContent("home");
    const clean = (list: unknown) => (Array.isArray(list) ? list.filter((b): b is string => typeof b === "string" && b.trim() !== "") : []);
    const mine = clean(own);
    return mine.length > 0 ? mine : clean(home.hero.banners);
}

function Slide({ src, active }: { src: string; active: boolean }) {
    const o = useSharedValue(active ? 1 : 0);
    const z = useSharedValue(1);
    useEffect(() => {
        o.set(withTiming(active ? 1 : 0, { duration: 900 }));
        if (active) {
            z.set(1);
            z.set(withRepeat(withTiming(1.12, { duration: 9000, easing: Easing.inOut(Easing.quad) }), -1, true));
        }
    }, [active, o, z]);
    const s = useAnimatedStyle(() => ({ opacity: o.value * 0.4, transform: [{ scale: z.value }] }));
    return (
        <Animated.View style={[StyleSheet.absoluteFill, s]}>
            <SmartImage quiet src={localOr(src)} style={{ width: "100%", height: "100%" }} transition={0} />
        </Animated.View>
    );
}

/** Banner background with cross-fade + slow zoom, navy gradient and dots — like the website hero. */
function BannerBackground({ banners, interval = 5, showIndicators = true }: { banners: string[]; interval?: number; showIndicators?: boolean }) {
    const theme = useTheme();
    const [slide, setSlide] = useState(0);
    const count = banners.length;
    useEffect(() => {
        if (count <= 1) return;
        const t = setInterval(() => setSlide((s) => (s + 1) % count), Math.max(2, interval) * 1000);
        return () => clearInterval(t);
    }, [count, interval]);
    return (
        <>
            <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.navy, overflow: "hidden" }]}>
                {banners.map((b, i) => (
                    <Slide key={`${b}-${i}`} src={b} active={i === slide % Math.max(1, count)} />
                ))}
            </View>
            <LinearGradient colors={[`${theme.navy}F2`, `${theme.navy}B3`, `${theme.navy}66`]} start={{ x: 0, y: 0.3 }} end={{ x: 1, y: 0.7 }} style={StyleSheet.absoluteFill} />
            <LinearGradient colors={["transparent", `${theme.navy}CC`]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120 }} />
            {count > 1 && showIndicators ? (
                <View style={{ position: "absolute", bottom: 14, alignSelf: "center", flexDirection: "row", gap: 6 }}>
                    {banners.map((_, i) => (
                        <Tap key={i} hitSlop={6} onPress={() => setSlide(i)} style={{ height: 6, width: i === slide % count ? 26 : 6, borderRadius: 3, backgroundColor: i === slide % count ? theme.brand : "rgba(255,255,255,0.4)" }} />
                    ))}
                </View>
            ) : null}
        </>
    );
}

type HomeHeroData = {
    badge?: string;
    headingLine1?: string;
    headingLine2?: string;
    featuresLine?: string;
    description?: string;
    primaryBtnText?: string;
    primaryBtnLink?: string;
    secondaryBtnText?: string;
    secondaryBtnLink?: string;
    banners?: readonly string[];
    examTabs?: readonly { id?: string | number; name: string; link?: string; active?: boolean }[];
    settings?: { autoSlideInterval?: number; showArrows?: boolean; showIndicators?: boolean };
};

export function HomeHero({ data, topInset }: { data: HomeHeroData; topInset: number }) {
    const theme = useTheme();
    const banners = useBanners(data.banners);
    const tabs = (Array.isArray(data.examTabs) ? data.examTabs : []).filter((t) => t && typeof t.name === "string");
    const [selected, setSelected] = useState("");

    let features = data.featuresLine?.trim() || "";
    let description = data.description?.trim() || "";
    if (features && description.startsWith(features)) description = description.slice(features.length).trim();
    else if (!features && description.includes("\n\n")) {
        const [first, ...rest] = description.split(/\n\n+/);
        if (first.includes("|")) {
            features = first;
            description = rest.join("\n\n");
        }
    }
    const featureList = features.split("|").map((f) => f.trim()).filter((f) => f);
    const activeTab = selected || tabs.find((t) => t.active)?.name || tabs[0]?.name;

    return (
        <View style={{ backgroundColor: theme.navy, paddingTop: topInset + 70, paddingBottom: 40, overflow: "hidden" }}>
            <BannerBackground banners={banners} interval={data.settings?.autoSlideInterval ?? 5} showIndicators={data.settings?.showIndicators !== false} />
            <View style={{ paddingHorizontal: 20 }}>
                {data.badge ? (
                    <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.glassPill}>
                        <T w="bold" size={11} color="rgba(255,255,255,0.92)">
                            {data.badge}
                        </T>
                    </Animated.View>
                ) : null}
                <Animated.View entering={FadeInDown.delay(200).duration(600)}>
                    <T w="black" size={38} color="#fff" lh={1.06} style={{ letterSpacing: -1, marginTop: 18 }}>
                        {data.headingLine1}
                        {"\n"}
                        <T w="black" size={38} color={theme.brand}>
                            {data.headingLine2}
                        </T>
                    </T>
                </Animated.View>
                {featureList.length > 0 ? (
                    <Animated.View entering={FadeInDown.delay(320).duration(600)} style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
                        {featureList.map((f) => (
                            <View key={f} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                <CheckCircle2 size={15} color={theme.brand} />
                                <T w="bold" size={12} color="#fff">
                                    {f}
                                </T>
                            </View>
                        ))}
                    </Animated.View>
                ) : null}
                {description ? (
                    <Animated.View entering={FadeInDown.delay(420).duration(600)}>
                        <T w="medium" size={15} color="rgba(255,255,255,0.85)" lh={1.55} style={{ marginTop: 12 }}>
                            {description}
                        </T>
                    </Animated.View>
                ) : null}
                <Animated.View entering={FadeInDown.delay(520).duration(600)} style={{ flexDirection: "row", gap: 10, marginTop: 22 }}>
                    {data.primaryBtnText ? (
                        <Tap haptic onPress={() => openLink(data.primaryBtnLink || "/test-series")} style={[styles.heroBtn, { backgroundColor: theme.brand, shadowColor: theme.brand, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 }]}>
                            <T w="bold" size={14} color="#fff">
                                {data.primaryBtnText}
                            </T>
                            <ArrowRight size={16} color="#fff" />
                        </Tap>
                    ) : null}
                    {data.secondaryBtnText ? (
                        <Tap haptic onPress={() => openLink(data.secondaryBtnLink || "/courses")} style={[styles.heroBtn, styles.glassBtn]}>
                            <CirclePlay size={16} color="#fff" />
                            <T w="bold" size={14} color="#fff">
                                {data.secondaryBtnText}
                            </T>
                        </Tap>
                    ) : null}
                </Animated.View>
            </View>
            {tabs.length > 0 ? (
                <Animated.View entering={FadeIn.delay(650).duration(600)}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, marginTop: 22 }}>
                        {tabs.map((t, i) => {
                            const on = activeTab === t.name;
                            return (
                                <Tap
                                    key={t.id ?? `${t.name}-${i}`}
                                    haptic
                                    onPress={() => {
                                        setSelected(t.name);
                                        router.push({ pathname: "/explore", params: { kind: "course", exam: t.name } });
                                    }}
                                    style={[styles.tab, on ? { backgroundColor: theme.brand, borderColor: theme.brand } : { backgroundColor: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }]}
                                >
                                    <T w="bold" size={12} color={on ? "#fff" : "rgba(255,255,255,0.85)"}>
                                        {t.name}
                                    </T>
                                </Tap>
                            );
                        })}
                    </ScrollView>
                </Animated.View>
            ) : null}
        </View>
    );
}

/** Inner-page hero (catalog, faculty, results, about …). */
export function PageHero({ eyebrow, title, description, banners, highlights, children, topInset = 0 }: { eyebrow?: string; title: string; description?: string; banners?: readonly string[]; highlights?: readonly string[]; children?: ReactNode; topInset?: number }) {
    const theme = useTheme();
    const list = useBanners(banners);
    const hl = (highlights ?? []).filter((h) => h);
    const words = (title || "").trim().split(/\s+/);
    return (
        <View style={{ backgroundColor: theme.navy, paddingTop: topInset + 22, paddingBottom: 30, paddingHorizontal: 20, overflow: "hidden", minHeight: 230 }}>
            <BannerBackground banners={list} showIndicators={false} />
            {eyebrow ? (
                <Animated.View entering={FadeInDown.duration(450)} style={styles.glassPill}>
                    <T w="bold" size={11} color="rgba(255,255,255,0.92)" style={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
                        {eyebrow}
                    </T>
                </Animated.View>
            ) : null}
            <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                <T w="black" size={31} color="#fff" lh={1.1} style={{ letterSpacing: -0.8, marginTop: 14 }}>
                    {words.slice(0, -1).join(" ")}{" "}
                    <T w="black" size={31} color={theme.brand}>
                        {words.slice(-1).join(" ")}
                    </T>
                </T>
            </Animated.View>
            {description ? (
                <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                    <T w="medium" size={14} color="rgba(255,255,255,0.82)" lh={1.55} style={{ marginTop: 10 }}>
                        {description}
                    </T>
                </Animated.View>
            ) : null}
            {hl.length > 0 ? (
                <Animated.View entering={FadeInDown.delay(300).duration(500)} style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
                    {hl.map((h) => (
                        <View key={h} style={{ flexDirection: "row", alignItems: "center", gap: 6, width: (SCREEN_W - 50) / 2 }}>
                            <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }}>
                                <CheckCircle2 size={13} color={theme.brand} />
                            </View>
                            <T w="semibold" size={12} color="#fff" style={{ flex: 1 }}>
                                {h}
                            </T>
                        </View>
                    ))}
                </Animated.View>
            ) : null}
            {children ? <View style={{ marginTop: 18 }}>{children}</View> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    glassPill: { alignSelf: "flex-start", borderRadius: 30, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 12, paddingVertical: 6 },
    heroBtn: { height: 48, borderRadius: 12, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", gap: 8 },
    glassBtn: { borderWidth: 1, borderColor: "rgba(255,255,255,0.22)", backgroundColor: "rgba(255,255,255,0.1)" },
    tab: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
});

