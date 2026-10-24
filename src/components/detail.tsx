import { useEffect, useState, type ReactNode } from "react";
import { Animated as RNAnimated, Share, TextInput, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from "firebase/firestore";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Share2, Star } from "lucide-react-native";
import { db } from "@/lib/firebase";
import { PURCHASE_MODE, websiteLink } from "@/lib/config";
import type { ProductKind, Review, Testimonial } from "@/lib/models";
import { FONT, palette, shadow, slate, useTheme } from "@/lib/theme";
import { formatDate, formatINR, discountPercent, toMillis } from "@/lib/utils";
import { useEnrollments } from "@/hooks/useOrders";
import { useAuth } from "@/providers/AuthProvider";
import { usePurchase } from "@/providers/PurchaseProvider";
import { TestimonialCard } from "./cards";
import { goBack } from "./Screen";
import { Btn, Notice, SmartImage, T, Tap } from "./ui";

const HERO_H = 300;

/** Detail page frame: parallax cover image, title card, collapsing header, sticky enrol bar. */
export function DetailScaffold({
    image,
    label,
    title,
    subtitle,
    meta,
    sharePath,
    bottom,
    children,
}: {
    image?: string;
    label?: string;
    title: string;
    subtitle?: string;
    meta?: ReactNode;
    sharePath?: string;
    bottom?: ReactNode;
    children: ReactNode;
}) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    // Parallax + collapsing bar with React Native's built-in Animated (native driver).
    const [y] = useState(() => new RNAnimated.Value(0));
    const onScroll = RNAnimated.event([{ nativeEvent: { contentOffset: { y } } }], { useNativeDriver: true });
    const imgStyle = {
        transform: [
            { translateY: y.interpolate({ inputRange: [-HERO_H, 0, HERO_H], outputRange: [-HERO_H / 2, 0, HERO_H * 0.5], extrapolate: "clamp" as const }) },
            { scale: y.interpolate({ inputRange: [-HERO_H, 0], outputRange: [2, 1], extrapolate: "clamp" as const }) },
        ],
    };
    const barStyle = { opacity: y.interpolate({ inputRange: [HERO_H - 140, HERO_H - 60], outputRange: [0, 1], extrapolate: "clamp" as const }) };

    return (
        <View style={{ flex: 1, backgroundColor: slate[50] }}>
            <StatusBar style="light" />
            <RNAnimated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: (bottom ? 110 : 30) + insets.bottom }}>
                <RNAnimated.View style={[{ height: HERO_H, backgroundColor: theme.navy }, imgStyle]}>
                    <SmartImage src={image} style={{ width: "100%", height: "100%" }} />
                    <LinearGradient colors={["rgba(2,20,36,0.55)", "transparent", "rgba(2,20,36,0.85)"]} locations={[0, 0.35, 1]} style={{ position: "absolute", inset: 0 }} />
                </RNAnimated.View>
                <Animated.View entering={FadeInDown.duration(500)} style={{ marginTop: -70, marginHorizontal: 14, backgroundColor: "#fff", borderRadius: 22, padding: 18, ...shadow.md }}>
                    {label ? (
                        <View style={{ alignSelf: "flex-start", backgroundColor: theme.brand50, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10 }}>
                            <T w="extrabold" size={11} color={theme.brand} style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                                {label}
                            </T>
                        </View>
                    ) : null}
                    <T w="black" size={23} color={slate[900]} lh={1.2} style={{ letterSpacing: -0.4 }}>
                        {title}
                    </T>
                    {subtitle ? (
                        <T size={14} color={slate[600]} lh={1.55} style={{ marginTop: 8 }}>
                            {subtitle}
                        </T>
                    ) : null}
                    {meta ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}>{meta}</View> : null}
                </Animated.View>
                <View style={{ padding: 14, gap: 16 }}>{children}</View>
            </RNAnimated.ScrollView>

            {/* Collapsing top bar */}
            <RNAnimated.View style={[{ position: "absolute", top: 0, left: 0, right: 0, height: insets.top + 58, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: slate[100], ...shadow.sm }, barStyle]} pointerEvents="none">
                <T w="black" size={16} color={slate[900]} numberOfLines={1} style={{ position: "absolute", left: 66, right: 66, bottom: 18 }}>
                    {title}
                </T>
            </RNAnimated.View>
            <View style={{ position: "absolute", top: insets.top + 8, left: 12, right: 12, flexDirection: "row", justifyContent: "space-between" }}>
                <Tap haptic onPress={() => goBack()} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.95)", alignItems: "center", justifyContent: "center", ...shadow.sm }}>
                    <ArrowLeft size={20} color={slate[900]} />
                </Tap>
                {sharePath ? (
                    <Tap haptic onPress={() => Share.share({ message: `${title}\n${websiteLink(sharePath)}` }).catch(() => undefined)} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.95)", alignItems: "center", justifyContent: "center", ...shadow.sm }}>
                        <Share2 size={18} color={slate[900]} />
                    </Tap>
                ) : null}
            </View>

            {bottom ? (
                <Animated.View entering={FadeInDown.delay(200).duration(450)} style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#fff", paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 12, borderTopWidth: 1, borderTopColor: slate[100], ...shadow.lg }}>
                    {bottom}
                </Animated.View>
            ) : null}
        </View>
    );
}

