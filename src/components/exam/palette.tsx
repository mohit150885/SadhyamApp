import { View } from "react-native";
import { palette, slate } from "@/lib/theme";
import { T, Tap } from "../ui";

export type QStatus = "notVisited" | "notAnswered" | "answered" | "marked" | "answeredMarked";

export const STATUS_LABEL: Record<QStatus, string> = {
    answered: "Answered",
    notAnswered: "Not Answered",
    notVisited: "Not Visited",
    marked: "Marked for Review",
    answeredMarked: "Answered & Marked (will be evaluated)",
};

const STYLE: Record<QStatus, { bg: string; fg: string; border: string; round: boolean; shape: "down" | "up" | "flat" }> = {
    notVisited: { bg: slate[100], fg: slate[700], border: slate[300], round: false, shape: "flat" },
    notAnswered: { bg: palette.red500, fg: "#fff", border: palette.red600, round: false, shape: "down" },
    answered: { bg: palette.emerald500, fg: "#fff", border: palette.emerald600, round: false, shape: "up" },
    marked: { bg: palette.violet600, fg: "#fff", border: "#6d28d9", round: true, shape: "flat" },
    answeredMarked: { bg: palette.violet600, fg: "#fff", border: "#6d28d9", round: true, shape: "flat" },
};

/** Question number button styled like the official CBT palette. */
export function PaletteBtn({ n, status, current, onPress, size = 44 }: { n: number | string; status: QStatus; current?: boolean; onPress?: () => void; size?: number }) {
    const s = STYLE[status];
    const radius = s.round ? size / 2 : 8;
    return (
        <Tap haptic onPress={onPress} scaleTo={0.9} style={{ padding: 2, borderRadius: radius + 3, borderWidth: 2, borderColor: current ? "#021424" : "transparent" }}>
            <View
                style={{
                    width: size,
                    height: size,
                    borderRadius: radius,
                    backgroundColor: s.bg,
                    borderWidth: 1,
                    borderColor: s.border,
                    alignItems: "center",
                    justifyContent: "center",
                    borderTopLeftRadius: s.shape === "up" ? size / 2.2 : radius,
                    borderTopRightRadius: s.shape === "up" ? size / 2.2 : radius,
                    borderBottomLeftRadius: s.shape === "down" ? size / 2.2 : radius,
                    borderBottomRightRadius: s.shape === "down" ? size / 2.2 : radius,
                }}
            >
                <T w="bold" size={size > 36 ? 14 : 11} color={s.fg}>
                    {n}
                </T>
                {status === "answeredMarked" ? <View style={{ position: "absolute", right: -2, bottom: -2, width: 13, height: 13, borderRadius: 7, borderWidth: 2, borderColor: "#fff", backgroundColor: palette.emerald500 }} /> : null}
            </View>
        </Tap>
    );
}

export function Legend({ counts }: { counts?: Record<QStatus, number> }) {
    const order: QStatus[] = ["answered", "notAnswered", "notVisited", "marked", "answeredMarked"];
    return (
        <View style={{ gap: 10 }}>
            {order.map((k) => (
                <View key={k} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <PaletteBtn n={counts ? counts[k] : ""} status={k} size={30} />
                    <T w="medium" size={13} color={slate[600]} style={{ flex: 1 }}>
                        {STATUS_LABEL[k]}
                    </T>
                </View>
            ))}
        </View>
    );
}
