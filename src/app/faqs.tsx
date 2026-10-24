import { useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { useContent } from "@/hooks/useContent";
import { Body, Header, Page } from "@/components/Screen";
import { Accordion, Loader, T, Tap } from "@/components/ui";
import { slate, useTheme } from "@/lib/theme";

export default function FaqsScreen() {
    const theme = useTheme();
    const { data, loading } = useContent("faqs");
    const cats = useMemo(() => ["All", ...Array.from(new Set(data.items.map((f) => f.category).filter((c) => c)))], [data.items]);
    const [cat, setCat] = useState("All");
    if (loading) return <Loader />;
    const items = cat === "All" ? data.items : data.items.filter((f) => f.category === cat);
    return (
        <Page>
            <Header title={data.hero.title} subtitle={data.hero.eyebrow} />
            <Body contentStyle={{ gap: 14 }}>
                <T size={14} color={slate[600]}>
                    {data.hero.description}
                </T>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {cats.map((c) => (
                        <Tap key={c} haptic onPress={() => setCat(c)} style={{ paddingHorizontal: 14, height: 36, justifyContent: "center", borderRadius: 10, borderWidth: 1, borderColor: c === cat ? theme.brand : slate[200], backgroundColor: c === cat ? theme.brand : "#fff" }}>
                            <T w="bold" size={13} color={c === cat ? "#fff" : slate[600]}>
                                {c}
                            </T>
                        </Tap>
                    ))}
                </ScrollView>
                <Accordion key={cat} items={items.map((f) => ({ title: f.question, body: f.answer }))} />
            </Body>
        </Page>
    );
}
