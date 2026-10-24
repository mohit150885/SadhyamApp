
import { Animated, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell, Search } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { useNotifications, useSeenNotifications } from "@/hooks/useNotifications";
import { useContent } from "@/hooks/useContent";
import { shadow, slate, useTheme } from "@/lib/theme";
import { toMillis } from "@/lib/utils";
import { Brand } from "./Logo";
import { Tap } from "./ui";

export const SOLID_AT = 120;

/**
 * Floating header: transparent over the hero, turns white as you scroll.
 * Uses React Native's built-in Animated (native driver) for the fade, and
 * `solid` (set by the screen's scroll listener) to switch icon/text colours.
 */
export function HomeHeader({ scrollY, solid }: { scrollY: Animated.Value; solid: boolean }) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const { data: global } = useContent("global");
    const { items } = useNotifications();
    const { seenAt } = useSeenNotifications();
    const unread = items.filter((n) => toMillis(n.createdAt) > seenAt).length;

    const bgOpacity = scrollY.interpolate({ inputRange: [60, 160], outputRange: [0, 1], extrapolate: "clamp" });
    const iconBg = solid ? slate[100] : "rgba(255,255,255,0.14)";
    const iconFg = solid ? slate[800] : "#fff";

    return (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20 }}>
            <StatusBar style={solid ? "dark" : "light"} />
            <Animated.View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: slate[100], opacity: bgOpacity, ...shadow.sm }} />
            <View style={{ paddingTop: insets.top + 8, paddingBottom: 10, paddingHorizontal: 16, flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                    <Brand dark={!solid} size={32} />
                </View>
                {global.showSearch !== false ? (
                    <Tap haptic onPress={() => router.push("/search")} style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: iconBg, marginRight: 8 }}>
                        <Search size={19} color={iconFg} />
                    </Tap>
                ) : null}
                <Tap haptic onPress={() => router.push("/notifications")} style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: iconBg }}>
                    <Bell size={19} color={iconFg} />
                    {unread > 0 ? <View style={{ position: "absolute", top: 8, right: 9, width: 9, height: 9, borderRadius: 5, backgroundColor: theme.brand, borderWidth: 2, borderColor: solid ? "#fff" : theme.navy }} /> : null}
                </Tap>
            </View>
        </View>
    );
}
