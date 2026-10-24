import Constants, { ExecutionEnvironment } from "expo-constants";
import { GoogleAuthProvider, signInWithCredential, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "./firebase";
import { GOOGLE_WEB_CLIENT_ID } from "./config";
import { ensureProfile } from "@/providers/AuthProvider";

/*
 * Native Google sign-in connected to Firebase Auth — the same Google provider
 * and the same Firebase user (uid) as the website's "Continue with Google".
 *
 *   Android account picker (@react-native-google-signin) → Google ID token
 *   → GoogleAuthProvider.credential(idToken) → signInWithCredential(auth)
 *
 * Needs EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (Firebase console → Authentication →
 * Sign-in method → Google → Web SDK configuration → Web client ID) and the app's
 * SHA-1 added to the Android app in Firebase. Native module → not in Expo Go;
 * use a development build (see README).
 */

export class GoogleSignInCancelled extends Error {}

type GoogleModule = typeof import("@react-native-google-signin/google-signin");

let mod: GoogleModule | null | undefined;
let configured = false;

export const IS_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/** Loads the native module lazily, so Expo Go (which doesn't include it) doesn't crash on start. */
function google(): GoogleModule | null {
    if (mod !== undefined) return mod;
    if (IS_EXPO_GO) return (mod = null);
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        mod = require("@react-native-google-signin/google-signin") as GoogleModule;
    } catch {
        mod = null;
    }
    return mod;
}

export function googleSignInAvailable() {
    return Boolean(GOOGLE_WEB_CLIENT_ID) && google() !== null;
}

export async function signInWithGoogle() {
    if (!GOOGLE_WEB_CLIENT_ID) throw new Error("Google sign-in is not configured. Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to .env.");
    const g = google();
    if (!g) {
        throw new Error(
            IS_EXPO_GO
                ? "Google sign-in needs the installed app build (it doesn't run inside Expo Go). Use email login here, or install a development build."
                : "Google sign-in is not available on this device."
        );
    }
    const { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } = g;
    if (!configured) {
        GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, offlineAccess: false });
        configured = true;
    }
    try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        // Always show the account picker (so students can switch accounts).
        await GoogleSignin.signOut().catch(() => undefined);
        const res = await GoogleSignin.signIn();
        if (!isSuccessResponse(res)) throw new GoogleSignInCancelled("Google sign-in was cancelled.");
        const idToken = res.data.idToken;
        if (!idToken) throw new Error("Google did not return an ID token. Check EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID and the SHA-1 in Firebase.");
        const cred = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
        await ensureProfile(cred.user);
        return cred.user;
    } catch (e) {
        if (e instanceof GoogleSignInCancelled) throw e;
        if (isErrorWithCode(e)) {
            if (e.code === statusCodes.SIGN_IN_CANCELLED) throw new GoogleSignInCancelled("Google sign-in was cancelled.");
            if (e.code === statusCodes.IN_PROGRESS) throw new Error("Google sign-in is already in progress.");
            if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) throw new Error("Google Play services are not available or need an update.");
            if (String(e.code) === "10" || /DEVELOPER_ERROR/i.test(String(e.message)))
                throw new Error("Google sign-in setup error (DEVELOPER_ERROR): add this app's SHA-1 fingerprint to the Android app in Firebase and use the Web client ID.");
        }
        throw e;
    }
}

/** Also clears the Google session so the next sign-in shows the account picker. */
export async function signOutEverywhere() {
    const g = google();
    if (g) await g.GoogleSignin.signOut().catch(() => undefined);
    await firebaseSignOut(auth);
}
