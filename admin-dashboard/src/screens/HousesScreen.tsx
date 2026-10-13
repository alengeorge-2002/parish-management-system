import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Colors } from "../theme/colors";
import { Card, Pill, Button, Input, ModalOverlay, Field } from "../components/UIComponents";
import { useApp } from "../lib/app-context";
import { RELIGIOUS_HOUSES } from "../lib/data";

const typeTone: Record<string, "gold" | "blue" | "violet"> = {
  Convent: "gold",
  Monastery: "blue",
  "Formation House": "violet",
};

export default function HousesScreen() {
  const { lang, tt } = useApp();
  const [q, setQ] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const filtered = RELIGIOUS_HOUSES.filter((h) =>
    `${h.name} ${h.congregation} ${h.superior}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Input
            placeholder="Search houses, congregations..."
            value={q}
            onChangeText={setQ}
            style={{ height: 38 }}
          />
        </View>
        <Button onPress={() => setModalVisible(true)}>
          <Text style={{ color: Colors.primaryForeground, fontWeight: "700" }}>+ Add Religious House</Text>
        </Button>
      </View>

      <View style={styles.grid}>
        {filtered.map((h) => (
          <Card key={h.id} style={styles.houseCard}>
            <View style={styles.bannerBox}>
              <Text style={{ fontSize: 24 }}>🏛️</Text>
              <View style={styles.typeBadge}>
                <Pill tone={typeTone[h.type] || "gold"}>{h.type}</Pill>
              </View>
            </View>

            <View style={{ padding: 12 }}>
              <Text style={styles.houseName}>{h.name}</Text>
              <Text style={styles.houseMl}>{h.nameMl}</Text>
              <Text style={styles.congregation}>{h.congregation}</Text>

              <View style={styles.infoBox}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Superior:</Text>
                  <Text style={styles.infoVal}>{h.superior}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Established:</Text>
                  <Text style={styles.infoVal}>{h.established}</Text>
                </View>
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>👥 {h.members} members</Text>
                <Text style={styles.footerText}>📞 {h.phone}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <ModalOverlay
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Add Religious House"
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
        <Field label="House Name">
          <Input placeholder="e.g. Carmel Convent" />
        </Field>
        <Field label="Congregation">
          <Input placeholder="CMC Sisters" />
        </Field>
        <Field label="Superior Name">
          <Input placeholder="Sr. Little Rose CMC" />
        </Field>
        <Field label="Phone">
          <Input placeholder="+91 " />
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
  houseCard: {
    width: "31%",
    minWidth: 280,
    padding: 0,
    overflow: "hidden",
  },
  bannerBox: {
    height: 90,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  typeBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
  },
  houseName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.foreground,
  },
  houseMl: {
    fontSize: 11,
    color: Colors.mutedForeground,
  },
  congregation: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: "rgba(28, 33, 42, 0.4)",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 10,
    gap: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.mutedForeground,
  },
  infoVal: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.foreground,
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
  footerText: {
    fontSize: 11,
    color: Colors.mutedForeground,
  },
});
