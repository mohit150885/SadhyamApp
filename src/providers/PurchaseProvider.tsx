import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AppState, Linking, Modal, Pressable, View } from "react-native";
import { router } from "expo-router";
import Animated, { FadeIn, FadeInUp, FadeOut, FadeOutUp, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckCircle2, ExternalLink, Globe, Info, Loader2, ShieldCheck } from "lucide-react-native";
import { APP_NAME, PURCHASE_MODE, WEBSITE_URL, websiteLink } from "@/lib/config";
import type { ProductKind } from "@/lib/models";
import { palette, shadow, slate, useTheme } from "@/lib/theme";
import { useEnrollments } from "@/hooks/useOrders";
import { useAuth } from "./AuthProvider";
import { Btn, T } from "@/components/ui";

/*
 * Google Play rule: digital purchases may not be processed inside the app.
 * Every Buy / Enroll / Pay action comes here. We show a short dialog and
 * open the website in the device's browser (never a WebView), where the
 * student pays with Razorpay. When they come back, orders/{id} has been
 * marked paid by the website, the live Firestore listener sees it and the
 * library refreshes — the item unlocks without restarting the app.
 */

const PATH: Record<ProductKind, string> = { course: "/courses", test: "/test-series", material: "/study-material" };

type Request =
    | { type: "item"; kind: ProductKind; id: string; title: string }
    | { type: "order"; orderId: string; orderNumber?: string; keys: string[] };

type Toast = { tone: "info" | "success"; title: string; text?: string; action?: { label: string; onPress: () => void } };

type PurchaseState = {
    /** Buy / enroll a catalog item on the website. */
    buy: (kind: ProductKind, id: string, title: string) => void;
    /** Pay a pending order on the website. */
    payOrder: (orderId: string, orderNumber: string | undefined, keys: string[]) => void;
    toast: (t: Toast) => void;
};

const Ctx = createContext<PurchaseState>({ buy: () => {}, payOrder: () => {}, toast: () => {} });
export const usePurchase = () => useContext(Ctx);

const LIBRARY_ROUTE: Record<ProductKind, string> = { course: "/library?tab=course", test: "/library?tab=test", material: "/library?tab=material" };

