import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { EmptyState, SectionHeader, TransactionRow } from "@/components/finance-ui";
import { useColors } from "@/hooks/use-colors";
import {
  getTransactionTypeLabel,
  type TransactionType,
} from "@/lib/accounting/domain";
import { useLedger } from "@/lib/accounting/store";

const filters: { label: string; value: "all" | TransactionType }[] = [
  { label: "همه", value: "all" },
  { label: "دریافت", value: "income" },
  { label: "پرداخت", value: "expense" },
  { label: "فروش", value: "sale" },
  { label: "خرید", value: "purchase" },
];

export default function TransactionsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state } = useLedger();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | TransactionType>("all");
  const visible = useMemo(
    () =>
      state.transactions.filter((transaction) => {
        const matchesFilter = filter === "all" || transaction.type === filter;
        const haystack =
          `${transaction.partyName ?? ""} ${transaction.description}`.toLowerCase();
        return matchesFilter && haystack.includes(query.trim().toLowerCase());
      }),
    [filter, query, state.transactions],
  );
  return (
    <ScreenContainer style={{ direction: "rtl" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
      >
        <View className="mb-5 flex-row-reverse items-center justify-between">
          <View className="items-end">
            <Text className="text-2xl font-bold text-foreground">
              تراکنش‌ها
            </Text>
            <Text className="mt-1 text-xs text-muted">
              دفتر روزانه · {state.transactions.length} سند ثبت‌شده
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/transaction/new")}
            className="h-11 w-11 items-center justify-center rounded-2xl bg-primary"
          >
            <Feather name="plus" size={22} color="white" />
          </TouchableOpacity>
        </View>
        <View className="mb-4 flex-row-reverse items-center rounded-2xl border border-border bg-surface px-3">
          <Feather name="search" size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="جست‌وجوی طرف معامله یا شرح"
            placeholderTextColor={colors.muted}
            className="flex-1 p-3 text-right text-sm text-foreground"
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: "row-reverse", gap: 8 }}
          className="mb-5"
        >
          {filters.map((item) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => setFilter(item.value)}
              className={`rounded-full border px-4 py-2 ${filter === item.value ? "border-primary bg-primary" : "border-border bg-surface"}`}
            >
              <Text
                className={`text-xs font-semibold ${filter === item.value ? "text-white" : "text-muted"}`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <SectionHeader
          title={
            filter === "all" ? "همه تراکنش‌ها" : getTransactionTypeLabel(filter)
          }
        />
        {visible.length ? (
          visible.map((transaction) => (
            <TransactionRow key={transaction.id} {...transaction} />
          ))
        ) : (
          <EmptyState
            title="تراکنشی پیدا نشد"
            detail="فیلتر یا عبارت جست‌وجو را تغییر دهید."
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
