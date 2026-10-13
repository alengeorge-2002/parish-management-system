import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Colors } from "../theme/colors";
import { Card, Button, IconButton } from "../components/UIComponents";
import { useApp } from "../lib/app-context";
import { WARDS } from "../lib/data";

export default function WardsScreen() {
  const { tt } = useApp();

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.grid}>
        {WARDS.map((w) => (
          <Card key={w.number} style={styles.wardCard}>
            <View style={styles.cardHeader}>
              <View style={styles.numberBox}>
                <Text style={styles.numberText}>{w.number}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.wardLabel}>WARD #{w.number}</Text>
                <Text style={styles.patronName}>{w.patron}</Text>
                <Text style={styles.patronMl}>{w.patronMl}</Text>
              </View>
            </View>

            <View style={styles.repBox}>
              <Text style={styles.repLabel}>{tt("wardRep").toUpperCase()}</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={styles.repName}>{w.rep}</Text>
                <Text style={styles.repPhone}>📞 {w.phone}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ fontSize: 16 }}>👥</Text>
                <Text style={styles.familyCount}>{w.families}</Text>
                <Text style={styles.familyText}>{tt("families")}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 6 }}>
                <Button variant="secondary" style={{ paddingVertical: 4, paddingHorizontal: 8 }}>
                  <Text style={{ fontSize: 11, color: Colors.secondaryForeground }}>{tt("viewHouseholds")} ›</Text>
                </Button>
                <IconButton style={{ width: 28, height: 28 }}>
                  <Text style={{ fontSize: 11 }}>✏️</Text>
                </IconButton>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  wardCard: {
    width: "31%",
    minWidth: 280,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  numberBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "rgba(244, 196, 48, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primary,
  },
  wardLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.mutedForeground,
  },
  patronName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.foreground,
  },
  patronMl: {
    fontSize: 11,
    color: Colors.mutedForeground,
  },
  repBox: {
    backgroundColor: "rgba(28, 33, 42, 0.4)",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 12,
    gap: 4,
  },
  repLabel: {
    fontSize: 10,
    color: Colors.mutedForeground,
  },
  repName: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.foreground,
  },
  repPhone: {
    fontSize: 11,
    color: Colors.info,
    fontFamily: "monospace",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  familyCount: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.foreground,
  },
  familyText: {
    fontSize: 11,
    color: Colors.mutedForeground,
  },
});
