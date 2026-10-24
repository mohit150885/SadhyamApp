import { Linking, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { BookOpen, CalendarDays, ClipboardList, FileText, Languages, Play, PlayCircle, Star, UserRound } from "lucide-react-native";
import { useContent, useCourses, useFaculty } from "@/hooks/useContent";
import { CheckGrid, DetailBlock, DetailScaffold, EnrollBar, InfoTiles, MetaChip, NotFound, ReviewsSection } from "@/components/detail";
import { CourseCard, FacultyCard } from "@/components/cards";
import { Carousel, CtaSection } from "@/components/sections";
import { ItemCountdown } from "@/components/Countdown";
import { Accordion, Btn, Loader, T } from "@/components/ui";
import { palette, slate, useTheme } from "@/lib/theme";

export default function CourseDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = useTheme();
    const { items, loading } = useCourses();
    const { data: cfg } = useContent("courseDetails");
    const { data: home } = useContent("home");
    const faculty = useFaculty();
    if (loading) return <Loader />;
    const course = items.find((c) => c.id === id);
    if (!course) return <NotFound title="Course not found" />;
    const s = cfg.sections;
    const syllabus = course.syllabus?.length ? course.syllabus : cfg.defaultSyllabus;
    const faqs = course.faqs?.length ? course.faqs : cfg.faqs;
    const teachers = course.facultyIds?.length ? faculty.items.filter((f) => course.facultyIds?.includes(f.id)) : faculty.items.slice(0, 4);
    const related = items.filter((c) => c.id !== course.id && c.category === course.category).slice(0, 4);
    const tiles = [
        [Play, course.lectures],
        [FileText, course.pdfs],
        [ClipboardList, course.tests],
        [CalendarDays, course.validity],
    ].filter(([, v]) => v) as [typeof Play, string][];

    return (
        <DetailScaffold
            image={course.image}
            label={course.badge || cfg.heroLabel}
            title={course.title}
            subtitle={course.description}
            sharePath={`/courses/${course.id}`}
            meta={
                <>
                    <MetaChip icon={<UserRound size={14} color={theme.brand} />}>{course.instructor}</MetaChip>
                    <MetaChip icon={<Star size={14} color={palette.amber400} fill={palette.amber400} />}>
                        {course.rating} ({course.reviews} reviews)
                    </MetaChip>
                    <MetaChip icon={<Languages size={14} color={theme.brand} />}>{course.language}</MetaChip>
                    <MetaChip icon={<CalendarDays size={14} color={theme.brand} />}>{course.validity}</MetaChip>
                </>
            }
            bottom={<EnrollBar kind="course" id={course.id} title={course.title} price={course.price} oldPrice={course.oldPrice} primary={cfg.primaryButtonText} />}
        >
            <ItemCountdown item={course} box />
            {course.previewVideo ? <Btn full variant="dark" title="Watch course preview" icon={<PlayCircle size={18} color="#fff" />} onPress={() => Linking.openURL(course.previewVideo!)} /> : null}

            {s.overview.visible ? (
                <DetailBlock title={s.overview.title}>
                    <InfoTiles items={cfg.whyChoose} />
                    {course.highlights && course.highlights.length > 0 ? (
                        <View style={{ marginTop: 16 }}>
                            <CheckGrid items={course.highlights} />
                        </View>
                    ) : null}
                </DetailBlock>
            ) : null}

            {s.includes.visible ? (
                <DetailBlock title={s.includes.title}>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                        {tiles.map(([Icon, v]) => (
                            <View key={v} style={{ flexGrow: 1, minWidth: "45%", backgroundColor: theme.brand50, borderRadius: 14, padding: 12, alignItems: "center" }}>
                                <Icon size={22} color={theme.brand} />
                                <T w="extrabold" size={13} color={slate[900]} center style={{ marginTop: 6 }}>
                                    {v}
                                </T>
                            </View>
                        ))}
                    </View>
                    <CheckGrid items={course.features} />
                </DetailBlock>
            ) : null}

            {s.syllabus.visible && syllabus.length > 0 ? (
                <DetailBlock title={s.syllabus.title}>
                    <Accordion items={syllabus.map((x) => ({ title: x.title, body: x.details }))} />
                </DetailBlock>
            ) : null}

            {s.faculty.visible && teachers.length > 0 ? (
                <DetailBlock title={s.faculty.title}>
                    <Carousel data={teachers} itemWidth={170} keyOf={(f) => f.id} render={(f) => <FacultyCard member={f} />} />
                </DetailBlock>
            ) : null}

            {s.testimonials.visible ? <ReviewsSection title={s.testimonials.title} kind="course" itemId={course.id} itemTitle={course.title} fallback={home.testimonials.items} /> : null}

            {s.faqs.visible && faqs.length > 0 ? (
                <DetailBlock title={s.faqs.title}>
                    <Accordion items={faqs.map((f) => ({ title: f.question, body: f.answer }))} />
                </DetailBlock>
            ) : null}

            <DetailBlock title={cfg.help.title}>
                <T size={14} color={slate[600]} lh={1.5}>
                    {cfg.help.text}
                </T>
                <Btn variant="outline" title="Contact us" style={{ marginTop: 12 }} icon={<BookOpen size={16} color={theme.brand} />} onPress={() => router.push("/contact")} />
            </DetailBlock>

            {related.length > 0 ? (
                <View>
                    <T w="black" size={18} color={slate[900]} style={{ marginBottom: 12, marginLeft: 2 }}>
                        Related Courses
                    </T>
                    <Carousel data={related} itemWidth={290} keyOf={(c) => c.id} render={(c) => <CourseCard course={c} />} />
                </View>
            ) : null}
            <View style={{ marginHorizontal: -14 }}>
                <CtaSection />
            </View>
        </DetailScaffold>
    );
}
