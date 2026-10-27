import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 60 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "خانه",
          tabBarIcon: ({ color }) => <IconSymbol size={23} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen name="transactions" options={{ title: "تراکنش‌ها", tabBarIcon: ({ color }) => <IconSymbol size={23} name="arrow.left.arrow.right" color={color} /> }} />
      <Tabs.Screen name="sales" options={{ title: "فروش/خرید", tabBarIcon: ({ color }) => <IconSymbol size={23} name="bag.fill" color={color} /> }} />
      <Tabs.Screen name="parties" options={{ title: "طرف‌ها", tabBarIcon: ({ color }) => <IconSymbol size={23} name="person.2.fill" color={color} /> }} />
      <Tabs.Screen name="reports" options={{ title: "گزارش‌ها", tabBarIcon: ({ color }) => <IconSymbol size={23} name="chart.bar.fill" color={color} /> }} />
      <Tabs.Screen name="more" options={{ href: null }} />
    </Tabs>
  );
}
