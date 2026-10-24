import { useState, type ReactNode, type Ref } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    type PressableProps,
    type StyleProp,
    type TextInputInstance,
    type TextInputProps,
    type TextProps,
    type TextStyle,
    type ViewStyle,
} from "react-native";
import { Image, type ImageContentFit } from "expo-image";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { ChevronDown, ImageOff, Star } from "lucide-react-native";
import { absoluteUrl } from "@/lib/config";
import { FONT, palette, shadow, slate, useTheme, type Weight } from "@/lib/theme";
import { discountPercent, formatINR } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */

export function T({
    w = "regular",
    size = 14,
    color = slate[800],
    style,
    lh,
    center,
    children,
    ...rest
}: TextProps & { w?: Weight; size?: number; color?: string; lh?: number; center?: boolean; style?: StyleProp<TextStyle> }) {
    return (
        <Text
            {...rest}
            style={[{ fontFamily: FONT[w], fontSize: size, color, lineHeight: lh ? size * lh : undefined }, center && { textAlign: "center" }, style]}
        >
            {children}
        </Text>
    );
}

/** Highlights the last word of a heading in the brand colour, like the website. */
export function AccentTitle({ text, size = 24, color = slate[900], w = "black", center }: { text: string; size?: number; color?: string; w?: Weight; center?: boolean }) {
    const theme = useTheme();
    const words = (text || "").trim().split(/\s+/);
    const head = words.slice(0, -1).join(" ");
    const tail = words.slice(-1).join(" ");
    return (
        <T w={w} size={size} color={color} lh={1.18} center={center} style={{ letterSpacing: -0.4 }}>
            {head ? `${head} ` : ""}
            <T w={w} size={size} color={theme.brand}>
                {tail}
            </T>
        </T>
    );
}

/* ------------------------------------------------------------------ */
/* Pressables                                                          */
/* ------------------------------------------------------------------ */

const APressable = Animated.createAnimatedComponent(Pressable);

/** Pressable that gently shrinks when touched. */
export function Tap({ style, children, haptic = false, scaleTo = 0.97, onPress, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; haptic?: boolean; scaleTo?: number; children?: ReactNode }) {
    const s = useSharedValue(1);
    const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
    return (
        <APressable
            {...rest}
            onPressIn={(e) => {
                s.set(withTiming(scaleTo, { duration: 90 }));
                rest.onPressIn?.(e);
            }}
            onPressOut={(e) => {
                s.set(withSpring(1, { damping: 14, stiffness: 260 }));
                rest.onPressOut?.(e);
            }}
            onPress={(e) => {
                if (haptic) Haptics.selectionAsync().catch(() => undefined);
                onPress?.(e);
            }}
            style={[style, a]}
        >
            {children}
        </APressable>
    );
}

type BtnVariant = "primary" | "outline" | "ghost" | "light" | "glass" | "dark" | "success" | "danger" | "soft";

export function Btn({
    title,
    onPress,
    variant = "primary",
    size = "md",
    icon,
    iconRight,
    loading,
    disabled,
    full,
    style,
    fg,
}: {
    title: string;
    /** Text colour override. */
    fg?: string;
    onPress?: () => void;
    variant?: BtnVariant;
    size?: "sm" | "md" | "lg";
    icon?: ReactNode;
    iconRight?: ReactNode;
    loading?: boolean;
    disabled?: boolean;
    full?: boolean;
    style?: StyleProp<ViewStyle>;
}) {
    const theme = useTheme();
    const h = size === "sm" ? 40 : size === "lg" ? 56 : 48;
    const map: Record<BtnVariant, { bg: string; fg: string; border?: string }> = {
        primary: { bg: theme.brand, fg: "#fff" },
        outline: { bg: "transparent", fg: theme.brand, border: theme.brand },
        ghost: { bg: "transparent", fg: slate[600] },
        light: { bg: "#fff", fg: slate[900] },
        glass: { bg: "rgba(255,255,255,0.12)", fg: "#fff", border: "rgba(255,255,255,0.25)" },
        dark: { bg: theme.navy, fg: "#fff" },
        success: { bg: palette.emerald600, fg: "#fff" },
        danger: { bg: palette.red50, fg: palette.red600 },
        soft: { bg: theme.brand50, fg: theme.brand },
    };
    const v = map[variant];
    const off = disabled || loading;
    return (
        <Tap
            haptic
            disabled={off}
            onPress={onPress}
            style={[
                {
                    height: h,
                    paddingHorizontal: size === "sm" ? 14 : 22,
                    borderRadius: 12,
                    backgroundColor: v.bg,
                    borderWidth: v.border ? (variant === "glass" ? 1 : 2) : 0,
                    borderColor: v.border,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    opacity: off ? 0.6 : 1,
                    alignSelf: full ? "stretch" : "flex-start",
                },
                variant === "primary" && { ...shadow.md, shadowColor: theme.brand, shadowOpacity: 0.3 },
                style,
            ]}
        >
            {loading ? <ActivityIndicator size="small" color={v.fg} /> : icon}
            <T w="bold" size={size === "sm" ? 14 : 15} color={fg ?? v.fg} numberOfLines={1}>
                {title}
            </T>
            {iconRight}
        </Tap>
    );
}

