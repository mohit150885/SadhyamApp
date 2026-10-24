import { Linking } from "react-native";
import { router } from "expo-router";
import { websiteLink } from "./config";

/*
 * Links in the admin-managed content point at website pages ("/courses",
 * "/test-series/upsc-prelims", "/courses?exam=UPSC" …). This maps them to
 * the matching app screen. Cart / checkout links go to the catalog instead,
 * because purchases are never made inside the app.
 */
/** Minimal query parser (URLSearchParams is incomplete on some React Native versions). */
function queryParam(query: string, key: string): string | null {
    for (const part of query.split("&")) {
        const [k, v = ""] = part.split("=");
        if (decodeURIComponent(k) === key) return decodeURIComponent(v.replace(/\+/g, " "));
    }
    return null;
}

export function appRouteFor(href: string): string | null {
    if (!href) return null;
    if (/^(https?:|mailto:|tel:|whatsapp:)/i.test(href)) return null;
    const [rawPath, query = ""] = href.split("?");
    const path = rawPath.replace(/\/+$/, "") || "/";
    const exam = queryParam(query, "exam");
    const withExam = (kind: string) => `/explore?kind=${kind}${exam ? `&exam=${encodeURIComponent(exam)}` : ""}`;
    const seg = path.split("/").filter((s) => s);
    const id = seg[1] ? encodeURIComponent(decodeURIComponent(seg[1])) : "";

    switch (seg[0] ?? "") {
        case "":
            return "/";
        case "courses":
            return id ? `/course/${id}` : withExam("course");
        case "test-series":
            return id ? `/test-series/${id}` : withExam("test");
        case "tests":
            return withExam("test");
        case "study-material":
            return id ? `/material/${id}` : withExam("material");
        case "cart":
            return withExam("course");
        case "faculty":
            return id ? `/faculty/${id}` : "/faculty";
        case "results":
            return "/results";
        case "about":
            return "/about";
        case "contact":
            return "/contact";
        case "help":
        case "help-center":
            return "/help";
        case "faqs":
            return "/faqs";
        case "refund-policy":
            return "/legal/refund";
        case "terms-and-conditions":
            return "/legal/terms";
        case "privacy-policy":
            return "/legal/privacy";
        case "login":
            return "/login";
        case "signup":
            return "/signup";
        case "forgot-password":
            return "/forgot-password";
        case "my-courses":
            return "/library?tab=course";
        case "my-tests":
            return id ? `/series/${id}` : "/library?tab=test";
        case "my-materials":
            return "/library?tab=material";
        case "orders":
            return id ? `/orders/${id}` : "/orders";
        case "profile":
            return "/profile";
        case "settings":
            return "/settings";
        case "search":
            return "/search";
        case "attempts":
            return id ? (seg[2] === "solutions" ? `/solutions/${id}` : `/result/${id}`) : null;
        case "test":
            return id ? `/test/${id}` : null;
        default:
            return null;
    }
}

/** Opens an admin-managed link: an app screen when one matches, otherwise the browser. */
export function openLink(href?: string) {
    if (!href) return;
    const route = appRouteFor(href);
    if (route) {
        router.push(route as never);
        return;
    }
    const url = /^[a-z]+:/i.test(href) ? href : websiteLink(href);
    Linking.openURL(url).catch(() => undefined);
}
