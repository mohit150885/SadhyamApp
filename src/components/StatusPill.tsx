import { View } from "react-native";
import { CheckCircle2, Clock, XCircle } from "lucide-react-native";
import { palette, slate } from "@/lib/theme";
import { T } from "./ui";

const STATUS: Record<string, { label: string; bg: string; fg: string; icon: typeof Clock }> = {
    pending: { label: "Awaiting payment", bg: palette.amber50, fg: "#b45309", icon: Clock },
    paid: { label: "Paid", bg: palette.emerald50, fg: palette.emerald700, icon: CheckCircle2 },
    failed: { label: "Failed", bg: palette.red50, fg: palette.red700, icon: XCircle },
    cancelled: { label: "Cancelled", bg: slate[100], fg: slate[600], icon: XCircle },
    refunded: { label: "Refunded", bg: palette.blue50, fg: palette.blue700, icon: CheckCircle2 },
};

export function StatusPill({ status }: { status: string }) {
    const s = STATUS[status] ?? STATUS.pending;
    const Icon = s.icon;
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: s.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" }}>
            <Icon size={13} color={s.fg} />
            <T w="bold" size={12} color={s.fg}>
                {s.label}
            </T>
        </View>
    );
}
