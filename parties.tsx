import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { EmptyState, SectionHeader, SurfaceCard } from "@/components/finance-ui";
import { useColors } from "@/hooks/use-colors";
import { formatAfghani } from "@/lib/accounting/domain";
import { useLedger } from "@/lib/accounting/store";

export default function PartiesScreen() {
  const colors = useColors();
  const { state } = useLedger();
  const [filter, setFilter] = useState<"all" | "customer" | "supplier">("all");
  const parties = state.parties.filter((party) => filter === "all" || party.kind === filter || party.kind === "both");
  return (
    <ScreenContainer style={{ direction: "rtl" }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 110 }}>
        <View className="mb-5 flex-row-reverse items-center justify-between"><View className="items-end"><Text className="text-2xl font-bold text-foreground">طرف‌های معامله</Text><Text className="mt-1 text-xs text-muted">مشتریان، تأمین‌کنندگان و مانده حساب</Text></View><TouchableOpacity className="h-11 w-11 items-center justify-center rounded-2xl bg-primary"><Feather name="user-plus" size={20} color="white" /></TouchableOpacity></View>
        <View className="mb-5 flex-row-reverse gap-2"><TouchableOpacity onPress={() => setFilter("all")} className={`rounded-full border px-4 py-2 ${filter === "all" ? "border-primary bg-primary" : "border-border bg-surface"}`}><Text className={`text-xs font-semibold ${filter === "all" ? "text-white" : "text-muted"}`}>همه ({state.parties.length})</Text></TouchableOpacity><TouchableOpacity onPress={() => setFilter("customer")} className={`rounded-full border px-4 py-2 ${filter === "customer" ? "border-primary bg-primary" : "border-border bg-surface"}`}><Text className={`text-xs font-semibold ${filter === "customer" ? "text-white" : "text-muted"}`}>مشتری</Text></TouchableOpacity><TouchableOpacity onPress={() => setFilter("supplier")} className={`rounded-full border px-4 py-2 ${filter === "supplier" ? "border-primary bg-primary" : "border-border bg-surface"}`}><Text className={`text-xs font-semibold ${filter === "supplier" ? "text-white" : "text-muted"}`}>تأمین‌کننده</Text></TouchableOpacity></View>
        <SectionHeader title="فهرست طرف‌ها" />
        {parties.length ? parties.map((party) => { const positive = party.balance >= 0; return <SurfaceCard key={party.id} className="mb-3"><View className="flex-row-reverse items-center"><View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary/10"><Text className="text-lg font-bold text-primary">{party.name.slice(0, 1)}</Text></View><View className="mr-3 flex-1 items-end"><Text className="text-sm font-bold text-foreground">{party.name}</Text><Text className="mt-1 text-xs text-muted">{party.kind === "supplier" ? "تأمین‌کننده" : "مشتری"} · {party.phone}</Text></View><View className="items-start"><Text style={{ color: positive ? colors.success : colors.warning }} className="text-sm font-bold">{formatAfghani(Math.abs(party.balance))}</Text><Text className="mt-1 text-[11px] text-muted">{positive ? "دریافتنی" : "پرداختنی"}</Text></View></View><View className="mt-3 flex-row-reverse items-center border-t border-border pt-3"><Text className="text-xs text-muted">آخرین فعالیت: {party.lastActivity}</Text><View className="flex-1" /><TouchableOpacity><Text className="text-xs font-semibold text-primary">جزئیات حساب</Text></TouchableOpacity></View></SurfaceCard>; }) : <EmptyState title="طرفی ثبت نشده" />}
      </ScrollView>
    </ScreenContainer>
  );
}