/* ------------------------------------------------------------------ */
/* Images                                                              */
/* ------------------------------------------------------------------ */

export function SmartImage({
    src,
    style,
    contentFit = "cover",
    contentPosition,
    headers,
    transition = 250,
    quiet,
}: {
    /** URL (absolute or website-relative) or a bundled image (require(...)). */
    src?: string | number | object | null;
    style?: StyleProp<ViewStyle>;
    contentFit?: ImageContentFit;
    contentPosition?: "top" | "center";
    headers?: Record<string, string>;
    transition?: number;
    /** Render nothing (instead of a placeholder icon) when the image is missing. */
    quiet?: boolean;
}) {
    const [failed, setFailed] = useState(false);
    const bundled = src !== null && (typeof src === "number" || typeof src === "object");
    const uri = typeof src === "string" ? absoluteUrl(src) : "";
    if ((!bundled && !uri) || failed) {
        if (quiet) return null;
        return (
            <View style={[style, { backgroundColor: slate[100], alignItems: "center", justifyContent: "center" }]}>
                <ImageOff size={22} color={slate[400]} />
            </View>
        );
    }
    return (
        <Image
            source={bundled ? (src as number) : { uri, headers }}
            style={style as never}
            contentFit={contentFit}
            contentPosition={contentPosition}
            transition={transition}
            cachePolicy="memory-disk"
            onError={() => setFailed(true)}
        />
    );
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

export function Badge({ children, style, color }: { children: ReactNode; style?: StyleProp<ViewStyle>; color?: string }) {
    const theme = useTheme();
    return (
        <View style={[{ backgroundColor: color ?? theme.brand, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" }, style]}>
            <T w="extrabold" size={10} color="#fff" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                {children}
            </T>
        </View>
    );
}

export function Tag({ children, small }: { children: ReactNode; small?: boolean }) {
    return (
        <View style={{ borderWidth: 1, borderColor: slate[200], backgroundColor: slate[50], borderRadius: 6, paddingHorizontal: small ? 6 : 8, paddingVertical: 2 }}>
            <T w="semibold" size={small ? 10 : 11} color={slate[600]}>
                {children}
            </T>
        </View>
    );
}

export function Rating({ value, reviews }: { value: number | string; reviews?: string }) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Star size={14} color={palette.amber400} fill={palette.amber400} />
            <T w="extrabold" size={13} color={slate[800]}>
                {value}
            </T>
            {reviews ? (
                <T size={13} color={slate[500]}>
                    ({reviews})
                </T>
            ) : null}
        </View>
    );
}

export function Price({ price, oldPrice, large }: { price: number; oldPrice?: number; large?: boolean }) {
    const off = discountPercent(price, oldPrice ?? 0);
    return (
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
            <T w="black" size={large ? 30 : 21} color={slate[900]} style={{ lineHeight: large ? 32 : 23 }}>
                {price > 0 ? formatINR(price) : "Free"}
            </T>
            {oldPrice && oldPrice > price ? (
                <T w="medium" size={13} color={slate[400]} style={{ textDecorationLine: "line-through", marginBottom: 2 }}>
                    {formatINR(oldPrice)}
                </T>
            ) : null}
            {off > 0 ? (
                <View style={{ marginLeft: "auto", backgroundColor: palette.emerald50, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 }}>
                    <T w="black" size={11} color={palette.emerald600}>
                        {off}% OFF
                    </T>
                </View>
            ) : null}
        </View>
    );
}

export function Card({ children, style, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
    return <View style={[styles.card, padded && { padding: 18 }, style]}>{children}</View>;
}

export function SectionHeading({
    title,
    description,
    action,
    onAction,
    accent = true,
    dark,
    center,
}: {
    title: string;
    description?: string;
    action?: string;
    onAction?: () => void;
    accent?: boolean;
    dark?: boolean;
    center?: boolean;
}) {
    const theme = useTheme();
    return (
        <View style={{ marginBottom: 18, flexDirection: center ? "column" : "row", alignItems: center ? "center" : "flex-end", gap: 12 }}>
            <View style={{ flex: center ? undefined : 1 }}>
                {accent ? (
                    <AccentTitle text={title} size={23} color={dark ? "#fff" : slate[900]} center={center} />
                ) : (
                    <T w="black" size={23} color={dark ? "#fff" : slate[900]} lh={1.2} center={center} style={{ letterSpacing: -0.4 }}>
                        {title}
                    </T>
                )}
                {description ? (
                    <T size={14} color={dark ? "rgba(255,255,255,0.7)" : slate[500]} lh={1.45} center={center} style={{ marginTop: 5 }}>
                        {description}
                    </T>
                ) : null}
            </View>
            {action && onAction && !center ? (
                <Tap onPress={onAction} hitSlop={10} style={{ paddingBottom: 2 }}>
                    <T w="bold" size={13} color={theme.brand}>
                        {action} →
                    </T>
                </Tap>
            ) : null}
        </View>
    );
}

export function Loader({ label = "Loading…", full = true }: { label?: string; full?: boolean }) {
    const theme = useTheme();
    return (
        <View style={[{ alignItems: "center", justifyContent: "center", gap: 14, padding: 30 }, full && { flex: 1, minHeight: 300 }]}>
            <ActivityIndicator size="large" color={theme.brand} />
            <T w="semibold" size={13} color={slate[500]}>
                {label}
            </T>
        </View>
    );
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
    return (
        <View style={styles.empty}>
            {icon}
            <T w="black" size={18} color={slate[800]} center style={{ marginTop: icon ? 14 : 0 }}>
                {title}
            </T>
            {description ? (
                <T size={14} color={slate[500]} center lh={1.5} style={{ marginTop: 6 }}>
                    {description}
                </T>
            ) : null}
            {action ? <View style={{ marginTop: 18 }}>{action}</View> : null}
        </View>
    );
}

export function Notice({ tone = "amber", icon, children, style }: { tone?: "amber" | "green" | "red" | "blue"; icon?: ReactNode; children: ReactNode; style?: StyleProp<ViewStyle> }) {
    const c = {
        amber: { bg: palette.amber50, border: palette.amber200, fg: palette.amber800 },
        green: { bg: palette.emerald50, border: palette.emerald100, fg: palette.emerald800 },
        red: { bg: palette.red50, border: "#fecaca", fg: palette.red700 },
        blue: { bg: palette.blue50, border: "#bfdbfe", fg: palette.blue700 },
    }[tone];
    return (
        <View style={[{ flexDirection: "row", gap: 10, alignItems: "flex-start", backgroundColor: c.bg, borderColor: c.border, borderWidth: 1, borderRadius: 12, padding: 13 }, style]}>
            {icon}
            <T w="semibold" size={13} color={c.fg} lh={1.45} style={{ flex: 1 }}>
                {children}
            </T>
        </View>
    );
}

/* ------------------------------------------------------------------ */
/* Forms                                                               */
/* ------------------------------------------------------------------ */

export function Field({ label, icon, error, right, ref, ...input }: TextInputProps & { label: string; icon?: ReactNode; error?: string; right?: ReactNode; ref?: Ref<TextInputInstance> }) {
    const theme = useTheme();
    const [focus, setFocus] = useState(false);
    return (
        <View>
            <T w="bold" size={13} color={slate[700]} style={{ marginBottom: 6 }}>
                {label}
            </T>
            <View
                style={[
                    styles.input,
                    { borderColor: error ? "#f87171" : focus ? theme.brand : slate[300] },
                    focus && { shadowColor: theme.brand, shadowOpacity: 0.15, shadowRadius: 6, elevation: 0 },
                    input.editable === false && { backgroundColor: slate[50] },
                ]}
            >
                {icon}
                <TextInput
                    ref={ref}
                    placeholderTextColor={slate[400]}
                    {...input}
                    onFocus={(e) => {
                        setFocus(true);
                        input.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setFocus(false);
                        input.onBlur?.(e);
                    }}
                    style={[{ flex: 1, fontFamily: FONT.medium, fontSize: 15, color: input.editable === false ? slate[500] : slate[900], paddingVertical: 0 }, input.multiline && { minHeight: 100, textAlignVertical: "top", paddingTop: 12 }]}
                />
                {right}
            </View>
            {error ? (
                <T w="medium" size={12} color={palette.red600} style={{ marginTop: 4 }}>
                    {error}
                </T>
            ) : null}
        </View>
    );
}

/** A row of choice chips (used instead of <select>). */
export function ChipSelect({ label, options, value, onChange, error }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; error?: string }) {
    const theme = useTheme();
    return (
        <View>
            <T w="bold" size={13} color={slate[700]} style={{ marginBottom: 8 }}>
                {label}
            </T>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {options.map((o) => {
                    const on = o === value;
                    return (
                        <Tap
                            key={o}
                            haptic
                            onPress={() => onChange(on ? "" : o)}
                            style={{ paddingHorizontal: 14, height: 36, justifyContent: "center", borderRadius: 10, borderWidth: 1, borderColor: on ? theme.brand : slate[300], backgroundColor: on ? theme.brand : "#fff" }}
                        >
                            <T w="bold" size={13} color={on ? "#fff" : slate[600]}>
                                {o}
                            </T>
                        </Tap>
                    );
                })}
            </View>
            {error ? (
                <T w="medium" size={12} color={palette.red600} style={{ marginTop: 4 }}>
                    {error}
                </T>
            ) : null}
        </View>
    );
}

/* ------------------------------------------------------------------ */
/* Accordion / FAQ                                                     */
/* ------------------------------------------------------------------ */

export function Accordion({ items, firstOpen = true }: { items: readonly { title: string; body: string }[]; firstOpen?: boolean }) {
    const [open, setOpen] = useState<number | null>(firstOpen ? 0 : null);
    const theme = useTheme();
    return (
        <View style={{ gap: 10 }}>
            {items.map((f, i) => {
                const on = open === i;
                return (
                    <View key={`${f.title}-${i}`} style={[styles.card, { overflow: "hidden" }]}>
                        <Tap onPress={() => setOpen(on ? null : i)} scaleTo={0.99} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16 }}>
                            <T w="extrabold" size={15} color={slate[900]} style={{ flex: 1 }} lh={1.35}>
                                {f.title}
                            </T>
                            <View style={{ transform: [{ rotate: on ? "180deg" : "0deg" }] }}>
                                <ChevronDown size={18} color={on ? theme.brand : slate[400]} />
                            </View>
                        </Tap>
                        {on ? (
                            <Animated.View entering={undefined} style={{ borderTopWidth: 1, borderTopColor: slate[100], padding: 16 }}>
                                <T size={14} color={slate[600]} lh={1.6}>
                                    {f.body}
                                </T>
                            </Animated.View>
                        ) : null}
                    </View>
                );
            })}
        </View>
    );
}

