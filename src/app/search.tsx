import { useMemo, useState } from "react";
import { TextInput, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ArrowLeft, BookOpen, ChevronRight, ClipboardList, PlayCircle, Search as SearchIcon, UserRound, X } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { useCourses, useFaculty, useStudyMaterials, useTestSeries } from "@/hooks/useContent";
import { Body, goBack } from "@/components/Screen";
import { EmptyState, SmartImage, T, Tap, styles } from "@/components/ui";
import { FONT, shadow, slate, useTheme } from "@/lib/theme";
import { formatINR } from "@/lib/utils";

type Hit = { key: string; title: string; sub: string; image: string; href: string; price?: number };

export default function SearchScreen() {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const [q, setQ] = useState("");
    const courses = useCourses();
    const tests = useTestSeries();
    const materials = useStudyMaterials();
    const faculty = useFaculty();

    const groups = useMemo(() => {
        const needle = q.trim().toLowerCase();
        if (needle.length < 2) return [];
        const has = (...parts: (string | undefined)[]) => parts.join(" ").toLowerCase().includes(needle);
        const g: { title: string; icon: typeof BookOpen; hits: Hit[] }[] = [
            { title: "Courses", icon: PlayCircle, hits: courses.items.filter((c) => has(c.title, c.instructor, c.category, c.type)).map((c) => ({ key: `c-${c.id}`, title: c.title, sub: `${c.category} • ${c.instructor}`, image: c.image, href: `/course/${encodeURIComponent(c.id)}`, price: c.price })) },
            { title: "Test Series", icon: ClipboardList, hits: tests.items.filter((t) => has(t.title, t.category, t.type)).map((t) => ({ key: `t-${t.id}`, title: t.title, sub: `${t.category} • ${t.tests}`, image: t.image, href: `/test-series/${encodeURIComponent(t.id)}`, price: t.price })) },
            { title: "Study Material", icon: BookOpen, hits: materials.items.filter((m) => has(m.title, m.category, m.subject, m.tags.join(" "))).map((m) => ({ key: `m-${m.id}`, title: m.title, sub: `${m.category} • ${m.pages}`, image: m.image, href: `/material/${encodeURIComponent(m.id)}`, price: m.price })) },
            { title: "Faculty", icon: UserRound, hits: faculty.items.filter((f) => has(f.name, f.subject)).map((f) => ({ key: `f-${f.id}`, title: f.name, sub: f.subject, image: f.image, href: `/faculty/${encodeURIComponent(f.id)}` })) },
        ];
        return g.filter((x) => x.hits.length);
    }, [q, courses.items, tests.items, materials.items, faculty.items]);

    return (
        <View style={{ flex: 1, backgroundColor: slate[50] }}>
            <StatusBar style="dark" />
            <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 12, paddingBottom: 12, backgroundColor: "#fff", flexDirection: "row", alignItems: "center", gap: 8, ...shadow.sm }}>
                <Tap onPress={() => goBack()} style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: slate[100] }}>
                    <ArrowLeft size={20} color={slate[900]} />
                </Tap>
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, height: 44, borderRadius: 12, backgroundColor: slate[50], borderWidth: 1, borderColor: theme.brand200, paddingHorizontal: 12 }}>
                    <SearchIcon size={17} color={theme.brand} />
                    <TextInput autoFocus value={q} onChangeText={setQ} placeholder="Search courses, tests, notes, faculty…" placeholderTextColor={slate[400]} returnKeyType="search" style={{ flex: 1, fontFamily: FONT.medium, fontSize: 15, color: slate[900], paddingVertical: 0 }} />
                    {q ? (
                        <Tap onPress={() => setQ("")} hitSlop={8}>
                            <X size={16} color={slate[400]} />
                        </Tap>
                    ) : null}
                </View>
            </View>
            <Body contentStyle={{ gap: 18 }}>
                {q.trim().length < 2 ? (
                    <EmptyState icon={<SearchIcon size={40} color={slate[300]} />} title="What are you looking for?" description="Type at least two letters to search everything on the app." />
                ) : groups.length === 0 ? (
                    <EmptyState title={`No results for “${q}”`} description="Try a different word or check the spelling." />
                ) : (
                    groups.map((g, gi) => (
                        <Animated.View key={g.title} entering={FadeInDown.delay(gi * 60).duration(350)}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                <g.icon size={16} color={theme.brand} />
                                <T w="black" size={15} color={slate[900]}>
                                    {g.title}
                                </T>
                                <T w="bold" size={12} color={slate[400]}>
                                    {g.hits.length}
                                </T>
                            </View>
                            <View style={[styles.card, { overflow: "hidden" }]}>
                                {g.hits.slice(0, 8).map((h, i) => (
                                    <Tap key={h.key} scaleTo={0.985} onPress={() => router.push(h.href as never)} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderTopWidth: i ? 1 : 0, borderTopColor: slate[100] }}>
                                        <SmartImage src={h.image} style={{ width: 54, height: 54, borderRadius: 12 }} />
                                        <View style={{ flex: 1 }}>
                                            <T w="extrabold" size={14} color={slate[900]} numberOfLines={2}>
                                                {h.title}
                                            </T>
                                            <T size={12} color={slate[500]} numberOfLines={1}>
                                                {h.sub}
                                            </T>
                                        </View>
                                        {h.price !== undefined ? (
                                            <T w="black" size={13} color={slate[900]}>
                                                {h.price > 0 ? formatINR(h.price) : "Free"}
                                            </T>
                                        ) : null}
                                        <ChevronRight size={16} color={slate[300]} />
                                    </Tap>
                                ))}
                            </View>
                        </Animated.View>
                    ))
                )}
            </Body>
        </View>
    );
}
