import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import { db } from "../../services/firebase";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  onSnapshot,
  getDoc,
  doc,
  startAfter,
  Timestamp,
} from "firebase/firestore";
import { useAuth } from "../../context/authContext";
import { StatusBar } from "expo-status-bar";
import { useSound } from "../../context/SoundContext";

// Persist previousAlerts outside the component to survive navigation
const previousAlerts = new Map();

const PAGE_SIZE = 10;

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isRefreshingButton, setIsRefreshingButton] = useState(false);

  const deviceCache = useRef(new Map()).current;
  const unsubscribeRef = useRef(null);
  const isMountedRef = useRef(true);
  const isListenerActive = useRef(false);
  const initialFetchDone = useRef(false); // Track if initial fetch is done

  const router = useRouter();
  const { user, role, logout } = useAuth();
  const { playSound, stopSound, isPlaying } = useSound();

  const setupRealTimeListener = useCallback(() => {
    if (!user || !isMountedRef.current) return;

    const oneHourAgo = Timestamp.fromDate(
      new Date(Date.now() - 60 * 60 * 1000)
    );
    const alertsQuery = query(
      collection(db, "alerts"),
      where("occur_at", ">=", oneHourAgo),
      limit(PAGE_SIZE)
    );

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    unsubscribeRef.current = onSnapshot(
      alertsQuery,
      async (querySnapshot) => {
        if (!isMountedRef.current) return;

        const allDocs = querySnapshot.docs;
        const newAlerts = await Promise.all(allDocs.map(transformAlertData));
        const filteredAlerts = newAlerts.filter((alert) => alert !== null);

        const sortedAlerts = filteredAlerts.sort((a, b) => {
          const aTime = a.occurAtTimestamp
            ? typeof a.occurAtTimestamp.toDate === "function"
              ? a.occurAtTimestamp.toDate().getTime()
              : new Date(a.occurAtTimestamp).getTime()
            : 0;
          const bTime = b.occurAtTimestamp
            ? typeof b.occurAtTimestamp.toDate === "function"
              ? b.occurAtTimestamp.toDate().getTime()
              : new Date(b.occurAtTimestamp).getTime()
            : 0;
          return bTime - aTime;
        });

        if (!isMountedRef.current) return;

        // Track changes to detect new approvals
        const currentAlertsMap = new Map(
          sortedAlerts.map((alert) => [alert.id, alert.status])
        );

        let shouldPlaySound = false;
        if (role === "security" && !isPlaying) {
          for (const [id, currentStatus] of currentAlertsMap) {
            const prevStatus = previousAlerts.get(id);
            if (currentStatus === "approved" && prevStatus !== "approved") {
              shouldPlaySound = true;
              break;
            }
          }
        }

        // Update previous alerts and play sound if needed
        sortedAlerts.forEach((alert) =>
          previousAlerts.set(alert.id, alert.status)
        );
        if (shouldPlaySound) {
          playSound();
        }

        setAlerts(sortedAlerts);
        applyFiltersAndSearch(sortedAlerts);

        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length === PAGE_SIZE);
        setLoading(false);
        setError(null);
      },
      (error) => {
        if (!isMountedRef.current) return;
        console.error("Real-time listener error:", error);
        if (
          error.code === "unavailable" ||
          error.message.includes("network-request-failed")
        ) {
          setError("No Internet. Please check your connection.");
        } else {
          setError("Failed to load alerts in real-time. Retrying...");
          setTimeout(() => {
            fetchAlerts(true);
          }, 2000);
        }
      }
    );
  }, [
    user,
    transformAlertData,
    applyFiltersAndSearch,
    role,
    playSound,
    isPlaying,
  ]);

  useEffect(() => {
    isMountedRef.current = true;
    if (!initialFetchDone.current) {
      fetchAlerts(true); // Initial fetch on mount
      initialFetchDone.current = true;
    }

    return () => {
      isMountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        isListenerActive.current = false;
      }
    };
  }, [fetchAlerts]);

  useFocusEffect(
    useCallback(() => {
      if (!isListenerActive.current && user) {
        console.log("Setting up real-time listener on focus");
        isListenerActive.current = true;
        setupRealTimeListener();
      }

      // Handle navigation params
      const { refresh, approvedAlertId } = router.params || {};
      if (refresh === "true" && approvedAlertId) {
        const alertDoc = doc(db, "alerts", approvedAlertId);
        getDoc(alertDoc).then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            previousAlerts.set(approvedAlertId, data.status.toLowerCase());
          }
        });
        router.setParams({ refresh: undefined, approvedAlertId: undefined }); // Clear params
      }

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
          isListenerActive.current = false;
        }
      };
    }, [user, setupRealTimeListener, router])
  );

  const formatDate = useCallback((timestamp) => {
    try {
      if (!timestamp) return "N/A";
      if (typeof timestamp.toDate === "function") {
        return timestamp.toDate().toLocaleString();
      }
      if (typeof timestamp === "string" || typeof timestamp === "number") {
        return new Date(timestamp).toLocaleString();
      }
      return "N/A";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  }, []);

  const resolveReference = useCallback(
    async (field, path) => {
      if (!field) return "Unknown";
      const fieldId = typeof field === "string" ? field : field.id;
      if (deviceCache.has(fieldId)) return deviceCache.get(fieldId);

      try {
        const docRef =
          typeof field === "object" && "path" in field
            ? field
            : doc(db, path, field);
        const docSnap = await getDoc(docRef);
        const resolvedValue = docSnap.exists()
          ? docSnap.data().name || docSnap.id
          : docRef.id;
        deviceCache.set(fieldId, resolvedValue);
        return resolvedValue;
      } catch (error) {
        console.error(`Error resolving ${path} reference:`, error);
        return "Unknown";
      }
    },
    [deviceCache]
  );

  const transformAlertData = useCallback(
    async (doc) => {
      if (!isMountedRef.current) return null;

      const data = doc.data();
      if (!data) {
        console.warn("Alert document has no data:", doc.id);
        return null;
      }

      const deviceId = await resolveReference(data.deviceId, "devices");
      const detections = data.detections || {};
      const detectionDetails = [];

      if (detections.image) {
        detectionDetails.push({
          type: detections.image.type || "image",
          confidence: detections.image.confidence || 0,
          timestamp: formatDate(detections.image.timestamp),
          detected: detections.image.detected || false,
          imageUrl: detections.image.imageUrl || "N/A",
        });
      }
      if (detections.smoke) {
        detectionDetails.push({
          type: "smoke",
          level: detections.smoke.level || 0,
          timestamp: formatDate(detections.smoke.timestamp),
          detected: detections.smoke.detected || false,
        });
      }
      if (detections.sound) {
        detectionDetails.push({
          type: detections.sound.type || "sound",
          confidence: detections.sound.confidence || 0,
          timestamp: formatDate(detections.sound.timestamp),
          detected: detections.sound.detected || false,
          soundUrl: detections.sound.soundUrl || "N/A",
        });
      }

      const normalizedStatus = data.status
        ? data.status.toLowerCase()
        : "pending";

      return {
        id: doc.id,
        occurAt: formatDate(data.occur_at),
        occurAtTimestamp: data.occur_at,
        status: normalizedStatus,
        deviceId,
        location:
          Array.isArray(data.location) && data.location.length === 2
            ? `${data.location[0] || "N/A"}, ${data.location[1] || "N/A"}`
            : "N/A",
        detections: detectionDetails,
        notes: data.notes || "",
      };
    },
    [formatDate, resolveReference]
  );

  const applyFiltersAndSearch = useCallback(
    (alertsList) => {
      console.log(
        "Applying filters - filterStatus:",
        filterStatus,
        "filterType:",
        filterType
      );
      if (!alertsList || !Array.isArray(alertsList)) {
        console.warn(
          "applyFiltersAndSearch received invalid alertsList:",
          alertsList
        );
        setFilteredAlerts([]);
        return;
      }

      let result = [...alertsList];

      const oneHourAgo = Timestamp.now().toDate().getTime() - 60 * 60 * 1000;
      result = result.filter((alert) => {
        const alertTime = alert.occurAtTimestamp
          ? typeof alert.occurAtTimestamp.toDate === "function"
            ? alert.occurAtTimestamp.toDate().getTime()
            : new Date(alert.occurAtTimestamp).getTime()
          : 0;
        const isWithinHour = alertTime >= oneHourAgo;
        console.log(
          `Alert ${alert.id} time: ${alertTime}, Within hour: ${isWithinHour}`
        );
        return isWithinHour;
      });

      if (role === "security") {
        result = result.filter((alert) => alert.status === "approved");
      }

      if (filterStatus !== "all") {
        result = result.filter((alert) => alert.status === filterStatus);
      }

      if (filterType !== "all") {
        result = result.filter((alert) =>
          alert.detections.some((d) => d.type === filterType)
        );
      }

      console.log("Filtered alerts result:", result);
      setFilteredAlerts((prev) => {
        const newFiltered = result;
        return newFiltered.length !== prev.length ||
          newFiltered.some((item, index) => item.id !== prev[index]?.id)
          ? newFiltered
          : prev;
      });
    },
    [role, filterStatus, filterType]
  );

  const fetchAlerts = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
        setLastDoc(null);
        setHasMore(true);
      } else if (!hasMore || isLoadingMore) {
        return;
      }

      setError(null);
      setIsLoadingMore(!isRefresh);

      try {
        const oneHourAgo = Timestamp.fromDate(
          new Date(Date.now() - 60 * 60 * 1000)
        );
        const alertsQuery = query(
          collection(db, "alerts"),
          where("occur_at", ">=", oneHourAgo),
          limit(PAGE_SIZE)
        );

        const querySnapshot = await getDocs(
          isRefresh || !lastDoc
            ? alertsQuery
            : query(alertsQuery, startAfter(lastDoc))
        );
        if (querySnapshot.empty) {
          if (isRefresh) {
            setAlerts([]);
            setFilteredAlerts([]);
          }
          setHasMore(false);
          setLoading(false);
          setRefreshing(false);
          setIsLoadingMore(false);
          return;
        }

        const newAlerts = await Promise.all(
          querySnapshot.docs.map(transformAlertData)
        );
        const filteredAlerts = newAlerts.filter((alert) => alert !== null);
        const sortedAlerts = filteredAlerts.sort((a, b) => {
          const aTime = a.occurAtTimestamp
            ? typeof a.occurAtTimestamp.toDate === "function"
              ? a.occurAtTimestamp.toDate().getTime()
              : new Date(a.occurAtTimestamp).getTime()
            : 0;
          const bTime = b.occurAtTimestamp
            ? typeof b.occurAtTimestamp.toDate === "function"
              ? b.occurAtTimestamp.toDate().getTime()
              : new Date(b.occurAtTimestamp).getTime()
            : 0;
          return bTime - aTime;
        });

        if (!isMountedRef.current) return;

        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setAlerts((prev) =>
          isRefresh ? sortedAlerts : [...prev, ...sortedAlerts]
        );
        applyFiltersAndSearch(
          isRefresh ? sortedAlerts : [...alerts, ...sortedAlerts]
        );
        setHasMore(querySnapshot.docs.length === PAGE_SIZE);
      } catch (error) {
        if (!isMountedRef.current) return;
        console.error("Error fetching alerts:", error);
        if (
          error.code === "unavailable" ||
          error.message.includes("network-request-failed")
        ) {
          setError("No Internet. Please check your connection.");
        } else {
          setError("Failed to fetch alerts. Please try again.");
        }
      } finally {
        if (!isMountedRef.current) return;
        setLoading(false);
        setRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [
      transformAlertData,
      lastDoc,
      hasMore,
      isLoadingMore,
      applyFiltersAndSearch,
      alerts,
    ]
  );

  const loadMoreAlerts = useCallback(() => {
    fetchAlerts(false);
  }, [fetchAlerts]);

  useEffect(() => {
    applyFiltersAndSearch(alerts);
  }, [filterStatus, filterType, alerts, applyFiltersAndSearch]);

  const handleLogout = useCallback(async () => {
    try {
      setIsRefreshingButton(true);
      await logout();
      router.replace("/(auth)/SignIn");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    } finally {
      setIsRefreshingButton(false);
    }
  }, [logout, router]);

  const pageData = useMemo(() => {
    console.log(
      "Recomputing pageData with filteredAlerts:",
      filteredAlerts.length
    );
    const baseData = [
      { type: "header", id: "header" },
      ...(filteredAlerts.length > 0
        ? filteredAlerts.map((alert) => ({
            type: "alert",
            id: alert.id,
            data: alert,
          }))
        : [{ type: "empty", id: "empty" }]),
    ];
    return role === "admin"
      ? [{ type: "filters", id: "filters" }, ...baseData]
      : baseData;
  }, [filteredAlerts, role]);

  const renderItem = useCallback(
    ({ item }) => {
      switch (item.type) {
        case "header":
          return (
            <View style={styles.header}>
              <Text style={styles.headerText}>Alerts</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={[
                    styles.refreshButton,
                    isRefreshingButton && styles.buttonPressed,
                  ]}
                  onPress={() => {
                    setIsRefreshingButton(true);
                    fetchAlerts(true).finally(() =>
                      setIsRefreshingButton(false)
                    );
                  }}
                  disabled={isRefreshingButton}
                >
                  <Icon
                    name="refresh"
                    size={20}
                    color={isRefreshingButton ? "#888" : "#fff"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.logoutButton,
                    isRefreshingButton && styles.buttonPressed,
                  ]}
                  onPress={handleLogout}
                  disabled={isRefreshingButton}
                >
                  <Icon
                    name="log-out-outline"
                    size={20}
                    color={isRefreshingButton ? "#888" : "#fff"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        case "filters":
          return (
            <View style={styles.filterContainer}>
              <View style={styles.alertsTitleContainer}>
                <Text style={styles.alertsTitle}>Alerts</Text>
              </View>
              <View style={styles.filterButtons}>
                {["all", "pending", "approved", "rejected"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterButton,
                      filterStatus === status && styles.activeFilter,
                      filterStatus === status && styles.buttonPressed,
                    ]}
                    onPress={() => {
                      console.log("Setting filterStatus to:", status);
                      setFilterStatus(status);
                    }}
                  >
                    <Text style={styles.filterButtonText}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.filterButtons}>
                {["all", "image", "smoke", "sound"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterButton,
                      filterType === type && styles.activeFilter,
                      filterType === type && styles.buttonPressed,
                    ]}
                    onPress={() => {
                      console.log("Setting filterType to:", type);
                      setFilterType(type);
                    }}
                  >
                    <Text style={styles.filterButtonText}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        case "alert":
          const alert = item.data;
          return (
            <Animated.View entering={FadeIn}>
              <TouchableOpacity
                style={styles.alertItem}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/AlertDetailPage",
                    params: { alertId: alert.id },
                  })
                }
              >
                <View style={styles.alertContent}>
                  <View style={styles.alertHeader}>
                    <Text style={styles.alertTimestamp}>{alert.occurAt}</Text>
                    <Text
                      style={[
                        styles.alertStatus,
                        { backgroundColor: getStatusColor(alert.status) },
                      ]}
                    >
                      {alert.status}
                    </Text>
                  </View>
                  <View style={styles.alertDetails}>
                    <View style={styles.detailRow}>
                      <Icon
                        name="cube-outline"
                        size={16}
                        color="#4CAF50"
                        style={styles.detailIcon}
                      />
                      <Text style={styles.alertDetailText}>
                        {alert.deviceId}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon
                        name="location-outline"
                        size={16}
                        color="#4CAF50"
                        style={styles.detailIcon}
                      />
                      <Text style={styles.alertDetailText}>
                        {alert.location}
                      </Text>
                    </View>
                  </View>
                  {alert.detections.length > 0 && (
                    <View style={styles.detectionsContainer}>
                      {alert.detections.map((detection, index) => (
                        <View key={index} style={styles.detectionItem}>
                          <View style={styles.detectionHeader}>
                            <Text style={styles.detectionType}>
                              {detection.type.toUpperCase()}
                            </Text>
                            {detection.confidence !== null ? (
                              <Text style={styles.detectionConfidence}>
                                {(detection.confidence * 100).toFixed(0)}%
                              </Text>
                            ) : (
                              <Text style={styles.detectionLevel}>
                                Level: {detection.level}
                              </Text>
                            )}
                          </View>
                          <Text style={styles.detectionTimestamp}>
                            {detection.timestamp}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {role === "security" && (
                    <Text style={styles.receivedText}>Received</Text>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        case "empty":
          return <Text style={styles.emptyText}>No alerts found</Text>;
        default:
          return null;
      }
    },
    [role, fetchAlerts, router, filterStatus, filterType, handleLogout, alerts]
  );

  const renderFooter = useCallback(() => {
    return isLoadingMore ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4CAF50" />
      </View>
    ) : null;
  }, [isLoadingMore]);

  const getStatusColor = useCallback((status) => {
    const normalizedStatus = status?.toLowerCase() || "pending";
    return (
      {
        pending: "#FF9800",
        approved: "#4CAF50",
        rejected: "#D32F2F",
      }[normalizedStatus] || "#333"
    );
  }, []);

  if (loading && !error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Alerts</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => fetchAlerts(true)}
            >
              <Icon name="refresh" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Icon name="log-out-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        {[...Array(5)].map((_, index) => (
          <View key={index} style={styles.skeletonItem}>
            <View style={styles.skeletonHeader}>
              <View style={[styles.skeletonText, { width: "60%" }]} />
              <View style={styles.skeletonStatus} />
            </View>
            <View style={styles.skeletonDetails}>
              <View style={[styles.skeletonText, { width: "40%" }]} />
              <View style={[styles.skeletonText, { width: "50%" }]} />
            </View>
            <View style={styles.skeletonDetection}>
              <View style={[styles.skeletonText, { width: "30%" }]} />
              <View style={[styles.skeletonText, { width: "70%" }]} />
            </View>
          </View>
        ))}
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => {
              setError(null);
              fetchAlerts(true);
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={pageData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAlerts(true)}
          />
        }
        onEndReached={loadMoreAlerts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />
      {role === "security" && isPlaying && (
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.stopAlarmButton} onPress={stopSound}>
            <Icon name="stop-circle-outline" size={20} color="#fff" />
            <Text style={styles.stopAlarmText}>Stop Alarm</Text>
          </TouchableOpacity>
        </View>
      )}
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  loadingContainer: { flex: 1, backgroundColor: "#121212" },
  errorContainer: {
    backgroundColor: "#2a2a2a",
    padding: 10,
    margin: 10,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: { color: "#D32F2F", fontSize: 14 },
  retryButton: { backgroundColor: "#4CAF50", padding: 5, borderRadius: 5 },
  retryText: { color: "#fff", fontSize: 14 },
  header: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  headerText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 15,
  },
  headerButtons: { flexDirection: "row", alignItems: "center", marginTop: 15 },
  refreshButton: { padding: 5, marginRight: 10 },
  logoutButton: { padding: 5 },
  filterContainer: { padding: 10, backgroundColor: "#1a1a1a" },
  alertsTitleContainer: {
    backgroundColor: "#2a2a2a",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  alertsTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  filterButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#333",
    borderRadius: 5,
    margin: 5,
    minWidth: "20%",
    alignItems: "center",
  },
  activeFilter: { backgroundColor: "#4CAF50" },
  buttonPressed: { opacity: 0.7 },
  filterButtonText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  alertItem: {
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  alertContent: { flexDirection: "column" },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  alertTimestamp: { color: "#fff", fontSize: 14, fontWeight: "600" },
  alertStatus: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textTransform: "capitalize",
  },
  alertDetails: { marginBottom: 8 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  detailIcon: { marginRight: 6 },
  alertDetailText: { color: "#bbb", fontSize: 13 },
  detectionsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 8,
  },
  detectionItem: {
    backgroundColor: "#2a2a2a",
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  detectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  detectionType: {
    color: "#4CAF50",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  detectionConfidence: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  detectionLevel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    backgroundColor: "#FF9800",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  detectionTimestamp: { color: "#999", fontSize: 12 },
  receivedText: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "right",
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  footerLoader: { padding: 10, alignItems: "center" },
  skeletonItem: {
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  skeletonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  skeletonText: {
    backgroundColor: "#333",
    height: 14,
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonStatus: {
    backgroundColor: "#333",
    height: 20,
    width: 60,
    borderRadius: 12,
  },
  skeletonDetails: { marginBottom: 8 },
  skeletonDetection: {
    backgroundColor: "#2a2a2a",
    padding: 8,
    borderRadius: 6,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    paddingHorizontal: 10,
    marginBottom: 1,
  },
  stopAlarmButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D32F2F",
    margin: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  stopAlarmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default AlertsPage;
