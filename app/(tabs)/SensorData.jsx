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
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, BounceIn } from "react-native-reanimated";
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
  const router = useRouter();
  const [deviceId, setDeviceId] = useState(null);

  // Convert Firestore Timestamp to JavaScript Date
  const convertFirestoreTimestamp = (timestamp) => {
    if (!timestamp) {
      console.warn("Timestamp is undefined or null");
      return new Date();
    }

    try {
      // Check if timestamp is already a Firestore Timestamp object
      if (
        timestamp.seconds &&
        typeof timestamp.seconds === "number" &&
        timestamp.nanoseconds &&
        typeof timestamp.nanoseconds === "number"
      ) {
        return new Date(
          timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1e6)
        );
      }
      // If timestamp is a string, try parsing it
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date;
      }
      console.warn("Invalid timestamp format:", timestamp);
      return new Date(); // Fallback to current date
    } catch (error) {
      console.warn(
        "Error converting timestamp:",
        error,
        "Falling back to current date"
      );
      return new Date();
    }
  };

  // Convert Firestore timestamp to relative time
  const getTimeElapsed = (timestamp) => {
    const date = convertFirestoreTimestamp(timestamp);
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.warn("Invalid date object generated:", date);
      return "Invalid Date";
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Interpret the status field (boolean or string)
  const interpretStatus = (status) => {
    if (status === true || status === "true") return "Connected";
    return "Disconnected";
  };

  // Check if the sensor is connected
  const isConnected = (status) => {
    return status === true || status === "true";
  };

  // Map sensor keys to user-friendly names
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

  // Map sensor keys to icons based on connection status
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

  // Retrieve deviceId from AsyncStorage
  useEffect(() => {
    const retrieveDeviceId = async () => {
      try {
        const storedDeviceId = await AsyncStorage.getItem("device_id");
        if (storedDeviceId) {
          setDeviceId(storedDeviceId);
          console.log("Retrieved device_id for SensorData:", storedDeviceId);
        } else {
          setError(
            "No device ID found in storage. Please select a device from the Dashboard."
          );
          setLoading(false);
        }
      } catch (error) {
        console.error("Error retrieving device_id:", error);
        setError("Failed to retrieve device ID: " + error.message);
        setLoading(false);
      }
    };

    retrieveDeviceId();
  }, []);

  // Fetch sensor data when deviceId is available
  useEffect(() => {
    if (!deviceId || !db) {
      if (!db) {
        console.error("Firebase db is not initialized!");
        setError(
          "Firebase database not initialized. Check your firebase.js configuration."
        );
      }
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Query the sensors collection for documents where deviceId matches
        const sensorsQuery = query(
          collection(db, "sensors"),
          where("deviceId", "==", deviceId)
        );

        const unsubscribe = onSnapshot(
          sensorsQuery,
          (querySnapshot) => {
            if (!querySnapshot.empty) {
              // Take the first matching document
              const sensorDoc = querySnapshot.docs[0];
              const data = sensorDoc.data();
              const sensorReading = data.sensorReading || {};

              // Set device info
              setDeviceInfo({
                deviceId: data.deviceId,
                status: "active", // Assuming the device is active if sensors are reporting
              });

              const sensorsArray = Object.entries(sensorReading)
                .map(([key, value]) => {
                  if (!value || typeof value !== "object") {
                    console.warn(`Invalid sensor data for key: ${key}`, value);
                    return null;
                  }
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
              setLoading(false);
            } else {
              console.log("No sensor data found for deviceId:", deviceId);
              setError(`No sensor data found for device: ${deviceId}`);
              setSensors([]);
              setLoading(false);
            }
          },
          (error) => {
            console.error("Error fetching sensor data:", error);
            setError(`Failed to fetch sensor data: ${error.message}`);
            setSensors([]);
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching sensor data:", error);
        setError(`Failed to fetch sensor data: ${error.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [deviceId]);

  // Combined data structure for FlatList
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
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Sensor Status - {deviceId || "Loading..."}
            </Text>
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/DashboardPage")}
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        );
      case "deviceInfo":
        return item.data ? (
          <Animated.View entering={FadeIn} style={styles.deviceInfoContainer}>
            <View style={styles.deviceInfoRow}>
              <Icon name="hardware-chip" size={20} color="#4CAF50" />
              <Text style={styles.deviceInfoText}>
                Device: {item.data.deviceId}
              </Text>
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
            style={styles.refreshButton}
            onPress={() => setLoading(true)}
          >
            <Text style={styles.refreshButtonText}>Refresh Status</Text>
          </TouchableOpacity>
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

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            // Navigate back to Dashboard if device_id is missing
            if (error.includes("No device ID found")) {
              router.replace("/(tabs)/DashboardPage");
            }
          }}
        >
          <Text style={styles.retryButtonText}>
            {error.includes("No device ID found") ? "Go to Dashboard" : "Retry"}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={pageData}
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
    alignItems: "center",
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#2d2d2d",
  },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  deviceInfoContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 10,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  deviceInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  deviceInfoText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
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
    fontWeight: "600",
    marginLeft: 12,
  },
  sensorStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sensorStatus: { color: "#fff", fontSize: 16 },
  sensorDetail: { color: "#999", fontSize: 14 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 8,
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
  refreshButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default SensorData;
