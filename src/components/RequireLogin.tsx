import type { ReactNode } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ArrowLeft, LockKeyhole } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { goBack } from "./Screen";
import { useAuth } from "@/providers/AuthProvider";
import { slate, useTheme } from "@/lib/theme";
import { Btn, Loader, T, Tap } from "./ui";

/** Shows a friendly sign-in prompt instead of the children when nobody is logged in. */
export function RequireLogin({ children, title = "Log in to continue", text = "Sign in to see your courses, tests, results and orders.", withBack }: { children: ReactNode; title?: string; text?: string; withBack?: boolean }) {
    const { user, loading } = useAuth();
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    if (loading) return <Loader />;
    if (user) return <>{children}</>;
    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 28, backgroundColor: slate[50] }}>
            {withBack ? (
                <Tap haptic onPress={() => goBack()} style={{ position: "absolute", top: insets.top + 8, left: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: slate[100], alignItems: "center", justifyContent: "center" }}>
                    <ArrowLeft size={20} color={slate[900]} />
                </Tap>
            ) : null}
            <Animated.View entering={FadeInDown.duration(500)} style={{ alignItems: "center" }}>
                <View style={{ width: 86, height: 86, borderRadius: 28, backgroundColor: theme.brand50, alignItems: "center", justifyContent: "center", transform: [{ rotate: "-6deg" }] }}>
                    <LockKeyhole size={38} color={theme.brand} />
                </View>
                <T w="black" size={22} color={slate[900]} center style={{ marginTop: 22 }}>
                    {title}
                </T>
                <T size={14} color={slate[500]} center lh={1.55} style={{ marginTop: 8, maxWidth: 300 }}>
                    {text}
                </T>
                <Btn title="Log In" style={{ marginTop: 24, minWidth: 220, alignSelf: "center" }} onPress={() => router.push("/login")} />
                <Btn variant="outline" title="Create free account" style={{ marginTop: 10, minWidth: 220, alignSelf: "center" }} onPress={() => router.push("/signup")} />
            </Animated.View>
        </View>
    );
}
