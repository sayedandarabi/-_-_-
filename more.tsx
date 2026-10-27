import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { SectionHeader, SurfaceCard } from "@/components/finance-ui";
import { useLedger } from "@/lib/accounting/store";
import { useLanguage } from "@/lib/i18n/provider";

const rows = [
  { icon: "git-branch" as const, title: "شعبه فعال", detail: "شعبه مرکزی" },
  { icon: "calendar" as const, title: "دوره مالی", detail: "سال ۱۴۰۵" },
  {
    icon: "bell" as const,
    title: "اعلان‌ها",
    detail: "سررسید و خطای همگام‌سازی",
  },
  {
    icon: "shield" as const,
    title: "امنیت و دسترسی",
    detail: "قفل برنامه و نقش‌ها",
  },
  {
    icon: "help-circle" as const,
    title: "راهنما و پشتیبانی",
    detail: "پاسخ به پرسش‌های شما",
  },
];

export default function MoreScreen() {
  const { resetDemo } = useLedger();
  const { language, setLanguage } = useLanguage();
  const [confirmReset, setConfirmReset] = useState(false);
  return (
    <ScreenContainer style={{ direction: "rtl" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
      >
        <View className="mb-5 items-end">
          <Text className="text-2xl font-bold text-foreground">بیشتر</Text>
          <Text className="mt-1 text-xs text-muted">
            تنظیمات و ابزارهای حساب‌یار
          </Text>
        </View>
        <SurfaceCard className="mb-5" style={{ backgroundColor: "#0F766E", borderWidth: 0 }}>
          <View className="flex-row-reverse items-center">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Text className="text-lg font-bold text-white">س</Text>
            </View>
            <View className="mr-3 flex-1 items-end">
              <Text className="text-base font-bold text-white">
                سمیرا احمدی
              </Text>
              <Text className="mt-1 text-xs text-[#D7FFF0]">
                مدیر سازمان · فروشگاه پامیر
              </Text>
            </View>
            <Feather name="chevron-left" size={18} color="#D7FFF0" />
          </View>
          <View className="mt-4 flex-row-reverse items-center border-t border-white/20 pt-3">
            <Text className="text-xs text-[#D7FFF0]">
              نسخه رایگان · ۱۴ روز باقی‌مانده
            </Text>
            <View className="flex-1" />
            <Text className="text-xs font-bold text-white">ارتقا</Text>
          </View>
        </SurfaceCard>
        <SectionHeader title="تنظیمات کسب‌وکار" />
        <View className="mb-3 rounded-2xl border border-border bg-surface p-4">
          <View className="flex-row-reverse items-center justify-between"><View className="items-end"><Text className="text-sm font-semibold text-foreground">زبان برنامه</Text><Text className="mt-1 text-xs text-muted">فارسی و پشتو · انتخاب روی دستگاه ذخیره می‌شود</Text></View><Feather name="globe" size={20} color="#0F766E" /></View>
          <View className="mt-3 flex-row-reverse gap-2"><TouchableOpacity onPress={() => setLanguage("fa")} className={`flex-1 items-center rounded-xl border p-3 ${language === "fa" ? "border-primary bg-primary" : "border-border bg-background"}`}><Text className={`text-xs font-semibold ${language === "fa" ? "text-white" : "text-muted"}`}>فارسی</Text></TouchableOpacity><TouchableOpacity onPress={() => setLanguage("ps")} className={`flex-1 items-center rounded-xl border p-3 ${language === "ps" ? "border-primary bg-primary" : "border-border bg-background"}`}><Text className={`text-xs font-semibold ${language === "ps" ? "text-white" : "text-muted"}`}>پښتو</Text></TouchableOpacity></View>
        </View>
        {rows.map((row) => (
          <TouchableOpacity
            key={row.title}
            className="mb-2 flex-row-reverse items-center rounded-2xl border border-border bg-surface p-4"
          >
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <Feather name={row.icon} size={18} color="#0F766E" />
            </View>
            <View className="mr-3 flex-1 items-end">
              <Text className="text-sm font-semibold text-foreground">
                {row.title}
              </Text>
              <Text className="mt-1 text-xs text-muted">{row.detail}</Text>
            </View>
            <Feather name="chevron-left" size={18} color="#94A3B8" />
          </TouchableOpacity>
        ))}
        <SectionHeader title="داده و پشتیبان" />
        <TouchableOpacity className="mb-2 flex-row-reverse items-center rounded-2xl border border-border bg-surface p-4">
          <Feather name="download-cloud" size={19} color="#0F766E" />
          <View className="mr-3 flex-1 items-end">
            <Text className="text-sm font-semibold text-foreground">
              پشتیبان‌گیری و بازیابی
            </Text>
            <Text className="mt-1 text-xs text-muted">
              آخرین نسخه: امروز · فقط نمایشی در MVP
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setConfirmReset(true)}
          className="mt-5 items-center rounded-2xl border border-error/25 p-3"
        >
          <Text className="text-xs font-semibold text-error">
            بازنشانی داده‌های نمایشی
          </Text>
        </TouchableOpacity>
        {confirmReset ? (
          <View className="mt-3 rounded-2xl border border-warning/25 bg-warning/10 p-4">
            <Text className="text-right text-sm font-semibold text-foreground">
              بازنشانی داده‌های نمایشی؟
            </Text>
            <Text className="mt-1 text-right text-xs leading-5 text-muted">
              این گزینه فقط داده‌های محلی نمونه را به وضعیت اولیه برمی‌گرداند.
            </Text>
            <View className="mt-3 flex-row-reverse gap-2">
              <TouchableOpacity
                onPress={() => setConfirmReset(false)}
                className="flex-1 items-center rounded-xl border border-border bg-surface p-3"
              >
                <Text className="text-xs font-semibold text-muted">انصراف</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  await resetDemo();
                  setConfirmReset(false);
                }}
                className="flex-1 items-center rounded-xl bg-error p-3"
              >
                <Text className="text-xs font-semibold text-white">
                  بازنشانی
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        <Text className="mt-5 text-center text-xs leading-5 text-muted">
          اطلاعات مالی در این MVP روی دستگاه ذخیره می‌شود. فعال‌سازی سرویس ابری،
          مالیات و پرداخت نیازمند تنظیمات رسمی پروژه است.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
