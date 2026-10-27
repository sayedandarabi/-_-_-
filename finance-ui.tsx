import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { PropsWithChildren } from "react";
import { Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from "react-native";
import { useColors } from "@/hooks/use-colors";
import {
  formatAfghani,
  getSyncLabel,
  getTransactionTypeLabel,
  type SyncStatus,
  type TransactionType,
} from "@/lib/accounting/domain";

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const colors = useColors();
  return (
    <View className="mb-3 flex-row-reverse items-center justify-between">
      <Text className="text-lg font-bold text-foreground">{title}</Text>
      {action && onAction ? (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text
            style={{ color: colors.primary }}
            className="text-sm font-semibold"
          >
            {action}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function SurfaceCard({
  children,
  className = "",
  style,
}: PropsWithChildren<{ className?: string; style?: StyleProp<ViewStyle> }>) {
  return (
    <View
      style={style}
      className={`rounded-3xl border border-border bg-surface p-4 ${className}`}
    >
      {children}
    </View>
  );
}

export function StatCard({
  label,
  value,
  icon,
  tone = "primary",
  hint,
}: {
  label: string;
  value: string;
  icon: keyof typeof Feather.glyphMap;
  tone?: "primary" | "success" | "warning" | "error";
  hint?: string;
}) {
  const colors = useColors();
  const color = colors[tone];
  return (
    <SurfaceCard className="min-w-[46%] flex-1">
      <View className="mb-3 flex-row-reverse items-center justify-between">
        <View
          style={{ backgroundColor: `${color}1A` }}
          className="h-9 w-9 items-center justify-center rounded-2xl"
        >
          <Feather name={icon} size={18} color={color} />
        </View>
        {hint ? <Text className="text-xs text-muted">{hint}</Text> : null}
      </View>
      <Text className="text-xs text-muted">{label}</Text>
      <Text className="mt-1 text-xl font-bold text-foreground">{value}</Text>
    </SurfaceCard>
  );
}

export function SyncBadge({ status }: { status: SyncStatus }) {
  const colors = useColors();
  const map = {
    pending: { color: colors.warning, icon: "clock" as const },
    synced: { color: colors.success, icon: "check-circle" as const },
    conflict: { color: colors.error, icon: "alert-circle" as const },
  };
  const item = map[status];
  return (
    <View className="flex-row-reverse items-center gap-1">
      <Feather name={item.icon} size={12} color={item.color} />
      <Text style={{ color: item.color }} className="text-[11px] font-medium">
        {getSyncLabel(status)}
      </Text>
    </View>
  );
}

export function TransactionRow({
  type,
  amount,
  partyName,
  description,
  date,
  syncStatus,
  onPress,
}: {
  type: TransactionType;
  amount: number;
  partyName?: string;
  description: string;
  date: string;
  syncStatus: SyncStatus;
  onPress?: () => void;
}) {
  const colors = useColors();
  const positive = type === "income" || type === "sale";
  const icon = positive
    ? "arrow-down-left"
    : type === "transfer"
      ? "repeat"
      : "arrow-up-right";
  const color = positive ? colors.success : colors.error;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.75}
      className="mb-2 flex-row-reverse items-center rounded-2xl border border-border bg-background px-3 py-3"
    >
      <View
        style={{ backgroundColor: `${color}18` }}
        className="ml-3 h-10 w-10 items-center justify-center rounded-2xl"
      >
        <MaterialCommunityIcons name={icon} size={19} color={color} />
      </View>
      <View className="flex-1 items-end">
        <Text className="text-sm font-semibold text-foreground">
          {partyName || getTransactionTypeLabel(type)}
        </Text>
        <Text className="mt-0.5 text-xs text-muted">
          {description} ·{" "}
          {new Intl.DateTimeFormat("fa-AF", {
            month: "short",
            day: "numeric",
          }).format(new Date(date))}
        </Text>
      </View>
      <View className="items-start">
        <Text style={{ color }} className="text-sm font-bold">
          {positive ? "+" : "−"}
          {formatAfghani(amount)}
        </Text>
        <SyncBadge status={syncStatus} />
      </View>
    </TouchableOpacity>
  );
}

export function EmptyState({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  return (
    <SurfaceCard className="items-center py-8">
      <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Feather name="inbox" size={22} color="#0F766E" />
      </View>
      <Text className="text-base font-semibold text-foreground">{title}</Text>
      {detail ? (
        <Text className="mt-1 text-center text-sm text-muted">{detail}</Text>
      ) : null}
    </SurfaceCard>
  );
}
