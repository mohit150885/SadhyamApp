import { useEffect } from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Compass, GraduationCap, House, UserRound, type LucideIcon } from "lucide-react-native";
import { FONT, slate, useTheme } from "@/lib/theme";

/*
 * Uses the router's built-in tab bar, styled through screen options only
 * (no custom `tabBar` component), so it keeps working across Expo Router versions.
 * The active tab gets an animated pill behind its icon.
 */

function TabIcon({ icon: Icon, focused }: { icon: LucideIcon; focused: boolean }) {
    const theme = useTheme();
    const p = useSharedValue(focused ? 1 : 0);
    useEffect(() => {
        p.set(withSpring(focused ? 1 : 0, { damping: 15, stiffness: 200 }));
    }, [focused, p]);
    const pill = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ scaleX: 0.6 + p.value * 0.4 }] }));
    const icon = useAnimatedStyle(() => ({ transform: [{ translateY: -p.value * 1.5 }, { scale: 1 + p.value * 0.08 }] }));
    return (
        <View style={{ width: 64, height: 32, alignItems: "center", justifyContent: "center" }}>
            <Animated.View style={[{ position: "absolute", width: 64, height: 32, borderRadius: 16, backgroundColor: theme.brand50 }, pill]} />
            <Animated.View style={icon}>
                <Icon size={22} color={focused ? theme.brand : slate[400]} strokeWidth={focused ? 2.4 : 2} />
            </Animated.View>
        </View>
    );
}

const TABS: { name: string; title: string; icon: LucideIcon }[] = [
    { name: "index", title: "Home", icon: House },
    { name: "explore", title: "Explore", icon: Compass },
    { name: "library", title: "My Learning", icon: GraduationCap },
    { name: "account", title: "Account", icon: UserRound },
];

export default function TabsLayout() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.brand,
                tabBarInactiveTintColor: slate[500],
                tabBarLabelStyle: { fontFamily: FONT.bold, fontSize: 11, marginTop: 2 },
                tabBarStyle: {
                    backgroundColor: "#fff",
                    borderTopColor: slate[100],
                    height: 72 + insets.bottom,
                    paddingTop: 8,
                    paddingBottom: insets.bottom + 8,
                    elevation: 12,
                    shadowColor: "#0f172a",
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                },
            }}
            screenListeners={{ tabPress: () => void Haptics.selectionAsync().catch(() => undefined) }}
        >
            {TABS.map((t) => (
                <Tabs.Screen key={t.name} name={t.name} options={{ title: t.title, tabBarIcon: ({ focused }) => <TabIcon icon={t.icon} focused={focused} /> }} />
            ))}
        </Tabs>
    );
}
