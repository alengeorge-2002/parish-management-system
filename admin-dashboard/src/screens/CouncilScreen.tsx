import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Colors } from "../theme/colors";
import { Card, Pill, Button, IconButton, ModalOverlay, Field, Input } from "../components/UIComponents";
import { useApp } from "../lib/app-context";
import { COUNCIL_SEATS } from "../lib/data";

export default function CouncilScreen() {
  const { lang, tt } = useApp();
  const [modalVisible, setModalVisible] = useState(false);

  const filled = COUNCIL_SEATS.filter((s) => s.status === "filled").length;
  const vacant = COUNCIL_SEATS.length - filled;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
      <View style={styles.topBar}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pill tone="green">{filled} filled</Pill>
          <Pill tone="red">{vacant} vacant</Pill>
          <Text style={styles.termText}>Term 2024 – 2026</Text>
        </View>

        <Button onPress={() => setModalVisible(true)}>
          <Text style={{ color: Colors.primaryForeground, fontWeight: "700" }}>+ Add Council Seat</Text>
        </Button>
      </View>

      <Card style={{ padding: 0 }}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colHeader, { flex: 1.5 }]}>Seat / Office</Text>
          <Text style={[styles.colHeader, { flex: 1.5 }]}>Holder</Text>
          <Text style={[styles.colHeader, { width: 80 }]}>Ward</Text>
          <Text style={[styles.colHeader, { width: 100 }]}>Term</Text>
          <Text style={[styles.colHeader, { width: 90 }]}>Status</Text>
          <Text style={[styles.colHeader, { width: 80, textAlign: "right" }]}>Actions</Text>
        </View>
        <View style={styles.divider} />

        {COUNCIL_SEATS.map((s) => (
          <View key={s.id} style={styles.row}>
            <View style={{ flex: 1.5 }}>
              <Text style={styles.seatTitle}>{s.seat}</Text>
              <Text style={styles.seatMl}>{s.seatMl}</Text>
            </View>

            <View style={{ flex: 1.5 }}>
              {s.holder ? (
                <View>
                  <Text style={styles.holderName}>{s.holder}</Text>
                  {s.phone && <Text style={styles.phoneText}>{s.phone}</Text>}
                </View>
              ) : (
                <Text style={styles.unassignedText}>Unassigned</Text>
              )}
            </View>

            <View style={{ width: 80 }}>
              {s.ward ? <Pill tone="gold">#{s.ward}</Pill> : <Text style={{ color: Colors.mutedForeground }}>—</Text>}
            </View>

            <View style={{ width: 100 }}>
              <Text style={styles.termVal}>{s.term}</Text>
            </View>

            <View style={{ width: 90 }}>
              <Pill tone={s.status === "filled" ? "green" : "red"}>
                {s.status.toUpperCase()}
              </Pill>
            </View>

            <View style={{ width: 80, flexDirection: "row", justifyContent: "flex-end", gap: 4 }}>
              {s.status === "vacant" ? (
                <Button style={{ paddingVertical: 2, paddingHorizontal: 8 }}>
                  <Text style={{ fontSize: 10, color: Colors.primaryForeground }}>Assign</Text>
                </Button>
              ) : (
                <IconButton style={{ width: 28, height: 28 }}>
                  <Text style={{ fontSize: 11 }}>✏️</Text>
                </IconButton>
              )}
            </View>
          </View>
        ))}
      </Card>

      <ModalOverlay
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Add Council Seat"
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
        <Field label="Seat Office Title">
          <Input placeholder="e.g. Vice President" />
        </Field>
        <Field label="Holder Member Name">
          <Input placeholder="e.g. Mr. Varghese Ambatt" />
        </Field>
        <Field label="Ward Number">
          <Input placeholder="11" />
        </Field>
        <Field label="Term">
          <Input placeholder="2024 – 2026" />
        </Field>
      </ModalOverlay>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  termText: {
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(28, 33, 42, 0.4)",
  },
  colHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.mutedForeground,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  seatTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.foreground,
  },
  seatMl: {
    fontSize: 11,
    color: Colors.mutedForeground,
  },
  holderName: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.foreground,
  },
  phoneText: {
    fontSize: 11,
    color: Colors.mutedForeground,
    fontFamily: "monospace",
  },
  unassignedText: {
    fontSize: 12,
    fontStyle: "italic",
    color: Colors.mutedForeground,
  },
  termVal: {
    fontSize: 11,
    color: Colors.mutedForeground,
    fontFamily: "monospace",
  },
});
