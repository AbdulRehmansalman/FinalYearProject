import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import { LineChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

const Dashboard = () => {
  const [device, setDevice] = useState({
    status: "active",
    lastPing: "2025-02-25T14:30:00Z",
  });
  const [sensorReadings, setSensorReadings] = useState([
    {
      timestamp: "2025-02-25T14:25:00Z",
      type: "smoke",
      value: { smokeLevel: 0.0 },
    },
    {
      timestamp: "2025-02-25T14:24:00Z",
      type: "motion",
      value: { motionDetected: true },
    },
    {
      timestamp: "2025-02-25T14:23:00Z",
      type: "smoke",
      value: { smokeLevel: 0.1 },
    },
    {
      timestamp: "2025-02-25T14:22:00Z",
      type: "motion",
      value: { motionDetected: false },
    },
    {
      timestamp: "2025-02-25T14:21:00Z",
      type: "smoke",
      value: { smokeLevel: 0.0 },
    },
    {
      timestamp: "2025-02-25T14:20:00Z",
      type: "motion",
      value: { motionDetected: true },
    },
    {
      timestamp: "2025-02-25T14:19:00Z",
      type: "smoke",
      value: { smokeLevel: 0.2 },
    },
    {
      timestamp: "2025-02-25T14:18:00Z",
      type: "motion",
      value: { motionDetected: false },
    },
    {
      timestamp: "2025-02-25T14:17:00Z",
      type: "smoke",
      value: { smokeLevel: 0.0 },
    },
    {
      timestamp: "2025-02-25T14:16:00Z",
      type: "motion",
      value: { motionDetected: true },
    },
  ]);
  const [alerts, setAlerts] = useState([
    {
      id: "1",
      timestamp: "2025-02-25T14:30:00Z",
      status: "pending",
      soundConfidence: 0.92,
      weaponConfidence: 0.87,
    },
    {
      id: "2",
      timestamp: "2025-02-25T14:25:00Z",
      status: "approved",
      soundConfidence: 0.95,
      weaponConfidence: 0.91,
    },
    {
      id: "3",
      timestamp: "2025-02-25T14:20:00Z",
      status: "rejected",
      soundConfidence: 0.88,
      weaponConfidence: 0.82,
    },
    {
      id: "4",
      timestamp: "2025-02-25T14:15:00Z",
      status: "pending",
      soundConfidence: 0.93,
      weaponConfidence: 0.89,
    },
    {
      id: "5",
      timestamp: "2025-02-25T14:10:00Z",
      status: "approved",
      soundConfidence: 0.97,
      weaponConfidence: 0.94,
    },
  ]);
  const [stats, setStats] = useState({ pending: 2, approved: 2, rejected: 1 });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  //  Dummy Chart data for sensor readings
  const chartData = {
    labels: sensorReadings
      .map((reading) => reading.timestamp.split("T")[1].slice(0, 5))
      .slice(0, 10),
    datasets: [
      {
        data: sensorReadings
          .map((reading) =>
            reading.type === "smoke"
              ? reading.value.smokeLevel || 0
              : reading.value.motionDetected
              ? 1
              : 0
          )
          .slice(0, 10),
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ["Sensor Activity"],
  };

  // Combined data structure used for the  FlatList sections
  const dashboardData = [
    { type: "header", id: "header" },
    { type: "deviceStatus", id: "deviceStatus", data: device },
    { type: "sensorChart", id: "sensorChart", data: chartData },
    { type: "alertStats", id: "alertStats", data: stats },
    { type: "recentAlerts", id: "recentAlerts", data: alerts },
    { type: "quickActions", id: "quickActions" },
  ];

  const renderItem = ({ item }) => {
    switch (item.type) {
      case "header":
        return (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Wildlife Dashboard</Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Icon name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        );
      case "deviceStatus":
        return (
          <Animated.View entering={FadeIn} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Device Status</Text>
              <Icon name="hardware-chip" size={20} color="#4CAF50" />
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Pi Unit 001</Text>
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor:
                      item.data.status === "active" ? "#4CAF50" : "#D32F2F",
                  },
                ]}
              >
                <Text style={styles.statusText}>
                  {item.data.status || "Offline"}
                </Text>
              </View>
            </View>
            <Text style={styles.statusDetail}>
              Last Ping:{" "}
              {item.data.lastPing?.split("T")[1].slice(0, 5) || "N/A"}
            </Text>
          </Animated.View>
        );
      case "sensorChart":
        return (
          <Animated.View entering={FadeIn} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Sensor Activity</Text>
              <Icon name="analytics" size={20} color="#4CAF50" />
            </View>
            <LineChart
              data={item.data}
              width={width - 40}
              height={200}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: "#1a1a1a",
                backgroundGradientFrom: "#1a1a1a",
                backgroundGradientTo: "#1a1a1a",
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                labelColor: (opacity = 1) => `#fff`,
                style: { borderRadius: 16 },
                propsForDots: { r: "4", strokeWidth: "2", stroke: "#4CAF50" },
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
            <Text style={styles.chartLabel}>
              Last 10 Readings (Motion/Smoke)
            </Text>
          </Animated.View>
        );
      case "alertStats":
        return (
          <Animated.View entering={FadeIn} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Alert Statistics</Text>
              <Icon name="alert-circle" size={20} color="#4CAF50" />
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{item.data.pending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{item.data.approved}</Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{item.data.rejected}</Text>
                <Text style={styles.statLabel}>Rejected</Text>
              </View>
            </View>
          </Animated.View>
        );
      case "recentAlerts":
        return (
          <Animated.View entering={FadeIn} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Recent Alerts</Text>
              <Icon name="notifications" size={20} color="#4CAF50" />
            </View>
            {item.data.map((alert) => (
              <TouchableOpacity
                key={alert.id}
                style={styles.alertCard}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/AlertDetailPage",
                    params: { alertId: alert.id },
                  })
                }
              >
                <Animated.View entering={SlideInRight}>
                  <View style={styles.alertHeader}>
                    <Text style={styles.alertTime}>
                      {alert.timestamp.split("T")[1].slice(0, 5)}
                    </Text>
                    <Text
                      style={[
                        styles.alertStatus,
                        {
                          color:
                            alert.status === "pending"
                              ? "#FF9800"
                              : alert.status === "approved"
                              ? "#4CAF50"
                              : "#D32F2F",
                        },
                      ]}
                    >
                      {alert.status}
                    </Text>
                  </View>
                  <Text style={styles.alertDetails}>
                    Sound: {(alert.soundConfidence || 0).toFixed(2)}, Weapon:{" "}
                    {(alert.weaponConfidence || 0).toFixed(2)}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            ))}
            {item.data.length === 0 && (
              <Text style={styles.emptyText}>No recent alerts</Text>
            )}
          </Animated.View>
        );
      case "quickActions":
        return (
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push("/(tabs)/AlertsPage")}
            >
              <Icon name="alert-circle-outline" size={24} color="#fff" />
              <Text style={styles.quickActionText}>View All Alerts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push("/(tabs)/Settings")}
            >
              <Icon name="settings-outline" size={24} color="#fff" />
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={dashboardData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#2d2d2d",
  },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 10,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
  statusRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  statusLabel: { color: "#fff", fontSize: 16, marginRight: 12 },
  statusIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: { color: "#fff", fontSize: 14 },
  statusDetail: { color: "#999", fontSize: 14 },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  statItem: { alignItems: "center" },
  statNumber: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  statLabel: { color: "#999", fontSize: 14 },
  alertCard: {
    backgroundColor: "#2d2d2d",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  alertTime: { color: "#fff", fontSize: 14 },
  alertStatus: { fontSize: 14, fontWeight: "500" },
  alertDetails: { color: "#999", fontSize: 12 },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 8,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 10,
    marginVertical: 16,
  },
  quickActionButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  quickActionText: { color: "#fff", fontSize: 16, marginLeft: 8 },
  chartLabel: {
    color: "#999",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
});

export default Dashboard;
