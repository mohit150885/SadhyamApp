import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown, LinearTransition, SlideInDown } from "react-native-reanimated";
import { SlidersHorizontal, Search, X, SearchX } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { useCourses, useStudyMaterials, useTestSeries } from "@/hooks/useContent";
import { CourseCard, MaterialCard, TestSeriesCard } from "@/components/cards";
import { PageHero } from "@/components/Hero";
import { CtaSection } from "@/components/sections";
import { Btn, EmptyState, Loader, T, Tap } from "@/components/ui";
import type { Course, StudyMaterial, TestSeries } from "@/lib/models";
import { FONT, shadow, slate, useTheme } from "@/lib/theme";
import { matchExam } from "@/lib/utils";

type Kind = "course" | "test" | "material";
type Item = Course | TestSeries | StudyMaterial;

const KINDS: { key: Kind; label: string }[] = [
    { key: "course", label: "Courses" },
    { key: "test", label: "Test Series" },
    { key: "material", label: "Study Material" },
];
const SORTS = ["Most Popular", "Price: Low to High", "Price: High to Low", "Rating"];

const groupsFor = (kind: Kind): { title: string; values: (i: Item) => string[] }[] =>
    kind === "course"
        ? [
              { title: "Course Type", values: (c) => [(c as Course).type] },
              { title: "Language", values: (c) => [(c as Course).language] },
          ]
        : kind === "test"
          ? [
                { title: "Test Type", values: (t) => [(t as TestSeries).type] },
                { title: "Language", values: (t) => [(t as TestSeries).language] },
            ]
          : [
                { title: "Subject", values: (m) => [(m as StudyMaterial).subject ?? ""] },
                { title: "Format", values: (m) => [(m as StudyMaterial).format ?? ""] },
                { title: "Language", values: (m) => [(m as StudyMaterial).language ?? ""] },
            ];

const searchText = (i: Item) => {
    const x = i as Course & StudyMaterial;
    return `${x.title} ${x.instructor ?? ""} ${x.category} ${x.type ?? ""} ${x.subject ?? ""} ${(x.tags ?? []).join(" ")}`.toLowerCase();
};

