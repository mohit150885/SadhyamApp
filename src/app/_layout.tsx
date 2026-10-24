import { useCallback, useMemo, useState, type ReactNode } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
// Import single weights so only the fonts the app uses end up in the APK.
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { Inter_800ExtraBold } from "@expo-google-fonts/inter/800ExtraBold";
import { Inter_900Black } from "@expo-google-fonts/inter/900Black";
import { Kalam_700Bold } from "@expo-google-fonts/kalam/700Bold";
import { AuthProvider } from "@/providers/AuthProvider";
import { PurchaseProvider } from "@/providers/PurchaseProvider";
import { AnimatedIntro } from "@/components/AnimatedIntro";
import { prefetchContent, useContent } from "@/hooks/useContent";
import { makeTheme, slate, ThemeContext } from "@/lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);
// setOptions only works in a development/production build, not in Expo Go.
if (Constants.executionEnvironment !== ExecutionEnvironment.StoreClient) {
    try {
        SplashScreen.setOptions({ fade: true, duration: 200 });
    } catch {
        /* not supported here */
    }
}

// Start loading content while the intro plays.
prefetchContent(["global", "home", "courses", "testSeries", "studyMaterial", "faculty", "results", "auth"]);

function ThemeFromContent({ children }: { children: ReactNode }) {
    const { data } = useContent("global");
    const theme = useMemo(() => makeTheme(data.theme?.brandColor, data.theme?.navyColor), [data.theme?.brandColor, data.theme?.navyColor]);
    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black, Kalam_700Bold });
    const [introDone, setIntroDone] = useState(false);
    const ready = fontsLoaded || Boolean(fontError);
    const finish = useCallback(() => setIntroDone(true), []);

    // Keep the native splash until fonts are ready, so the intro text never flashes in a fallback font.
    if (!ready) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <ThemeFromContent>
                    <AuthProvider>
                        <PurchaseProvider>
                            <View style={{ flex: 1, backgroundColor: slate[50] }}>
                                <StatusBar style={introDone ? "dark" : "light"} />
                                <Stack screenOptions={{ headerShown: false, animation: "slide_from_right", contentStyle: { backgroundColor: slate[50] } }}>
                                    <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
                                    <Stack.Screen name="login" options={{ animation: "slide_from_bottom" }} />
                                    <Stack.Screen name="signup" options={{ animation: "slide_from_bottom" }} />
                                    <Stack.Screen name="test/[id]" options={{ gestureEnabled: false }} />
                                </Stack>
                                {!introDone ? <AnimatedIntro ready={ready} onDone={finish} /> : null}
                            </View>
                        </PurchaseProvider>
                    </AuthProvider>
                </ThemeFromContent>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
