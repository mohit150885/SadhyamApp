import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useStudyMaterials } from "@/hooks/useContent";
import { useAuth } from "@/providers/AuthProvider";
import { Header } from "@/components/Screen";
import { RequireLogin } from "@/components/RequireLogin";
import { PdfViewer } from "@/components/PdfViewer";
import { T } from "@/components/ui";
import { slate, useTheme } from "@/lib/theme";

export default function ReadScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = useTheme();
    const { user } = useAuth();
    const { items } = useStudyMaterials();
    const item = items.find((m) => m.id === id);
    const [page, setPage] = useState<{ n: number; total: number } | null>(null);
    return (
        <View style={{ flex: 1, backgroundColor: slate[50] }}>
            <Header
                title={item?.title || "Study material"}
                subtitle="Pinch to zoom"
                right={
                    page && page.total ? (
                        <View style={{ backgroundColor: theme.brand50, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
                            <T w="bold" size={12} color={theme.brand}>
                                {page.n} / {page.total}
                            </T>
                        </View>
                    ) : null
                }
            />
            <RequireLogin>
                <PdfViewer endpoint={`/api/my/material/${encodeURIComponent(id)}`} watermark={user?.email || ""} onPage={(n, total) => setPage({ n, total })} />
            </RequireLogin>
        </View>
    );
}
