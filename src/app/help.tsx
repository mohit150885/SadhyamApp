import { Dimensions, View } from "react-native";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Mail } from "lucide-react-native";
import { useContent } from "@/hooks/useContent";
import { Body, Header, Page } from "@/components/Screen";
import { DynamicIcon } from "@/components/icons";
import { Btn, Card, Loader, T, Tap, styles } from "@/components/ui";
import { openLink } from "@/lib/links";
import { slate, useTheme } from "@/lib/theme";

const { width: W } = Dimensions.get("window");

export default function HelpScreen() {
    const theme = useTheme();
    const { data, loading } = useContent("help");
    if (loading) return <Loader />;
    return (
        <Page>
            <Header title={data.hero.title} subtitle={data.hero.eyebrow} />
            <Body contentStyle={{ gap: 14 }}>
                <T size={14} color={slate[600]} lh={1.55}>
                    {data.hero.description}
                </T>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                    {data.topics.map((t, i) => (
                        <Animated.View key={t.title} entering={FadeInDown.delay(i * 60).duration(420)} style={{ width: (W - 32 - 12) / 2 }}>
                            <Tap onPress={() => openLink(t.link)} style={[styles.card, { padding: 14, minHeight: 150 }]}>
                                <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: theme.brand50, alignItems: "center", justifyContent: "center" }}>
                                    <DynamicIcon name={t.iconName} size={20} color={theme.brand} />
                                </View>
                                <T w="extrabold" size={14} color={slate[900]} style={{ marginTop: 10 }}>
                                    {t.title}
                                </T>
                                <T size={12} color={slate[500]} lh={1.45} style={{ marginTop: 3 }}>
                                    {t.text}
                                </T>
                            </Tap>
                        </Animated.View>
                    ))}
                </View>
                <Card style={{ backgroundColor: theme.navy, borderColor: theme.navy, gap: 8 }}>
                    <T w="black" size={17} color="#fff">
                        Still need help?
                    </T>
                    <T size={13} color="rgba(255,255,255,0.7)">
                        Our team replies within 24 hours.
                    </T>
                    <Btn title="Contact Support" icon={<Mail size={16} color="#fff" />} onPress={() => router.push("/contact")} />
                </Card>
            </Body>
        </Page>
    );
}
