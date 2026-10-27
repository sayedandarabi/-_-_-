import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import {
  SectionHeader,
  StatCard,
  SurfaceCard,
  SyncBadge,
  TransactionRow,
} from "@/components/finance-ui";
import { useLedger } from "@/lib/accounting/store";
import { formatAfghani } from "@/lib/accounting/domain";

export default function HomeScreen() {
  const router = useRouter();
  const { state, metrics, syncPending, loading } = useLedger();
  const recent = state.transactions.slice(0, 3);
  const pending = metrics.pendingSync;
  if (loading)
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">در حال آماده‌سازی دفتر شما…</Text>
      </ScreenContainer>
    );

  return (
    <ScreenContainer className="bg-background" style={{ direction: "rtl" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
      >
        <View className="mb-5 flex-row-reverse items-start justify-between">
          <View className="items-end">
            <Text className="text-sm text-muted">امروز، ۶ آبان ۱۴۰۵</Text>
            <Text className="mt-1 text-2xl font-bold text-foreground">
              سلام، سمیرا
            </Text>
            <Text className="mt-1 text-xs text-muted">
              فروشگاه پامیر · شعبه مرکزی
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/more")} className="h-12 w-12 items-center justify-center rounded-2xl bg-primary">
            <Text className="text-lg font-bold text-white">س</Text>
          </TouchableOpacity>
        </View>

        <SurfaceCard className="mb-5" style={{ backgroundColor: "#0F766E", borderWidth: 0 }}>
          <View className="flex-row-reverse items-center justify-between">
            <View className="items-end">
              <View className="mb-2 flex-row-reverse items-center gap-2">
                <View className="h-2 w-2 rounded-full bg-[#B8F1DB]" />
                <Text className="text-xs text-[#D7FFF0]">
                  دفتر فعال و آماده ثبت
                </Text>
              </View>
              <Text className="text-3xl font-bold text-white">
                {formatAfghani(metrics.cashBalance)}
              </Text>
              <Text className="mt-1 text-xs text-[#D7FFF0]">
                مانده نقد تقریبی · افغانی
              </Text>
            </View>
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <Feather name="briefcase" size={26} color="#D7FFF0" />
            </View>
          </View>
          <View className="mt-4 flex-row-reverse items-center justify-between border-t border-white/20 pt-3">
            <Text className="text-xs text-[#D7FFF0]">
              آخرین بروزرسانی همین حالا
            </Text>
            <SyncBadge status={pending ? "pending" : "synced"} />
          </View>
        </SurfaceCard>

        {pending ? (
          <TouchableOpacity
            onPress={syncPending}
            activeOpacity={0.8}
            className="mb-5 flex-row-reverse items-center rounded-2xl border border-warning/30 bg-warning/10 p-3"
          >
            <Feather name="wifi-off" size={18} color="#B45309" />
            <View className="mr-3 flex-1 items-end">
              <Text className="text-sm font-semibold text-foreground">
                {pending} عملیات در صف آفلاین
              </Text>
              <Text className="mt-0.5 text-xs text-muted">
                برای شبیه‌سازی همگام‌سازی لمس کنید
              </Text>
            </View>
            <Text className="text-xs font-bold text-warning">همگام‌سازی</Text>
          </TouchableOpacity>
        ) : null}

        <View className="mb-6 flex-row-reverse flex-wrap gap-3">
          <StatCard
            label="دریافت این ماه"
            value={formatAfghani(metrics.income)}
            icon="arrow-down-left"
            tone="success"
            hint="+۱۲٪"
          />
          <StatCard
            label="پرداخت این ماه"
            value={formatAfghani(metrics.expense)}
            icon="arrow-up-right"
            tone="error"
            hint="این ماه"
          />
          <StatCard
            label="سود تقریبی"
            value={formatAfghani(metrics.profit)}
            icon="trending-up"
            tone="primary"
            hint="خوب"
          />
          <StatCard
            label="دریافتنی‌ها"
            value={formatAfghani(metrics.receivables)}
            icon="users"
            tone="warning"
            hint="۲ مشتری"
          />
        </View>

        <SectionHeader title="عملیات سریع" />
        <View className="mb-6 flex-row-reverse gap-3">
          <TouchableOpacity
            onPress={() => router.push("/transaction/new")}
            activeOpacity={0.8}
            className="flex-1 items-center rounded-2xl bg-primary p-4"
          >
            <Feather name="plus-circle" size={22} color="white" />
            <Text className="mt-2 text-sm font-bold text-white">
              ثبت تراکنش
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/reports")}
            activeOpacity={0.8}
            className="flex-1 items-center rounded-2xl border border-border bg-surface p-4"
          >
            <Feather name="bar-chart-2" size={22} color="#0F766E" />
            <Text className="mt-2 text-sm font-bold text-foreground">
              گزارش سریع
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/parties")}
            activeOpacity={0.8}
            className="flex-1 items-center rounded-2xl border border-border bg-surface p-4"
          >
            <Feather name="users" size={22} color="#0F766E" />
            <Text className="mt-2 text-sm font-bold text-foreground">
              طرف‌ها
            </Text>
          </TouchableOpacity>
        </View>

        <SectionHeader
          title="آخرین تراکنش‌ها"
          action="مشاهده همه"
          onAction={() => router.push("/(tabs)/transactions")}
        />
        {recent.map((transaction) => (
          <TransactionRow key={transaction.id} {...transaction} />
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
