import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { auth, db } from "@/lib/firebase";
import type { UserProfile } from "@/lib/models";

type AuthState = {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({ user: null, profile: null, loading: true, logout: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubProfile: (() => void) | undefined;
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
            unsubProfile?.();
            unsubProfile = undefined;
            if (!u) {
                setProfile(null);
                return;
            }
            unsubProfile = onSnapshot(
                doc(db, "users", u.uid),
                (snap) => setProfile(snap.exists() ? ({ uid: u.uid, ...snap.data() } as UserProfile) : null),
                () => setProfile(null)
            );
        });
        return () => {
            unsub();
            unsubProfile?.();
        };
    }, []);

    const logout = async () => {
        try {
            // Also clears the Google session so the account picker shows next time.
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { signOutEverywhere } = require("@/lib/googleAuth") as typeof import("@/lib/googleAuth");
            await signOutEverywhere();
        } catch {
            await signOut(auth);
        }
    };

    return <AuthContext.Provider value={{ user, profile, loading, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}

export function authErrorMessage(error: unknown): string {
    if (error instanceof FirebaseError) {
        const map: Record<string, string> = {
            "auth/user-not-found": "No account found with this email. Please sign up.",
            "auth/wrong-password": "Incorrect password. Please try again.",
            "auth/invalid-credential": "Invalid email or password.",
            "auth/email-already-in-use": "This email is already registered. Please log in instead.",
            "auth/invalid-email": "The email address is invalid.",
            "auth/weak-password": "The password is too weak.",
            "auth/network-request-failed": "Network connection failed. Check your internet and try again.",
            "auth/too-many-requests": "Too many attempts. Please try again later.",
            "auth/operation-not-allowed": "This sign-in method is disabled in Firebase Authentication.",
            "auth/requires-recent-login": "Please log out and log in again, then retry.",
            "auth/missing-password": "Please enter your password.",
            "auth/missing-email": "Please enter your email address.",
            "auth/user-disabled": "This account has been disabled. Please contact support.",
            "auth/account-exists-with-different-credential": "This email is registered with a different sign-in method. Log in with email and password instead.",
            "auth/credential-already-in-use": "This Google account is already linked to another account.",
            "auth/invalid-api-key": "The app's Firebase configuration is invalid. Check the EXPO_PUBLIC_FIREBASE_* values in .env.",
            "auth/app-not-authorized": "This app is not authorised for this Firebase project. Check the Firebase settings in .env.",
            "auth/internal-error": "Something went wrong while signing in. Please try again.",
        };
        return map[error.code] || error.message.replace(/^Firebase:\s*/i, "").replace(/\s*\(auth\/[a-z-]+\)\.?$/i, "") || "Something went wrong. Please try again.";
    }
    return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

/** Creates users/{uid} only if it does not exist yet (same as the website). */
export async function ensureProfile(user: User, extra?: { name?: string; mobile?: string; exam?: string }) {
    const ref = doc(db, "users", user.uid);
    try {
        const snap = await getDoc(ref);
        if (snap.exists()) return;
        await setDoc(ref, {
            uid: user.uid,
            name: extra?.name || user.displayName || "Student",
            email: user.email || "",
            mobile: extra?.mobile || "",
            exam: extra?.exam || "",
            photoURL: user.photoURL || "",
            createdAt: serverTimestamp(),
        });
    } catch (err) {
        console.warn("Could not save the student profile:", err);
    }
}
