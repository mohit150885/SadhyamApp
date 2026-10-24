import { useCallback, useRef, useState } from "react";
import { Keyboard, View, type TextInputInstance } from "react-native";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from "lucide-react-native";
import { auth } from "@/lib/firebase";
import { GOOGLE_ENABLED } from "@/lib/config";
import { useContent } from "@/hooks/useContent";
import { authErrorMessage, ensureProfile } from "@/providers/AuthProvider";
import { AuthShell, Divider, GoogleButton } from "@/components/auth";
import { goBack } from "@/components/Screen";
import { Btn, ChipSelect, Field, Notice, T, Tap } from "@/components/ui";
import { palette, slate, useTheme } from "@/lib/theme";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Form = { name: string; mobile: string; email: string; exam: string; password: string; confirm: string; terms: boolean };
type Errors = Partial<Record<keyof Form, string>>;

export default function SignupScreen() {
    const theme = useTheme();
    const { data: cfg } = useContent("auth");
    const { data: global } = useContent("global");
    const askMobile = cfg.signup.askMobile !== false;
    const askExam = cfg.signup.askExam !== false;
    const [form, setForm] = useState<Form>({ name: "", mobile: "", email: "", exam: "", password: "", confirm: "", terms: false });
    const [show, setShow] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const [serverError, setServerError] = useState("");
    const [busy, setBusy] = useState(false);
    const mobileRef = useRef<TextInputInstance>(null);
    const emailRef = useRef<TextInputInstance>(null);
    const passwordRef = useRef<TextInputInstance>(null);
    const confirmRef = useRef<TextInputInstance>(null);

    const left = useRef(false);
    const done = useCallback(() => {
        if (left.current) return;
        left.current = true;
        goBack("/");
    }, []);

    /** Updates a field and clears its error as the student fixes it. */
    const set = <K extends keyof Form>(k: K, v: Form[K]) => {
        setForm((f) => ({ ...f, [k]: v }));
        if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
        if (serverError) setServerError("");
    };

    const validate = (): Errors => {
        const e: Errors = {};
        if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters.";
        if (askMobile && !/^[6-9][0-9]{9}$/.test(form.mobile)) e.mobile = "Enter a valid 10-digit mobile number.";
        if (!EMAIL_RE.test(form.email.trim())) e.email = "Please enter a valid email address.";
        if (askExam && !form.exam) e.exam = "Please select a target exam.";
        if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
        else if (!/[A-Z]/.test(form.password)) e.password = "Include at least one uppercase letter.";
        else if (!/[a-z]/.test(form.password)) e.password = "Include at least one lowercase letter.";
        else if (!/[0-9]/.test(form.password)) e.password = "Include at least one number.";
        if (!form.confirm) e.confirm = "Please re-enter your password.";
        else if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
        if (!form.terms) e.terms = "Please accept the Terms & Conditions.";
        return e;
    };

    const submit = async () => {
        if (busy) return;
        Keyboard.dismiss();
        setServerError("");
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length) {
            setServerError("Please fix the highlighted fields.");
            return;
        }
        setBusy(true);
        try {
            const name = form.name.trim();
            const cred = await createUserWithEmailAndPassword(auth, form.email.trim().toLowerCase(), form.password);
            await updateProfile(cred.user, { displayName: name }).catch(() => undefined);
            await ensureProfile(cred.user, { name, mobile: askMobile ? form.mobile : "", exam: askExam ? form.exam : "" });
            done();
        } catch (err) {
            setServerError(authErrorMessage(err));
            setBusy(false);
        }
    };

    const strength = [form.password.length >= 8, /[A-Z]/.test(form.password), /[a-z]/.test(form.password), /[0-9]/.test(form.password)].filter(Boolean).length;

    return (
        <AuthShell title={cfg.signup.title} highlight={cfg.signup.highlight} subtitle={cfg.signup.subtitle}>
            {GOOGLE_ENABLED && cfg.showGoogle !== false ? (
                <>
                    <GoogleButton label={cfg.signup.googleText} onDone={done} onError={setServerError} disabled={busy} />
                    <Divider />
                </>
            ) : null}
            <View style={{ gap: 16 }}>
                <Field
                    label="Full Name"
                    icon={<UserRound size={18} color={slate[400]} />}
                    error={errors.name}
                    value={form.name}
                    onChangeText={(v) => set("name", v)}
                    placeholder="Your full name"
                    autoComplete="name"
                    autoCapitalize="words"
                    returnKeyType="next"
                    submitBehavior="submit"
                    onSubmitEditing={() => (askMobile ? mobileRef : emailRef).current?.focus()}
                />
                {askMobile ? (
                    <Field
                        ref={mobileRef}
                        label="Mobile Number"
                        icon={<Phone size={18} color={slate[400]} />}
                        error={errors.mobile}
                        value={form.mobile}
                        onChangeText={(v) => set("mobile", v.replace(/\D/g, "").slice(0, 10))}
                        placeholder="10-digit number"
                        keyboardType="phone-pad"
                        autoComplete="tel"
                        maxLength={10}
                        returnKeyType="next"
                        submitBehavior="submit"
                        onSubmitEditing={() => emailRef.current?.focus()}
                    />
                ) : null}
                {askExam ? <ChipSelect label="Target Exam" options={global.exams} value={form.exam} onChange={(v) => set("exam", v)} error={errors.exam} /> : null}
                <Field
                    ref={emailRef}
                    label="Email Address"
                    icon={<Mail size={18} color={slate[400]} />}
                    error={errors.email}
                    value={form.email}
                    onChangeText={(v) => set("email", v)}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    returnKeyType="next"
                    submitBehavior="submit"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                />
                <View>
                    <Field
                        ref={passwordRef}
                        label="Password"
                        icon={<LockKeyhole size={18} color={slate[400]} />}
                        error={errors.password}
                        value={form.password}
                        onChangeText={(v) => set("password", v)}
                        placeholder="Min 8 characters, A-Z, a-z and 0-9"
                        secureTextEntry={!show}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="new-password"
                        textContentType="newPassword"
                        returnKeyType="next"
                        submitBehavior="submit"
                        onSubmitEditing={() => confirmRef.current?.focus()}
                        right={
                            <Tap onPress={() => setShow((v) => !v)} hitSlop={10}>
                                {show ? <EyeOff size={18} color={slate[400]} /> : <Eye size={18} color={slate[400]} />}
                            </Tap>
                        }
                    />
                    {form.password ? (
                        <View style={{ flexDirection: "row", gap: 4, marginTop: 8 }}>
                            {[0, 1, 2, 3].map((i) => (
                                <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < strength ? (strength === 4 ? palette.emerald500 : strength >= 2 ? palette.amber500 : palette.red500) : slate[200] }} />
                            ))}
                        </View>
                    ) : null}
                </View>
                <Field
                    ref={confirmRef}
                    label="Confirm Password"
                    icon={<LockKeyhole size={18} color={slate[400]} />}
                    error={errors.confirm}
                    value={form.confirm}
                    onChangeText={(v) => set("confirm", v)}
                    placeholder="Re-enter password"
                    secureTextEntry={!show}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                />
                <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                    <Tap onPress={() => set("terms", !form.terms)} hitSlop={10} style={{ marginTop: 1 }}>
                        <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: errors.terms ? palette.red500 : form.terms ? theme.brand : slate[300], backgroundColor: form.terms ? theme.brand : "#fff", alignItems: "center", justifyContent: "center" }}>
                            {form.terms ? <Check size={14} color="#fff" strokeWidth={3} /> : null}
                        </View>
                    </Tap>
                    <T size={13} color={slate[600]} lh={1.5} style={{ flex: 1 }} onPress={() => set("terms", !form.terms)}>
                        I agree to the{" "}
                        <T w="bold" size={13} color={theme.brand} onPress={() => router.push("/legal/terms")}>
                            Terms & Conditions
                        </T>{" "}
                        and{" "}
                        <T w="bold" size={13} color={theme.brand} onPress={() => router.push("/legal/privacy")}>
                            Privacy Policy
                        </T>
                        .
                    </T>
                </View>
                {errors.terms ? (
                    <T w="medium" size={12} color={palette.red600} style={{ marginTop: -8 }}>
                        {errors.terms}
                    </T>
                ) : null}
                {serverError ? <Notice tone="red">{serverError}</Notice> : null}
                <Btn full size="lg" title={busy ? "Creating account…" : cfg.signup.buttonText} loading={busy} iconRight={!busy ? <ArrowRight size={18} color="#fff" /> : undefined} onPress={submit} />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 6, marginTop: 26 }}>
                <T size={14} color={slate[600]}>
                    {cfg.signup.loginPrompt}
                </T>
                <Tap onPress={() => router.replace("/login")} hitSlop={8}>
                    <T w="bold" size={14} color={theme.brand}>
                        {cfg.signup.loginLinkText}
                    </T>
                </Tap>
            </View>
        </AuthShell>
    );
}
