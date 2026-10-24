import { Alert, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import {
    BadgeHelp,
    Bell,
    BookOpen,
    ChevronRight,
    CirclePlay,
    FileText,
    Info,
    LogOut,
    Mail,
    MessageCircleQuestion,
    Package,
    RefreshCcw,
    Settings,
    ShieldCheck,
    Trophy,
    UserRound,
    Users,
    type LucideIcon,
} from "lucide-react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useContent } from "@/hooks/useContent";
import { Btn, SmartImage, T, Tap } from "@/components/ui";
import { APP_NAME } from "@/lib/config";
import { palette, shadow, slate, useTheme } from "@/lib/theme";
import Constants from "expo-constants";

type Row = { icon: LucideIcon; label: string; href: string; tint?: string };

export default function AccountScreen() {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const { user, profile, logout } = useAuth();
    const { data: global } = useContent("global");

    const mine: Row[] = [
        { icon: UserRound, label: "My Profile", href: "/profile" },
        { icon: CirclePlay, label: "My Courses", href: "/library?tab=course" },
        { icon: FileText, label: "My Test Series", href: "/library?tab=test" },
        { icon: BookOpen, label: "My Study Material", href: "/library?tab=material" },
        { icon: Package, label: "My Orders", href: "/orders" },
        { icon: Settings, label: "Settings", href: "/settings" },
    ];
    const discover: Row[] = [
        { icon: Users, label: "Our Faculty", href: "/faculty" },
        { icon: Trophy, label: "Results & Toppers", href: "/results" },
        { icon: Bell, label: "Notifications", href: "/notifications" },
        { icon: Info, label: `About ${global.siteName || APP_NAME}`, href: "/about" },
    ];
    const support: Row[] = [
        { icon: BadgeHelp, label: "Help Center", href: "/help" },
        { icon: MessageCircleQuestion, label: "FAQs", href: "/faqs" },
        { icon: Mail, label: "Contact Us", href: "/contact" },
        { icon: RefreshCcw, label: "Refund Policy", href: "/legal/refund" },
        { icon: FileText, label: "Terms & Conditions", href: "/legal/terms" },
        { icon: ShieldCheck, label: "Privacy Policy", href: "/legal/privacy" },
    ];

    const name = profile?.name || user?.displayName || "Student";
    return (
        <View style={{ flex: 1, backgroundColor: slate[50] }}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                <LinearGradient colors={[theme.navy, theme.navy800]} style={{ paddingTop: insets.top + 20, paddingBottom: 60, paddingHorizontal: 20 }}>
                    <T w="black" size={26} color="#fff">
                        Account
                    </T>
                </LinearGradient>
                <Animated.View entering={FadeInDown.duration(500)} style={{ marginTop: -44, marginHorizontal: 16, backgroundColor: "#fff", borderRadius: 22, padding: 18, ...shadow.md }}>
                    {user ? (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                            <View style={{ width: 62, height: 62, borderRadius: 31, overflow: "hidden", borderWidth: 3, borderColor: theme.brand100, backgroundColor: theme.brand50, alignItems: "center", justifyContent: "center" }}>
                                {user.photoURL || profile?.photoURL ? (
                                    <SmartImage src={user.photoURL || profile?.photoURL} style={{ width: "100%", height: "100%" }} />
                                ) : (
                                    <T w="black" size={24} color={theme.brand}>
                                        {name.charAt(0).toUpperCase()}
                                    </T>
                                )}
                            </View>
                            <View style={{ flex: 1 }}>
                                <T w="black" size={18} color={slate[900]} numberOfLines={1}>
                                    {name}
                                </T>
                                <T size={13} color={slate[500]} numberOfLines={1}>
                                    {user.email}
                                </T>
                                {profile?.exam ? (
                                    <View style={{ alignSelf: "flex-start", marginTop: 6, backgroundColor: theme.brand50, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                                        <T w="bold" size={11} color={theme.brand}>
                                            Preparing for {profile.exam}
                                        </T>
                                    </View>
                                ) : null}
                            </View>
                            <Tap onPress={() => router.push("/profile")} style={{ backgroundColor: slate[100], borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }}>
                                <T w="bold" size={12} color={slate[700]}>
                                    Edit
                                </T>
                            </Tap>
                        </View>
                    ) : (
                        <View>
                            <T w="black" size={18} color={slate[900]}>
                                Welcome to {global.siteName || APP_NAME}
                            </T>
                            <T size={13} color={slate[500]} lh={1.5} style={{ marginTop: 4 }}>
                                Log in to track your courses, attempt tests and see your results.
                            </T>
                            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                                <Btn title="Log In" style={{ flex: 1 }} onPress={() => router.push("/login")} />
                                <Btn variant="outline" title="Sign Up" style={{ flex: 1 }} onPress={() => router.push("/signup")} />
                            </View>
                        </View>
                    )}
                </Animated.View>

                {user ? <Group title="My Account" rows={mine} delay={80} /> : null}
                <Group title="Discover" rows={discover} delay={140} />
                <Group title="Help & Policies" rows={support} delay={200} />

                {user ? (
                    <Animated.View entering={FadeInDown.delay(260).duration(450)} style={{ marginHorizontal: 16, marginTop: 18 }}>
                        <Tap
                            haptic
                            onPress={() =>
                                Alert.alert("Sign out?", "You can log in again any time.", [
                                    { text: "Cancel", style: "cancel" },
                                    { text: "Sign out", style: "destructive", onPress: () => void logout() },
                                ])
                            }
                            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 14, backgroundColor: palette.red50 }}
                        >
                            <LogOut size={18} color={palette.red600} />
                            <T w="bold" size={15} color={palette.red600}>
                                Sign out
                            </T>
                        </Tap>
                    </Animated.View>
                ) : null}
                <T size={11} color={slate[400]} center style={{ marginTop: 22 }}>
                    {global.siteName || APP_NAME} • v{Constants.expoConfig?.version ?? "1.0.0"}
                </T>
            </ScrollView>
        </View>
    );
}

function Group({ title, rows, delay }: { title: string; rows: Row[]; delay: number }) {
    const theme = useTheme();
    return (
        <Animated.View entering={FadeInDown.delay(delay).duration(450)} style={{ marginTop: 22, marginHorizontal: 16 }}>
            <T w="extrabold" size={12} color={slate[500]} style={{ textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 }}>
                {title}
            </T>
            <View style={{ backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: slate[200], overflow: "hidden" }}>
                {rows.map((r, i) => {
                    const Icon = r.icon;
                    return (
                        <Tap key={r.href} scaleTo={0.985} onPress={() => router.push(r.href as never)} style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: i ? 1 : 0, borderTopColor: slate[100] }}>
                            <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: theme.brand50, alignItems: "center", justifyContent: "center" }}>
                                <Icon size={18} color={theme.brand} />
                            </View>
                            <T w="semibold" size={15} color={slate[800]} style={{ flex: 1 }}>
                                {r.label}
                            </T>
                            <ChevronRight size={18} color={slate[300]} />
                        </Tap>
                    );
                })}
            </View>
        </Animated.View>
    );
}
