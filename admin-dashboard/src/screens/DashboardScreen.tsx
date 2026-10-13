import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Colors } from "../theme/colors";
import { Card, Pill, FlexBarChart, Button } from "../components/UIComponents";
import { useApp } from "../lib/app-context";
import { WARDS, MASS_TIMINGS, BULLETINS, RECENT_REGISTRATIONS, type Bulletin } from "../lib/data";

function KpiCard({
  icon,
  label,
  value,
  sub,
  trend,
}: {
  icon: string;
  label: string;
  value: string;
  sub: React.ReactNode;
  trend: string;
}) {
  return (
    <Card style={styles.kpiCard}>
      <View style={styles.kpiHeader}>
        <View style={styles.kpiIconBox}>
          <Text style={{ fontSize: 18 }}>{icon}</Text>
        </View>
        <Pill tone="green">📈 {trend}</Pill>
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
      <View style={styles.kpiSubDivider} />
      {sub}
    </Card>
  );
}

export default function DashboardScreen() {
  const { tt } = useApp();
  const [bulletins, setBulletins] = useState<Bulletin[]>(BULLETINS);

  const wardChartData = WARDS.map((w) => ({
    label: `#${w.number}`,
    value: w.families,
  }));

  const toggleBulletin = (id: string) => {
    setBulletins((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: b.status === "active" ? "draft" : "active" } : b))
    );
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 20, paddingBottom: 24 }}>
      {/* KPI Cards Row */}
      <View style={styles.kpiGrid}>
        <KpiCard
          icon="👥"
          label={tt("totalParishioners")}
          value="3,420"
          trend="+2.4%"
          sub={
            <View style={{ gap: 4 }}>
              <View style={styles.genderBarTrack}>
                <View style={[styles.genderBarMale, { width: "50%" }]} />
                <View style={[styles.genderBarFemale, { width: "50%" }]} />
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={styles.subText}>♂ 1,712 male</Text>
                <Text style={styles.subText}>♀ 1,708 female</Text>
              </View>
            </View>
          }
        />
        <KpiCard
          icon="🏠"
          label={tt("registeredFamilies")}
          value="1,048"
          trend="+1.1%"
          sub={<Text style={styles.subText}>{tt("across16Wards")}</Text>}
        />
        <KpiCard
          icon="✝️"
          label={tt("activeClergy")}
          value="12"
          trend="+1"
          sub={<Text style={styles.subText}>2 clergy · 6 council · 4 catechists</Text>}
        />
        <KpiCard
          icon="✨"
          label={tt("upcomingFeasts")}
          value="3"
          trend={tt("thisWeek")}
          sub={<Text style={styles.subText}>Next: St. Joseph — Mar 19</Text>}
        />
      </View>

      {/* Main Grid: Registrations & Bulletins | Mass & Ward Chart */}
      <View style={styles.mainGrid}>
        {/* Left Column */}
        <View style={styles.leftCol}>
          <Card style={{ padding: 0 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{tt("recentRegistrations")}</Text>
            </View>
            <View style={styles.divider} />
            {RECENT_REGISTRATIONS.map(({ member, when }, i) => (
              <View key={i} style={styles.regRow}>
                <View style={styles.regAvatar}>
                  <Text style={{ fontSize: 16 }}>👤</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.regName}>{member.name}</Text>
                  <Text style={styles.regNameMl}>{member.nameMl}</Text>
                </View>
                <Pill tone="gold">{member.familyHouse}</Pill>
                <Text style={styles.regTime}>🕒 {when}</Text>
              </View>
            ))}
          </Card>

          <Card>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{tt("bulletins")}</Text>
            </View>
            <View style={{ gap: 12, marginTop: 10 }}>
              {bulletins.map((b) => (
                <View key={b.id} style={styles.bulletinCard}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={styles.bulletinTitle}>{b.title}</Text>
                      <Pill tone={b.status === "active" ? "green" : "neutral"}>
                        {b.status === "active" ? tt("active") : tt("draft")}
                      </Pill>
                    </View>
                    <Text style={styles.bulletinExcerpt}>{b.excerpt}</Text>
                    <Text style={styles.bulletinDate}>{b.date}</Text>
                  </View>
                  <Button
                    variant={b.status === "active" ? "secondary" : "primary"}
                    onPress={() => toggleBulletin(b.id)}
                    style={{ paddingVertical: 4, paddingHorizontal: 10 }}
                  >
                    {b.status === "active" ? "Draft" : "Publish"}
                  </Button>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Right Column */}
        <View style={styles.rightCol}>
          <Card style={{ padding: 0 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{tt("todaysMass")}</Text>
            </View>
            <View style={styles.divider} />
            {MASS_TIMINGS.map((m, i) => (
              <View key={i} style={styles.massRow}>
                <Text style={styles.massTime}>{m.time}</Text>
                <Pill tone={m.language === "English" ? "blue" : "gold"}>{m.language}</Pill>
                <Text style={styles.massPriest}>{m.priest}</Text>
              </View>
            ))}
          </Card>

          <Card>
            <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>{tt("wardDistribution")}</Text>
            <FlexBarChart data={wardChartData} height={180} />
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  kpiCard: {
    flex: 1,
    minWidth: 220,
  },
  kpiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kpiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(244, 196, 48, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.foreground,
    marginTop: 12,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  kpiSubDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  genderBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondary,
    flexDirection: "row",
    overflow: "hidden",
  },
  genderBarMale: {
    backgroundColor: Colors.info,
    height: "100%",
  },
  genderBarFemale: {
    backgroundColor: Colors.litLent,
    height: "100%",
  },
  subText: {
    fontSize: 11,
    color: Colors.mutedForeground,
  },
  mainGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  leftCol: {
    flex: 1.8,
    minWidth: 320,
    gap: 16,
  },
  rightCol: {
    flex: 1,
    minWidth: 280,
    gap: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.foreground,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  regRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  regAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  regName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.foreground,
  },
  regNameMl: {
    fontSize: 11,
    color: Colors.mutedForeground,
  },
  regTime: {
    fontSize: 11,
    color: Colors.mutedForeground,
  },
  bulletinCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(28, 33, 42, 0.4)",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  bulletinTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.foreground,
  },
  bulletinExcerpt: {
    fontSize: 11,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  bulletinDate: {
    fontSize: 10,
    color: Colors.mutedForeground,
    marginTop: 4,
  },
  massRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  massTime: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "monospace",
    color: Colors.foreground,
  },
  massPriest: {
    fontSize: 11,
    color: Colors.mutedForeground,
    marginLeft: "auto",
  },
});