export function MetaChip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: slate[50], borderWidth: 1, borderColor: slate[100], borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}>
            {icon}
            <T w="semibold" size={12} color={slate[700]}>
                {children}
            </T>
        </View>
    );
}

export function DetailBlock({ title, children, dark }: { title: string; children: ReactNode; dark?: boolean }) {
    const theme = useTheme();
    return (
        <Animated.View entering={FadeInDown.duration(450)} style={[{ backgroundColor: dark ? theme.navy : "#fff", borderRadius: 20, borderWidth: dark ? 0 : 1, borderColor: slate[200], padding: 18 }, !dark && shadow.sm]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <View style={{ width: 4, height: 20, borderRadius: 2, backgroundColor: theme.brand }} />
                <T w="black" size={18} color={dark ? "#fff" : slate[900]} style={{ flex: 1 }}>
                    {title}
                </T>
            </View>
            {children}
        </Animated.View>
    );
}

export function CheckGrid({ items }: { items: readonly string[] }) {
    const theme = useTheme();
    return (
        <View style={{ gap: 10 }}>
            {items.map((it, i) => (
                <View key={`${it}-${i}`} style={{ flexDirection: "row", gap: 10 }}>
                    <CheckCircle2 size={18} color={theme.brand} style={{ marginTop: 1 }} />
                    <T w="medium" size={14} color={slate[700]} lh={1.45} style={{ flex: 1 }}>
                        {it}
                    </T>
                </View>
            ))}
        </View>
    );
}

export function InfoTiles({ items, dark }: { items: readonly { title: string; text: string }[]; dark?: boolean }) {
    const theme = useTheme();
    return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {items.map((x, i) => (
                <View key={`${x.title}-${i}`} style={{ width: "48%", flexGrow: 1, backgroundColor: dark ? "rgba(255,255,255,0.06)" : theme.brand50, borderRadius: 14, padding: 12, borderWidth: dark ? 1 : 0, borderColor: "rgba(255,255,255,0.1)" }}>
                    <CheckCircle2 size={20} color={theme.brand} />
                    <T w="extrabold" size={14} color={dark ? "#fff" : slate[900]} style={{ marginTop: 8 }}>
                        {x.title}
                    </T>
                    <T size={12} color={dark ? "rgba(255,255,255,0.7)" : slate[600]} lh={1.45} style={{ marginTop: 3 }}>
                        {x.text}
                    </T>
                </View>
            ))}
        </View>
    );
}

/**
 * Bottom bar on every product page. No payment happens in the app:
 * the button hands over to PurchaseProvider (dialog → website in the browser).
 * Owned items show a shortcut to the library instead.
 */
export function EnrollBar({ kind, id, title, price, oldPrice, primary }: { kind: ProductKind; id: string; title: string; price: number; oldPrice: number; primary?: string }) {
    const theme = useTheme();
    const { owned, pending } = useEnrollments();
    const { buy } = usePurchase();
    const key = `${kind}:${id}`;
    if (owned.has(key)) {
        const go = () => router.push((kind === "test" ? `/series/${encodeURIComponent(id)}` : `/library?tab=${kind}`) as never);
        return (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={22} color={palette.emerald600} />
                    <T w="extrabold" size={15} color={palette.emerald700}>
                        You are enrolled
                    </T>
                </View>
                <Btn variant="success" title={kind === "test" ? "Go to Tests" : kind === "material" ? "Open Material" : "My Courses"} iconRight={<ArrowRight size={16} color="#fff" />} onPress={go} />
            </View>
        );
    }
    const off = discountPercent(price, oldPrice);
    return (
        <View>
            {pending.has(key) ? (
                <Tap onPress={() => router.push("/orders")} style={{ marginBottom: 10 }}>
                    <Notice tone="amber" icon={<Clock size={16} color={palette.amber800} />}>
                        Payment pending for this item — tap to view your order.
                    </Notice>
                </Tap>
            ) : null}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6 }}>
                        <T w="black" size={23} color={slate[900]}>
                            {price > 0 ? formatINR(price) : "Free"}
                        </T>
                        {oldPrice > price ? (
                            <T w="medium" size={13} color={slate[400]} style={{ textDecorationLine: "line-through", marginBottom: 3 }}>
                                {formatINR(oldPrice)}
                            </T>
                        ) : null}
                    </View>
                    {off > 0 ? (
                        <T w="extrabold" size={12} color={palette.emerald600}>
                            {off}% OFF
                        </T>
                    ) : null}
                </View>
                <Btn
                    title={PURCHASE_MODE === "external" ? primary || "Enroll Now" : "How to enrol"}
                    iconRight={<ArrowRight size={16} color="#fff" />}
                    onPress={() => buy(kind, id, title)}
                    style={{ paddingHorizontal: 26, backgroundColor: theme.brand }}
                />
            </View>
        </View>
    );
}

