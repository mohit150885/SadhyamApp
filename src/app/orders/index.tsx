import { View } from "react-native";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ChevronRight, Package } from "lucide-react-native";
import { useMyOrders } from "@/hooks/useOrders";
import { Body, Header, Page } from "@/components/Screen";
import { RequireLogin } from "@/components/RequireLogin";
import { StatusPill } from "@/components/StatusPill";
import { Btn, EmptyState, Loader, T, Tap, styles } from "@/components/ui";
import { slate } from "@/lib/theme";
import { formatDate, formatINR } from "@/lib/utils";

export default function OrdersScreen() {
    return (
        <Page>
            <Header title="My Orders" subtitle="Purchases and payment status" />
            <RequireLogin>
                <OrdersList />
            </RequireLogin>
        </Page>
    );
}

function OrdersList() {
    const { orders, loading } = useMyOrders();
    if (loading) return <Loader />;
    return (
        <Body contentStyle={{ gap: 12 }}>
            {orders.length === 0 ? (
                <EmptyState icon={<Package size={44} color={slate[300]} />} title="No orders yet" description="Orders you place on our website appear here with their payment status." action={<Btn title="Explore Courses" onPress={() => router.push("/explore")} />} />
            ) : (
                orders.map((o, i) => (
                    <Animated.View key={o.id} entering={FadeInDown.delay(Math.min(i, 8) * 60).duration(400)}>
                        <Tap onPress={() => router.push(`/orders/${o.id}`)} scaleTo={0.98} style={[styles.card, { padding: 16 }]}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <T w="black" size={15} color={slate[900]}>
                                        Order #{o.orderNumber}
                                    </T>
                                    <T size={12} color={slate[500]} style={{ marginTop: 2 }}>
                                        {formatDate(o.createdAt, true)} • {o.items.length} item(s)
                                    </T>
                                </View>
                                <T w="black" size={17} color={slate[900]}>
                                    {formatINR(o.total)}
                                </T>
                                <ChevronRight size={18} color={slate[300]} />
                            </View>
                            <T size={13} color={slate[600]} numberOfLines={1} style={{ marginTop: 8 }}>
                                {o.items.map((x) => x.title).join(", ")}
                            </T>
                            <View style={{ marginTop: 10 }}>
                                <StatusPill status={o.status} />
                            </View>
                        </Tap>
                    </Animated.View>
                ))
            )}
        </Body>
    );
}
