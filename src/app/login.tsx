import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, View, type TextInputInstance } from "react-native";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react-native";
import { auth } from "@/lib/firebase";
import { GOOGLE_ENABLED } from "@/lib/config";
import { useContent } from "@/hooks/useContent";
import { authErrorMessage, useAuth } from "@/providers/AuthProvider";
import { AuthShell, Divider, GoogleButton } from "@/components/auth";
import { goBack } from "@/components/Screen";
import { Btn, Field, Notice, T, Tap } from "@/components/ui";
import { slate, useTheme } from "@/lib/theme";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
    const theme = useTheme();
    const { data: cfg } = useContent("auth");
    const { user } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [serverError, setServerError] = useState("");
    const [busy, setBusy] = useState(false);
    const passwordRef = useRef<TextInputInstance>(null);

    // Leave exactly once, as soon as someone is signed in (email, Google, or already signed in).
    const left = useRef(false);
    const done = useCallback(() => {
        if (left.current) return;
        left.current = true;
        goBack("/");
    }, []);
    useEffect(() => {
        if (user && !busy) done();
    }, [user, busy, done]);

    const submit = async () => {
        if (busy) return;
        Keyboard.dismiss();
        setServerError("");
        const e: typeof errors = {};
        const mail = email.trim().toLowerCase();
        if (!EMAIL_RE.test(mail)) e.email = "Please enter a valid email address.";
        if (!password) e.password = "Password is required.";
        setErrors(e);
        if (e.email || e.password) return;
        setBusy(true);
        try {
            await signInWithEmailAndPassword(auth, mail, password);
            // Navigation happens in the effect above once the auth state updates.
        } catch (err) {
            setServerError(authErrorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthShell title={cfg.login.title} highlight={cfg.login.highlight} subtitle={cfg.login.subtitle}>
            <View style={{ gap: 16 }}>
                <Field
                    label="Email Address"
                    icon={<Mail size={18} color={slate[400]} />}
                    error={errors.email}
                    value={email}
                    onChangeText={(v) => {
                        setEmail(v);
                        if (errors.email) setErrors((x) => ({ ...x, email: undefined }));
                        if (serverError) setServerError("");
                    }}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="next"
                    submitBehavior="submit"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                />
                <Field
                    ref={passwordRef}
                    label="Password"
                    icon={<LockKeyhole size={18} color={slate[400]} />}
                    error={errors.password}
                    value={password}
                    onChangeText={(v) => {
                        setPassword(v);
                        if (errors.password) setErrors((x) => ({ ...x, password: undefined }));
                        if (serverError) setServerError("");
                    }}
                    placeholder="Enter your password"
                    secureTextEntry={!show}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="current-password"
                    textContentType="password"
                    returnKeyType="go"
                    onSubmitEditing={submit}
                    right={
                        <Tap onPress={() => setShow((v) => !v)} hitSlop={10}>
                            {show ? <EyeOff size={18} color={slate[400]} /> : <Eye size={18} color={slate[400]} />}
                        </Tap>
                    }
                />
                <Tap onPress={() => router.push("/forgot-password")} style={{ alignSelf: "flex-end" }} hitSlop={8}>
                    <T w="bold" size={13} color={theme.brand}>
                        {cfg.login.forgotText}
                    </T>
                </Tap>
                {serverError ? <Notice tone="red">{serverError}</Notice> : null}
                <Btn full size="lg" title={busy ? "Logging in…" : cfg.login.buttonText} loading={busy} iconRight={!busy ? <ArrowRight size={18} color="#fff" /> : undefined} onPress={submit} />
            </View>
            {GOOGLE_ENABLED && cfg.showGoogle !== false ? (
                <>
                    <Divider />
                    <GoogleButton label={cfg.login.googleText} onDone={done} onError={setServerError} disabled={busy} />
                </>
            ) : null}
            <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 6, marginTop: 26 }}>
                <T size={14} color={slate[600]}>
                    {cfg.login.signupPrompt}
                </T>
                <Tap onPress={() => router.replace("/signup")} hitSlop={8}>
                    <T w="bold" size={14} color={theme.brand}>
                        {cfg.login.signupLinkText}
                    </T>
                </Tap>
            </View>
        </AuthShell>
    );
}
