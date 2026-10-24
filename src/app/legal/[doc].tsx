import { useLocalSearchParams } from "expo-router";
import { useContent } from "@/hooks/useContent";
import { Body, Header, Page } from "@/components/Screen";
import { Card, Loader, RichText, T } from "@/components/ui";
import { slate } from "@/lib/theme";

export default function LegalScreen() {
    const { doc } = useLocalSearchParams<{ doc: string }>();
    const { data, loading } = useContent("legal");
    if (loading) return <Loader />;
    const key = (["refund", "terms", "privacy"].includes(doc) ? doc : "terms") as "refund" | "terms" | "privacy";
    const page = data[key];
    return (
        <Page>
            <Header title={page.title} subtitle={page.updatedOn ? `Last updated ${page.updatedOn}` : undefined} />
            <Body>
                <Card>
                    <RichText text={page.content} />
                </Card>
                <T size={12} color={slate[400]} center style={{ marginTop: 16 }}>
                    {page.title}
                </T>
            </Body>
        </Page>
    );
}
