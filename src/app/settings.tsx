import { useState } from "react";
import { Alert, View } from "react-native";
import { router } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification, updatePassword } from "firebase/auth";
import { KeyRound, LogOut, ShieldCheck, Trash2 } from "lucide-react-native";
import { db } from "@/lib/firebase";
import { authErrorMessage, useAuth } from "@/providers/AuthProvider";
import { Body, Header, Page } from "@/components/Screen";
import { RequireLogin } from "@/components/RequireLogin";
import { Btn, Card, Field, Notice, T } from "@/components/ui";
import { palette, slate, useTheme } from "@/lib/theme";

export default function SettingsScreen() {
    return (
        <Page>
            <Header title="Settings" subtitle="Sign-in and security" />
            <RequireLogin>
                <SettingsBody />
            </RequireLogin>
        </Page>
    );
}

function Title({ icon, children }: { icon: React.ReactNode; children: string }) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            {icon}
            <T w="black" size={16} color={slate[900]}>
                {children}
            </T>
        </View>
    );
}

function SettingsBody() {
    const theme = useTheme();
    const { user, profile, logout } = useAuth();
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [busy, setBusy] = useState(false);
    const [verifySent, setVerifySent] = useState(false);
    const [delPass, setDelPass] = useState("");
    const [delState, setDelState] = useState<{ busy: boolean; error: string }>({ busy: false, error: "" });
    const hasPassword = user?.providerData.some((p) => p.providerId === "password");

    const changePassword = async () => {
        if (!user?.email) return;
        setMsg(null);
        if (next.length < 8) return setMsg({ ok: false, text: "New password must be at least 8 characters." });
        setBusy(true);
        try {
            await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, current));
            await updatePassword(user, next);
            setMsg({ ok: true, text: "Password updated." });
            setCurrent("");
            setNext("");
        } catch (err) {
            setMsg({ ok: false, text: authErrorMessage(err) });
        } finally {
            setBusy(false);
        }
    };

    // Google Play requires in-app account deletion. The sign-in account is deleted here;
    // a request is also filed so the team removes the profile and order records.
    const deleteAccount = () => {
        if (!user) return;
        Alert.alert("Delete your account?", "This permanently deletes your sign-in. You will lose access to everything you bought with this account. This cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    setDelState({ busy: true, error: "" });
                    try {
                        if (hasPassword && user.email) await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, delPass));
                        await addDoc(collection(db, "support_queries"), {
                            name: (profile?.name || user.displayName || "Student").slice(0, 80),
                            email: (user.email || "").slice(0, 120),
                            mobile: (profile?.mobile || "").slice(0, 10),
                            subject: "Account deletion",
                            message: `Account deletion requested from the Android app. UID: ${user.uid}. Please delete this student's profile and personal data.`,
                            userId: user.uid,
                            status: "open",
                            createdAt: serverTimestamp(),
                        }).catch(() => undefined);
                        await deleteUser(user);
                        router.replace("/");
                    } catch (err) {
                        setDelState({ busy: false, error: authErrorMessage(err) });
                    }
                },
            },
        ]);
    };

    return (
        <Body contentStyle={{ gap: 14 }}>
            <Card>
                <Title icon={<ShieldCheck size={18} color={theme.brand} />}>Email</Title>
                <T size={14} color={slate[600]}>
                    {user?.email} —{" "}
                    <T w="bold" size={14} color={user?.emailVerified ? palette.emerald600 : palette.amber500}>
                        {user?.emailVerified ? "verified" : "not verified"}
                    </T>
                </T>
                {!user?.emailVerified ? (
                    <Btn
                        size="sm"
                        variant="outline"
                        style={{ marginTop: 12 }}
                        title={verifySent ? "Verification email sent" : "Send verification email"}
                        disabled={verifySent}
                        onPress={async () => {
                            if (user) {
                                await sendEmailVerification(user).catch(() => undefined);
                                setVerifySent(true);
                            }
                        }}
                    />
                ) : null}
            </Card>

            {hasPassword ? (
                <Card style={{ gap: 12 }}>
                    <Title icon={<KeyRound size={18} color={theme.brand} />}>Change Password</Title>
                    <Field label="Current password" secureTextEntry value={current} onChangeText={setCurrent} autoComplete="current-password" />
                    <Field label="New password" secureTextEntry value={next} onChangeText={setNext} placeholder="Min 8 characters" autoComplete="new-password" />
                    {msg ? <Notice tone={msg.ok ? "green" : "red"}>{msg.text}</Notice> : null}
                    <Btn title="Update Password" loading={busy} onPress={changePassword} />
                </Card>
            ) : null}

            <Card style={{ gap: 12 }}>
                <Title icon={<LogOut size={18} color={theme.brand} />}>Session</Title>
                <Btn variant="danger" title="Sign out of this device" icon={<LogOut size={16} color={palette.red600} />} onPress={() => void logout().then(() => router.replace("/"))} />
            </Card>

            <Card style={{ gap: 12, borderColor: "#fecaca" }}>
                <Title icon={<Trash2 size={18} color={palette.red600} />}>Delete Account</Title>
                <T size={13} color={slate[600]} lh={1.5}>
                    Permanently delete your account and request removal of your personal data. Purchases on this account will no longer be accessible.
                </T>
                {hasPassword ? <Field label="Confirm with your password" secureTextEntry value={delPass} onChangeText={setDelPass} /> : null}
                {delState.error ? <Notice tone="red">{delState.error}</Notice> : null}
                <Btn variant="danger" title="Delete my account" loading={delState.busy} disabled={hasPassword ? !delPass : false} icon={<Trash2 size={16} color={palette.red600} />} onPress={deleteAccount} />
            </Card>
        </Body>
    );
}
