import { useState } from "react";
import { Dimensions, Linking, Modal, Pressable, ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { Download, FileText, Languages, Star, X } from "lucide-react-native";
import { useContent, useStudyMaterials } from "@/hooks/useContent";
import { CheckGrid, DetailBlock, DetailScaffold, EnrollBar, InfoTiles, MetaChip, NotFound, ReviewsSection } from "@/components/detail";
import { MaterialCard } from "@/components/cards";
import { Carousel, CtaSection } from "@/components/sections";
import { ItemCountdown } from "@/components/Countdown";
import { Accordion, Btn, Loader, SmartImage, T, Tap } from "@/components/ui";
import { palette, slate, useTheme } from "@/lib/theme";

const { width: W, height: H } = Dimensions.get("window");

export default function MaterialDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = useTheme();
    const { items, loading } = useStudyMaterials();
    const { data: cfg } = useContent("studyMaterialDetails");
    const { data: home } = useContent("home");
    const [preview, setPreview] = useState<string | null>(null);
    if (loading) return <Loader />;
    const item = items.find((m) => m.id === id);
    if (!item) return <NotFound title="Study material not found" />;
    const s = cfg.sections;
    const contents = item.contents?.length ? item.contents : cfg.defaultContents;
    const faqs = item.faqs?.length ? item.faqs : cfg.faqs;
    const samples = item.samplePages ?? [];
    const related = items.filter((m) => m.id !== item.id).slice(0, 4);
    const includes = [item.pages, item.format, item.language, ...item.tags].filter((x): x is string => Boolean(x));

    return (
        <>
            <DetailScaffold
                image={item.image}
                label={item.badge || item.category}
                title={item.title}
                subtitle={item.description}
                sharePath={`/study-material/${item.id}`}
                meta={
                    <>
                        {item.pages ? <MetaChip icon={<FileText size={14} color={theme.brand} />}>{item.pages}</MetaChip> : null}
                        <MetaChip icon={<Star size={14} color={palette.amber400} fill={palette.amber400} />}>
                            {item.rating} ({item.reviews})
                        </MetaChip>
                        {item.language ? <MetaChip icon={<Languages size={14} color={theme.brand} />}>{item.language}</MetaChip> : null}
                    </>
                }
                bottom={<EnrollBar kind="material" id={item.id} title={item.title} price={item.price} oldPrice={item.oldPrice} primary={cfg.primaryButtonText} />}
            >
                <ItemCountdown item={item} box />
                {s.overview.visible ? (
                    <DetailBlock title={s.overview.title}>
                        <CheckGrid items={includes} />
                    </DetailBlock>
                ) : null}
                {s.contents.visible && contents.length > 0 ? (
                    <DetailBlock title={s.contents.title}>
                        <Accordion items={contents.map((c) => ({ title: c.title, body: c.details }))} />
                    </DetailBlock>
                ) : null}
                {s.samplePages.visible && samples.length > 0 ? (
                    <DetailBlock title={s.samplePages.title}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                            {samples.map((src, i) => (
                                <Tap key={`${src}-${i}`} onPress={() => setPreview(src)} style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: slate[200] }}>
                                    <SmartImage src={src} style={{ width: 130, height: 175 }} />
                                </Tap>
                            ))}
                        </ScrollView>
                    </DetailBlock>
                ) : null}
                {item.sampleUrl ? <Btn full variant="outline" title="Download Free Sample" icon={<Download size={16} color={theme.brand} />} onPress={() => Linking.openURL(item.sampleUrl!)} /> : null}
                {s.benefits.visible && cfg.benefits.length > 0 ? (
                    <DetailBlock title={s.benefits.title}>
                        <InfoTiles items={cfg.benefits} />
                    </DetailBlock>
                ) : null}
                {s.testimonials.visible ? <ReviewsSection title={s.testimonials.title} kind="material" itemId={item.id} itemTitle={item.title} fallback={home.testimonials.items} /> : null}
                {s.faqs.visible && faqs.length > 0 ? (
                    <DetailBlock title={s.faqs.title}>
                        <Accordion items={faqs.map((f) => ({ title: f.question, body: f.answer }))} />
                    </DetailBlock>
                ) : null}
                {related.length > 0 ? (
                    <View>
                        <T w="black" size={18} color={slate[900]} style={{ marginBottom: 12, marginLeft: 2 }}>
                            More Study Material
                        </T>
                        <Carousel data={related} itemWidth={290} keyOf={(c) => c.id} render={(c) => <MaterialCard item={c} />} />
                    </View>
                ) : null}
                <View style={{ marginHorizontal: -14 }}>
                    <CtaSection />
                </View>
            </DetailScaffold>

            <Modal visible={Boolean(preview)} transparent statusBarTranslucent onRequestClose={() => setPreview(null)}>
                <Animated.View entering={FadeIn.duration(150)} style={{ flex: 1, backgroundColor: "rgba(2,6,23,0.92)", alignItems: "center", justifyContent: "center" }}>
                    <Pressable style={{ position: "absolute", inset: 0 }} onPress={() => setPreview(null)} />
                    <Animated.View entering={ZoomIn.springify().damping(16)}>
                        <SmartImage src={preview} contentFit="contain" style={{ width: W - 24, height: H * 0.75 }} />
                    </Animated.View>
                    <Tap onPress={() => setPreview(null)} style={{ position: "absolute", top: 50, right: 18, width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}>
                        <X size={22} color="#fff" />
                    </Tap>
                </Animated.View>
            </Modal>
        </>
    );
}