export default function ExploreScreen() {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const params = useLocalSearchParams<{ kind?: string; exam?: string }>();
    const [kind, setKind] = useState<Kind>((params.kind as Kind) || "course");
    const courses = useCourses();
    const tests = useTestSeries();
    const materials = useStudyMaterials();
    const src = kind === "course" ? courses : kind === "test" ? tests : materials;
    const page = src.page;
    const tabs = page.examTabs as readonly string[];
    const allTab = tabs[0] ?? "All";

    const [tab, setTab] = useState(allTab);
    const [q, setQ] = useState("");
    const [selected, setSelected] = useState<string[]>([]);
    const [sort, setSort] = useState(SORTS[0]);
    const [sheet, setSheet] = useState(false);

    // Deep links like /explore?kind=test&exam=UPSC (home hero, admin links). State is
    // adjusted during render when the link or the selected kind changes.
    const linkKey = `${params.kind ?? ""}|${params.exam ?? ""}`;
    const [seenLink, setSeenLink] = useState("");
    if (linkKey !== seenLink) {
        setSeenLink(linkKey);
        if (params.kind && params.kind !== kind) setKind(params.kind as Kind);
    }
    const tabKey = `${kind}|${linkKey}|${allTab}`;
    const [seenTab, setSeenTab] = useState("");
    if (tabKey !== seenTab) {
        setSeenTab(tabKey);
        const ex = params.exam ? matchExam(params.exam, tabs.slice(1)) : undefined;
        setTab(ex ?? allTab);
        setSelected([]);
    }

    const items = src.items as Item[];
    const tabItems = useMemo(() => (tab === allTab ? items : items.filter((i) => i.category === tab)), [items, tab, allTab]);
    const groups = useMemo(
        () =>
            groupsFor(kind)
                .map((g) => {
                    const counts = new Map<string, number>();
                    tabItems.forEach((it) => g.values(it).forEach((v) => v && counts.set(v, (counts.get(v) ?? 0) + 1)));
                    return { ...g, options: [...counts.entries()].sort((a, b) => b[1] - a[1]) };
                })
                .filter((g) => g.options.length > 0),
        [kind, tabItems]
    );
    const list = useMemo(() => {
        const needle = q.trim().toLowerCase();
        let out = tabItems.filter((it) => {
            if (needle && !searchText(it).includes(needle)) return false;
            for (const g of groups) {
                const picked = g.options.map(([v]) => v).filter((v) => selected.includes(v));
                if (picked.length && !g.values(it).some((v) => picked.includes(v))) return false;
            }
            return true;
        });
        if (sort === "Price: Low to High") out = [...out].sort((a, b) => a.price - b.price);
        else if (sort === "Price: High to Low") out = [...out].sort((a, b) => b.price - a.price);
        else if (sort === "Rating") out = [...out].sort((a, b) => b.rating - a.rating);
        return out;
    }, [tabItems, q, groups, selected, sort]);

    const filterCount = selected.length + (sort !== SORTS[0] ? 1 : 0);
    const noun = KINDS.find((k) => k.key === kind)!.label.toLowerCase();

    return (
        <View style={{ flex: 1, backgroundColor: slate[50] }}>
            <StatusBar style="light" />
            <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View>
                    {page.sectionVisibility?.hero !== false ? (
                        <PageHero topInset={insets.top} eyebrow={page.hero.eyebrow} title={page.hero.title} description={page.hero.description} banners={page.hero.bannerImages} highlights={page.hero.highlights} />
                    ) : (
                        <View style={{ height: insets.top + 10, backgroundColor: theme.navy }} />
                    )}
                </View>

                {/* Sticky: kind switch, search and exam tabs */}
                <View style={{ backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: slate[100], ...shadow.sm }}>
                    <View style={{ flexDirection: "row", margin: 12, marginBottom: 8, backgroundColor: slate[100], borderRadius: 14, padding: 4 }}>
                        {KINDS.map((k) => {
                            const on = k.key === kind;
                            return (
                                <Tap key={k.key} haptic onPress={() => setKind(k.key)} style={[{ flex: 1, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" }, on && { backgroundColor: "#fff", ...shadow.sm }]}>
                                    <T w={on ? "extrabold" : "semibold"} size={13} color={on ? theme.brand : slate[500]}>
                                        {k.label}
                                    </T>
                                </Tap>
                            );
                        })}
                    </View>
                    <View style={{ flexDirection: "row", gap: 8, marginHorizontal: 12 }}>
                        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, height: 44, borderRadius: 12, backgroundColor: slate[50], borderWidth: 1, borderColor: slate[200], paddingHorizontal: 12 }}>
                            <Search size={17} color={slate[400]} />
                            <TextInput value={q} onChangeText={setQ} placeholder={`Search ${noun}…`} placeholderTextColor={slate[400]} style={{ flex: 1, fontFamily: FONT.medium, fontSize: 14, color: slate[900], paddingVertical: 0 }} />
                            {q ? (
                                <Tap onPress={() => setQ("")} hitSlop={8}>
                                    <X size={16} color={slate[400]} />
                                </Tap>
                            ) : null}
                        </View>
                        {page.sectionVisibility?.filters !== false ? (
                            <Tap haptic onPress={() => setSheet(true)} style={{ width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: filterCount ? theme.brand : slate[900] }}>
                                <SlidersHorizontal size={18} color="#fff" />
                                {filterCount ? (
                                    <View style={{ position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: slate[900], alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" }}>
                                        <T w="black" size={9} color="#fff">
                                            {filterCount}
                                        </T>
                                    </View>
                                ) : null}
                            </Tap>
                        ) : null}
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 12, paddingVertical: 10 }}>
                        {tabs.map((t) => {
                            const on = t === tab;
                            return (
                                <Tap key={t} haptic onPress={() => setTab(t)} style={{ paddingHorizontal: 14, height: 36, justifyContent: "center", borderRadius: 10, borderWidth: 1, borderColor: on ? theme.brand : slate[200], backgroundColor: on ? theme.brand : "#fff" }}>
                                    <T w="bold" size={13} color={on ? "#fff" : slate[600]}>
                                        {t}
                                    </T>
                                </Tap>
                            );
                        })}
                    </ScrollView>
                </View>

                <View style={{ padding: 16, gap: 16, minHeight: 400 }}>
                    {src.loading ? (
                        <Loader />
                    ) : (
                        <>
                            <T w="semibold" size={13} color={slate[500]}>
                                Showing {list.length} {list.length === 1 ? noun.replace(/s$/, "") : noun}
                            </T>
                            {list.length === 0 ? (
                                <EmptyState
                                    icon={<SearchX size={42} color={slate[300]} />}
                                    title={`No ${noun} found`}
                                    description="Try another exam or clear your filters."
                                    action={
                                        <Btn
                                            variant="outline"
                                            title="Clear filters"
                                            onPress={() => {
                                                setQ("");
                                                setSelected([]);
                                                setTab(allTab);
                                            }}
                                        />
                                    }
                                />
                            ) : (
                                list.map((it, i) => (
                                    <Animated.View key={`${kind}-${it.id}`} entering={FadeInDown.delay(Math.min(i, 6) * 70).duration(420)} layout={LinearTransition.springify().damping(18)}>
                                        {kind === "course" ? <CourseCard course={it as Course} /> : kind === "test" ? <TestSeriesCard item={it as TestSeries} /> : <MaterialCard item={it as StudyMaterial} />}
                                    </Animated.View>
                                ))
                            )}
                        </>
                    )}
                </View>
                {page.sectionVisibility?.cta !== false ? <CtaSection /> : null}
            </ScrollView>

            <Modal visible={sheet} transparent statusBarTranslucent onRequestClose={() => setSheet(false)}>
                <View style={{ flex: 1, justifyContent: "flex-end" }}>
                    <Animated.View entering={FadeIn.duration(150)} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(2,20,36,0.5)" }}>
                        <Pressable style={{ flex: 1 }} onPress={() => setSheet(false)} />
                    </Animated.View>
                    <Animated.View entering={SlideInDown.springify().damping(18)} style={{ backgroundColor: "#fff", borderTopLeftRadius: 26, borderTopRightRadius: 26, maxHeight: "80%", paddingBottom: insets.bottom + 16 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", padding: 20, paddingBottom: 12 }}>
                            <T w="black" size={20} color={slate[900]} style={{ flex: 1 }}>
                                Filters
                            </T>
                            <Tap
                                onPress={() => {
                                    setSelected([]);
                                    setSort(SORTS[0]);
                                }}
                            >
                                <T w="bold" size={13} color={theme.brand}>
                                    Reset all
                                </T>
                            </Tap>
                        </View>
                        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 20, paddingBottom: 10 }}>
                            <FilterGroup title="Sort by" options={SORTS.map((s) => [s, 0] as [string, number])} isOn={(v) => v === sort} onToggle={setSort} hideCount />
                            {groups.map((g) => (
                                <FilterGroup key={g.title} title={g.title} options={g.options} isOn={(v) => selected.includes(v)} onToggle={(v) => setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]))} />
                            ))}
                        </ScrollView>
                        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
                            <Btn full title={`Show ${list.length} result${list.length === 1 ? "" : "s"}`} onPress={() => setSheet(false)} />
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

function FilterGroup({ title, options, isOn, onToggle, hideCount }: { title: string; options: [string, number][]; isOn: (v: string) => boolean; onToggle: (v: string) => void; hideCount?: boolean }) {
    const theme = useTheme();
    return (
        <View>
            <T w="extrabold" size={14} color={slate[800]} style={{ marginBottom: 10 }}>
                {title}
            </T>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {options.map(([v, n]) => {
                    const on = isOn(v);
                    return (
                        <Tap key={v} haptic onPress={() => onToggle(v)} style={{ flexDirection: "row", gap: 6, alignItems: "center", paddingHorizontal: 12, height: 36, borderRadius: 10, borderWidth: 1, borderColor: on ? theme.brand : slate[200], backgroundColor: on ? theme.brand50 : "#fff" }}>
                            <T w="bold" size={13} color={on ? theme.brand : slate[600]}>
                                {v}
                            </T>
                            {!hideCount ? (
                                <T w="semibold" size={11} color={slate[400]}>
                                    {n}
                                </T>
                            ) : null}
                        </Tap>
                    );
                })}
            </View>
        </View>
    );
}
