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
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, BounceIn, ZoomIn } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import { db } from "../../services/firebase";
import { onSnapshot, collection, query, where } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const SensorData = () => {
  const [sensors, setSensors] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const router = useRouter();

  // Helper functions
  const convertFirestoreTimestamp = (timestamp) => {
    if (!timestamp) return new Date();
    try {
      if (timestamp.seconds && timestamp.nanoseconds) {
        return new Date(
          timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1e6)
        );
      }
      const date = new Date(timestamp);
      return !isNaN(date.getTime()) ? date : new Date();
    } catch (error) {
      return new Date();
    }
  };

  const getTimeElapsed = (timestamp) => {
    const date = convertFirestoreTimestamp(timestamp);
    if (!(date instanceof Date) || isNaN(date.getTime())) return "Invalid Date";
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const interpretStatus = (status) => {
    return status === true || status === "true" ? "Connected" : "Disconnected";
  };

  const isConnected = (status) => {
    return status === true || status === "true";
  };

  const getSensorName = (type) => {
    const names = {
      smoke: "Smoke Sensor",
      sound: "Sound Detection",
      camera: "Camera Sensor",
      motion: "Motion Sensor",
      gsm: "GSM Module",
      wifi: "WiFi Connection",
    };
    return (
      names[type] || type.charAt(0).toUpperCase() + type.slice(1) + " Sensor"
    );
  };

  const getSensorIcon = (type, connected) => {
    const icons = {
      smoke: connected ? "cloud" : "cloud-off",
      sound: connected ? "volume-high" : "volume-mute",
      camera: connected ? "camera" : "camera-off",
      motion: connected ? "walk" : "person-outline",
      gsm: connected ? "cellular" : "cellular-outline",
      wifi: connected ? "wifi" : "wifi-outline",
    };
    return (
      icons[type] || (connected ? "hardware-chip" : "hardware-chip-outline")
    );
  };

  // Skeleton Component
  const SkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonHeader} />
      <View style={styles.skeletonDeviceInfo} />
      {[...Array(3)].map((_, index) => (
        <View key={index} style={styles.skeletonCard} />
      ))}
    </View>
  );

  // Fetch device ID from AsyncStorage
  useEffect(() => {
    const retrieveDeviceId = async () => {
      try {
        const storedDeviceId = await AsyncStorage.getItem("device_id");
        if (storedDeviceId) {
          setDeviceId(storedDeviceId);
        } else {
          setError("No device ID found. Please select a device.");
          setLoading(false);
        }
      } catch (error) {
        setError("Failed to retrieve device ID: " + error.message);
        setLoading(false);
      }
    };
    retrieveDeviceId();
  }, []);

  // Fetch sensor data (display only, no context update here)
  const fetchSensorData = async () => {
    if (!deviceId || !db) {
      setLoading(false);
      return;
    }

    try {
      const sensorsQuery = query(
        collection(db, "sensors"),
        where("deviceId", "==", deviceId)
      );

      const unsubscribe = onSnapshot(
        sensorsQuery,
        (querySnapshot) => {
          if (!querySnapshot.empty) {
            const sensorDoc = querySnapshot.docs[0];
            const data = sensorDoc.data();
            const sensorReading = data.sensorReading || {};

            setDeviceInfo({
              deviceId: data.deviceId,
              status: "active",
            });

            const sensorsArray = Object.entries(sensorReading)
              .map(([key, value]) => {
                if (!value || typeof value !== "object") return null;
                const status = interpretStatus(value.status);
                const connected = isConnected(value.status);

                return {
                  id: key,
                  name: getSensorName(key),
                  status,
                  lastChecked: value.last_updated
                    ? getTimeElapsed(value.last_updated)
                    : "Unknown",
                  icon: getSensorIcon(key, connected),
                  connected,
                  ...(key === "gsm" && {
                    signalStrength: value.signal_strength,
                  }),
                  ...(key === "smoke" && { level: value.level }),
                  ...(key === "sound" && { value: value.value }),
                };
              })
              .filter((sensor) => sensor !== null);

            setSensors(sensorsArray);
          } else {
            setError(`No sensor data found for device: ${deviceId}`);
            setSensors([]);
          }
          setLoading(false);
          setRefreshing(false);
        },
        (error) => {
          setError(`Failed to fetch sensor data: ${error.message}`);
          setSensors([]);
          setLoading(false);
          setRefreshing(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      setError(`Failed to fetch sensor data: ${error.message}`);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (deviceId) fetchSensorData();
  }, [deviceId]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setSensors([]);
    fetchSensorData();
  };

  const pageData = [
    { type: "header", id: "header" },
    { type: "deviceInfo", id: "deviceInfo", data: deviceInfo },
    { type: "sensors", id: "sensors", data: sensors },
    { type: "refresh", id: "refresh" },
  ];

  const renderItem = ({ item }) => {
    switch (item.type) {
      case "header":
        return (
          <Animated.View entering={FadeIn} style={styles.header}>
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/DashboardPage")}
              style={styles.backButton}
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sensor Status</Text>
            <TouchableOpacity
              onPress={handleRefresh}
              style={styles.refreshIcon}
            >
              <Icon
                name="refresh"
                size={24}
                color={refreshing ? "#4CAF50" : "#fff"}
              />
            </TouchableOpacity>
          </Animated.View>
        );
      case "deviceInfo":
        return item.data ? (
          <Animated.View entering={ZoomIn} style={styles.deviceInfoContainer}>
            <TouchableOpacity
              onPress={() => {
                /* Add interactive action, e.g., show device details */
              }}
              style={styles.deviceInfoButton}
            >
              <View style={styles.deviceInfoRow}>
                <Icon
                  name="hardware-chip"
                  size={20}
                  color="#4CAF50"
                  style={styles.deviceInfoIcon}
                />
                <Text style={styles.deviceInfoText}>{item.data.deviceId}</Text>
              </View>
              <View style={styles.deviceInfoRow}>
                <Icon
                  name="ellipse"
                  size={20}
                  color={item.data.status === "active" ? "#4CAF50" : "#D32F2F"}
                />
                <Text style={styles.deviceInfoText}>
                  Status: {item.data.status}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ) : null;
      case "sensors":
        return item.data.length > 0 ? (
          item.data.map((sensor) => (
            <Animated.View
              key={sensor.id}
              entering={FadeIn}
              style={[
                styles.sensorCard,
                { backgroundColor: sensor.connected ? "#1a1a1a" : "#4B1C1C" },
              ]}
            >
              <View style={styles.sensorHeader}>
                <Icon
                  name={sensor.icon}
                  size={24}
                  color={sensor.connected ? "#4CAF50" : "#D32F2F"}
                />
                <Text style={styles.sensorTitle}>{sensor.name}</Text>
              </View>
              <View style={styles.sensorStatusRow}>
                <Text style={styles.sensorStatus}>
                  Status:{" "}
                  <Text
                    style={{ color: sensor.connected ? "#4CAF50" : "#D32F2F" }}
                  >
                    {sensor.status}
                  </Text>
                </Text>
                <Animated.View
                  entering={BounceIn}
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: sensor.connected ? "#4CAF50" : "#D32F2F",
                    },
                  ]}
                />
              </View>
              <Text style={styles.sensorDetail}>
                Last Checked: {sensor.lastChecked}
              </Text>
              {sensor.signalStrength !== undefined && (
                <Text style={styles.sensorDetail}>
                  Signal Strength: {sensor.signalStrength}
                </Text>
              )}
              {sensor.level !== undefined && (
                <Text style={styles.sensorDetail}>Level: {sensor.level}</Text>
              )}
              {sensor.value !== undefined && (
                <Text style={styles.sensorDetail}>Value: {sensor.value}</Text>
              )}
            </Animated.View>
          ))
        ) : (
          <Text style={styles.emptyText}>No sensors available</Text>
        );
      case "refresh":
        return (
          <TouchableOpacity
            style={[styles.refreshButton, refreshing && { opacity: 0.7 }]}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <Text style={styles.refreshButtonText}>
              {refreshing ? "Refreshing..." : "Refresh Status"}
            </Text>
            {refreshing && (
              <ActivityIndicator
                size="small"
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            )}
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <SkeletonLoader />
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              if (error.includes("No device ID found")) {
                router.replace("/(tabs)/DashboardPage");
              } else {
                fetchSensorData();
              }
            }}
          >
            <Text style={styles.retryButtonText}>
              {error.includes("No device ID found")
                ? "Go to Dashboard"
                : "Retry"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pageData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
      <StatusBar backgroundColor="#000" barStyle="light-content" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#121212",
    alignItems: "center",
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Poppins-Regular", // Regular for error text
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Bold", // Bold for retry button text
  },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    backgroundColor: "#1E1E1E",
  },
  backButton: { padding: 8 },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontFamily: "Poppins-Bold", // Bold for header title
  },
  refreshIcon: { padding: 8 },
  deviceInfoContainer: {
    marginHorizontal: 10,
    marginVertical: 12,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  deviceInfoButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#2d2d2d",
  },
  deviceInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingLeft: 5,
  },
  deviceInfoIcon: { marginRight: 8 },
  deviceInfoText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    letterSpacing: 1,
    paddingLeft: 5,
  },
  sensorCard: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    marginHorizontal: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  sensorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sensorTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins-Bold", // Bold for sensor title
    marginLeft: 12,
  },
  sensorStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sensorStatus: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Regular", // Regular for sensor status
  },
  sensorDetail: {
    color: "#999",
    fontSize: 14,
    fontFamily: "Poppins-Regular", // Regular for sensor details
  },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 8,
    fontFamily: "Poppins-Regular", // Regular for empty text
  },
  refreshButton: {
    backgroundColor: "#4CAF50",
    width: 150,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Bold", // Bold for refresh button text
  },
  skeletonContainer: { flex: 1, backgroundColor: "#121212", padding: 10 },
  skeletonHeader: {
    height: 50,
    backgroundColor: "#2d2d2d",
    borderRadius: 8,
    marginBottom: 10,
  },
  skeletonDeviceInfo: {
    height: 80,
    backgroundColor: "#2d2d2d",
    borderRadius: 12,
    marginBottom: 20,
  },
  skeletonCard: {
    height: 120,
    backgroundColor: "#2d2d2d",
    borderRadius: 16,
    marginBottom: 12,
  },
});

export default SensorData;
