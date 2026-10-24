import { useSyncExternalStore } from "react";
import { View } from "react-native";
import { Timer } from "lucide-react-native";
import type { Schedulable } from "@/lib/models";
import { palette } from "@/lib/theme";
import { T } from "./ui";

/* One shared 1-second clock for every countdown on screen. */
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
let now = Date.now();

function subscribe(l: () => void) {
    listeners.add(l);
    if (!timer) {
        now = Date.now();
        timer = setInterval(() => {
            now = Date.now();
            listeners.forEach((fn) => fn());
        }, 1000);
    }
    return () => {
        listeners.delete(l);
        if (listeners.size === 0 && timer) {
            clearInterval(timer);
            timer = undefined;
        }
    };
}
export const useNow = () => useSyncExternalStore(subscribe, () => now);

const parse = (iso?: string) => {
    const t = iso ? new Date(iso).getTime() : 0;
    return Number.isNaN(t) ? 0 : t;
};

export function countdownFor(item: Schedulable): { target: string; label: string } | null {
    if (!item.showCountdown) return null;
    const useEnd = item.countdownTo === "End date";
    const target = useEnd ? item.endsAt || item.startsAt : item.startsAt || item.endsAt;
    if (!target) return null;
    const isEnd = target === item.endsAt && (useEnd || !item.startsAt);
    return { target, label: item.countdownLabel || (isEnd ? "Offer ends in" : "Starts in") };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function ItemCountdown({ item, box }: { item: Schedulable; box?: boolean }) {
    const t = useNow();
    const cd = countdownFor(item);
    if (!cd) return null;
    const ms = parse(cd.target) - t;
    if (ms <= 0) return null;
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (box) {
        return (
            <View style={{ backgroundColor: palette.amber50, borderRadius: 14, borderWidth: 1, borderColor: palette.amber200, padding: 14 }}>
                <T w="bold" size={12} color={palette.amber800} style={{ marginBottom: 8 }}>
                    {cd.label}
                </T>
                <View style={{ flexDirection: "row", gap: 8 }}>
                    {[
                        [d, "Days"],
                        [h, "Hrs"],
                        [m, "Min"],
                        [sec, "Sec"],
                    ].map(([v, l]) => (
                        <View key={String(l)} style={{ flex: 1, alignItems: "center", backgroundColor: "#fff", borderRadius: 10, paddingVertical: 8 }}>
                            <T w="black" size={20} color="#0f172a">
                                {pad(Number(v))}
                            </T>
                            <T w="semibold" size={10} color="#64748b">
                                {l}
                            </T>
                        </View>
                    ))}
                </View>
            </View>
        );
    }
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", backgroundColor: palette.amber50, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 10 }}>
            <Timer size={13} color={palette.amber800} />
            <T w="bold" size={11} color={palette.amber800}>
                {cd.label} {d > 0 ? `${d}d ` : ""}
                {pad(h)}:{pad(m)}:{pad(sec)}
            </T>
        </View>
    );
}
