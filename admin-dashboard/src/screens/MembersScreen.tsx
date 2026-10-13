import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Colors } from "../theme/colors";
import { Card, Pill, StatusPill, Button, Input, ModalOverlay, Field, IconButton } from "../components/UIComponents";
import { useApp } from "../lib/app-context";
import { MEMBERS, WARDS, type Sacrament } from "../lib/data";

export default function MembersScreen() {
  const { tt } = useApp();
  const [q, setQ] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return MEMBERS.filter((m) => {
      if (query) {
        const hay = `${m.name} ${m.baptismName} ${m.phone} ${m.familyId} ${m.nameMl}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [q]);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
      {/* Search & Actions Bar */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Input
            placeholder="Search parishioner name, baptism name, phone..."
            value={q}
            onChangeText={setQ}
            style={{ height: 38 }}
          />
        </View>
        <Button onPress={() => setModalVisible(true)}>
          <Text style={{ color: Colors.primaryForeground, fontWeight: "700" }}>+ {tt("addMember")}</Text>
        </Button>
      </View>

      {/* Member Roster Card */}
      <Card style={{ padding: 0 }}>
        <View style={styles.cardHeader}>
          <Text style={styles.headerText}>
            Showing <Text style={{ color: Colors.foreground, fontWeight: "700" }}>{filtered.length}</Text> of{" "}
            {MEMBERS.length} parishioners
          </Text>
        </View>
        <View style={styles.divider} />

        {filtered.map((m) => (
          <View key={m.id} style={styles.row}>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 16 }}>👤</Text>
            </View>
            <View style={{ flex: 1, minWidth: 150 }}>
              <Text style={styles.memberName}>{m.name}</Text>
              <Text style={styles.memberNameMl}>{m.nameMl}</Text>
            </View>
            <View style={{ minWidth: 120 }}>
              <Text style={styles.houseName}>{m.familyHouse}</Text>
            </View>
            <View style={{ minWidth: 100 }}>
              <Pill tone="gold">#{m.ward} · {m.wardPatron}</Pill>
            </View>
            <View style={{ minWidth: 100 }}>
              <Text style={styles.phoneText}>{m.phone}</Text>
            </View>
            <View style={{ minWidth: 60 }}>
              <Pill tone="red">{m.blood}</Pill>
            </View>
            <View style={{ minWidth: 80 }}>
              <StatusPill status={m.status} />
            </View>
            <View style={styles.actions}>
              <IconButton style={{ width: 28, height: 28 }}>
                <Text style={{ fontSize: 12 }}>✏️</Text>
              </IconButton>
              <IconButton style={{ width: 28, height: 28 }}>
                <Text style={{ fontSize: 12, color: Colors.danger }}>🗑️</Text>
              </IconButton>
            </View>
          </View>
        ))}
      </Card>

      {/* Add Member Modal */}
      <ModalOverlay
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={tt("addMember")}
        subtitle="New parishioner record"
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
          <Input placeholder="e.g. Joseph Thekkedathu" />
        </Field>
        <Field label="Malayalam Name">
          <Input placeholder="ജോസഫ് തെക്കേടത്ത്" />
        </Field>
        <Field label="Baptism Name">
          <Input placeholder="Joseph" />
        </Field>
        <Field label="Mobile Number">
          <Input placeholder="+91 " />
        </Field>
        <Field label="Blood Group">
          <Input placeholder="e.g. O+" />
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
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerText: {
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexWrap: "wrap",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  memberName: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.foreground,
  },
  memberNameMl: {
    fontSize: 11,
    color: Colors.mutedForeground,
  },
  houseName: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.foreground,
  },
  familyId: {
    fontSize: 10,
    color: Colors.mutedForeground,
    fontFamily: "monospace",
  },
  phoneText: {
    fontSize: 11,
    color: Colors.mutedForeground,
    fontFamily: "monospace",
  },
  actions: {
    flexDirection: "row",
    gap: 4,
    marginLeft: "auto",
  },
});
