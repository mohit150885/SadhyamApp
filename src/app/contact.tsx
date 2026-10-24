import { useState } from "react";
import { Linking, View } from "react-native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react-native";
import { db } from "@/lib/firebase";
import { useContent } from "@/hooks/useContent";
import { useAuth } from "@/providers/AuthProvider";
import { Body, Header, Page } from "@/components/Screen";
import { Btn, Card, ChipSelect, Field, Loader, Notice, T, Tap } from "@/components/ui";
import { palette, slate, useTheme } from "@/lib/theme";

export default function ContactScreen() {
    const theme = useTheme();
    const { data: page, loading } = useContent("contact");
    const { data: global } = useContent("global");
    const { user, profile } = useAuth();
    const [form, setForm] = useState({ name: "", email: "", mobile: "", subject: "", message: "" });
    const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const name = form.name || profile?.name || user?.displayName || "";
    const email = form.email || user?.email || "";

    const submit = async () => {
        if (name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(email.trim()) || form.message.trim().length < 5) {
            setState("error");
            return;
        }
        setState("sending");
        try {
            await addDoc(collection(db, "support_queries"), {
                name: name.trim().slice(0, 80),
                email: email.trim().slice(0, 120),
                mobile: form.mobile.replace(/\D/g, "").slice(0, 10),
                subject: (form.subject || page.subjects[0] || "General").slice(0, 80),
                message: form.message.trim().slice(0, 2000),
                userId: user?.uid ?? null,
                status: "open",
                createdAt: serverTimestamp(),
            });
            setState("sent");
            setForm({ name: "", email: "", mobile: "", subject: "", message: "" });
        } catch {
            setState("error");
        }
    };

    if (loading) return <Loader />;
    const c = global.contact;
    const cards = [
        c.phone && { icon: Phone, title: "Call Us", text: c.phone, url: `tel:${c.phone.replace(/\s/g, "")}` },
        c.email && { icon: Mail, title: "Email Us", text: c.email, url: `mailto:${c.email}` },
        c.whatsapp && { icon: MessageCircle, title: "WhatsApp", text: "Chat with us", url: `https://wa.me/${c.whatsapp.replace(/\D/g, "")}` },
    ].filter((x): x is { icon: typeof Phone; title: string; text: string; url: string } => Boolean(x));

    return (
        <Page>
            <Header title={page.hero.title} subtitle={page.hero.eyebrow} />
            <Body contentStyle={{ gap: 14 }}>
                <T size={14} color={slate[600]} lh={1.55}>
                    {page.hero.description}
                </T>
                <View style={{ flexDirection: "row", gap: 10 }}>
                    {cards.map((x) => (
                        <Tap key={x.title} haptic onPress={() => Linking.openURL(x.url)} style={{ flex: 1, backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: slate[200], padding: 12, alignItems: "center" }}>
                            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.brand50, alignItems: "center", justifyContent: "center" }}>
                                <x.icon size={19} color={theme.brand} />
                            </View>
                            <T w="extrabold" size={13} color={slate[900]} style={{ marginTop: 8 }}>
                                {x.title}
                            </T>
                            <T size={11} color={slate[500]} numberOfLines={1} center>
                                {x.text}
                            </T>
                        </Tap>
                    ))}
                </View>
                {c.address || c.hours ? (
                    <Card style={{ gap: 10 }}>
                        {c.address ? (
                            <View style={{ flexDirection: "row", gap: 10 }}>
                                <MapPin size={17} color={theme.brand} />
                                <T size={13} color={slate[600]} lh={1.5} style={{ flex: 1 }}>
                                    {c.address}
                                </T>
                            </View>
                        ) : null}
                        {c.hours ? (
                            <View style={{ flexDirection: "row", gap: 10 }}>
                                <Clock size={17} color={theme.brand} />
                                <T size={13} color={slate[600]}>
                                    {c.hours}
                                </T>
                            </View>
                        ) : null}
                    </Card>
                ) : null}

                <Card style={{ gap: 14 }}>
                    <T w="black" size={18} color={slate[900]}>
                        {page.formTitle}
                    </T>
                    {state === "sent" ? (
                        <Notice tone="green" icon={<CheckCircle2 size={18} color={palette.emerald700} />}>
                            Thanks! Your message has been sent. We’ll get back to you within 24 hours.
                        </Notice>
                    ) : null}
                    <Field label="Your Name" value={name} onChangeText={(v) => setForm({ ...form, name: v })} />
                    <Field label="Email" value={email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" />
                    <Field label="Mobile (optional)" value={form.mobile} onChangeText={(v) => setForm({ ...form, mobile: v.replace(/\D/g, "").slice(0, 10) })} keyboardType="number-pad" />
                    <ChipSelect label="Subject" options={page.subjects} value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} />
                    <Field label="Message" value={form.message} onChangeText={(v) => setForm({ ...form, message: v })} multiline maxLength={2000} placeholder="How can we help?" />
                    {state === "error" ? <Notice tone="red">Please fill your name, a valid email and a message, then try again.</Notice> : null}
                    <Btn full size="lg" title="Send Message" loading={state === "sending"} icon={<Send size={17} color="#fff" />} onPress={submit} />
                </Card>
            </Body>
        </Page>
    );
}
