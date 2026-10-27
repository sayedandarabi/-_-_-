import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { SurfaceCard } from "@/components/finance-ui";
import { useColors } from "@/hooks/use-colors";
import { useLedger } from "@/lib/accounting/store";
import type { Currency, TransactionType } from "@/lib/accounting/domain";

const types: { label: string; value: TransactionType }[] = [
  { label: "دریافت", value: "income" },
  { label: "پرداخت", value: "expense" },
  { label: "فروش", value: "sale" },
  { label: "خرید", value: "purchase" },
  { label: "انتقال", value: "transfer" },
  { label: "سند دستی", value: "manual" },
];
const methods = [
  { label: "نقدی", value: "cash" as const },
  { label: "بانکی", value: "bank" as const },
  { label: "موبایلی", value: "mobile" as const },
  { label: "نسیه", value: "credit" as const },
];

export default function NewTransactionScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const { state, addTransaction } = useLedger();
  const initialType = (
    params.type === "sale" || params.type === "purchase"
      ? params.type
      : "income"
  ) as TransactionType;
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState("");
  const [partyId, setPartyId] = useState<string | undefined>();
  const [description, setDescription] = useState("");
  const [method, setMethod] = useState<"cash" | "bank" | "mobile" | "credit">(
    "cash",
  );
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const party = useMemo(
    () => state.parties.find((item) => item.id === partyId),
    [partyId, state.parties],
  );

  const accounts = useMemo(() => {
    if (type === "expense" || type === "purchase")
      return {
        debitAccount: type === "purchase" ? "inventory" : "expense",
        creditAccount: "cash",
      };
    if (type === "transfer")
      return { debitAccount: "bank", creditAccount: "cash" };
    return {
      debitAccount: "cash",
      creditAccount: type === "sale" || type === "income" ? "sales" : "capital",
    };
  }, [type]);

  const submit = async () => {
    const numericAmount = Number(amount.replace(/,/g, ""));
    if (!numericAmount || numericAmount <= 0)
      return setError("مبلغ باید بیشتر از صفر باشد.");
    if (!description.trim()) return setError("شرح تراکنش را وارد کنید.");
    setError("");
    await addTransaction({
      type,
      amount: numericAmount,
      currency: "AFN" as Currency,
      date: new Date().toISOString(),
      ...accounts,
      partyId,
      partyName: party?.name,
      description: description.trim(),
      branch: "شعبه مرکزی",
      paymentMethod: method,
    });
    setSaved(true);
    setTimeout(() => router.back(), 650);
  };

  return (
    <ScreenContainer style={{ direction: "rtl" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-5 flex-row-reverse items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface"
            >
              <Feather name="x" size={19} color={colors.foreground} />
            </TouchableOpacity>
            <View className="items-end">
              <Text className="text-2xl font-bold text-foreground">
                تراکنش جدید
              </Text>
              <Text className="mt-1 text-xs text-muted">
                ثبت دوطرفه · ذخیره اول روی دستگاه
              </Text>
            </View>
          </View>
          <SurfaceCard className="mb-4">
            <Text className="mb-3 text-right text-sm font-bold text-foreground">
              نوع عملیات
            </Text>
            <View className="flex-row-reverse flex-wrap gap-2">
              {types.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => setType(item.value)}
                  className={`rounded-full border px-3 py-2 ${type === item.value ? "border-primary bg-primary" : "border-border bg-background"}`}
                >
                  <Text
                    className={`text-xs font-semibold ${type === item.value ? "text-white" : "text-muted"}`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SurfaceCard>
          <SurfaceCard className="mb-4">
            <Text className="mb-2 text-right text-sm font-bold text-foreground">
              مبلغ (افغانی)
            </Text>
            <TextInput
              value={amount}
              onChangeText={(value) =>
                setAmount(value.replace(/[^0-9٠-۹]/g, ""))
              }
              keyboardType="numeric"
              placeholder="۰"
              placeholderTextColor={colors.muted}
              className="rounded-2xl bg-background p-4 text-right text-2xl font-bold text-foreground"
            />
            <View className="mt-3 flex-row-reverse items-center">
              <Feather name="lock" size={13} color={colors.muted} />
              <Text className="mr-1 text-xs text-muted">
                ثبت سند: بدهکار {accounts.debitAccount} ← بستانکار{" "}
                {accounts.creditAccount}
              </Text>
            </View>
          </SurfaceCard>
          <SurfaceCard className="mb-4">
            <Text className="mb-3 text-right text-sm font-bold text-foreground">
              جزئیات
            </Text>
            <Text className="mb-2 text-right text-xs text-muted">
              طرف معامله (اختیاری)
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexDirection: "row-reverse", gap: 8 }}
              className="mb-3"
            >
              {state.parties.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() =>
                    setPartyId(partyId === item.id ? undefined : item.id)
                  }
                  className={`rounded-full border px-3 py-2 ${partyId === item.id ? "border-primary bg-primary" : "border-border bg-background"}`}
                >
                  <Text
                    className={`text-xs ${partyId === item.id ? "text-white" : "text-muted"}`}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text className="mb-2 text-right text-xs text-muted">شرح</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="مثلاً فروش نقدی روزانه"
              placeholderTextColor={colors.muted}
              multiline
              className="min-h-[76px] rounded-2xl bg-background p-3 text-right text-sm text-foreground"
            />
            <Text className="mb-2 mt-4 text-right text-xs text-muted">
              روش پرداخت
            </Text>
            <View className="flex-row-reverse flex-wrap gap-2">
              {methods.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => setMethod(item.value)}
                  className={`rounded-full border px-3 py-2 ${method === item.value ? "border-primary bg-primary" : "border-border bg-background"}`}
                >
                  <Text
                    className={`text-xs ${method === item.value ? "text-white" : "text-muted"}`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SurfaceCard>
          {error ? (
            <View className="mb-4 rounded-2xl border border-error/25 bg-error/10 p-3">
              <Text className="text-right text-xs text-error">{error}</Text>
            </View>
          ) : null}
          <TouchableOpacity
            onPress={submit}
            disabled={saved}
            activeOpacity={0.8}
            className="flex-row-reverse items-center justify-center gap-2 rounded-2xl bg-primary p-4"
          >
            {saved ? (
              <Feather name="check" size={18} color="white" />
            ) : (
              <Feather name="save" size={18} color="white" />
            )}
            <Text className="font-bold text-white">
              {saved ? "ذخیره شد" : "ذخیره تراکنش"}
            </Text>
          </TouchableOpacity>
          <Text className="mt-3 text-center text-xs leading-5 text-muted">
            با ذخیره، سند دوبل، رویداد ممیزی و عملیات همگام‌سازی ایجاد می‌شود.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
