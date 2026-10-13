import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Colors } from "../theme/colors";
import { Card, Pill, Button, IconButton, ModalOverlay, Field, Input } from "../components/UIComponents";
import { useApp } from "../lib/app-context";
import { CLERGY } from "../lib/data";

export default function ClergyScreen() {
  const { tt, lang } = useApp();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
      <View style={styles.topBar}>
        <Text style={styles.statsText}>
          <Text style={{ fontWeight: "700", color: Colors.foreground }}>{CLERGY.length}</Text>{" "}
          {lang === "en" ? "clergy & council members" : "വൈദികരും കൗൺസിലംഗങ്ങളും"}
        </Text>
        <Button onPress={() => setModalVisible(true)}>
          <Text style={{ color: Colors.primaryForeground, fontWeight: "700" }}>+ Add New Clergy</Text>
        </Button>
      </View>

      <View style={styles.grid}>
        {CLERGY.map((c) => (
          <Card key={c.id} style={styles.clergyCard}>
            <View style={styles.cardHeader}>
              <View style={styles.avatarBox}>
                <Text style={{ fontSize: 24 }}>✝️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Pill tone={c.primary ? "gold" : "neutral"}>{c.title}</Pill>
                <Text style={styles.clergyName}>{c.name}</Text>
                <Text style={styles.clergyRole}>{c.role}</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.phoneText}>📞 {c.phone}</Text>
              <Text style={styles.tenureText}>📅 {tt("tenure")}: {c.tenure}</Text>
            </View>

            <View style={styles.cardFooter}>
              <Button variant="secondary" style={{ flex: 1, paddingVertical: 4 }}>
                <Text style={{ fontSize: 11, color: Colors.secondaryForeground }}>{tt("editContact")}</Text>
              </Button>
            </View>
          </Card>
        ))}
      </View>

      <ModalOverlay
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Add Clergy Record"
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
        <Field label="Full Name">
          <Input placeholder="e.g. Fr. Sebastian Vadakkumchery" />
        </Field>
        <Field label="Title / Office">
          <Input placeholder="e.g. Vicar" />
        </Field>
        <Field label="Role Description">
          <Input placeholder="Parish Priest" />
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
    justifyContent: "space-between",
    alignItems: "center",
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
  clergyCard: {
    width: "31%",
    minWidth: 280,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clergyName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.foreground,
    marginTop: 4,
  },
  clergyRole: {
    fontSize: 11,
    color: Colors.mutedForeground,
  },
  infoBox: {
    backgroundColor: "rgba(28, 33, 42, 0.4)",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 12,
    gap: 4,
  },
  phoneText: {
    fontSize: 11,
    color: Colors.info,
    fontFamily: "monospace",
  },
  tenureText: {
    fontSize: 11,
    color: Colors.mutedForeground,
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