/* ------------------------------------------------------------------ */
/* Markdown-lite (same subset as the website's RichText)               */
/* ------------------------------------------------------------------ */

export function RichText({ text }: { text: string }) {
    const theme = useTheme();
    const blocks = (text || "").replace(/\r/g, "").split(/\n{2,}/);
    const inline = (s: string) =>
        s.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g).map((part, i) => {
            if (/^\*\*[^*]+\*\*$/.test(part))
                return (
                    <T key={i} w="bold" size={15} color={slate[800]}>
                        {part.slice(2, -2)}
                    </T>
                );
            const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
            if (link)
                return (
                    <T key={i} w="bold" size={15} color={theme.brand}>
                        {link[1]}
                    </T>
                );
            return part;
        });
    return (
        <View style={{ gap: 10 }}>
            {blocks.flatMap((block, bi) =>
                block
                    .split("\n")
                    .filter((l) => l.trim())
                    .map((line, li) => {
                        const k = `${bi}-${li}`;
                        if (line.startsWith("## "))
                            return (
                                <T key={k} w="black" size={19} color={slate[900]} style={{ marginTop: 8 }}>
                                    {line.slice(3)}
                                </T>
                            );
                        if (line.startsWith("### "))
                            return (
                                <T key={k} w="extrabold" size={16} color={slate[900]} style={{ marginTop: 4 }}>
                                    {line.slice(4)}
                                </T>
                            );
                        if (/^[-*] /.test(line))
                            return (
                                <View key={k} style={{ flexDirection: "row", gap: 10, paddingLeft: 4 }}>
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.brand, marginTop: 9 }} />
                                    <T size={15} color={slate[600]} lh={1.6} style={{ flex: 1 }}>
                                        {inline(line.slice(2))}
                                    </T>
                                </View>
                            );
                        return (
                            <T key={k} size={15} color={slate[600]} lh={1.65}>
                                {inline(line)}
                            </T>
                        );
                    })
            )}
        </View>
    );
}

export const styles = StyleSheet.create({
    card: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: slate[200], ...shadow.sm },
    empty: { alignItems: "center", justifyContent: "center", borderRadius: 20, borderWidth: 2, borderStyle: "dashed", borderColor: slate[200], backgroundColor: "#fff", padding: 28, minHeight: 260 },
    input: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 50, borderRadius: 12, borderWidth: 1, backgroundColor: "#fff", paddingHorizontal: 14 },
});
