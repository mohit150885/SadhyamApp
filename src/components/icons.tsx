import {
    Award,
    BookOpen,
    CheckCircle2,
    ClipboardList,
    FileText,
    GraduationCap,
    Headphones,
    Lightbulb,
    MonitorPlay,
    Play,
    PlayCircle,
    RefreshCcw,
    ShieldCheck,
    ShoppingCart,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Trophy,
    UserRound,
    Users,
    type LucideIcon,
} from "lucide-react-native";

/** Icon names the admin panel can pick (same list as the website). */
export const ICONS: Record<string, LucideIcon> = {
    Award,
    BookOpen,
    CheckCircle2,
    ClipboardList,
    FileText,
    GraduationCap,
    Headphones,
    Lightbulb,
    MonitorPlay,
    Play,
    PlayCircle,
    RefreshCcw,
    ShieldCheck,
    ShoppingCart,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Trophy,
    UserRound,
    Users,
};

export function DynamicIcon({ name, size = 20, color }: { name?: string; size?: number; color?: string }) {
    const Icon = (name && ICONS[name]) || Star;
    return <Icon size={size} color={color} />;
}
