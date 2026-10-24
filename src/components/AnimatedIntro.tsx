import { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
    type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";
import { FONT } from "@/lib/theme";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { LogoMark } from "./Logo";

/*
 * Launch animation. It starts exactly where the native splash screen ends
 * (logo centred on navy), so the hand-off is seamless:
 *   1. the logo pops and does a half spin while light ripples spread out
 *   2. a shine sweeps across the logo and it glides up
 *   3. the app name rises in letter by letter, then an underline draws
 *   4. the tagline appears word by word
 *   5. the whole layer zooms forward and fades, revealing the app
 */

const BRAND = "#f97316";
const NAVY = "#021424";
const LOGO = 96;
const { width: W } = Dimensions.get("window");

const T0 = 150; // pop
const T_NAME = 750; // name letters
const T_LINE = 1450; // underline
const T_TAG = 1550; // tagline
const T_EXIT = 2650; // exit
const EXIT_MS = 480;

function splitName(name: string): { text: string; accent: boolean }[] {
    // "SadhyamIAS" → "Sadhyam" + "IAS" (accent), like the brand colour on the website.
    const m = name.match(/^(.*?)(IAS|Academy|Classes)$/);
    const head = m && m[1] ? m[1] : name;
    const tail = m && m[1] ? m[2] : "";
    return [...head.split("").map((c) => ({ text: c, accent: false })), ...tail.split("").map((c) => ({ text: c, accent: true }))];
}

function Letter({ ch, index, accent }: { ch: string; index: number; accent: boolean }) {
    const p = useSharedValue(0);
    useEffect(() => {
        p.set(withDelay(T_NAME + index * 45, withSpring(1, { damping: 12, stiffness: 140 })));
    }, [index, p]);
    const s = useAnimatedStyle(() => ({
        opacity: interpolate(p.value, [0, 0.6, 1], [0, 1, 1]),
        transform: [{ translateY: interpolate(p.value, [0, 1], [26, 0]) }, { rotateX: `${interpolate(p.value, [0, 1], [70, 0])}deg` }, { scale: interpolate(p.value, [0, 1], [0.7, 1]) }],
    }));
    return <Animated.Text style={[styles.letter, { color: accent ? BRAND : "#fff" }, s]}>{ch === " " ? " " : ch}</Animated.Text>;
}

function Word({ text, index, accent }: { text: string; index: number; accent: boolean }) {
    const p = useSharedValue(0);
    useEffect(() => {
        p.set(withDelay(T_TAG + index * 180, withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) })));
    }, [index, p]);
    const s = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateY: interpolate(p.value, [0, 1], [10, 0]) }] }));
    return <Animated.Text style={[styles.tag, { color: accent ? BRAND : "rgba(255,255,255,0.78)" }, s]}>{text} </Animated.Text>;
}

function Ripple({ delay, progress }: { delay: number; progress: SharedValue<number> }) {
    const r = useSharedValue(0);
    useEffect(() => {
        r.set(withDelay(delay, withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false)));
    }, [delay, r]);
    const s = useAnimatedStyle(() => ({
        opacity: interpolate(r.value, [0, 0.15, 1], [0, 0.45, 0]) * progress.value,
        transform: [{ scale: interpolate(r.value, [0, 1], [0.8, 3.2]) }],
    }));
    return <Animated.View style={[styles.ripple, s]} />;
}

