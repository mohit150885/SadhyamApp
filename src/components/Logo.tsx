import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { View } from "react-native";
import { useContent } from "@/hooks/useContent";
import { APP_NAME } from "@/lib/config";
import { useTheme } from "@/lib/theme";
import { SmartImage, T } from "./ui";

export const LOGO_S =
    "M41.5 21.5c-2-2.7-5.4-4.2-9.6-4.2-6.3 0-10.6 3.4-10.6 8.4 0 4.6 3.3 6.7 9.3 8l2.4.5c3.4.7 4.7 1.6 4.7 3.3 0 2-2.1 3.4-5.4 3.4-3.2 0-5.8-1.4-7.4-3.8l-4.4 3.3c2.3 3.5 6.6 5.5 11.7 5.5 6.8 0 11.4-3.6 11.4-8.8 0-4.5-3-6.7-9.4-8l-2.4-.5c-3.2-.7-4.5-1.5-4.5-3.1 0-1.9 1.9-3.2 4.8-3.2 2.6 0 4.6 1 5.9 2.7z";

/** The website's logo mark (orange rounded square with the white S). */
export function LogoMark({ size = 40, color }: { size?: number; color?: string }) {
    const theme = useTheme();
    const c = color ?? theme.brand;
    return (
        <Svg width={size} height={size} viewBox="0 0 64 64">
            <Defs>
                <LinearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor={c} stopOpacity={0.85} />
                    <Stop offset="1" stopColor={c} />
                </LinearGradient>
            </Defs>
            <Rect width="64" height="64" rx="14" fill="url(#lg)" />
            <Path d={LOGO_S} fill="#fff" />
        </Svg>
    );
}

/** Logo + site name, driven by Website Settings (logo image / show name) like the website header. */
export function Brand({ dark, size = 34 }: { dark?: boolean; size?: number }) {
    const { data } = useContent("global");
    const showName = data.showSiteName !== false;
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
            {data.logoImage ? (
                <SmartImage src={data.logoImage} contentFit="contain" style={{ height: size, width: size * 1.6, maxWidth: 140, borderRadius: 8 }} />
            ) : (
                <LogoMark size={size} />
            )}
            {showName ? (
                <T w="black" size={21} color={dark ? "#fff" : "#0f172a"} style={{ letterSpacing: -0.5 }}>
                    {data.siteName || APP_NAME}
                </T>
            ) : null}
        </View>
    );
}
