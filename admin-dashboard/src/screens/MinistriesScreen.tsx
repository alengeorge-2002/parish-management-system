import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../theme/colors";
import { Card, Pill, Button, ModalOverlay, Field, Input } from "../components/UIComponents";
import { useApp } from "../lib/app-context";
import { MINISTRIES, type Ministry } from "../lib/data";

const catTone: Record<Ministry["category"], "gold" | "blue" | "green" | "violet" | "neutral"> = {
  Liturgical: "gold",
  Youth: "blue",
  Charity: "green",
  Catechetical: "violet",
  Devotional: "neutral",
};

const CATS = ["All", "Liturgical", "Youth", "Charity", "Catechetical", "Devotional"] as const;

export default function MinistriesScreen() {
  const { lang, tt } = useApp();
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [modalVisible, setModalVisible] = useState(false);

  const filtered = MINISTRIES.filter((m) => cat === "All" || m.category === cat);
  const totalMembers = MINISTRIES.reduce((s, m) => s + m.members, 0);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
      <View style={styles.topBar}>
        <View style={styles.catPillsRow}>
          {CATS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setCat(c)}
              style={[styles.catBtn, cat === c && styles.catBtnActive]}
            >
              <Text style={[styles.catText, cat === c && styles.catTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button onPress={() => setModalVisible(true)}>
          <Text style={{ color: Colors.primaryForeground, fontWeight: "700" }}>+ Add Ministry</Text>
        </Button>
      </View>

      <Text style={styles.statsText}>
        Total volunteers: <Text style={{ fontWeight: "700", color: Colors.foreground }}>{totalMembers.toLocaleString()}</Text>
      </Text>

      <View style={styles.grid}>
        {filtered.map((m) => (
          <Card key={m.id} style={styles.ministryCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <Text style={{ fontSize: 18 }}>🤲</Text>
              </View>
              <Pill tone={catTone[m.category]}>{m.category}</Pill>
            </View>

            <Text style={styles.ministryName}>{m.name}</Text>
            <Text style={styles.ministryMl}>{m.nameMl}</Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>👥 {m.members} members</Text>
              <Text style={styles.infoText}>🕒 Meets: {m.meets}</Text>
            </View>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.coordLabel}>Coordinator</Text>
                <Text style={styles.coordName}>{m.coordinator}</Text>
              </View>
              <Text style={styles.phoneText}>📞 {m.phone}</Text>
            </View>
          </Card>
        ))}
      </View>

      <ModalOverlay
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Add Ministry / Group"
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
        <Field label="Ministry Name">
          <Input placeholder="e.g. Parish Choir" />
        </Field>
        <Field label="Category">
          <Input placeholder="Liturgical" />
        </Field>
        <Field label="Coordinator">
          <Input placeholder="Mr. Jocy Fernandez" />
        </Field>
        <Field label="Meeting Schedule">
          <Input placeholder="Fri 7:00 PM" />
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
    flexWrap: "wrap",
  },
  catPillsRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  catBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.secondary,
  },
  catBtnActive: {
    backgroundColor: "rgba(244, 196, 48, 0.15)",
    borderColor: Colors.primary,
  },
  catText: {
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  catTextActive: {
    color: Colors.primary,
    fontWeight: "700",
  },
  statsText: {
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  ministryCard: {
    width: "31%",
    minWidth: 280,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(244, 196, 48, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  ministryName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.foreground,
    marginTop: 10,
  },
  ministryMl: {
    fontSize: 11,
    color: Colors.mutedForeground,
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
  infoText: {
    fontSize: 11,
    color: Colors.mutedForeground,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  coordLabel: {
    fontSize: 10,
    color: Colors.mutedForeground,
  },
  coordName: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.foreground,
  },
  phoneText: {
    fontSize: 11,
    color: Colors.info,
    fontFamily: "monospace",
  },
});
