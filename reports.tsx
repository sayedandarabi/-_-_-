import { Feather } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { SectionHeader, SurfaceCard } from "@/components/finance-ui";
import { formatAfghani } from "@/lib/accounting/domain";
import { useLedger } from "@/lib/accounting/store";

export default function ReportsScreen() {
  const { metrics, state } = useLedger();
  const max = Math.max(metrics.income, metrics.expense, 1);
  const bars = [{ label: "دریافت", value: metrics.income, color: "#0F766E" }, { label: "پرداخت", value: metrics.expense, color: "#E07A5F" }, { label: "سود", value: metrics.profit, color: "#D4A72C" }];
  return (
    <ScreenContainer style={{ direction: "rtl" }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
        <View className="mb-5 flex-row-reverse items-start justify-between"><View className="items-end"><Text className="text-2xl font-bold text-foreground">گزارش‌ها</Text><Text className="mt-1 text-xs text-muted">گزارش پایه · اول تا پایان این ماه</Text></View><TouchableOpacity className="h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface"><Feather name="download" size={19} color="#0F766E" /></TouchableOpacity></View>
        <SurfaceCard className="mb-5"><View className="flex-row-reverse items-center justify-between"><View className="items-end"><Text className="text-xs text-muted">سود و زیان</Text><Text className="mt-1 text-2xl font-bold text-foreground">{formatAfghani(metrics.profit)}</Text><Text className="mt-1 text-xs text-success">برآورد بر اساس {state.transactions.length} سند</Text></View><View className="h-12 w-12 items-center justify-center rounded-2xl bg-success/10"><Feather name="trending-up" size={22} color="#16A34A" /></View></View><View className="mt-6 gap-4">{bars.map((bar) => <View key={bar.label}><View className="mb-1 flex-row-reverse justify-between"><Text className="text-xs font-semibold text-foreground">{bar.label}</Text><Text className="text-xs text-muted">{formatAfghani(bar.value)}</Text></View><View className="h-3 overflow-hidden rounded-full bg-background"><View style={{ width: `${Math.max((bar.value / max) * 100, 4)}%`, backgroundColor: bar.color }} className="h-full rounded-full" /></View></View>)}</View></SurfaceCard>
        <SectionHeader title="گزارش‌های قابل دسترس" />
        {[{ icon: "bar-chart-2" as const, title: "سود و زیان", detail: "درآمد، هزینه و سود تقریبی" }, { icon: "layers" as const, title: "ترازنامه", detail: "دارایی‌ها، بدهی‌ها و سرمایه" }, { icon: "activity" as const, title: "جریان نقدی", detail: "ورودی و خروجی نقد" }].map((item) => <TouchableOpacity key={item.title} className="mb-3 flex-row-reverse items-center rounded-2xl border border-border bg-surface p-4"><View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10"><Feather name={item.icon} size={18} color="#0F766E" /></View><View className="mr-3 flex-1 items-end"><Text className="text-sm font-bold text-foreground">{item.title}</Text><Text className="mt-1 text-xs text-muted">{item.detail}</Text></View><Feather name="chevron-left" size={18} color="#94A3B8" /></TouchableOpacity>)}
        <View className="mt-3 rounded-2xl border border-warning/25 bg-warning/10 p-4"><View className="flex-row-reverse items-center"><Feather name="info" size={17} color="#B45309" /><Text className="mr-2 text-sm font-semibold text-foreground">گزارش پیشرفته در نسخه پولی</Text></View><Text className="mt-2 text-right text-xs leading-5 text-muted">خروجی PDF و Excel، گزارش‌های چندشعبه‌ای و مالیات قابل تنظیم پس از تأیید قواعد محلی اضافه می‌شوند.</Text></View>
      </ScrollView>
    </ScreenContainer>
  );
}
