import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Colors } from "../theme/colors";
import { Card, Pill, Button, Input, ModalOverlay, Field } from "../components/UIComponents";
import { useApp } from "../lib/app-context";
import { FAMILIES, WARDS } from "../lib/data";

export default function FamiliesScreen() {
  const { tt } = useApp();
  const [q, setQ] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return FAMILIES.filter((f) => {
      if (query && !`${f.name} ${f.house} ${f.id}`.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [q]);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
      {/* Search & Actions Bar */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Input
            placeholder="Search family name, house, or ID..."
            value={q}
            onChangeText={setQ}
            style={{ height: 38 }}
          />
        </View>
        <Button onPress={() => setModalVisible(true)}>
          <Text style={{ color: Colors.primaryForeground, fontWeight: "700" }}>+ {tt("addFamily")}</Text>
        </Button>
      </View>

      {/* Family Cards Grid */}
      <View style={styles.grid}>
        {filtered.map((f) => {
          const wardNum = typeof f.ward === "number" ? f.ward : (f as any).ward?.ward_number || (f as any).ward?.number || "1";
          const wardName = f.wardPatron || (f as any).ward?.ward_name || (f as any).ward?.patron || "Ward";

          return (
            <Card key={f.id} style={styles.familyCard}>
              <View style={styles.bannerBox}>
                <Text style={{ fontSize: 24 }}>🏡</Text>
                <View style={styles.wardBadge}>
                  <Pill tone="gold">
                    #{wardNum} · {wardName}
                  </Pill>
                </View>
              </View>

            <View style={{ padding: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={styles.houseName}>{f.house}</Text>
                <Text style={styles.familyId}>{f.id}</Text>
              </View>

              <View style={styles.headRow}>
                <Text style={{ fontSize: 13 }}>👤</Text>
                <Text style={styles.headName}>{f.head}</Text>
                <Text style={styles.phoneText}>· {f.phone}</Text>
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.memberCount}>👥 {f.memberCount} members</Text>
                <Button variant="ghost" style={{ paddingVertical: 2, paddingHorizontal: 6 }}>
                  <Text style={{ fontSize: 11, color: Colors.primary }}>{tt("viewRoster")} ›</Text>
                </Button>
              </View>
            </View>
          </Card>
        );
      })}
      </View>

      {/* Add Family Modal */}
      <ModalOverlay
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={tt("addFamily")}
        subtitle="New household record"
        footer={
          <>
            <Button variant="ghost" onPress={() => setModalVisible(false)}>
              {tt("cancel")}
            </Button>
            <Button onPress={() => setModalVisible(false)}>
              <Text style={{ color: Colors.primaryForeground, fontWeight: "700" }}>{tt("save")}</Text>
            </Button>
          </>
        }
      >
        <Field label="Family Name">
          <Input placeholder="e.g. Thekkedathu" />
        </Field>
        <Field label="House Name">
          <Input placeholder="e.g. Thekkedathu House" />
        </Field>
        <Field label="Head of Family">
          <Input placeholder="e.g. Joseph Thekkedathu" />
        </Field>
        <Field label="Ward Subdivision">
          <Input placeholder="Select ward e.g. Ward #1" />
        </Field>
        <Field label="Full Address">
          <Input multiline numberOfLines={3} placeholder="House address" />
        </Field>
      </ModalOverlay>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchBox: {
    flex: 1,
    maxWidth: 360,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  familyCard: {
    width: "31%",
    minWidth: 280,
    padding: 0,
    overflow: "hidden",
  },
  bannerBox: {
    height: 100,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  wardBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
  },
  houseName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.foreground,
  },
  familyId: {
    fontSize: 11,
    color: Colors.mutedForeground,
    fontFamily: "monospace",
  },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  headName: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.foreground,
  },
  phoneText: {
    fontSize: 11,
    color: Colors.mutedForeground,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  memberCount: {
    fontSize: 11,
    color: Colors.mutedForeground,
  },
});