export function PurchaseProvider({ children }: { children: ReactNode }) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { owned } = useEnrollments();
    const [req, setReq] = useState<Request | null>(null);
    const [toastState, setToast] = useState<Toast | null>(null);
    const awaiting = useRef<{ keys: string[]; since: number } | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const toast = useCallback((t: Toast) => {
        setToast(t);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), t.action ? 7000 : 4000);
    }, []);

    // Back from the browser → tell the student we're checking.
    useEffect(() => {
        const sub = AppState.addEventListener("change", (s) => {
            const a = awaiting.current;
            if (s !== "active" || !a) return;
            if (Date.now() - a.since > 30 * 60_000) {
                awaiting.current = null;
                return;
            }
            if (!a.keys.every((k) => owned.has(k))) toast({ tone: "info", title: "Checking your purchase…", text: "If you completed the payment, it unlocks here in a few seconds." });
        });
        return () => sub.remove();
    }, [owned, toast]);

    // The paid order arrives through the live orders listener.
    useEffect(() => {
        const a = awaiting.current;
        if (!a || !a.keys.length || !a.keys.every((k) => owned.has(k))) return;
        awaiting.current = null;
        const kind = a.keys[0].split(":")[0] as ProductKind;
        toast({
            tone: "success",
            title: "Payment received — unlocked!",
            text: "Your purchase is ready in My Learning.",
            action: { label: "Open", onPress: () => router.push(LIBRARY_ROUTE[kind] as never) },
        });
    }, [owned, toast]);

    const buy = useCallback(
        (kind: ProductKind, id: string, title: string) => {
            if (owned.has(`${kind}:${id}`)) {
                router.push(LIBRARY_ROUTE[kind] as never);
                return;
            }
            setReq({ type: "item", kind, id, title });
        },
        [owned]
    );

    const payOrder = useCallback((orderId: string, orderNumber: string | undefined, keys: string[]) => setReq({ type: "order", orderId, orderNumber, keys }), []);

    const proceed = async () => {
        if (!req) return;
        const url =
            req.type === "item" ? websiteLink(`${PATH[req.kind]}/${encodeURIComponent(req.id)}?from=android-app`) : websiteLink(`/orders/${encodeURIComponent(req.orderId)}?from=android-app`);
        awaiting.current = { keys: req.type === "item" ? [`${req.kind}:${req.id}`] : req.keys, since: Date.now() };
        setReq(null);
        try {
            await Linking.openURL(url); // system browser — not an in-app WebView
        } catch {
            toast({ tone: "info", title: "Couldn't open the browser", text: `Visit ${WEBSITE_URL.replace(/^https?:\/\//, "")} to continue.` });
        }
    };

    const external = PURCHASE_MODE === "external";
    const host = WEBSITE_URL.replace(/^https?:\/\//, "");

    return (
        <Ctx.Provider value={{ buy, payOrder, toast }}>
            {children}

            <Modal visible={Boolean(req)} transparent statusBarTranslucent navigationBarTranslucent onRequestClose={() => setReq(null)}>
                {req ? (
                    <View style={{ flex: 1, justifyContent: "flex-end" }}>
                        <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(2,20,36,0.55)" }}>
                            <Pressable style={{ flex: 1 }} onPress={() => setReq(null)} />
                        </Animated.View>
                        <Animated.View
                            entering={SlideInDown.springify().damping(18)}
                            exiting={SlideOutDown.duration(180)}
                            style={{ backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: insets.bottom + 24, ...shadow.lg }}
                        >
                            <View style={{ alignSelf: "center", width: 44, height: 5, borderRadius: 3, backgroundColor: slate[200], marginBottom: 20 }} />
                            <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: theme.brand50, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                                {external ? <Globe size={28} color={theme.brand} /> : <Info size={28} color={theme.brand} />}
                            </View>
                            {!user ? (
                                <>
                                    <T w="black" size={21} color={slate[900]}>
                                        Log in first
                                    </T>
                                    <T size={14} color={slate[600]} lh={1.55} style={{ marginTop: 8 }}>
                                        Log in or create your free account so your purchases and test results stay linked to you on every device.
                                    </T>
                                    <Btn
                                        full
                                        title="Log in / Sign up"
                                        style={{ marginTop: 22 }}
                                        onPress={() => {
                                            setReq(null);
                                            router.push("/login");
                                        }}
                                    />
                                </>
                            ) : external ? (
                                <>
                                    <T w="black" size={21} color={slate[900]}>
                                        {req.type === "item" ? "Continue on our website" : "Complete payment on our website"}
                                    </T>
                                    <T size={14} color={slate[600]} lh={1.55} style={{ marginTop: 8 }}>
                                        {req.type === "item" ? `Enrolment for “${req.title}” is done on ${host}. ` : `Order ${req.orderNumber ? `#${req.orderNumber} ` : ""}is paid on ${host}. `}
                                        Your browser will open — log in there with{" "}
                                        <T w="bold" size={14} color={slate[800]}>
                                            {user.email}
                                        </T>{" "}
                                        and come back to {APP_NAME}. It unlocks here automatically.
                                    </T>
                                    <View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginTop: 16, backgroundColor: slate[50], borderRadius: 12, padding: 12 }}>
                                        <ShieldCheck size={18} color={palette.emerald600} />
                                        <T w="semibold" size={12} color={slate[600]} style={{ flex: 1 }}>
                                            Payments are handled securely on the website. No card or UPI details are entered in this app.
                                        </T>
                                    </View>
                                    <Btn full title="Open website" iconRight={<ExternalLink size={16} color="#fff" />} style={{ marginTop: 20 }} onPress={proceed} />
                                </>
                            ) : (
                                <>
                                    <T w="black" size={21} color={slate[900]}>
                                        Not available in the app
                                    </T>
                                    <T size={14} color={slate[600]} lh={1.55} style={{ marginTop: 8 }}>
                                        This item can’t be purchased in the app. Anything you already own on your {APP_NAME} account appears in My Learning.
                                    </T>
                                </>
                            )}
                            <Btn full variant="ghost" title="Not now" style={{ marginTop: 8 }} onPress={() => setReq(null)} />
                        </Animated.View>
                    </View>
                ) : null}
            </Modal>

            {toastState ? (
                <Animated.View
                    entering={FadeInUp.springify().damping(16)}
                    exiting={FadeOutUp.duration(200)}
                    style={{ position: "absolute", top: insets.top + 8, left: 12, right: 12, zIndex: 999, ...shadow.lg }}
                >
                    <Pressable
                        onPress={() => setToast(null)}
                        style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: toastState.tone === "success" ? palette.emerald600 : theme.navy, borderRadius: 16, padding: 14 }}
                    >
                        {toastState.tone === "success" ? <CheckCircle2 size={22} color="#fff" /> : <Loader2 size={22} color="#fff" />}
                        <View style={{ flex: 1 }}>
                            <T w="extrabold" size={14} color="#fff">
                                {toastState.title}
                            </T>
                            {toastState.text ? (
                                <T size={12} color="rgba(255,255,255,0.8)" style={{ marginTop: 2 }}>
                                    {toastState.text}
                                </T>
                            ) : null}
                        </View>
                        {toastState.action ? (
                            <Pressable
                                onPress={() => {
                                    toastState.action?.onPress();
                                    setToast(null);
                                }}
                                style={{ backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }}
                            >
                                <T w="bold" size={13} color="#fff">
                                    {toastState.action.label}
                                </T>
                            </Pressable>
                        ) : null}
                    </Pressable>
                </Animated.View>
            ) : null}
        </Ctx.Provider>
    );
}
