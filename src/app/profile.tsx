import { useState } from "react";
import { View } from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { CheckCircle2, MapPin, Phone, UserRound } from "lucide-react-native";
import { db } from "@/lib/firebase";
import { useContent } from "@/hooks/useContent";
import { useAuth } from "@/providers/AuthProvider";
import { Body, Header, Page } from "@/components/Screen";
import { RequireLogin } from "@/components/RequireLogin";
import { Btn, Card, ChipSelect, Field, Notice } from "@/components/ui";
import { palette, slate } from "@/lib/theme";

export default function ProfileScreen() {
    const { user, profile } = useAuth();
    const key = JSON.stringify([user?.uid, profile?.name, profile?.mobile, profile?.exam, profile?.city]);
    return (
        <Page>
            <Header title="My Profile" subtitle="Keep your details up to date" />
            <RequireLogin>
                <ProfileForm key={key} />
            </RequireLogin>
        </Page>
    );
}

function ProfileForm() {
    const { user, profile } = useAuth();
    const { data: global } = useContent("global");
    const [form, setForm] = useState(() => ({ name: profile?.name || user?.displayName || "", mobile: profile?.mobile || "", exam: profile?.exam || "", city: profile?.city || "" }));
    const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

    const save = async () => {
        if (!user) return;
        setState("saving");
        try {
            const data = { uid: user.uid, email: user.email || "", name: form.name.trim().slice(0, 80), mobile: form.mobile.replace(/\D/g, "").slice(0, 10), exam: form.exam, city: form.city.trim().slice(0, 60) };
            await setDoc(doc(db, "users", user.uid), data, { merge: true });
            if (data.name && data.name !== user.displayName) await updateProfile(user, { displayName: data.name });
            setState("saved");
        } catch {
            setState("error");
        }
    };

    return (
        <Body>
            <Card style={{ gap: 16 }}>
                <Field label="Full Name" icon={<UserRound size={18} color={slate[400]} />} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
                <Field label="Email" value={user?.email || ""} editable={false} />
                <Field label="Mobile Number" icon={<Phone size={18} color={slate[400]} />} keyboardType="number-pad" value={form.mobile} onChangeText={(v) => setForm({ ...form, mobile: v.replace(/\D/g, "").slice(0, 10) })} />
                <ChipSelect label="Target Exam" options={global.exams} value={form.exam} onChange={(v) => setForm({ ...form, exam: v })} />
                <Field label="City" icon={<MapPin size={18} color={slate[400]} />} value={form.city} onChangeText={(v) => setForm({ ...form, city: v })} />
                {state === "saved" ? (
                    <Notice tone="green" icon={<CheckCircle2 size={18} color={palette.emerald700} />}>
                        Saved
                    </Notice>
                ) : null}
                {state === "error" ? <Notice tone="red">Could not save. Check your connection.</Notice> : null}
                <View>
                    <Btn full size="lg" title="Save Changes" loading={state === "saving"} onPress={save} />
                </View>
            </Card>
        </Body>
    );
}
