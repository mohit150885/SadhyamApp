import { Linking, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { BookOpen, CheckCircle2, PlayCircle, Quote, Star, Users } from "lucide-react-native";
import { useContent, useCourses, useFaculty } from "@/hooks/useContent";
import { DetailBlock, DetailScaffold, InfoTiles, NotFound, ReviewsSection } from "@/components/detail";
import { CourseCard, FacultyCard } from "@/components/cards";
import { Carousel } from "@/components/sections";
import { Btn, Loader, T } from "@/components/ui";
import { slate, useTheme } from "@/lib/theme";

export default function FacultyDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = useTheme();
    const { items, loading } = useFaculty();
    const courses = useCourses();
    const { data: cfg } = useContent("facultyDetails");
    const { data: home } = useContent("home");
    const { data: global } = useContent("global");
    if (loading) return <Loader />;
    const f = items.find((m) => m.id === id);
    if (!f) return <NotFound title="Faculty not found" />;
    const s = cfg.sections;
    const theirCourses = courses.items.filter((c) => c.facultyIds?.includes(f.id) || c.instructor.toLowerCase().includes(f.name.toLowerCase().replace(/^(dr|prof)\.?\s*/i, "")));
    const others = items.filter((m) => m.id !== f.id).slice(0, 6);
    const stats = [f.students && [Users, f.students, "Students"], f.rating && [Star, f.rating, "Rating"], [BookOpen, String(theirCourses.length), "Courses"]].filter((x) => x) as [typeof Users, string, string][];

    return (
        <DetailScaffold image={f.image} label={f.experience ? `${f.experience} Experience` : "Faculty"} title={f.name} subtitle={f.subject} sharePath={`/faculty/${f.id}`}>
            <View style={{ flexDirection: "row", gap: 10 }}>
                {stats.map(([Icon, v, l]) => (
                    <View key={l} style={{ flex: 1, backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: slate[200], padding: 12, alignItems: "center" }}>
                        <Icon size={18} color={theme.brand} />
                        <T w="black" size={18} color={slate[900]} style={{ marginTop: 4 }}>
                            {v}
                        </T>
                        <T w="semibold" size={11} color={slate[500]}>
                            {l}
                        </T>
                    </View>
                ))}
            </View>
            {f.quote ? (
                <View style={{ flexDirection: "row", gap: 10, backgroundColor: theme.brand50, borderRadius: 16, padding: 14 }}>
                    <Quote size={20} color={theme.brand} />
                    <T w="semibold" size={14} color={slate[700]} lh={1.5} style={{ flex: 1, fontStyle: "italic" }}>
                        {f.quote}
                    </T>
                </View>
            ) : null}
            {f.videoUrl ? <Btn full variant="dark" title="Watch introduction" icon={<PlayCircle size={18} color="#fff" />} onPress={() => Linking.openURL(f.videoUrl!)} /> : null}
            {s.profile.visible ? (
                <DetailBlock title={s.profile.title}>
                    {f.bullets.length ? (
                        <View style={{ gap: 8, marginBottom: 12 }}>
                            {f.bullets.map((b) => (
                                <View key={b} style={{ flexDirection: "row", gap: 8 }}>
                                    <CheckCircle2 size={16} color={theme.brand} style={{ marginTop: 2 }} />
                                    <T w="medium" size={14} color={slate[700]} style={{ flex: 1 }}>
                                        {b}
                                    </T>
                                </View>
                            ))}
                        </View>
                    ) : null}
                    <T size={14} color={slate[600]} lh={1.65}>
                        {f.bio || `${f.name} teaches ${f.subject} at ${global.siteName} with ${f.experience || "years of"} experience guiding aspirants.`}
                    </T>
                </DetailBlock>
            ) : null}
            {s.approach.visible && cfg.approach.length ? (
                <DetailBlock title={s.approach.title}>
                    <InfoTiles items={cfg.approach} />
                </DetailBlock>
            ) : null}
            {s.courses.visible && theirCourses.length ? (
                <View>
                    <T w="black" size={18} color={slate[900]} style={{ marginBottom: 12, marginLeft: 2 }}>
                        {s.courses.title}
                    </T>
                    <Carousel data={theirCourses.slice(0, 8)} itemWidth={290} keyOf={(c) => c.id} render={(c) => <CourseCard course={c} />} />
                </View>
            ) : null}
            {s.testimonials.visible ? <ReviewsSection title={s.testimonials.title} kind="faculty" itemId={f.id} itemTitle={f.name} fallback={home.testimonials.items} /> : null}
            {others.length ? (
                <View>
                    <T w="black" size={18} color={slate[900]} style={{ marginBottom: 12, marginLeft: 2 }}>
                        Other Faculty
                    </T>
                    <Carousel data={others} itemWidth={170} keyOf={(m) => m.id} render={(m) => <FacultyCard member={m} />} />
                </View>
            ) : null}
        </DetailScaffold>
    );
}
