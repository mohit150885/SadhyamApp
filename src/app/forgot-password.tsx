import { useState } from "react";
import { View } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react-native";
import { auth } from "@/lib/firebase";
import { useContent } from "@/hooks/useContent";
import { authErrorMessage } from "@/providers/AuthProvider";
import { AuthShell } from "@/components/auth";
import { goBack } from "@/components/Screen";
import { Btn, Field, Notice } from "@/components/ui";
import { palette, slate } from "@/lib/theme";

export default function ForgotPasswordScreen() {
    const { data: cfg } = useContent("auth");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

    const submit = async () => {
        setError("");
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            setError("Please enter a valid email address.");
            return;
        }
        setState("sending");
        try {
            await sendPasswordResetEmail(auth, email.trim());
        } catch (err) {
            // Same message for unknown emails, so accounts can't be discovered.
            const msg = authErrorMessage(err);
            if (!/No account/.test(msg)) {
                setError(msg);
                setState("idle");
                return;
            }
        }
        setState("sent");
    };

    return (
        <AuthShell title={cfg.forgot.title} highlight={cfg.forgot.highlight} subtitle={cfg.forgot.subtitle}>
            <View style={{ gap: 16 }}>
                {state === "sent" ? (
                    <>
                        <Notice tone="green" icon={<CheckCircle2 size={18} color={palette.emerald700} />}>
                            {cfg.forgot.successText}
                        </Notice>
                        <Btn full size="lg" title="Back to login" onPress={() => goBack("/login")} />
                    </>
                ) : (
                    <>
                        <Field label="Email Address" icon={<Mail size={18} color={slate[400]} />} error={error} value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" returnKeyType="send" onSubmitEditing={submit} />
                        <Btn full size="lg" title={cfg.forgot.buttonText} loading={state === "sending"} iconRight={<ArrowRight size={18} color="#fff" />} onPress={submit} />
                    </>
                )}
            </View>
        </AuthShell>
    );
}
