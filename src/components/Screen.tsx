import type { ReactNode } from "react";
import { RefreshControl, ScrollView, View, type ScrollViewProps, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import { shadow, slate, useTheme } from "@/lib/theme";
import { T, Tap } from "./ui";

export function goBack(fallback = "/") {
    if (router.canGoBack()) router.back();
    else router.replace(fallback as never);
}

/** White top bar with back arrow, title and optional actions. */
export function Header({ title, subtitle, right, back = true, dark, transparent }: { title?: string; subtitle?: string; right?: ReactNode; back?: boolean; dark?: boolean; transparent?: boolean }) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const fg = dark ? "#fff" : slate[900];
    return (
        <View
            style={[
                { paddingTop: insets.top + 6, paddingBottom: 10, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: transparent ? "transparent" : dark ? theme.navy : "#fff", zIndex: 10 },
                !transparent && !dark && { borderBottomWidth: 1, borderBottomColor: slate[100], ...shadow.sm },
            ]}
        >
            <StatusBar style={dark ? "light" : "dark"} />
            {back ? (
                <Tap haptic onPress={() => goBack()} hitSlop={8} style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: dark ? "rgba(255,255,255,0.1)" : slate[100] }}>
                    <ArrowLeft size={20} color={fg} />
                </Tap>
            ) : null}
            <View style={{ flex: 1, paddingHorizontal: 6 }}>
                {title ? (
                    <T w="black" size={18} color={fg} numberOfLines={1}>
                        {title}
                    </T>
                ) : null}
                {subtitle ? (
                    <T size={12} color={dark ? "rgba(255,255,255,0.65)" : slate[500]} numberOfLines={1}>
                        {subtitle}
                    </T>
                ) : null}
            </View>
            {right}
        </View>
    );
}

/** Scrollable page body on the slate-50 background, with pull-to-refresh. */
export function Body({
    children,
    style,
    contentStyle,
    onRefresh,
    refreshing = false,
    padded = true,
    ...rest
}: ScrollViewProps & { children: ReactNode; style?: StyleProp<ViewStyle>; contentStyle?: StyleProp<ViewStyle>; onRefresh?: () => void; refreshing?: boolean; padded?: boolean }) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    return (
        <ScrollView
            {...rest}
            style={[{ flex: 1, backgroundColor: slate[50] }, style]}
            contentContainerStyle={[padded && { padding: 16 }, { paddingBottom: insets.bottom + 32 }, contentStyle]}
            keyboardShouldPersistTaps="handled"
            refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.brand]} tintColor={theme.brand} /> : undefined}
        >
            {children}
        </ScrollView>
    );
}

export function Page({ children }: { children: ReactNode }) {
    return <View style={{ flex: 1, backgroundColor: slate[50] }}>{children}</View>;
}
