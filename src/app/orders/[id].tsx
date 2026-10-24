import { useEffect, useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { ExternalLink, ShieldCheck } from "lucide-react-native";
import { db } from "@/lib/firebase";
import type { Order } from "@/lib/models";
import { useAuth } from "@/providers/AuthProvider";
import { usePurchase } from "@/providers/PurchaseProvider";
import { Body, Header, Page } from "@/components/Screen";
import { RequireLogin } from "@/components/RequireLogin";
import { StatusPill } from "@/components/StatusPill";
import { Btn, Card, EmptyState, Loader, SmartImage, T } from "@/components/ui";
import { PURCHASE_MODE } from "@/lib/config";
import { palette, slate } from "@/lib/theme";
import { formatDate, formatINR } from "@/lib/utils";

export default function OrderScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return (
        <Page>
            <Header title="Order details" />
            <RequireLogin>
                <OrderBody id={id} />
            </RequireLogin>
        </Page>
    );
}

function OrderBody({ id }: { id: string }) {
    const { user } = useAuth();
    const { payOrder } = usePurchase();
    const [order, setOrder] = useState<Order | null | undefined>(undefined);

    // Live: when the website marks the order paid, this screen updates by itself.
    useEffect(() => {
        if (!user) return;
        return onSnapshot(
            doc(db, "orders", id),
            (snap) => setOrder(snap.exists() ? ({ id: snap.id, ...snap.data() } as Order) : null),
            () => setOrder(null)
        );
    }, [user, id]);

    if (order === undefined) return <Loader />;
    if (order === null) return <EmptyState title="Order not found" action={<Btn title="My Orders" onPress={() => router.replace("/orders")} />} />;

    return (
        <Body contentStyle={{ gap: 14 }}>
            <Card padded={false}>
                <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: slate[100], gap: 8 }}>
                    <T w="black" size={18} color={slate[900]}>
                        Order #{order.orderNumber}
                    </T>
                    <T size={12} color={slate[500]}>
                        Placed on {formatDate(order.createdAt, true)}
                    </T>
                    <StatusPill status={order.status} />
                </View>
                {order.items.map((i) => (
                    <View key={`${i.kind}-${i.id}`} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: slate[100] }}>
                        <SmartImage src={i.image} style={{ width: 72, height: 50, borderRadius: 10 }} />
                        <T w="extrabold" size={14} color={slate[900]} style={{ flex: 1 }} numberOfLines={2}>
                            {i.title}
                        </T>
                        <T w="black" size={14} color={slate[900]}>
                            {formatINR(i.price)}
                        </T>
                    </View>
                ))}
                <View style={{ padding: 16, gap: 8 }}>
                    <Row k="Subtotal" v={formatINR(order.subtotal)} />
                    {order.discount > 0 ? <Row k={`Coupon ${order.couponCode ?? ""}`} v={`− ${formatINR(order.discount)}`} green /> : null}
                    <View style={{ height: 1, backgroundColor: slate[100] }} />
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <T w="black" size={16} color={slate[900]}>
                            Total
                        </T>
                        <T w="black" size={20} color={slate[900]}>
                            {formatINR(order.total)}
                        </T>
                    </View>
                </View>
            </Card>

            {order.status === "pending" ? (
                <Card style={{ gap: 10 }}>
                    <T w="black" size={17} color={slate[900]}>
                        Complete your payment
                    </T>
                    <T size={14} color={slate[600]} lh={1.5}>
                        {PURCHASE_MODE === "external"
                            ? "Payments are completed on our website. Your items unlock in the app automatically once the payment is confirmed."
                            : "This order can't be paid in the app. Once it is paid, your items unlock here automatically."}
                    </T>
                    {PURCHASE_MODE === "external" ? (
                        <Btn full title="Continue on website" iconRight={<ExternalLink size={16} color="#fff" />} onPress={() => payOrder(order.id, order.orderNumber, order.items.map((i) => `${i.kind}:${i.id}`))} />
                    ) : null}
                </Card>
            ) : order.status === "paid" ? (
                <Card style={{ backgroundColor: palette.emerald50, borderColor: palette.emerald100, gap: 8 }}>
                    <ShieldCheck size={28} color={palette.emerald600} />
                    <T w="black" size={17} color={palette.emerald800}>
                        Payment confirmed
                    </T>
                    <T size={13} color={palette.emerald800}>
                        Your items are ready to use.{order.razorpayPaymentId ? ` Payment ID: ${order.razorpayPaymentId}` : ""}
                    </T>
                    {order.items.some((i) => i.kind === "test") ? <Btn full variant="success" title="Go to My Test Series" onPress={() => router.push("/library?tab=test")} /> : null}
                    {order.items.some((i) => i.kind === "course") ? <Btn full variant="success" title="Go to My Courses" onPress={() => router.push("/library?tab=course")} /> : null}
                    {order.items.some((i) => i.kind === "material") ? <Btn full variant="success" title="Go to My Study Material" onPress={() => router.push("/library?tab=material")} /> : null}
                </Card>
            ) : (
                <Card style={{ gap: 10 }}>
                    <T size={14} color={slate[600]}>
                        {order.note || "This order is closed. Contact support if you have questions."}
                    </T>
                    <Btn variant="outline" title="Contact Support" onPress={() => router.push("/contact")} />
                </Card>
            )}
        </Body>
    );
}

function Row({ k, v, green }: { k: string; v: string; green?: boolean }) {
    return (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <T size={14} color={slate[500]}>
                {k}
            </T>
            <T w="bold" size={14} color={green ? palette.emerald600 : slate[900]}>
                {v}
            </T>
        </View>
    );
}
