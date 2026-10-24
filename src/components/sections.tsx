import { Linking, ScrollView, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react-native";
import { useContent } from "@/hooks/useContent";
import { openLink } from "@/lib/links";
import { shadow, slate, useTheme } from "@/lib/theme";
import { localOr } from "./Hero";
import { DynamicIcon } from "./icons";
import { Brand } from "./Logo";
import { SmartImage, T, Tap } from "./ui";

/** Section wrapper with the website's white / muted backgrounds. */
export function Section({ children, tone = "white", style, delay = 0 }: { children: React.ReactNode; tone?: "white" | "muted" | "brand"; style?: StyleProp<ViewStyle>; delay?: number }) {
    const theme = useTheme();
    const bg = tone === "muted" ? slate[50] : tone === "brand" ? theme.brand50 : "#fff";
    return (
        <Animated.View entering={FadeInDown.delay(delay).duration(550)} style={[{ backgroundColor: bg, paddingVertical: 30, paddingHorizontal: 16 }, style]}>
            {children}
        </Animated.View>
    );
}

/** Horizontal carousel with snap, used for course / test / faculty rows. */
export function Carousel<Item>({ data, itemWidth, render, keyOf }: { data: Item[]; itemWidth: number; render: (item: Item, i: number) => React.ReactNode; keyOf: (item: Item, i: number) => string }) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast" snapToInterval={itemWidth + 14} snapToAlignment="start" contentContainerStyle={{ gap: 14, paddingHorizontal: 16, paddingBottom: 6 }} style={{ marginHorizontal: -16 }}>
            {data.map((item, i) => (
                <View key={keyOf(item, i)} style={{ width: itemWidth }}>
                    {render(item, i)}
                </View>
            ))}
        </ScrollView>
    );
}

export function StatsBar({ items }: { items: readonly { icon?: string; value: string; label: string }[] }) {
    const theme = useTheme();
    const defaults = ["Award", "GraduationCap", "Play", "BookOpen", "Trophy"];
    return (
        <View style={{ backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: slate[100], paddingVertical: 18 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 20, paddingHorizontal: 18 }}>
                {items.map((s, i) => (
                    <Animated.View key={`${s.label}-${i}`} entering={FadeInDown.delay(150 + i * 80).duration(500)} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: theme.brand50, alignItems: "center", justifyContent: "center" }}>
                            <DynamicIcon name={s.icon || defaults[i % defaults.length]} size={22} color={theme.brand} />
                        </View>
                        <View>
                            <T w="black" size={21} color={slate[900]}>
                                {s.value}
                            </T>
                            <T w="semibold" size={12} color={slate[500]} style={{ marginTop: 2 }}>
                                {s.label}
                            </T>
                        </View>
                    </Animated.View>
                ))}
            </ScrollView>
        </View>
    );
}

type CtaData = { title?: string; description?: string; btnText?: string; btnLink?: string; secondaryBtnText?: string; secondaryBtnLink?: string; tagline?: string; image?: string };

