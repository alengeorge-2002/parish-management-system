import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../theme/colors";
import { Card, Pill, Button, ModalOverlay, Field, Input } from "../components/UIComponents";
import { useApp } from "../lib/app-context";
import { FEASTS_MARCH, MASS_TIMINGS } from "../lib/data";

const DAYS_IN_MONTH = 31;

export default function CalendarScreen() {
  const { tt, lang } = useApp();
  const [selectedDay, setSelectedDay] = useState(19);
  const [modalVisible, setModalVisible] = useState(false);

  const selFeast = FEASTS_MARCH.find((f) => f.date === selectedDay);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
      {/* Calendar Bar */}
      <View style={styles.topBar}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={styles.monthTitle}>March 2026</Text>
        </View>

        <Button onPress={() => setModalVisible(true)}>
          <Text style={{ color: Colors.primaryForeground, fontWeight: "700" }}>+ {tt("scheduleFeast")}</Text>
        </Button>
      </View>

      <View style={styles.gridRow}>
        {/* Calendar Grid Box */}
        <Card style={styles.calGridCard}>
          <View style={styles.weekHeader}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Text key={day} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1).map((d) => {
              const feast = FEASTS_MARCH.find((f) => f.date === d);
              const isSelected = d === selectedDay;
              return (
                <TouchableOpacity
                  key={d}
                  onPress={() => setSelectedDay(d)}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                  ]}
                >
                  <Text style={[styles.dayNum, isSelected && { color: Colors.primary }]}>{d}</Text>
                  {feast && (
                    <Text style={styles.feastLabel} numberOfLines={1}>
                      {lang === "en" ? feast.saintEn : feast.saintMl}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Selected Day Panel */}
        <Card style={styles.detailCard}>
          <Text style={styles.dateHeading}>March {selectedDay}, 2026</Text>
          {selFeast ? (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.saintTitle}>{selFeast.saintEn}</Text>
              <Text style={styles.saintMl}>{selFeast.saintMl}</Text>
              <Pill tone="violet" style={{ marginTop: 6 }}>{selFeast.season.toUpperCase()}</Pill>
            </View>
          ) : (
            <Text style={{ color: Colors.mutedForeground, fontSize: 12, marginTop: 6 }}>
              Ferial day — no major feast
            </Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.massHeader}>⏰ {tt("massTimings")}</Text>
          <View style={{ gap: 8, marginTop: 8 }}>
            {MASS_TIMINGS.map((m, i) => (
              <View key={i} style={styles.massBox}>
                <Text style={styles.massTime}>{m.time}</Text>
                <Pill tone={m.language === "English" ? "blue" : "gold"}>{m.language}</Pill>
                <Text style={styles.massPriest}>{m.priest}</Text>
              </View>
            ))}
          </View>
        </Card>
      </View>

      <ModalOverlay
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={tt("scheduleFeast")}
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
        <Field label="Feast Event Title">
          <Input placeholder="e.g. Feast of St. Joseph" />
        </Field>
        <Field label="Date">
          <Input placeholder="YYYY-MM-DD" />
        </Field>
        <Field label="Mass Time">
          <Input placeholder="07:00 AM" />
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
  monthTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.foreground,
  },
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  calGridCard: {
    flex: 1.8,
    minWidth: 320,
  },
  detailCard: {
    flex: 1,
    minWidth: 260,
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  weekDayText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.mutedForeground,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  dayCell: {
    width: "13%",
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "rgba(28, 33, 42, 0.3)",
    padding: 4,
    justifyContent: "space-between",
  },
  dayCellSelected: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(244, 196, 48, 0.1)",
  },
  dayNum: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.foreground,
  },
  feastLabel: {
    fontSize: 8,
    color: Colors.mutedForeground,
  },
  dateHeading: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.mutedForeground,
    textTransform: "uppercase",
  },
  saintTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.foreground,
  },
  saintMl: {
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 14,
  },
  massHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.foreground,
  },
  massBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(28, 33, 42, 0.4)",
    padding: 8,
    borderRadius: 8,
  },
  massTime: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "monospace",
    color: Colors.foreground,
  },
  massPriest: {
    fontSize: 10,
    color: Colors.mutedForeground,
    marginLeft: "auto",
  },
});
