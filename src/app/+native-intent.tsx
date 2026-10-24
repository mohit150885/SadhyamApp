/*
 * The Google sign-in tab returns to the app via <scheme>://auth?code=…
 * expo-web-browser reads that link itself, so the router must not try
 * to open it as a screen. Every other link is handled normally.
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string | null {
    try {
        if (/(^|\/)auth(\?|#|$)/.test(path)) return null;
        return path;
    } catch {
        return path;
    }
}
