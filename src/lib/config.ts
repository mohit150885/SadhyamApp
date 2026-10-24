// Values from .env (EXPO_PUBLIC_* are inlined into the bundle at build time).

const trimSlash = (s: string) => s.replace(/\/+$/, "");

export const WEBSITE_URL: string = trimSlash(process.env.EXPO_PUBLIC_WEBSITE_URL || "https://www.sadhyamias.com");
export const APP_NAME: string = process.env.EXPO_PUBLIC_APP_NAME || "SadhyamIAS";
export const APP_TAGLINE: string = process.env.EXPO_PUBLIC_APP_TAGLINE || "Prepare. Practice. Perform.";
export const PURCHASE_MODE: "external" | "none" = process.env.EXPO_PUBLIC_PURCHASE_MODE === "none" ? "none" : "external";

/** Firebase's Google "Web client ID" — native Google sign-in uses it to get a token Firebase accepts. */
export const GOOGLE_WEB_CLIENT_ID: string = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "";
/** Shows "Continue with Google" when the Web client ID is set. */
export const GOOGLE_ENABLED: boolean = Boolean(GOOGLE_WEB_CLIENT_ID);

export const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/** Website-relative paths ("/banner1.png", "/api/media/x") become absolute URLs on the website. */
export function absoluteUrl(src?: string | null): string {
    if (!src) return "";
    const s = String(src).trim();
    if (!s) return "";
    if (/^(https?:|data:|file:|content:)/i.test(s)) return s;
    if (s.startsWith("//")) return `https:${s}`;
    return `${WEBSITE_URL}${s.startsWith("/") ? "" : "/"}${s}`;
}

export function websiteLink(path: string): string {
    return `${WEBSITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
