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
  Modal,
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
  orderBy,
  Timestamp,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const DashboardPage = () => {
  const [device, setDevice] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [alertTrendsData, setAlertTrendsData] = useState([]);
  const [selectedHourIndex, setSelectedHourIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAlerts, setModalAlerts] = useState([]);
  const [modalHourLabel, setModalHourLabel] = useState("");

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

  // Improved timestamp converter that handles various formats
  const convertFirestoreTimestamp = (timestamp) => {
    if (!timestamp) return null;

    try {
      if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
      }

      if (
        timestamp.seconds !== undefined &&
        typeof timestamp.seconds === "number"
      ) {
        return new Timestamp(
          timestamp.seconds,
          timestamp.nanoseconds || 0
        ).toDate();
      }

      if (typeof timestamp === "string") {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }

      if (timestamp instanceof Date) {
        return timestamp;
      }

      if (typeof timestamp === "number") {
        return new Date(timestamp);
      }

      return null;
    } catch (error) {
      console.error("Error converting timestamp:", error);
      return null;
    }
  };

  // Format time for display with error handling
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

  // Format time for trends (hourly, e.g., "12:00")
  const formatTrendTime = (date) => {
    if (!date) return "N/A";
    return date.toLocaleTimeString([], { hour: "numeric" });
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

  // Fetch the first device with enhanced error handling
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

  // Fetch alerts for a specific hour when a bar is clicked
  const fetchAlertsForHour = async (hourLabel) => {
    try {
      const now = new Date();
      const hourIndex = parseInt(hourLabel.split(":")[0], 10);
      const startTime = new Date(
        now.getTime() - (23 - hourIndex) * 60 * 60 * 1000
      );
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

      const alertsQuery = query(
        collection(db, "alerts"),
        where("occur_at", ">=", Timestamp.fromDate(startTime)),
        where("occur_at", "<", Timestamp.fromDate(endTime))
      );

      const unsubscribe = onSnapshot(
        alertsQuery,
        (querySnapshot) => {
          const alertsList = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            const occurAt = convertFirestoreTimestamp(data.occur_at);

            const detections = {};

            if (data.detections && data.detections.camera) {
              detections.image = {
                detected: data.detections.camera.detected || false,
                confidence: data.detections.camera.confidence || 0,
                type: data.detections.camera.type || "Unknown",
              };
            } else if (data.detections && data.detections.image) {
              detections.image = {
                detected: data.detections.image.detected || false,
                confidence: data.detections.image.confidence || 0,
                type: data.detections.image.type || "Unknown",
              };
            }

            if (data.detections && data.detections.sound) {
              detections.sound = {
                detected: data.detections.sound.detected || false,
                confidence: data.detections.sound.confidence || 0,
                type: data.detections.sound.type || "Unknown",
              };
            }

            if (data.detections && data.detections.smoke) {
              detections.smoke = {
                detected: data.detections.smoke.detected || false,
                level: data.detections.smoke.level || "Detected",
              };
            }

            return {
              id: doc.id,
              occur_at: occurAt,
              status: data.status || "pending",
              detections,
              type: data.type || "unknown",
            };
          });

          setModalAlerts(alertsList);
          setModalHourLabel(hourLabel);
          setModalVisible(true);
        },
        (error) => {
          console.error("Error fetching alerts for hour:", error);
          setModalAlerts([]);
          setModalHourLabel(hourLabel);
          setModalVisible(true);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Error in fetchAlertsForHour:", error);
      setModalAlerts([]);
      setModalHourLabel(hourLabel);
      setModalVisible(true);
    }
  };

  // Enhanced alert fetching with 20-minute window for stats and recent alerts
  const fetchAlerts = useCallback(() => {
    if (!db) {
      setError("Firestore db not initialized.");
      return () => {};
    }

    try {
      const now = new Date();
      const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);

      const alertsQuery = query(
        collection(db, "alerts"),
        where("occur_at", ">=", Timestamp.fromDate(twentyMinutesAgo)),
        orderBy("occur_at", "desc")
      );

      const unsubscribe = onSnapshot(
        alertsQuery,
        (querySnapshot) => {
          const alertsList = querySnapshot.docs
            .map((doc) => {
              const data = doc.data();
              const occurAt = convertFirestoreTimestamp(data.occur_at);

              if (!occurAt || occurAt < twentyMinutesAgo) {
                return null;
              }

              const detections = {};

              if (data.detections && data.detections.camera) {
                detections.image = {
                  detected: data.detections.camera.detected || false,
                  confidence: data.detections.camera.confidence || 0,
                  type: data.detections.camera.type || "Unknown",
                };
              } else if (data.detections && data.detections.image) {
                detections.image = {
                  detected: data.detections.image.detected || false,
                  confidence: data.detections.image.confidence || 0,
                  type: data.detections.image.type || "Unknown",
                };
              }

              if (data.detections && data.detections.sound) {
                detections.sound = {
                  detected: data.detections.sound.detected || false,
                  confidence: data.detections.sound.confidence || 0,
                  type: data.detections.sound.type || "Unknown",
                };
              }

              if (data.detections && data.detections.smoke) {
                detections.smoke = {
                  detected: data.detections.smoke.detected || false,
                  level: data.detections.smoke.level || "Detected",
                };
              }

              return {
                id: doc.id,
                occur_at: occurAt,
                status: data.status || "pending",
                detections,
                type: data.type || "unknown",
              };
            })
            .filter((alert) => alert !== null);

          setAlerts(alertsList);

          // Set recent alerts (limited to 5)
          const recent = alertsList.slice(0, 5);
          setRecentAlerts(recent);

          // Compute stats based on the 20-minute window
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

          // Compute 24-hour trend data (unchanged)
          const allAlertsQuery = query(
            collection(db, "alerts"),
            orderBy("occur_at", "desc")
          );
          onSnapshot(
            allAlertsQuery,
            (fullSnapshot) => {
              const allAlertsList = fullSnapshot.docs
                .map((doc) => {
                  const data = doc.data();
                  const occurAt = convertFirestoreTimestamp(data.occur_at);
                  if (
                    !occurAt ||
                    occurAt < new Date(now.getTime() - 24 * 60 * 60 * 1000)
                  ) {
                    return null;
                  }
                  return { occur_at: occurAt };
                })
                .filter((alert) => alert !== null);

              const alertTrends = {};
              allAlertsList.forEach((alert) => {
                if (alert.occur_at) {
                  const trendTime = formatTrendTime(alert.occur_at);
                  alertTrends[trendTime] = (alertTrends[trendTime] || 0) + 1;
                }
              });

              const trendData = [];
              for (let i = 23; i >= 0; i--) {
                const intervalTime = new Date(
                  now.getTime() - i * 60 * 60 * 1000
                );
                const intervalLabel = formatTrendTime(intervalTime);
                trendData.push({
                  value: alertTrends[intervalLabel] || 0,
                  label: intervalLabel,
                });
              }

              setAlertTrendsData(
                trendData.length > 0
                  ? trendData
                  : [{ value: 0, label: formatTrendTime(now) }]
              );
            },
            (error) => {
              console.error("Error fetching 24-hour trends:", error);
            }
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
      Object.values(unsubscribeRef.current).forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      });
    };
  }, [fetchCurrentUser, fetchDeviceId, fetchAlerts]);

  // Handle navigation for the two-bar window
  const handlePreviousHours = () => {
    setSelectedHourIndex((prev) =>
      Math.min(prev + 2, alertTrendsData.length - 2)
    );
  };

  const handleNextHours = () => {
    setSelectedHourIndex((prev) => Math.max(prev - 2, 0));
  };

  const dashboardData = [
    { type: "header", id: "header" },
    { type: "deviceStatus", id: "deviceStatus", data: device },
    { type: "alertTrendsChart", id: "alertTrendsChart", data: alertTrendsData },
    { type: "alertStats", id: "alertStats", data: stats },
    { type: "recentAlerts", id: "recentAlerts", data: recentAlerts },
    { type: "quickActions", id: "quickActions" },
  ];

  const renderItem = ({ item }) => {
    switch (item.type) {
      case "header":
        return (
          <LinearGradient
            colors={["#4CAF50", "#388E3C"]}
            style={dashboardStyles.header}
          >
            <Text style={dashboardStyles.headerTitle}>Wildlife Dashboard</Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/SignIn")}>
              <Icon name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
        );

      case "deviceStatus":
        return (
          <Animated.View
            entering={FadeIn.duration(800)}
            style={dashboardStyles.card}
          >
            <View style={dashboardStyles.cardHeader}>
              <Text style={dashboardStyles.cardTitle}>Device Status</Text>
              <Icon name="hardware-chip" size={20} color="#4CAF50" />
            </View>
            <View style={dashboardStyles.statusRow}>
              <Text style={dashboardStyles.statusLabel}>
                {item.data?.name || item.data?.deviceId || "Unknown Device"}
              </Text>
              <View
                style={[
                  dashboardStyles.statusIndicator,
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
                <Text style={dashboardStyles.statusText}>
                  {item.data?.status || "Offline"}
                </Text>
              </View>
            </View>
            <Text style={dashboardStyles.statusDetail}>
              Last Ping:{" "}
              {item.data?.lastPing ? formatTime(item.data.lastPing) : "N/A"}
            </Text>
            {item.data?.areaName && (
              <Text style={dashboardStyles.statusDetail}>
                Location: {item.data.areaName}
              </Text>
            )}
          </Animated.View>
        );

      case "alertTrendsChart":
        return (
          <Animated.View
            entering={SlideInRight.duration(800)}
            style={dashboardStyles.card}
          >
            <View style={dashboardStyles.cardHeader}>
              <Text style={dashboardStyles.cardTitle}>
                Alert Trends (Last 24 Hours)
              </Text>
              <Icon name="trending-up" size={20} color="#FF9800" />
            </View>
            <View style={dashboardStyles.chartContainer}>
              {item.data && item.data.length > 0 ? (
                <>
                  <View style={dashboardStyles.navigationContainer}>
                    <TouchableOpacity
                      style={dashboardStyles.navButton}
                      onPress={handlePreviousHours}
                      disabled={selectedHourIndex >= item.data.length - 2}
                    >
                      <Icon
                        name="chevron-back"
                        size={24}
                        color={
                          selectedHourIndex >= item.data.length - 2
                            ? "#999"
                            : "#fff"
                        }
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={dashboardStyles.navButton}
                      onPress={handleNextHours}
                      disabled={selectedHourIndex <= 0}
                    >
                      <Icon
                        name="chevron-forward"
                        size={24}
                        color={selectedHourIndex <= 0 ? "#999" : "#fff"}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={dashboardStyles.barChartContainer}>
                    {item.data
                      .slice(selectedHourIndex, selectedHourIndex + 2)
                      .map((dataPoint, index) => {
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
                            key={dataPoint.label}
                            style={dashboardStyles.barChartColumn}
                            onPress={() => fetchAlertsForHour(dataPoint.label)}
                          >
                            <Text style={dashboardStyles.barChartValue}>
                              {dataPoint.value}
                            </Text>
                            <View
                              style={[
                                dashboardStyles.barChartBar,
                                {
                                  height: `${heightPercentage}%`,
                                  backgroundColor: "#FF9800",
                                },
                              ]}
                            />
                            <Text style={dashboardStyles.barChartLabel}>
                              {dataPoint.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                </>
              ) : (
                <Text style={dashboardStyles.emptyText}>
                  No alert trends available
                </Text>
              )}
            </View>
            <Text style={dashboardStyles.chartLabel}>
              Tap bars to view alerts
            </Text>
          </Animated.View>
        );

      case "alertStats":
        return (
          <Animated.View
            entering={FadeIn.duration(1000)}
            style={dashboardStyles.card}
          >
            <View style={dashboardStyles.cardHeader}>
              <Text style={dashboardStyles.cardTitle}>Alert Statistics</Text>
              <Icon name="alert-circle" size={20} color="#4CAF50" />
            </View>
            <View style={dashboardStyles.statsGrid}>
              <View style={dashboardStyles.statItemPending}>
                <Text style={dashboardStyles.statNumber}>
                  {item.data.pending}
                </Text>
                <Text style={dashboardStyles.statLabel}>Pending</Text>
              </View>
              <View style={dashboardStyles.statItemApproved}>
                <Text style={dashboardStyles.statNumber}>
                  {item.data.approved}
                </Text>
                <Text style={dashboardStyles.statLabel}>Approved</Text>
              </View>
              <View style={dashboardStyles.statItemRejected}>
                <Text style={dashboardStyles.statNumber}>
                  {item.data.rejected}
                </Text>
                <Text style={dashboardStyles.statLabel}>Rejected</Text>
              </View>
            </View>
          </Animated.View>
        );

      case "recentAlerts":
        return (
          <Animated.View
            entering={FadeIn.duration(800)}
            style={dashboardStyles.card}
          >
            <View style={dashboardStyles.cardHeader}>
              <Text style={dashboardStyles.cardTitle}>Recent Alerts</Text>
              <Icon name="notifications" size={20} color="#4CAF50" />
            </View>
            {item.data.length > 0 ? (
              <>
                {item.data.map((alert) => {
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
                      `Smoke: ${alert.detections.smoke.level || "Detected"}`
                    );
                  }

                  if (detectionDetails.length === 0 && alert.type) {
                    if (
                      alert.type === "camera" ||
                      alert.type === "gundetected"
                    ) {
                      detectionDetails.push("Weapon detected in image");
                    } else if (
                      alert.type === "sound" ||
                      alert.type === "gunsound"
                    ) {
                      detectionDetails.push("Gunshot sound detected");
                    } else if (alert.type === "smoke") {
                      detectionDetails.push("Smoke detected");
                    } else if (alert.type === "combined_threat") {
                      detectionDetails.push("Multiple threats detected");
                    }
                  }

                  const detectionText = detectionDetails.join(", ");

                  return (
                    <TouchableOpacity
                      key={alert.id}
                      style={dashboardStyles.alertCard}
                      onPress={() =>
                        router.push({
                          pathname: "/(tabs)/AlertDetailPage",
                          params: { alertId: alert.id },
                        })
                      }
                    >
                      <Animated.View entering={SlideInRight}>
                        <View style={dashboardStyles.alertHeader}>
                          <Text style={dashboardStyles.alertTime}>
                            {formatTime(alert.occur_at)}
                          </Text>
                          <Text
                            style={[
                              dashboardStyles.alertStatus,
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
                          <Text style={dashboardStyles.alertDetails}>
                            {detectionText}
                          </Text>
                        ) : (
                          <Text style={dashboardStyles.alertDetails}>
                            Alert detected
                          </Text>
                        )}
                      </Animated.View>
                    </TouchableOpacity>
                  );
                })}
              </>
            ) : (
              <Text style={dashboardStyles.emptyText}>No recent alerts</Text>
            )}
          </Animated.View>
        );

      case "quickActions":
        return (
          <View style={dashboardStyles.quickActions}>
            <TouchableOpacity
              style={dashboardStyles.quickActionButton}
              onPress={() => router.push("/(tabs)/AlertsPage")}
            >
              <Icon name="alert-circle-outline" size={24} color="#fff" />
              <Text style={dashboardStyles.quickActionText}>
                View All Alerts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dashboardStyles.quickActionButton}
              onPress={() => router.push("/(tabs)/Setting")}
            >
              <Icon name="settings-outline" size={24} color="#fff" />
              <Text style={dashboardStyles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={dashboardStyles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={dashboardStyles.loadingText}>
          Loading dashboard data...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={dashboardStyles.loadingContainer}>
        <StatusBar style="light" />
        <Text style={dashboardStyles.errorText}>{error}</Text>
        <TouchableOpacity
          style={dashboardStyles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            fetchCurrentUser();
            fetchDeviceId();
            fetchAlerts();
          }}
        >
          <Text style={dashboardStyles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dashboardStyles.container}>
      <StatusBar style="light" />
      <FlatList
        data={dashboardData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={dashboardStyles.listContent}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={dashboardStyles.modalContainer}>
          <View style={dashboardStyles.modalContent}>
            <Text style={dashboardStyles.modalTitle}>
              Alerts for {modalHourLabel}
            </Text>
            {modalAlerts.length > 0 ? (
              <FlatList
                data={modalAlerts}
                keyExtractor={(alert) => alert.id}
                renderItem={({ item: alert }) => {
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
                      `Smoke: ${alert.detections.smoke.level || "Detected"}`
                    );
                  }

                  if (detectionDetails.length === 0 && alert.type) {
                    if (
                      alert.type === "camera" ||
                      alert.type === "gundetected"
                    ) {
                      detectionDetails.push("Weapon detected in image");
                    } else if (
                      alert.type === "sound" ||
                      alert.type === "gunsound"
                    ) {
                      detectionDetails.push("Gunshot sound detected");
                    } else if (alert.type === "smoke") {
                      detectionDetails.push("Smoke detected");
                    } else if (alert.type === "combined_threat") {
                      detectionDetails.push("Multiple threats detected");
                    }
                  }

                  const detectionText = detectionDetails.join(", ");

                  return (
                    <View style={dashboardStyles.modalAlertItem}>
                      <Text style={dashboardStyles.modalAlertTime}>
                        {formatTime(alert.occur_at)}
                      </Text>
                      <Text style={dashboardStyles.modalAlertStatus}>
                        Status: {alert.status || "pending"}
                      </Text>
                      <Text style={dashboardStyles.modalAlertDetails}>
                        {detectionText || "Alert detected"}
                      </Text>
                    </View>
                  );
                }}
                style={dashboardStyles.modalAlertList}
              />
            ) : (
              <Text style={dashboardStyles.modalEmptyText}>
                No alerts in this hour
              </Text>
            )}
            <TouchableOpacity
              style={dashboardStyles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={dashboardStyles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const dashboardStyles = StyleSheet.create({
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
    fontFamily: "Poppins-Regular", // Regular for loading text
  },
  errorText: {
    color: "#ff6b6b",
    marginHorizontal: 20,
    marginTop: 15,
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Poppins-Regular", // Regular for error text
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
    textAlign: "center",
    fontFamily: "Poppins-Regular", // Regular for retry button text
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
    fontFamily: "Poppins-Bold", // Bold for header title
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
    fontFamily: "Poppins-Bold", // Bold for card titles
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
    fontFamily: "Poppins-Regular", // Regular for status label
  },
  statusIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins-Regular", // Regular for status text
    textTransform: "uppercase",
  },
  statusDetail: {
    color: "#bbb",
    fontSize: 14,
    marginTop: 4,
    fontFamily: "Poppins-Regular", // Regular for status details
  },
  chartContainer: {
    position: "relative",
    marginVertical: 8,
    alignItems: "center",
    height: 220,
    width: "100%",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  navButton: {
    padding: 10,
  },
  barChartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 180,
    width: "100%",
    paddingHorizontal: 20,
    backgroundColor: "#2D2D2D",
    borderRadius: 8,
    paddingVertical: 10,
  },
  barChartColumn: {
    alignItems: "center",
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
    marginHorizontal: 10,
  },
  barChartBar: {
    width: 60,
    minHeight: 5,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barChartLabel: {
    color: "#fff",
    fontSize: 12,
    marginTop: 5,
    fontFamily: "Poppins-Regular", // Regular for chart labels
  },
  barChartValue: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 5,
    fontFamily: "Poppins-Regular", // Regular for chart values
  },
  chartLabel: {
    color: "#999",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    fontFamily: "Poppins-Regular", // Regular for chart label
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  statItemPending: {
    width: "30%",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 152, 0, 0.2)",
  },
  statItemApproved: {
    width: "30%",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(76, 175, 80, 0.2)",
  },
  statItemRejected: {
    width: "30%",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(244, 67, 54, 0.2)",
  },
  statNumber: {
    color: "#fff",
    fontSize: 24,
    fontFamily: "Poppins-Bold", // Bold for stat numbers
  },
  statLabel: {
    color: "#bbb",
    fontSize: 14,
    marginTop: 4,
    fontFamily: "Poppins-Regular", // Regular for stat labels
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
    fontFamily: "Poppins-Regular", // Regular for alert time
  },
  alertStatus: {
    fontSize: 14,
    fontFamily: "Poppins-Regular", // Regular for alert status
    textTransform: "capitalize",
  },
  alertDetails: {
    color: "#999",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Poppins-Regular", // Regular for alert details
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
    fontFamily: "Poppins-Regular", // Regular for empty text
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
    fontFamily: "Poppins-Bold", // Bold for quick action text
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins-Bold", // Bold for modal title
  },
  modalAlertList: {
    maxHeight: 400,
  },
  modalAlertItem: {
    backgroundColor: "#2d2d2d",
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },
  modalAlertTime: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins-Regular", // Regular for modal alert time
  },
  modalAlertStatus: {
    color: "#bbb",
    fontSize: 12,
    marginVertical: 2,
    fontFamily: "Poppins-Regular", // Regular for modal alert status
  },
  modalAlertDetails: {
    color: "#999",
    fontSize: 12,
    fontFamily: "Poppins-Regular", // Regular for modal alert details
  },
  modalEmptyText: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
    fontFamily: "Poppins-Regular", // Regular for modal empty text
  },
  modalCloseButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    alignItems: "center",
  },
  modalCloseText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Bold", // Bold for modal close text
  },
});

export default DashboardPage;
