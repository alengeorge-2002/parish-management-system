import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Colors } from "../theme/colors";
import { Card, Pill, Button, IconButton, ModalOverlay, Field, Input } from "../components/UIComponents";
import { useApp } from "../lib/app-context";
import { BULLETINS, type Bulletin } from "../lib/data";

export default function AnnouncementsScreen() {
  const { tt } = useApp();
  const [items, setItems] = useState<Bulletin[]>(BULLETINS);
  const [modalVisible, setModalVisible] = useState(false);

  const toggle = (id: string) => {
    setItems((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: b.status === "active" ? "draft" : "active" } : b))
    );
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
      <View style={styles.topBar}>
        <Text style={styles.statsText}>
          <Text style={{ fontWeight: "700", color: Colors.foreground }}>
            {items.filter((b) => b.status === "active").length}
          </Text>{" "}
          active ·{" "}
          <Text style={{ fontWeight: "700", color: Colors.foreground }}>
            {items.filter((b) => b.status === "draft").length}
          </Text>{" "}
          drafts
        </Text>

        <Button onPress={() => setModalVisible(true)}>
          <Text style={{ color: Colors.primaryForeground, fontWeight: "700" }}>+ {tt("newBulletin")}</Text>
        </Button>
      </View>

      <View style={styles.grid}>
        {items.map((b) => (
          <Card key={b.id} style={styles.bulletinCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <Text style={{ fontSize: 18 }}>📢</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Pill tone={b.status === "active" ? "green" : "neutral"}>
                    {b.status === "active" ? tt("active") : tt("draft")}
                  </Pill>
                  <Text style={styles.dateText}>📅 {b.date}</Text>
                </View>
                <Text style={styles.titleText}>{b.title}</Text>
                <Text style={styles.excerptText}>{b.excerpt}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Button
                variant={b.status === "active" ? "secondary" : "primary"}
                onPress={() => toggle(b.id)}
                style={{ paddingVertical: 4, paddingHorizontal: 10 }}
              >
                <Text style={{ fontSize: 11, color: b.status === "active" ? Colors.secondaryForeground : Colors.primaryForeground }}>
                  {b.status === "active" ? "Set Draft" : "Publish"}
                </Text>
              </Button>

              <View style={{ flexDirection: "row", gap: 4 }}>
                <IconButton style={{ width: 28, height: 28 }}>
                  <Text style={{ fontSize: 11 }}>✏️</Text>
                </IconButton>
                <IconButton style={{ width: 28, height: 28 }}>
                  <Text style={{ fontSize: 11, color: Colors.danger }}>🗑️</Text>
                </IconButton>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <ModalOverlay
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={tt("newBulletin")}
        subtitle="Post a parish announcement"
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
        <Field label="Announcement Title">
          <Input placeholder="e.g. Great Lent Retreat Schedule" />
        </Field>
        <Field label="Content / Excerpt">
          <Input multiline numberOfLines={4} placeholder="Announcement details..." />
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
  bulletinCard: {
    width: "48%",
    minWidth: 300,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(244, 196, 48, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    fontSize: 10,
    color: Colors.mutedForeground,
  },
  titleText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.foreground,
    marginTop: 6,
  },
  excerptText: {
    fontSize: 12,
    color: Colors.mutedForeground,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