/** Approved reviews from Firestore + a form to submit one (moderated in the admin panel). */
export function ReviewsSection({ title, kind, itemId, itemTitle, fallback }: { title: string; kind: ProductKind | "faculty"; itemId: string; itemTitle: string; fallback: readonly Testimonial[] }) {
    const theme = useTheme();
    const { user, profile } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

    useEffect(() => {
        if (!itemId) return;
        const q = query(collection(db, "reviews"), where("itemId", "==", itemId), where("status", "==", "approved"));
        return onSnapshot(
            q,
            (snap) => setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Review).sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))),
            () => setReviews([])
        );
    }, [itemId]);

    const submit = async () => {
        if (!user || comment.trim().length < 10) return;
        setStatus("saving");
        try {
            await addDoc(collection(db, "reviews"), {
                kind,
                itemId,
                itemTitle,
                userId: user.uid,
                userName: profile?.name || user.displayName || "Student",
                rating,
                comment: comment.trim().slice(0, 1000),
                status: "pending",
                createdAt: serverTimestamp(),
            });
            setStatus("done");
            setComment("");
        } catch {
            setStatus("error");
        }
    };

    const cards: Testimonial[] = reviews.length ? reviews.map((r) => ({ name: r.userName, role: formatDate(r.createdAt), quote: r.comment, image: "", rating: r.rating })) : [...fallback];

    return (
        <DetailBlock title={title}>
            <View style={{ gap: 12 }}>
                {cards.slice(0, 6).map((t, i) => (
                    <TestimonialCard key={`${t.name}-${i}`} t={t} />
                ))}
            </View>
            {!open ? (
                <Btn variant="outline" full title="Write a review" style={{ marginTop: 14 }} onPress={() => (user ? setOpen(true) : router.push("/login"))} />
            ) : status === "done" ? (
                <Notice tone="green" style={{ marginTop: 14 }} icon={<CheckCircle2 size={18} color={palette.emerald700} />}>
                    Thanks! Your review will appear after it is approved.
                </Notice>
            ) : (
                <View style={{ marginTop: 16, gap: 12, backgroundColor: slate[50], borderRadius: 16, padding: 14 }}>
                    <View style={{ flexDirection: "row", gap: 6 }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                            <Tap key={n} haptic onPress={() => setRating(n)} hitSlop={4}>
                                <Star size={30} color={n <= rating ? palette.amber400 : slate[300]} fill={n <= rating ? palette.amber400 : "transparent"} />
                            </Tap>
                        ))}
                    </View>
                    <TextInput
                        value={comment}
                        onChangeText={setComment}
                        multiline
                        maxLength={1000}
                        placeholder="Share your experience (at least 10 characters)"
                        placeholderTextColor={slate[400]}
                        style={{ minHeight: 100, textAlignVertical: "top", backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: slate[200], padding: 12, fontFamily: FONT.medium, fontSize: 14, color: slate[900] }}
                    />
                    {status === "error" ? (
                        <T w="semibold" size={12} color={palette.red600}>
                            Could not submit. Please try again.
                        </T>
                    ) : null}
                    <Btn full title="Submit review" loading={status === "saving"} disabled={comment.trim().length < 10} onPress={submit} style={{ backgroundColor: theme.brand }} />
                </View>
            )}
        </DetailBlock>
    );
}

export function NotFound({ title, onBack }: { title: string; onBack?: () => void }) {
    const insets = useSafeAreaInsets();
    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, paddingTop: insets.top, backgroundColor: slate[50] }}>
            <T w="black" size={20} color={slate[900]} center>
                {title}
            </T>
            <T size={14} color={slate[500]} center style={{ marginTop: 6 }}>
                It may have been removed or renamed.
            </T>
            <Btn title="Go back" style={{ marginTop: 18, alignSelf: "center" }} onPress={onBack ?? (() => goBack())} />
        </View>
    );
}
