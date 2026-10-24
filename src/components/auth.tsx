import { useState, type ReactNode } from "react";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { X } from "lucide-react-native";
import { GoogleSignInCancelled, signInWithGoogle } from "@/lib/googleAuth";
import { slate, shadow, useTheme } from "@/lib/theme";
import { authErrorMessage } from "@/providers/AuthProvider";
import { LogoMark } from "./Logo";
import { goBack } from "./Screen";
import { T, Tap } from "./ui";

/** Navy header with the logo, then a white rounded sheet holding the form. */
export function AuthShell({ title, highlight, subtitle, children }: { title: string; highlight: string; subtitle: string; children: ReactNode }) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    return (
        // Android apps are edge-to-edge on SDK 58, so the window no longer resizes for the keyboard:
        // pad the content ourselves on both platforms so fields and buttons stay visible.
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.navy }} behavior="padding">
            <StatusBar style="light" />
            <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                <LinearGradient colors={[theme.navy, theme.navy800]} style={{ paddingTop: insets.top + 12, paddingHorizontal: 22, paddingBottom: 46 }}>
                    <Tap haptic onPress={() => goBack()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", alignSelf: "flex-end" }}>
                        <X size={20} color="#fff" />
                    </Tap>
                    <Animated.View entering={FadeInUp.springify().damping(14)}>
                        <LogoMark size={54} />
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(120).duration(500)}>
                        <T w="black" size={30} color="#fff" style={{ marginTop: 18, letterSpacing: -0.6 }}>
                            {title}{" "}
                            <T w="black" size={30} color={theme.brand}>
                                {highlight}
                            </T>
                        </T>
                        <T size={14} color="rgba(255,255,255,0.72)" lh={1.5} style={{ marginTop: 6 }}>
                            {subtitle}
                        </T>
                    </Animated.View>
                </LinearGradient>
                <Animated.View entering={FadeInDown.delay(180).duration(550)} style={{ flex: 1, marginTop: -24, backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: insets.bottom + 30, ...shadow.lg }}>
                    {children}
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

export function Divider() {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 20 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: slate[200] }} />
            <T w="semibold" size={12} color={slate[400]}>
                OR
            </T>
            <View style={{ flex: 1, height: 1, backgroundColor: slate[200] }} />
        </View>
    );
}

/** "Continue with Google" — native account picker → Firebase Auth (see lib/googleAuth.ts). */
export function GoogleButton({ label, onDone, onError, disabled }: { label: string; onDone: () => void; onError: (msg: string) => void; disabled?: boolean }) {
    const [busy, setBusy] = useState(false);

    const onPress = async () => {
        setBusy(true);
        try {
            await signInWithGoogle();
            onDone();
        } catch (e) {
            if (!(e instanceof GoogleSignInCancelled)) onError(authErrorMessage(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Tap
            haptic
            disabled={disabled || busy}
            onPress={() => void onPress()}
            style={{ height: 50, borderRadius: 14, borderWidth: 1, borderColor: slate[300], flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, opacity: disabled || busy ? 0.6 : 1 }}
        >
            <Svg width={20} height={20} viewBox="0 0 48 48">
                <Path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                <Path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <Path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                <Path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </Svg>
            <T w="bold" size={15} color={slate[700]}>
                {busy ? "Connecting…" : label}
            </T>
        </Tap>
    );
}
