import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import type { ViewStyle, TextStyle, StyleProp } from "react-native";
import { Colors } from "../theme/colors";

/* ---------- Card ---------- */
export function Card({
  children,
  style,
  glow = false,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glow?: boolean;
}) {
  return (
    <View
      style={[
        styles.card,
        glow && styles.cardGlow,
        style,
      ]}
    >
      {children}
    </View>
  );
}

/* ---------- Pill / Badge ---------- */
export type Tone = "gold" | "green" | "red" | "blue" | "violet" | "neutral";

const toneBg: Record<Tone, string> = {
  gold: "rgba(244, 196, 48, 0.12)",
  green: "rgba(34, 197, 94, 0.12)",
  red: "rgba(239, 68, 68, 0.12)",
  blue: "rgba(56, 189, 248, 0.12)",
  violet: "rgba(139, 92, 246, 0.15)",
  neutral: Colors.secondary,
};

const toneText: Record<Tone, string> = {
  gold: Colors.primary,
  green: Colors.success,
  red: Colors.danger,
  blue: Colors.info,
  violet: Colors.litLent,
  neutral: Colors.mutedForeground,
};

const toneBorder: Record<Tone, string> = {
  gold: "rgba(244, 196, 48, 0.25)",
  green: "rgba(34, 197, 94, 0.25)",
  red: "rgba(239, 68, 68, 0.25)",
  blue: "rgba(56, 189, 248, 0.25)",
  violet: "rgba(139, 92, 246, 0.3)",
  neutral: Colors.border,
};

export function Pill({
  tone = "neutral",
  children,
  style,
}: {
  tone?: Tone;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: toneBg[tone],
          borderColor: toneBorder[tone],
        },
        style,
      ]}
    >
      {typeof children === "string" ? (
        <Text style={[styles.pillText, { color: toneText[tone] }]}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { tone: Tone; label: string }> = {
    active: { tone: "green", label: "Active" },
    deceased: { tone: "neutral", label: "Deceased" },
    relocated: { tone: "blue", label: "Relocated" },
  };
  const s = map[status] ?? map.active;
  return <Pill tone={s.tone}>{s.label.toUpperCase()}</Pill>;
}

/* ---------- Buttons ---------- */
export function Button({
  variant = "primary",
  children,
  onPress,
  disabled,
  style,
}: {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bgColors = {
    primary: Colors.primary,
    secondary: Colors.secondary,
    ghost: "transparent",
    danger: "rgba(239, 68, 68, 0.12)",
  };

  const textColors = {
    primary: Colors.primaryForeground,
    secondary: Colors.secondaryForeground,
    ghost: Colors.mutedForeground,
    danger: Colors.danger,
  };

  const borderColors = {
    primary: Colors.primary,
    secondary: Colors.borderStrong,
    ghost: "transparent",
    danger: "rgba(239, 68, 68, 0.25)",
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: bgColors[variant],
          borderColor: borderColors[variant],
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {typeof children === "string" ? (
        <Text style={[styles.buttonText, { color: textColors[variant] }]}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

export function IconButton({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.iconButton, style]}
    >
      {children}
    </TouchableOpacity>
  );
}

/* ---------- Field & Input ---------- */
export function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.fieldContainer, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export function Input({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  style,
  multiline,
  numberOfLines,
}: {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  style?: StyleProp<TextStyle>;
  multiline?: boolean;
  numberOfLines?: number;
}) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="rgba(148, 163, 184, 0.6)"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={numberOfLines}
      style={[
        styles.input,
        multiline && { height: (numberOfLines || 3) * 24, textAlignVertical: "top" },
        style,
      ]}
    />
  );
}

/* ---------- Modal ---------- */
export function ModalOverlay({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>{title}</Text>
              {subtitle && <Text style={styles.modalSubtitle}>{subtitle}</Text>}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Text style={{ color: Colors.mutedForeground, fontSize: 16, fontWeight: "bold" }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>{children}</ScrollView>

          {footer && <View style={styles.modalFooter}>{footer}</View>}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ---------- React Native Flex BarChart Component ---------- */
export function FlexBarChart({
  data,
  height = 200,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={[styles.chartContainer, { height }]}>
      <View style={styles.chartBarsRow}>
        {data.map((item, index) => {
          const barHeightPct = (item.value / maxValue) * 100;
          return (
            <View key={index} style={styles.chartCol}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${barHeightPct}%`,
                      backgroundColor: index % 3 === 0 ? Colors.primary : Colors.borderStrong,
                    },
                  ]}
                />
              </View>
              <Text style={styles.chartLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  cardGlow: {
    borderColor: "rgba(244, 196, 48, 0.3)",
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
  pillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldContainer: {
    gap: 6,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.mutedForeground,
  },
  input: {
    backgroundColor: Colors.input,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.foreground,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    width: "100%",
    maxWidth: 600,
    maxHeight: "85%",
    backgroundColor: Colors.popover,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.foreground,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  chartContainer: {
    width: "100%",
    justifyContent: "flex-end",
    paddingTop: 10,
  },
  chartBarsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    flex: 1,
    gap: 4,
  },
  chartCol: {
    flex: 1,
    alignItems: "center",
    height: "100%",
  },
  barTrack: {
    flex: 1,
    width: "100%",
    backgroundColor: Colors.secondary,
    borderRadius: 4,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 4,
  },
  chartLabel: {
    fontSize: 10,
    color: Colors.mutedForeground,
    marginTop: 4,
  },
});
