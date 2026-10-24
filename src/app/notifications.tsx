import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Bell, ChevronRight, Gift, GraduationCap, Info, Trophy } from "lucide-react-native";
import { useNotifications, useSeenNotifications } from "@/hooks/useNotifications";
import { Body, Header, Page } from "@/components/Screen";
import { EmptyState, Loader, T, Tap, styles } from "@/components/ui";
import { openLink } from "@/lib/links";
import { palette, slate, useTheme } from "@/lib/theme";
import { formatDate, toMillis } from "@/lib/utils";

const ICON = { info: Info, offer: Gift, exam: GraduationCap, result: Trophy } as const;
const TINT = { info: palette.blue500, offer: "#f43f5e", exam: "#8b5cf6", result: palette.amber500 } as const;

export default function NotificationsScreen() {
    const theme = useTheme();
    const { items, loading } = useNotifications();
    const { seenAt, markSeen } = useSeenNotifications();
    const [initialSeen] = useState(seenAt);
    useEffect(() => {
        if (!loading) {
            const t = setTimeout(markSeen, 1200);
            return () => clearTimeout(t);
        }
    }, [loading, markSeen]);

    return (
        <Page>
            <Header title="Notifications" />
            {loading ? (
                <Loader />
            ) : (
                <Body contentStyle={{ gap: 10 }}>
                    {items.length === 0 ? (
                        <EmptyState icon={<Bell size={42} color={slate[300]} />} title="You're all caught up" description="Offers, exam updates and results will appear here." />
                    ) : (
                        items.map((n, i) => {
                            const kind = (n.type ?? "info") as keyof typeof ICON;
                            const Icon = ICON[kind] ?? Info;
                            const unread = toMillis(n.createdAt) > initialSeen;
                            return (
                                <Animated.View key={n.id} entering={FadeInDown.delay(Math.min(i, 8) * 50).duration(400)}>
                                    <Tap onPress={() => n.link && openLink(n.link)} scaleTo={0.985} style={[styles.card, { flexDirection: "row", gap: 12, padding: 14 }, unread && { borderColor: theme.brand200, backgroundColor: theme.brand50 }]}>
                                        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: slate[100], alignItems: "center", justifyContent: "center" }}>
                                            <Icon size={19} color={TINT[kind] ?? palette.blue500} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <T w="extrabold" size={14} color={slate[900]}>
                                                {n.title}
                                            </T>
                                            <T size={13} color={slate[600]} lh={1.45} style={{ marginTop: 2 }}>
                                                {n.message}
                                            </T>
                                            <T size={11} color={slate[400]} style={{ marginTop: 6 }}>
                                                {formatDate(n.createdAt, true)}
                                            </T>
                                        </View>
                                        {n.link ? <ChevronRight size={18} color={slate[300]} style={{ alignSelf: "center" }} /> : null}
                                    </Tap>
                                </Animated.View>
                            );
                        })
                    )}
                </Body>
            )}
        </Page>
    );
}
