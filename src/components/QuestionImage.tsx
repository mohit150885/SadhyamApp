import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Image } from "expo-image";
import { RefreshCw } from "lucide-react-native";
import { pageSource } from "@/lib/testClient";
import type { Segment } from "@/lib/testTypes";
import { slate } from "@/lib/theme";
import { T, Tap } from "./ui";

/**
 * Shows a question exactly as printed: one or more rectangles cut out of the
 * protected page images (a question can continue into the next column/page).
 * Images are requested from the website with the student's ID token.
 */
export function QuestionImage({ testId, token, segments, pageSize, width }: { testId: string; token: string; segments: Segment[]; pageSize: (page: number) => { w: number; h: number }; width: number }) {
    return (
        <View style={{ gap: 4, width }}>
            {segments.map((s, i) => (
                <SegmentView key={`${s.page}-${i}`} testId={testId} token={token} s={s} size={pageSize(s.page)} width={width} />
            ))}
        </View>
    );
}

function SegmentView({ testId, token, s, size, width }: { testId: string; token: string; s: Segment; size: { w: number; h: number }; width: number }) {
    const [state, setState] = useState<"loading" | "ok" | "error">("loading");
    const [retry, setRetry] = useState(0);
    const pw = size.w || 1;
    const ph = size.h || 1.414;
    const ratio = (s.w * pw) / Math.max(0.0001, s.h * ph);
    const height = width / Math.max(0.05, ratio);
    const imgW = width / Math.max(0.0001, s.w);
    const imgH = imgW * (ph / pw);
    return (
        <View style={{ width, height, overflow: "hidden", backgroundColor: "#fff" }}>
            {token ? (
                <Image
                    key={retry}
                    source={pageSource(testId, s.page, token)}
                    style={{ position: "absolute", width: imgW, height: imgH, left: -s.x * imgW, top: -s.y * imgH }}
                    contentFit="fill"
                    cachePolicy="memory-disk"
                    recyclingKey={`${testId}-${s.page}`}
                    onLoad={() => setState("ok")}
                    onError={() => setState("error")}
                />
            ) : null}
            {state === "loading" ? (
                <View style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", backgroundColor: slate[50] }}>
                    <ActivityIndicator color={slate[400]} />
                </View>
            ) : null}
            {state === "error" ? (
                <Tap
                    onPress={() => {
                        setState("loading");
                        setRetry((r) => r + 1);
                    }}
                    style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", backgroundColor: slate[50], gap: 6 }}
                >
                    <RefreshCw size={18} color={slate[500]} />
                    <T w="semibold" size={12} color={slate[500]}>
                        Couldn’t load — tap to retry
                    </T>
                </Tap>
            ) : null}
        </View>
    );
}

/** A whole question-paper page (answer-sheet mode and the solutions "full paper" view). */
export function PageImage({ testId, token, page, size, width }: { testId: string; token: string; page: number; size: { w: number; h: number }; width: number }) {
    return <QuestionImage testId={testId} token={token} width={width} pageSize={() => size} segments={[{ page, x: 0, y: 0, w: 1, h: 1 }]} />;
}
