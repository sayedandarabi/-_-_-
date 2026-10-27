import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { SectionHeader, SurfaceCard, TransactionRow } from "@/components/finance-ui";
import { useLedger } from "@/lib/accounting/store";
import { formatAfghani } from "@/lib/accounting/domain";

export default function SalesScreen() {
  const router = useRouter();
  const { state } = useLedger();
  const sales = state.transactions.filter((item) => item.type === "sale");
  const purchases = state.transactions.filter((item) => item.type === "purchase");
  const salesTotal = sales.reduce((sum, item) => sum + item.amount, 0);
  const purchasesTotal = purchases.reduce((sum, item) => sum + item.amount, 0);
  return (
    <ScreenContainer style={{ direction: "rtl" }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
        <View className="mb-5 items-end"><Text className="text-2xl font-bold text-foreground">فروش و خرید</Text><Text className="mt-1 text-xs text-muted">مدیریت جریان کالا و درآمد روزانه</Text></View>
        <View className="mb-5 flex-row-reverse gap-3">
          <SurfaceCard className="flex-1"><View className="mb-3 h-9 w-9 items-center justify-center rounded-2xl bg-success/10"><Feather name="trending-up" size={18} color="#16A34A" /></View><Text className="text-xs text-muted">فروش ثبت‌شده</Text><Text className="mt-1 text-xl font-bold text-foreground">{formatAfghani(salesTotal)}</Text><Text className="mt-1 text-xs text-success">{sales.length} سند</Text></SurfaceCard>
          <SurfaceCard className="flex-1"><View className="mb-3 h-9 w-9 items-center justify-center rounded-2xl bg-warning/10"><Feather name="shopping-cart" size={18} color="#D97706" /></View><Text className="text-xs text-muted">خرید ثبت‌شده</Text><Text className="mt-1 text-xl font-bold text-foreground">{formatAfghani(purchasesTotal)}</Text><Text className="mt-1 text-xs text-warning">{purchases.length} سند</Text></SurfaceCard>
        </View>
        <View className="mb-6 flex-row-reverse gap-3"><TouchableOpacity onPress={() => router.push("/transaction/new?type=sale")} className="flex-1 flex-row-reverse items-center justify-center gap-2 rounded-2xl bg-primary p-4"><Feather name="plus" size={18} color="white" /><Text className="font-bold text-white">ثبت فروش</Text></TouchableOpacity><TouchableOpacity onPress={() => router.push("/transaction/new?type=purchase")} className="flex-1 flex-row-reverse items-center justify-center gap-2 rounded-2xl border border-border bg-surface p-4"><Feather name="plus" size={18} color="#0F766E" /><Text className="font-bold text-foreground">ثبت خرید</Text></TouchableOpacity></View>
        <SectionHeader title="آخرین فروش‌ها" />
        {sales.slice(0, 4).map((transaction) => <TransactionRow key={transaction.id} {...transaction} />)}
        <SectionHeader title="آخرین خریدها" />
        {purchases.slice(0, 4).map((transaction) => <TransactionRow key={transaction.id} {...transaction} />)}
      </ScrollView>
    </ScreenContainer>
  );
}