/** Bottom call-to-action (Home → CTA in the admin panel). */
export function CtaSection({ override }: { override?: CtaData }) {
    const theme = useTheme();
    const { data: home } = useContent("home");
    const cta: CtaData = { ...home.cta, ...(override ?? {}) };
    return (
        <View style={{ backgroundColor: theme.brand50, paddingVertical: 32, paddingHorizontal: 20, overflow: "hidden" }}>
            {cta.image ? (
                <SmartImage src={localOr(cta.image)} style={{ position: "absolute", right: -30, top: 20, width: 170, height: 140, borderRadius: 18, opacity: 0.18 }} />
            ) : null}
            <T w="black" size={27} color={slate[900]} lh={1.15} style={{ letterSpacing: -0.5 }}>
                {cta.title}
            </T>
            {cta.description ? (
                <T size={14} color={slate[600]} lh={1.6} style={{ marginTop: 10 }}>
                    {cta.description.replace(/\n/g, " ")}
                </T>
            ) : null}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
                {cta.btnText ? (
                    <Tap haptic onPress={() => openLink(cta.btnLink || "/signup")} style={{ height: 48, borderRadius: 12, paddingHorizontal: 20, backgroundColor: theme.brand, flexDirection: "row", alignItems: "center", gap: 8, ...shadow.md, shadowColor: theme.brand }}>
                        <T w="black" size={14} color="#fff">
                            {cta.btnText}
                        </T>
                        <ArrowRight size={16} color="#fff" />
                    </Tap>
                ) : null}
                {cta.secondaryBtnText ? (
                    <Tap haptic onPress={() => openLink(cta.secondaryBtnLink || "/courses")} style={{ height: 48, borderRadius: 12, paddingHorizontal: 20, borderWidth: 2, borderColor: slate[800], justifyContent: "center" }}>
                        <T w="black" size={14} color={slate[800]}>
                            {cta.secondaryBtnText}
                        </T>
                    </Tap>
                ) : null}
            </View>
            {cta.tagline ? (
                <View style={{ marginTop: 24, alignSelf: "flex-end", transform: [{ rotate: "-3deg" }], alignItems: "center" }}>
                    <T w="script" size={27} color={slate[800]}>
                        {cta.tagline}
                    </T>
                    <View style={{ width: 90, height: 4, borderRadius: 2, backgroundColor: theme.brand, marginTop: 2 }} />
                </View>
            ) : null}
        </View>
    );
}

/** Footer: description, quick links, contact, copyright. */
export function AppFooter() {
    const theme = useTheme();
    const { data } = useContent("global");
    const year = new Date().getFullYear();
    const links = [...(data.footerQuickLinks ?? []), ...(data.footerSupportLinks ?? [])].filter((l) => l && l.label && !/cart|checkout/i.test(l.href));
    const c = data.contact;
    return (
        <View style={{ backgroundColor: theme.navy, paddingHorizontal: 20, paddingTop: 30, paddingBottom: 26 }}>
            <Brand dark size={34} />
            {data.footerDescription ? (
                <T size={13} color="rgba(255,255,255,0.65)" lh={1.6} style={{ marginTop: 12 }}>
                    {data.footerDescription}
                </T>
            ) : null}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
                {links.map((l, i) => (
                    <Tap key={`${l.href}-${i}`} onPress={() => openLink(l.href)} style={{ borderRadius: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", paddingHorizontal: 10, paddingVertical: 6 }}>
                        <T w="semibold" size={12} color="rgba(255,255,255,0.8)">
                            {l.label}
                        </T>
                    </Tap>
                ))}
            </View>
            <View style={{ marginTop: 20, gap: 10 }}>
                {c.phone ? (
                    <Tap onPress={() => Linking.openURL(`tel:${c.phone.replace(/\s/g, "")}`)} style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                        <Phone size={15} color={theme.brand} />
                        <T size={13} color="rgba(255,255,255,0.8)">
                            {c.phone}
                        </T>
                    </Tap>
                ) : null}
                {c.email ? (
                    <Tap onPress={() => Linking.openURL(`mailto:${c.email}`)} style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                        <Mail size={15} color={theme.brand} />
                        <T size={13} color="rgba(255,255,255,0.8)">
                            {c.email}
                        </T>
                    </Tap>
                ) : null}
                {c.address ? (
                    <View style={{ flexDirection: "row", gap: 10 }}>
                        <MapPin size={15} color={theme.brand} style={{ marginTop: 2 }} />
                        <T size={13} color="rgba(255,255,255,0.8)" style={{ flex: 1 }} lh={1.5}>
                            {c.address}
                        </T>
                    </View>
                ) : null}
            </View>
            <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 18 }} />
            <T size={12} color="rgba(255,255,255,0.5)" center>
                {(data.copyright || "").replace("{year}", String(year))}
            </T>
        </View>
    );
}
