import { View, type StyleProp, type ViewStyle } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, BookOpen, CheckCircle2, ClipboardList, FileText, Play, Quote, Star } from "lucide-react-native";
import type { Course, FacultyMember, StudyMaterial, TestSeries, Testimonial, Topper } from "@/lib/models";
import { palette, shadow, slate, TONES, useTheme } from "@/lib/theme";
import { ItemCountdown } from "./Countdown";
import { DynamicIcon } from "./icons";
import { Badge, Price, Rating, SmartImage, T, Tag, Tap } from "./ui";

const shell = { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: slate[200], overflow: "hidden" as const, ...shadow.sm };
const shortCount = (v: string) => v.split(" ")[0];

function ViewDetails({ outline }: { outline?: boolean }) {
    const theme = useTheme();
    return (
        <View
            style={{
                marginTop: 14,
                height: 44,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                backgroundColor: outline ? "transparent" : theme.brand,
                borderWidth: outline ? 2 : 0,
                borderColor: theme.brand,
            }}
        >
            <T w="bold" size={14} color={outline ? theme.brand : "#fff"}>
                View Details
            </T>
            <ArrowRight size={16} color={outline ? theme.brand : "#fff"} />
        </View>
    );
}

export function CourseCard({ course, style }: { course: Course; style?: StyleProp<ViewStyle> }) {
    const theme = useTheme();
    const badge = course.badge || (course.bestseller ? "Bestseller" : "");
    return (
        <Tap onPress={() => router.push(`/course/${encodeURIComponent(course.id)}`)} style={[shell, style]}>
            <View style={{ height: 160, backgroundColor: slate[100] }}>
                <SmartImage src={course.image} style={{ width: "100%", height: "100%" }} />
                <LinearGradient colors={["transparent", "rgba(2,6,23,0.45)"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 80 }} />
                {badge ? <Badge style={{ position: "absolute", left: 12, top: 12 }}>{badge}</Badge> : null}
                <View style={{ position: "absolute", left: 12, bottom: 10, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <T w="bold" size={11} color={slate[800]}>
                        {course.category} • {course.language}
                    </T>
                </View>
            </View>
            <View style={{ padding: 16 }}>
                <T w="extrabold" size={16} color={slate[900]} lh={1.3} numberOfLines={2} style={{ minHeight: 42 }}>
                    {course.title}
                </T>
                <T size={13} color={slate[500]} style={{ marginTop: 4 }} numberOfLines={1}>
                    By <T w="bold" size={13} color={slate[700]}>{course.instructor}</T>
                </T>
                <View style={{ flexDirection: "row", gap: 14, marginTop: 12 }}>
                    {course.lectures ? <Meta icon={<Play size={14} color={theme.brand} />} text={shortCount(course.lectures)} /> : null}
                    {course.pdfs ? <Meta icon={<BookOpen size={14} color={theme.brand} />} text={shortCount(course.pdfs)} /> : null}
                    {course.tests ? <Meta icon={<ClipboardList size={14} color={theme.brand} />} text={shortCount(course.tests)} /> : null}
                </View>
                <View style={{ marginTop: 12 }}>
                    <Rating value={course.rating} reviews={course.reviews} />
                </View>
                <View style={{ marginTop: 12 }}>
                    <ItemCountdown item={course} />
                    <Price price={course.price} oldPrice={course.oldPrice} />
                </View>
                <ViewDetails />
            </View>
        </Tap>
    );
}

function Meta({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            {icon}
            <T w="medium" size={13} color={slate[600]}>
                {text}
            </T>
        </View>
    );
}

export function TestSeriesCard({ item, style }: { item: TestSeries; style?: StyleProp<ViewStyle> }) {
    const theme = useTheme();
    const stripe = TONES[item.tone || "orange"]?.solid ?? theme.brand;
    return (
        <Tap onPress={() => router.push(`/test-series/${encodeURIComponent(item.id)}`)} style={[shell, style]}>
            <View style={{ height: 4, backgroundColor: item.tone && item.tone !== "orange" ? stripe : theme.brand }} />
            <View style={{ height: 130, backgroundColor: slate[100] }}>
                <SmartImage src={item.image} style={{ width: "100%", height: "100%" }} />
                <LinearGradient colors={["transparent", "rgba(2,6,23,0.5)"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 70 }} />
                {item.badge ? <Badge style={{ position: "absolute", left: 12, top: 12 }}>{item.badge}</Badge> : null}
                <View style={{ position: "absolute", left: 12, bottom: 10, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <T w="bold" size={11} color={slate[800]}>
                        {item.category}
                    </T>
                </View>
            </View>
            <View style={{ padding: 16 }}>
                <T w="extrabold" size={16} color={slate[900]} lh={1.3} numberOfLines={2} style={{ minHeight: 42 }}>
                    {item.title}
                </T>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <ClipboardList size={14} color={theme.brand} />
                    <T w="semibold" size={13} color={slate[600]} numberOfLines={1}>
                        {[item.tests, item.questions].filter((x) => x).join(" • ")}
                    </T>
                </View>
                {item.features.length > 0 ? (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                        {item.features.slice(0, 3).map((f) => (
                            <Tag key={f} small>
                                {f}
                            </Tag>
                        ))}
                    </View>
                ) : null}
                <View style={{ marginTop: 12 }}>
                    <Rating value={item.rating} reviews={item.reviews} />
                </View>
                <View style={{ marginTop: 12 }}>
                    <ItemCountdown item={item} />
                    <Price price={item.price} oldPrice={item.oldPrice} />
                </View>
                <ViewDetails outline />
            </View>
        </Tap>
    );
}

export function MaterialCard({ item, style }: { item: StudyMaterial; style?: StyleProp<ViewStyle> }) {
    const theme = useTheme();
    return (
        <Tap onPress={() => router.push(`/material/${encodeURIComponent(item.id)}`)} style={[shell, style]}>
            <View style={{ height: 160, backgroundColor: slate[100] }}>
                <SmartImage src={item.image} style={{ width: "100%", height: "100%" }} />
                {item.badge ? <Badge style={{ position: "absolute", left: 12, top: 12 }}>{item.badge}</Badge> : null}
            </View>
            <View style={{ padding: 16 }}>
                <T w="extrabold" size={16} color={slate[900]} lh={1.3} numberOfLines={2} style={{ minHeight: 42 }}>
                    {item.title}
                </T>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <FileText size={14} color={theme.brand} />
                    <T w="semibold" size={13} color={slate[600]}>
                        {[item.pages, item.format].filter((x) => x).join(" • ")}
                    </T>
                </View>
                {item.tags.length > 0 ? (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                        {item.tags.slice(0, 3).map((t) => (
                            <Tag key={t}>{t}</Tag>
                        ))}
                    </View>
                ) : null}
                <View style={{ marginTop: 12 }}>
                    <Rating value={item.rating} reviews={item.reviews} />
                </View>
                <View style={{ marginTop: 12 }}>
                    <ItemCountdown item={item} />
                    <Price price={item.price} oldPrice={item.oldPrice} />
                </View>
                <ViewDetails />
            </View>
        </Tap>
    );
}

export function FacultyCard({ member, style, detailed }: { member: FacultyMember; style?: StyleProp<ViewStyle>; detailed?: boolean }) {
    const theme = useTheme();
    return (
        <Tap onPress={() => router.push(`/faculty/${encodeURIComponent(member.id)}`)} style={[shell, style]}>
            <View style={{ height: detailed ? 220 : 180, backgroundColor: slate[100] }}>
                <SmartImage src={member.image} contentPosition="top" style={{ width: "100%", height: "100%" }} />
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.55)"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 90 }} />
                <View style={{ position: "absolute", right: 10, bottom: 10, width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: "rgba(255,255,255,0.8)", backgroundColor: "rgba(15,23,42,0.7)", alignItems: "center", justifyContent: "center" }}>
                    <Play size={12} color="#fff" fill="#fff" />
                </View>
            </View>
            <View style={{ padding: 14 }}>
                <T w="extrabold" size={15} color={slate[900]} numberOfLines={1}>
                    {member.name}
                </T>
                <T w="medium" size={13} color={slate[600]} style={{ marginTop: 2 }} numberOfLines={1}>
                    {member.subject}
                </T>
                {member.experience ? (
                    <View style={{ alignSelf: "flex-start", marginTop: 8, backgroundColor: slate[50], borderWidth: 1, borderColor: slate[100], borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 }}>
                        <T w="semibold" size={11} color={slate[500]}>
                            {member.experience}
                        </T>
                    </View>
                ) : null}
                {detailed && member.bullets.length > 0 ? (
                    <View style={{ marginTop: 10, gap: 6 }}>
                        {member.bullets.slice(0, 3).map((b) => (
                            <View key={b} style={{ flexDirection: "row", gap: 7 }}>
                                <CheckCircle2 size={14} color={theme.brand} style={{ marginTop: 2 }} />
                                <T size={13} color={slate[600]} style={{ flex: 1 }}>
                                    {b}
                                </T>
                            </View>
                        ))}
                    </View>
                ) : null}
            </View>
        </Tap>
    );
}

export function ResultCard({ topper, style }: { topper: Topper; style?: StyleProp<ViewStyle> }) {
    const theme = useTheme();
    return (
        <View style={[shell, { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14 }, style]}>
            <View style={{ width: 56, height: 56, borderRadius: 28, overflow: "hidden", borderWidth: 2, borderColor: theme.brand100 }}>
                <SmartImage src={topper.image} style={{ width: "100%", height: "100%" }} />
            </View>
            <View style={{ flex: 1 }}>
                <T w="bold" size={12} color={slate[500]}>
                    {topper.exam}
                </T>
                <T w="black" size={18} color={theme.brand}>
                    {topper.rank}
                </T>
                <T w="semibold" size={14} color={slate[800]} numberOfLines={1}>
                    {topper.name}
                </T>
            </View>
        </View>
    );
}

const RING: Record<string, [string, string]> = {
    amber: ["#fcd34d", "#f59e0b"],
    blue: ["#7dd3fc", "#3b82f6"],
    emerald: ["#6ee7b7", "#10b981"],
    green: ["#6ee7b7", "#10b981"],
    teal: ["#5eead4", "#14b8a6"],
    purple: ["#c4b5fd", "#8b5cf6"],
    rose: ["#fda4af", "#f43f5e"],
    red: ["#fca5a5", "#ef4444"],
};

export function TopperCard({ topper, style }: { topper: Topper; style?: StyleProp<ViewStyle> }) {
    const theme = useTheme();
    const ring = RING[topper.color || "amber"] ?? (topper.color === "orange" ? [theme.brand300, theme.brand] : RING.amber);
    return (
        <View style={[shell, { alignItems: "center", padding: 18 }, style]}>
            <LinearGradient colors={ring as [string, string]} style={{ padding: 3, borderRadius: 60 }}>
                <View style={{ width: 92, height: 92, borderRadius: 46, overflow: "hidden", borderWidth: 4, borderColor: "#fff" }}>
                    <SmartImage src={topper.image} style={{ width: "100%", height: "100%" }} />
                </View>
            </LinearGradient>
            <View style={{ marginTop: 12, backgroundColor: theme.brand50, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 }}>
                <T w="black" size={16} color={theme.brand}>
                    {topper.rank}
                </T>
            </View>
            <T w="extrabold" size={15} color={slate[900]} style={{ marginTop: 8 }} center>
                {topper.name}
            </T>
            <T w="bold" size={12} color={slate[500]} center>
                {topper.exam}
            </T>
            {topper.quote ? (
                <T size={13} color={slate[600]} center lh={1.5} style={{ marginTop: 8, fontStyle: "italic" }} numberOfLines={4}>
                    “{topper.quote}”
                </T>
            ) : null}
        </View>
    );
}

export function TestimonialCard({ t, style }: { t: Testimonial; style?: StyleProp<ViewStyle> }) {
    const theme = useTheme();
    return (
        <View style={[shell, { padding: 18 }, style]}>
            <Quote size={34} color={theme.brand100} style={{ position: "absolute", left: 16, top: 14 }} />
            {t.rating ? (
                <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 2 }}>
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} size={14} color={i < (t.rating ?? 0) ? palette.amber400 : slate[200]} fill={i < (t.rating ?? 0) ? palette.amber400 : "transparent"} />
                    ))}
                </View>
            ) : null}
            <T size={14} color={slate[600]} lh={1.6} style={{ marginVertical: 14, fontStyle: "italic", minHeight: 60 }}>
                “{t.quote}”
            </T>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, borderTopWidth: 1, borderTopColor: slate[100], paddingTop: 14 }}>
                <View style={{ width: 46, height: 46, borderRadius: 23, overflow: "hidden", borderWidth: 2, borderColor: slate[100], backgroundColor: theme.brand50, alignItems: "center", justifyContent: "center" }}>
                    {t.image ? (
                        <SmartImage src={t.image} style={{ width: "100%", height: "100%" }} />
                    ) : (
                        <T w="black" size={18} color={theme.brand}>
                            {(t.name || "?").charAt(0).toUpperCase()}
                        </T>
                    )}
                </View>
                <View style={{ flex: 1 }}>
                    <T w="black" size={15} color={slate[900]}>
                        {t.name}
                    </T>
                    <T w="semibold" size={12} color={slate[500]}>
                        {t.role}
                    </T>
                </View>
            </View>
        </View>
    );
}

export function FeatureCard({ icon, tone = "orange", title, text, style }: { icon?: string; tone?: string; title: string; text: string; style?: StyleProp<ViewStyle> }) {
    const theme = useTheme();
    const c = tone === "orange" ? { soft: theme.brand50, fg: theme.brand } : TONES[tone] ?? TONES.orange;
    return (
        <View style={[{ backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: slate[100], padding: 16, ...shadow.sm }, style]}>
            <View style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: c.soft, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <DynamicIcon name={icon} size={20} color={c.fg} />
            </View>
            <T w="black" size={15} color={slate[900]} lh={1.3}>
                {title}
            </T>
            <T size={13} color={slate[500]} lh={1.5} style={{ marginTop: 6 }}>
                {text}
            </T>
        </View>
    );
}
