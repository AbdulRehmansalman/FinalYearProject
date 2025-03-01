import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import { Alert } from "react-native";

const AlertDetail = () => {
  const { alertId } = useLocalSearchParams();
  const [alert, setAlert] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = "security"; // Hardcoded role for frontend demo (replace with "security" if needed)
  const router = useRouter();

  // Mock data for alert and logs
  const mockAlert = {
    id: alertId,
    timestamp: "2025-02-25T14:30:00Z",
    status: "pending",
    soundConfidence: 0.92,
    weaponConfidence: 0.87,
    imageUrl: "https://via.placeholder.com/300x200", // Placeholder image
    sensorData: { motion: true, smoke: 0.1 },
    location: { latitude: 40.7128, longitude: -74.006 },
  };

  const mockLogs = [
    {
      id: "log1",
      alertId,
      action: "created",
      timestamp: "2025-02-25T14:31:00Z",
      userId: "user123",
    },
    {
      id: "log2",
      alertId,
      action: "viewed",
      timestamp: "2025-02-25T14:32:00Z",
      userId: "user456",
    },
  ];

  useEffect(() => {
    // Simulate data loading with mock data
    setTimeout(() => {
      setAlert(mockAlert);
      setLogs(mockLogs);
      setLoading(false);
    }, 1000); // Simulated delay for UI feedback
  }, [alertId]);

  const handleApprove = () => {
    if (role !== "admin" || alert.status !== "pending") return;
    setLoading(true);
    setTimeout(() => {
      setAlert({ ...alert, status: "approved" });
      setLogs([
        ...logs,
        {
          id: `log${logs.length + 1}`,
          alertId,
          action: "approved",
          timestamp: new Date().toISOString(),
          userId: "mockUser",
        },
      ]);
      Alert.alert("Success", "Alert approved successfully!");
      setLoading(false);
    }, 1000); // Simulate async action
  };

  const handleReject = () => {
    if (role !== "admin" || alert.status !== "pending") return;
    setLoading(true);
    setTimeout(() => {
      setAlert({ ...alert, status: "rejected" });
      setLogs([
        ...logs,
        {
          id: `log${logs.length + 1}`,
          alertId,
          action: "rejected",
          timestamp: new Date().toISOString(),
          userId: "mockUser",
        },
      ]);
      Alert.alert("Success", "Alert rejected successfully!");
      setLoading(false);
    }, 1000); // Simulate async action
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  if (!alert) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Alert not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn} style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Alert Details</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.timestamp}>
            Detected: {alert.timestamp.split("T")[1].slice(0, 5)}
          </Text>
          <Text
            style={[styles.status, { color: getStatusColor(alert.status) }]}
          >
            Status: {alert.status}
          </Text>
          <Text style={styles.confidence}>
            Sound Confidence: {alert.soundConfidence?.toFixed(2) || "N/A"},
            Weapon Confidence: {alert.weaponConfidence?.toFixed(2) || "N/A"}
          </Text>
          {alert.imageUrl && (
            <Image source={{ uri: alert.imageUrl }} style={styles.image} />
          )}
          <Text style={styles.sensorData}>
            Motion: {alert.sensorData?.motion ? "Detected" : "None"}
          </Text>
          <Text style={styles.sensorData}>
            Smoke: {alert.sensorData?.smoke || 0.0} ppm
          </Text>
          <Text style={styles.sensorData}>
            Location: Lat {alert.location?.latitude || "N/A"}, Lon{" "}
            {alert.location?.longitude || "N/A"}
          </Text>
          {logs.length > 0 && (
            <View style={styles.logsSection}>
              <Text style={styles.logsTitle}>Action History</Text>
              {logs.map((log) => (
                <Text key={log.id} style={styles.logEntry}>
                  {log.timestamp.split("T")[1].slice(0, 5)} - {log.action} by{" "}
                  {log.userId}
                </Text>
              ))}
            </View>
          )}
          {role === "admin" && alert.status === "pending" && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
                onPress={handleApprove}
              >
                <Text style={styles.actionText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#D32F2F" }]}
                onPress={handleReject}
              >
                <Text style={styles.actionText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "#FF9800";
    case "approved":
      return "#4CAF50";
    case "rejected":
      return "#D32F2F";
    default:
      return "#fff";
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    margin: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  timestamp: { color: "#fff", fontSize: 16, marginBottom: 8 },
  status: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  confidence: { color: "#999", fontSize: 14, marginBottom: 12 },
  image: { width: "100%", height: 200, borderRadius: 8, marginBottom: 12 },
  sensorData: { color: "#fff", fontSize: 14, marginBottom: 8 },
  logsSection: { marginTop: 12, marginBottom: 12 },
  logsTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  logEntry: { color: "#999", fontSize: 14, marginBottom: 4 },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    width: "45%",
  },
  actionText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

export default AlertDetail;
