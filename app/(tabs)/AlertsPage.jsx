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
  TextInput,
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
} from "firebase/firestore";
import { useAuth } from "../../context/authContext";
import { StatusBar } from "expo-status-bar";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const deviceCache = useRef(new Map()).current;
  const unsubscribeRef = useRef(null);
  const isMountedRef = useRef(true);

  const router = useRouter();
  const { user, role, logout } = useAuth();

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  const formatDate = useCallback((timestamp) => {
    return timestamp?.toDate().toLocaleString() || "N/A";
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
      if (role === "security") {
        setFilteredAlerts(alertsList);
        return;
      }

      let result = [...alertsList];
      const queryLower = searchQuery.toLowerCase().trim();

      if (filterStatus !== "all") {
        result = result.filter((alert) => alert.status === filterStatus);
      }

      if (filterType !== "all") {
        result = result.filter((alert) =>
          alert.detections.some((d) => d.type === filterType)
        );
      }

      if (queryLower) {
        result = result.filter(
          (alert) =>
            alert.deviceId.toLowerCase().includes(queryLower) ||
            alert.notes.toLowerCase().includes(queryLower) ||
            alert.detections.some(
              (d) =>
                d.type.toLowerCase().includes(queryLower) ||
                (d.imageUrl && d.imageUrl.toLowerCase().includes(queryLower)) ||
                (d.soundUrl && d.soundUrl.toLowerCase().includes(queryLower))
            )
        );
      }

      setFilteredAlerts(result);
    },
    [role, searchQuery, filterStatus, filterType]
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
        const baseQuery =
          role === "admin"
            ? collection(db, "alerts")
            : query(
                collection(db, "alerts"),
                where("status", "==", "approved")
              );
        const alertsQuery =
          isRefresh || !lastDoc
            ? query(baseQuery, limit(PAGE_SIZE))
            : query(baseQuery, startAfter(lastDoc), limit(PAGE_SIZE));

        const querySnapshot = await getDocs(alertsQuery);
        if (querySnapshot.empty) {
          if (isRefresh) {
            setAlerts([]);
            setFilteredAlerts([]);
          }
          setHasMore(false);
          return;
        }

        const newAlerts = await Promise.all(
          querySnapshot.docs.map(transformAlertData)
        );
        const filteredAlerts = newAlerts.filter((alert) => alert !== null);
        const sortedAlerts = filteredAlerts.sort(
          (a, b) =>
            (b.occurAtTimestamp?.toDate().getTime() || 0) -
            (a.occurAtTimestamp?.toDate().getTime() || 0)
        );

        if (!isMountedRef.current) return;

        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setAlerts((prev) =>
          isRefresh ? sortedAlerts : [...prev, ...sortedAlerts]
        );
        applyFiltersAndSearch(
          isRefresh ? sortedAlerts : [...prev, ...sortedAlerts]
        );
        setHasMore(querySnapshot.docs.length === PAGE_SIZE);
      } catch (error) {
        if (!isMountedRef.current) return;
        console.error("Error fetching alerts:", error);
        setError("Failed to fetch alerts. Please try again.");
      } finally {
        if (!isMountedRef.current) return;
        setLoading(false);
        setRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [
      role,
      transformAlertData,
      lastDoc,
      hasMore,
      isLoadingMore,
      applyFiltersAndSearch,
    ]
  );

  const loadMoreAlerts = useCallback(() => {
    fetchAlerts(false);
  }, [fetchAlerts]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      const alertsQuery =
        role === "admin"
          ? query(collection(db, "alerts"), limit(PAGE_SIZE))
          : query(
              collection(db, "alerts"),
              where("status", "==", "approved"),
              limit(PAGE_SIZE)
            );

      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      unsubscribeRef.current = onSnapshot(
        alertsQuery,
        async (querySnapshot) => {
          if (querySnapshot.empty) {
            if (!isMountedRef.current) return;
            setAlerts([]);
            setFilteredAlerts([]);
            setHasMore(false);
            setLoading(false);
            return;
          }

          const alertsList = await Promise.all(
            querySnapshot.docs.map(transformAlertData)
          );
          const filteredAlertsList = alertsList.filter(
            (alert) => alert !== null
          );
          const sortedAlerts = filteredAlertsList.sort(
            (a, b) =>
              (b.occurAtTimestamp?.toDate().getTime() || 0) -
              (a.occurAtTimestamp?.toDate().getTime() || 0)
          );

          if (!isMountedRef.current) return;

          setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
          setAlerts(sortedAlerts);
          applyFiltersAndSearch(sortedAlerts);
          setHasMore(querySnapshot.docs.length === PAGE_SIZE);
          setLoading(false);
          setError(null);
        },
        (error) => {
          if (!isMountedRef.current) return;
          console.error("Real-time listener error:", error);
          setError("Failed to load alerts in real-time. Retrying...");
          fetchAlerts(true);
        }
      );

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      };
    }, [user, role, transformAlertData, applyFiltersAndSearch, fetchAlerts])
  );

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.replace("/(auth)/SignIn");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  }, [logout, router]);

  const pageData = useMemo(() => {
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
          );
        case "filters":
          return (
            <View style={styles.filterContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search alerts..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <View style={styles.filterButtons}>
                {["all", "pending", "approved", "rejected"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterButton,
                      filterStatus === status && styles.activeFilter,
                    ]}
                    onPress={() => setFilterStatus(status)}
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
                    ]}
                    onPress={() => setFilterType(type)}
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
                            {detection.confidence ? (
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
    [
      role,
      fetchAlerts,
      router,
      searchQuery,
      filterStatus,
      filterType,
      handleLogout,
    ]
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
            <TouchableOpacity style={styles.refreshButton}>
              <Icon name="refresh" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton}>
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
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  errorContainer: {
    backgroundColor: "#2a2a2a",
    padding: 10,
    margin: 10,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    padding: 5,
    borderRadius: 5,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
  },
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
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButton: {
    padding: 5,
    marginRight: 10,
  },
  logoutButton: {
    padding: 5,
  },
  filterContainer: {
    padding: 10,
    backgroundColor: "#1a1a1a",
  },
  searchInput: {
    backgroundColor: "#2a2a2a",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  filterButton: {
    padding: 8,
    backgroundColor: "#333",
    borderRadius: 5,
  },
  activeFilter: {
    backgroundColor: "#4CAF50",
  },
  filterButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
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
  alertContent: {
    flexDirection: "column",
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  alertTimestamp: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  alertStatus: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textTransform: "capitalize",
  },
  alertDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailIcon: {
    marginRight: 6,
  },
  alertDetailText: {
    color: "#bbb",
    fontSize: 13,
  },
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
  detectionTimestamp: {
    color: "#999",
    fontSize: 12,
  },
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
  footerLoader: {
    padding: 10,
    alignItems: "center",
  },
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
  skeletonDetails: {
    marginBottom: 8,
  },
  skeletonDetection: {
    backgroundColor: "#2a2a2a",
    padding: 8,
    borderRadius: 6,
  },
});

export default AlertsPage;