export function AnimatedIntro({ ready, onDone }: { ready: boolean; onDone: () => void }) {
    const pop = useSharedValue(0); // logo pop + spin
    const lift = useSharedValue(0); // logo glides up
    const shine = useSharedValue(0);
    const line = useSharedValue(0);
    const glow = useSharedValue(0);
    const exit = useSharedValue(0);
    const ripples = useSharedValue(1);

    useEffect(() => {
        pop.set(withDelay(T0, withSequence(withTiming(0.4, { duration: 160, easing: Easing.in(Easing.quad) }), withSpring(1, { damping: 9, stiffness: 120 }))));
        glow.set(withDelay(T0, withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }), -1, true)));
        shine.set(withDelay(T0 + 520, withTiming(1, { duration: 650, easing: Easing.inOut(Easing.cubic) })));
        lift.set(withDelay(T_NAME - 200, withSpring(1, { damping: 16, stiffness: 110 })));
        line.set(withDelay(T_LINE, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) })));
    }, [pop, glow, shine, lift, line]);

    useEffect(() => {
        if (!ready) return;
        const t = setTimeout(() => {
            ripples.set(withTiming(0, { duration: 250 }));
            exit.set(withTiming(1, { duration: EXIT_MS, easing: Easing.in(Easing.cubic) }, (finished) => {
                if (finished) scheduleOnRN(onDone);
            }));
        }, T_EXIT);
        return () => clearTimeout(t);
    }, [ready, exit, ripples, onDone]);

    const logoStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: interpolate(lift.value, [0, 1], [0, -64]) },
            { scale: interpolate(pop.value, [0, 0.4, 1], [1, 0.82, 1]) * interpolate(lift.value, [0, 1], [1, 0.9]) },
            { rotate: `${interpolate(pop.value, [0, 0.4, 1], [0, -20, 360])}deg` },
        ],
    }));
    const glowStyle = useAnimatedStyle(() => ({
        opacity: interpolate(glow.value, [0, 1], [0.35, 0.75]) * interpolate(pop.value, [0, 1], [0, 1]),
        transform: [{ translateY: interpolate(lift.value, [0, 1], [0, -64]) }, { scale: interpolate(glow.value, [0, 1], [1, 1.25]) }],
    }));
    const shineStyle = useAnimatedStyle(() => ({ transform: [{ translateX: interpolate(shine.value, [0, 1], [-LOGO * 1.4, LOGO * 1.4]) }, { rotate: "20deg" }] }));
    const textStyle = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(lift.value, [0, 1], [40, 30]) }] }));
    const lineStyle = useAnimatedStyle(() => ({ width: interpolate(line.value, [0, 1], [0, 120]), opacity: line.value }));
    const rootStyle = useAnimatedStyle(() => ({ opacity: interpolate(exit.value, [0, 0.7, 1], [1, 0.6, 0]), transform: [{ scale: interpolate(exit.value, [0, 1], [1, 1.18]) }] }));

    const letters = splitName(APP_NAME);
    const words = APP_TAGLINE.split(" ").filter((w) => w.length > 0);

    return (
        <Animated.View
            style={[StyleSheet.absoluteFill, styles.root, rootStyle]}
            pointerEvents="none"
            onLayout={() => {
                SplashScreen.hideAsync().catch(() => undefined);
            }}
        >
            <LinearGradient colors={[NAVY, "#06223a", NAVY]} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
            <View style={styles.center}>
                <Ripple delay={T0 + 300} progress={ripples} />
                <Ripple delay={T0 + 900} progress={ripples} />
                <Animated.View style={[styles.glow, glowStyle]}>
                    <Svg width="100%" height="100%">
                        <Defs>
                            <RadialGradient id="g" cx="50%" cy="50%" r="50%">
                                <Stop offset="0" stopColor={BRAND} stopOpacity={0.55} />
                                <Stop offset="0.45" stopColor={BRAND} stopOpacity={0.18} />
                                <Stop offset="1" stopColor={BRAND} stopOpacity={0} />
                            </RadialGradient>
                        </Defs>
                        <Rect width="100%" height="100%" fill="url(#g)" />
                    </Svg>
                </Animated.View>
                <Animated.View style={[styles.logo, logoStyle]}>
                    <LogoMark size={LOGO} color={BRAND} />
                    <View style={styles.shineClip}>
                        <Animated.View style={[styles.shine, shineStyle]}>
                            <LinearGradient colors={["transparent", "rgba(255,255,255,0.55)", "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
                        </Animated.View>
                    </View>
                </Animated.View>
                <Animated.View style={[styles.textBlock, textStyle]}>
                    <View style={styles.row}>
                        {letters.map((l, i) => (
                            <Letter key={i} ch={l.text} index={i} accent={l.accent} />
                        ))}
                    </View>
                    <Animated.View style={[styles.line, lineStyle]} />
                    <View style={[styles.row, { marginTop: 14 }]}>
                        {words.map((w, i) => (
                            <Word key={i} text={w} index={i} accent={i === words.length - 1} />
                        ))}
                    </View>
                </Animated.View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    root: { zIndex: 1000, backgroundColor: NAVY },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    logo: { position: "absolute", width: LOGO, height: LOGO, borderRadius: 22, overflow: "hidden" },
    shineClip: { ...StyleSheet.absoluteFill, overflow: "hidden", borderRadius: 22 },
    shine: { position: "absolute", top: -LOGO / 2, width: LOGO * 0.45, height: LOGO * 2 },
    glow: { position: "absolute", width: LOGO * 3.2, height: LOGO * 3.2 },
    ripple: { position: "absolute", width: LOGO * 1.2, height: LOGO * 1.2, borderRadius: LOGO, borderWidth: 2, borderColor: "rgba(249,115,22,0.8)" },
    textBlock: { position: "absolute", top: "50%", alignItems: "center", width: W },
    row: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", paddingHorizontal: 24 },
    letter: { fontFamily: FONT.black, fontSize: 38, letterSpacing: -0.5, includeFontPadding: false },
    line: { height: 4, borderRadius: 2, backgroundColor: BRAND, marginTop: 10 },
    tag: { fontFamily: FONT.bold, fontSize: 15, letterSpacing: 0.3 },
});
