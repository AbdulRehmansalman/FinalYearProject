import React, { useState, useEffect, useCallback, useRef } from "react";
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
import Animated, {
  FadeIn,
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import Icon from "react-native-vector-icons/Ionicons";
import { auth, db } from "../../services/firebase";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const DashboardPage = () => {
  const [device, setDevice] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [alertTrendsData, setAlertTrendsData] = useState([]);

  const router = useRouter();
  const unsubscribeRef = useRef({
    auth: null,
    user: null,
    devices: null,
    alerts: null,
  });

  const fabScale = useSharedValue(0.8);
  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  // Simplified timestamp converter
  const convertFirestoreTimestamp = (timestamp) => {
    if (!timestamp) return null;

    try {
      // Handle Firestore Timestamp
      if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
      }

      // Handle timestamp object with seconds and nanoseconds
      if (
        timestamp.seconds !== undefined &&
        typeof timestamp.seconds === "number"
      ) {
        return new Timestamp(
          timestamp.seconds,
          timestamp.nanoseconds || 0
        ).toDate();
      }

      // Handle Date object
      if (timestamp instanceof Date) {
        return timestamp;
      }

      // Handle string or number timestamps
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date;
      }

      return null;
    } catch (error) {
      console.error("Error converting timestamp:", error);
      return null;
    }
  };

  // Format time for display
  const formatTime = (timestamp) => {
    const date = convertFirestoreTimestamp(timestamp);
    if (!date) return "N/A";

    try {
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  // Fetch current user
  const fetchCurrentUser = useCallback(() => {
    if (!auth) {
      setError("Firebase auth not initialized.");
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
          setCurrentUserId(firebaseUser.uid);
          const userUnsubscribe = fetchUserData(firebaseUser.uid);
          unsubscribeRef.current.user = userUnsubscribe;
        } else {
          setCurrentUserId(null);
          setUser(null);
          setError("No authenticated user found. Please log in.");
          router.replace("/(auth)/SignIn");
        }
      },
      (error) => {
        console.error("Auth state change error:", error);
        setError("Failed to authenticate user: " + error.message);
      }
    );

    unsubscribeRef.current.auth = unsubscribe;
    return unsubscribe;
  }, [router]);

  // Fetch user data
  const fetchUserData = useCallback((uid) => {
    if (!db || !uid) {
      return () => {};
    }

    const userRef = doc(db, "users", uid);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setUser(docSnap.data());
        } else {
          setUser(null);
          console.warn("User data not found for uid:", uid);
        }
      },
      (error) => {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data: " + error.message);
      }
    );

    return unsubscribe;
  }, []);

  // Fetch the first device
  const fetchDeviceId = useCallback(() => {
    if (!db) {
      setError("Firestore db not initialized.");
      return () => {};
    }

    const devicesQuery = query(collection(db, "devices"));
    const unsubscribe = onSnapshot(
      devicesQuery,
      async (querySnapshot) => {
        if (!querySnapshot.empty) {
          const deviceDoc = querySnapshot.docs[0];
          const deviceData = deviceDoc.data();
          const deviceId = deviceData.deviceId || deviceDoc.id;

          setSelectedDeviceId(deviceId);
          setDevice({ id: deviceDoc.id, ...deviceData });

          try {
            await AsyncStorage.setItem("device_id", deviceId);
          } catch (error) {
            console.error("Error storing device ID:", error);
          }
        } else {
          setSelectedDeviceId(null);
          setDevice(null);
          console.warn("No devices found.");
        }
      },
      (error) => {
        console.error("Error fetching devices:", error);
        setError("Failed to load device data: " + error.message);
      }
    );

    unsubscribeRef.current.devices = unsubscribe;
    return unsubscribe;
  }, []);

  // Fetch alerts
  const fetchAlerts = useCallback(() => {
    if (!db) {
      setError("Firestore db not initialized.");
      return () => {};
    }

    try {
      const now = new Date();
      const startTime = new Date(now);
      startTime.setHours(startTime.getHours() - 24);

      const alertsQuery = query(
        collection(db, "alerts"),
        where("occur_at", ">=", startTime),
        orderBy("occur_at", "desc"),
        limit(5)
      );

      const unsubscribe = onSnapshot(
        alertsQuery,
        (querySnapshot) => {
          const alertsList = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              occur_at: convertFirestoreTimestamp(data.occur_at),
              status: data.status || "pending",
              detections: data.detections || {},
            };
          });

          setAlerts(alertsList);

          // Calculate statistics
          const stats = alertsList.reduce(
            (acc, alert) => {
              const alertStatus = alert.status || "pending";
              if (alertStatus === "pending") acc.pending++;
              else if (alertStatus === "approved") acc.approved++;
              else if (alertStatus === "rejected") acc.rejected++;
              return acc;
            },
            { pending: 0, approved: 0, rejected: 0 }
          );
          setStats(stats);

          // Prepare chart data
          const alertTrends = {};
          alertsList.forEach((alert) => {
            if (alert.occur_at) {
              const hour = alert.occur_at.toLocaleTimeString([], {
                hour: "numeric",
              });
              alertTrends[hour] = (alertTrends[hour] || 0) + 1;
            }
          });

          const trendData = [];
          for (let i = 1; i >= 0; i--) {
            const hourDate = new Date(now.getTime() - i * 60 * 60 * 1000);
            const hour = hourDate.toLocaleTimeString([], { hour: "numeric" });
            trendData.push({
              value: alertTrends[hour] || 0,
              label: hour,
            });
          }

          setAlertTrendsData(
            trendData.length > 0 ? trendData : [{ value: 0, label: "0h" }]
          );
        },
        (error) => {
          console.error("Error fetching alerts:", error);
          if (
            error.code === "failed-precondition" &&
            error.message.includes("index")
          ) {
            setError(
              "Firestore query requires an index. Please create an index for 'occur_at' and 'desc' order in Firestore."
            );
          } else {
            setError("Failed to load alerts: " + error.message);
          }
        }
      );

      unsubscribeRef.current.alerts = unsubscribe;
      return unsubscribe;
    } catch (error) {
      console.error("Error in fetchAlerts:", error);
      setError("Failed to fetch alerts: " + error.message);
      return () => {};
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribeAuth = fetchCurrentUser();
    const unsubscribeDevices = fetchDeviceId();
    const unsubscribeAlerts = fetchAlerts();

    fabScale.value = withTiming(1, { duration: 500 });
    setLoading(false);

    return () => {
      // Properly clean up all subscriptions
      Object.values(unsubscribeRef.current).forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      });
    };
  }, [fetchCurrentUser, fetchDeviceId, fetchAlerts]);

  const dashboardData = [
    { type: "header", id: "header" },
    { type: "deviceStatus", id: "deviceStatus", data: device },
    { type: "alertTrendsChart", id: "alertTrendsChart", data: alertTrendsData },
    { type: "alertStats", id: "alertStats", data: stats },
    { type: "recentAlerts", id: "recentAlerts", data: alerts },
    { type: "quickActions", id: "quickActions" },
  ];

  const renderItem = ({ item }) => {
    switch (item.type) {
      case "header":
        return (
          <LinearGradient colors={["#4CAF50", "#388E3C"]} style={styles.header}>
            <Text style={styles.headerTitle}>Wildlife Dashboard</Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/SignIn")}>
              <Icon name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
        );

      case "deviceStatus":
        return (
          <Animated.View entering={FadeIn.duration(800)} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Device Status</Text>
              <Icon name="hardware-chip" size={20} color="#4CAF50" />
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>
                {item.data?.name || "Unknown Device"}
              </Text>
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor:
                      item.data?.status === "active"
                        ? "#4CAF50"
                        : item.data?.status === "maintenance"
                        ? "#FF9800"
                        : "#D32F2F",
                  },
                ]}
              >
                <Text style={styles.statusText}>
                  {item.data?.status || "Offline"}
                </Text>
              </View>
            </View>
            <Text style={styles.statusDetail}>
              Last Ping:{" "}
              {item.data?.lastPing ? formatTime(item.data.lastPing) : "N/A"}
            </Text>
            {item.data?.areaName && (
              <Text style={styles.statusDetail}>
                Location: {item.data.areaName}
              </Text>
            )}
          </Animated.View>
        );

      case "alertTrendsChart":
        return (
          <Animated.View
            entering={SlideInRight.duration(800)}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Alert Trends (Last 1 Hour)</Text>
              <Icon name="trending-up" size={20} color="#FF9800" />
            </View>
            {/* Custom bar chart implementation without SVG */}
            <View style={styles.chartContainer}>
              {item.data && item.data.length > 0 ? (
                <View style={styles.barChartContainer}>
                  {item.data.map((dataPoint, index) => {
                    // Calculate dynamic height safely with max cap
                    const maxValue = Math.max(
                      ...item.data.map((d) => d.value),
                      1
                    );
                    const heightPercentage = Math.min(
                      85,
                      (dataPoint.value / maxValue) * 85 +
                        (dataPoint.value > 0 ? 15 : 0)
                    );

                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.barChartColumn}
                        onPress={() => {
                          // Show alert on press to mimic tooltip
                          alert(
                            `Hour: ${dataPoint.label}\nAlerts: ${dataPoint.value}`
                          );
                        }}
                      >
                        <Text style={styles.barChartValue}>
                          {dataPoint.value}
                        </Text>
                        <View
                          style={[
                            styles.barChartBar,
                            {
                              height: `${heightPercentage}%`, // Fixed: Use string with % unit
                              backgroundColor: "#FF9800",
                            },
                          ]}
                        />
                        <Text style={styles.barChartLabel}>
                          {dataPoint.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.emptyText}>No alert trends available</Text>
              )}
            </View>
            <Text style={styles.chartLabel}>Tap bars for details</Text>
          </Animated.View>
        );

      case "alertStats":
        return (
          <Animated.View entering={FadeIn.duration(1000)} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Alert Statistics</Text>
              <Icon name="alert-circle" size={20} color="#4CAF50" />
            </View>
            <View style={styles.statsGrid}>
              <View
                style={[
                  styles.statItem,
                  { backgroundColor: "rgba(255, 152, 0, 0.2)" },
                ]}
              >
                <Text style={styles.statNumber}>{item.data.pending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View
                style={[
                  styles.statItem,
                  { backgroundColor: "rgba(76, 175, 80, 0.2)" },
                ]}
              >
                <Text style={styles.statNumber}>{item.data.approved}</Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
              <View
                style={[
                  styles.statItem,
                  { backgroundColor: "rgba(244, 67, 54, 0.2)" },
                ]}
              >
                <Text style={styles.statNumber}>{item.data.rejected}</Text>
                <Text style={styles.statLabel}>Rejected</Text>
              </View>
            </View>
          </Animated.View>
        );

      case "recentAlerts":
        return (
          <Animated.View entering={FadeIn.duration(800)} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Recent Alerts</Text>
              <Icon name="notifications" size={20} color="#4CAF50" />
            </View>
            {item.data.length > 0 ? (
              item.data.map((alert) => {
                // Process detection data safely
                const detectionDetails = [];

                if (alert.detections?.sound?.detected) {
                  const soundConfidence = parseFloat(
                    alert.detections.sound.confidence || 0
                  );
                  detectionDetails.push(
                    `Sound (${alert.detections.sound.type || "Unknown"}): ${(
                      soundConfidence * 100
                    ).toFixed(0)}%`
                  );
                }

                if (alert.detections?.image?.detected) {
                  const imageConfidence = parseFloat(
                    alert.detections.image.confidence || 0
                  );
                  detectionDetails.push(
                    `Image (${alert.detections.image.type || "Unknown"}): ${(
                      imageConfidence * 100
                    ).toFixed(0)}%`
                  );
                }

                if (alert.detections?.smoke?.detected) {
                  detectionDetails.push(
                    `Smoke: ${alert.detections.smoke.level || "Detected"}` // Fixed: Proper string formatting
                  );
                }

                const detectionText = detectionDetails.join(", ");

                return (
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
                          {formatTime(alert.occur_at)}
                        </Text>
                        <Text
                          style={[
                            styles.alertStatus,
                            {
                              color:
                                (alert.status || "pending") === "pending"
                                  ? "#FF9800"
                                  : (alert.status || "pending") === "approved"
                                  ? "#4CAF50"
                                  : "#D32F2F",
                            },
                          ]}
                        >
                          {alert.status || "pending"}
                        </Text>
                      </View>
                      {detectionText ? (
                        <Text style={styles.alertDetails}>{detectionText}</Text>
                      ) : null}
                    </Animated.View>
                  </TouchableOpacity>
                );
              })
            ) : (
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
              onPress={() => router.push("/(tabs)/Setting")}
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
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading dashboard data...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            fetchCurrentUser();
            fetchDeviceId();
            fetchAlerts();
          }}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <FlatList
        data={dashboardData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

export default DashboardPage;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    color: "#fff",
    marginTop: 15,
    fontSize: 16,
    textAlign: "center",
  },
  errorText: {
    color: "#ff6b6b",
    marginHorizontal: 20,
    marginTop: 15,
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  listContent: {
    padding: 15,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statusIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  statusDetail: {
    color: "#bbb",
    fontSize: 14,
    marginTop: 4,
  },
  // Custom chart styles without SVG
  chartContainer: {
    position: "relative",
    marginVertical: 8,
    alignItems: "center",
    height: 220,
    width: "100%",
  },
  barChartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 180,
    width: "100%",
    paddingHorizontal: 10,
    backgroundColor: "#2D2D2D",
    borderRadius: 8,
    paddingVertical: 10,
  },
  barChartColumn: {
    alignItems: "center",
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
  },
  barChartBar: {
    width: 30,
    minHeight: 5,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barChartLabel: {
    color: "#fff",
    fontSize: 12,
    marginTop: 5,
  },
  barChartValue: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 5,
  },
  chartLabel: {
    color: "#999",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  statItem: {
    width: "30%",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
  },
  statNumber: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#bbb",
    fontSize: 14,
    marginTop: 4,
  },
  alertCard: {
    backgroundColor: "#2d2d2d",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  alertTime: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  alertStatus: {
    fontSize: 14,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  alertDetails: {
    color: "#999",
    fontSize: 12,
    lineHeight: 18,
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
  },
  quickActionButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  quickActionText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "600",
  },
});
