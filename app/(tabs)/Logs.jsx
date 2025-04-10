import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Clipboard,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import { db } from "../../services/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  getDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "../../context/authContext";

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user, role } = useAuth();

  const [referenceCache, setReferenceCache] = useState({
    users: {},
    devices: {},
  });

  const formatTimestamp = useCallback((timestamp) => {
    if (!timestamp) return "Unknown";
    try {
      const date = timestamp.toDate();
      return date.toLocaleString();
    } catch (error) {
      console.warn("Invalid timestamp format:", timestamp);
      return "Unknown";
    }
  }, []);

  const resolveReference = useCallback(
    async (field, path) => {
      if (!field || !field.path) return "Unknown";
      const cacheKey = field.path;

      if (path === "users" && referenceCache.users[cacheKey]) {
        return referenceCache.users[cacheKey];
      }
      if (path === "devices" && referenceCache.devices[cacheKey]) {
        return referenceCache.devices[cacheKey];
      }

      try {
        const docSnap = await getDoc(field);
        if (docSnap.exists()) {
          const data = docSnap.data();
          let resolvedValue;
          if (path === "users") {
            resolvedValue = data.username || docSnap.id;
            setReferenceCache((prev) => ({
              ...prev,
              users: { ...prev.users, [cacheKey]: resolvedValue },
            }));
          } else if (path === "devices") {
            resolvedValue = data.name || docSnap.id;
            setReferenceCache((prev) => ({
              ...prev,
              devices: { ...prev.devices, [cacheKey]: resolvedValue },
            }));
          } else {
            resolvedValue = docSnap.id;
          }
          return resolvedValue;
        }
        return docSnap.id;
      } catch (error) {
        console.error(`Error resolving ${path} reference:`, error);
        return "Unknown";
      }
    },
    [referenceCache]
  );

  const transformAlertData = useCallback(
    async (doc) => {
      const data = doc.data();
      const deviceId = await resolveReference(data.deviceId, "devices");
      const resolvedBy = data.resolvedBy
        ? await resolveReference(data.resolvedBy, "users")
        : "N/A";

      return {
        id: doc.id,
        status: data.status || "pending",
        occurAt: formatTimestamp(data.occur_at),
        resolvedAt: data.resolvedAt ? formatTimestamp(data.resolvedAt) : "N/A",
        resolvedBy: resolvedBy,
        deviceId: deviceId,
        location:
          Array.isArray(data.location) && data.location.length === 2
            ? `${data.location[0] || "N/A"}, ${data.location[1] || "N/A"}`
            : "N/A",
        securityNotified: data.securityNotified || "N/A",
        notes: data.notes || "N/A",
      };
    },
    [formatTimestamp, resolveReference]
  );

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let logsQuery;

      if (role === "admin") {
        logsQuery = query(
          collection(db, "alerts"),
          orderBy("occur_at", "desc"),
          limit(20)
        );
      } else if (role === "security") {
        logsQuery = query(
          collection(db, "alerts"),
          where("securityNotified", "==", "notified"),
          orderBy("occur_at", "desc"),
          limit(20)
        );
      } else {
        throw new Error("Invalid user role");
      }

      const querySnapshot = await getDocs(logsQuery);
      if (querySnapshot.empty) {
        setLogs([]);
        setFilteredLogs([]);
      } else {
        const logsList = await Promise.all(
          querySnapshot.docs.map((doc) => transformAlertData(doc))
        );
        setLogs(logsList);
        applyFilters(logsList, filter, search);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      let errorMessage = "Failed to fetch logs.";
      if (error.code === "permission-denied") {
        errorMessage = "Permission denied: Unable to fetch logs.";
      } else if (error.code === "unavailable") {
        errorMessage = "Network error: Please check your internet connection.";
      }
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [role, filter, search, transformAlertData]);

  useEffect(() => {
    if (!user) return;

    let unsubscribe;
    const setupLogsListener = async () => {
      try {
        let logsQuery;

        if (role === "admin") {
          logsQuery = query(
            collection(db, "alerts"),
            orderBy("occur_at", "desc"),
            limit(20)
          );
        } else if (role === "security") {
          logsQuery = query(
            collection(db, "alerts"),
            where("securityNotified", "==", "notified"),
            orderBy("occur_at", "desc"),
            limit(20)
          );
        } else {
          throw new Error("Invalid user role");
        }

        unsubscribe = onSnapshot(
          logsQuery,
          async (querySnapshot) => {
            const logsList = await Promise.all(
              querySnapshot.docs.map((doc) => transformAlertData(doc))
            );
            setLogs(logsList);
            applyFilters(logsList, filter, search);
            setLoading(false);
          },
          (error) => {
            console.error("Error in real-time logs listener:", error);
            let errorMessage = "Failed to load logs in real-time.";
            if (error.code === "permission-denied") {
              errorMessage = "Permission denied: Unable to load logs.";
            } else if (error.code === "unavailable") {
              errorMessage =
                "Network error: Please check your internet connection.";
            }
            setError(errorMessage);
            Alert.alert("Error", errorMessage);
            fetchLogs();
          }
        );
      } catch (error) {
        console.error("Error setting up logs listener:", error);
        let errorMessage = "Error setting up real-time listener.";
        if (error.code === "permission-denied") {
          errorMessage = "Permission denied: Unable to set up listener.";
        } else if (error.code === "unavailable") {
          errorMessage =
            "Network error: Please check your internet connection.";
        }
        setError(errorMessage);
        Alert.alert("Error", errorMessage);
        fetchLogs();
      }
    };

    setupLogsListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, role, fetchLogs, filter, search, transformAlertData]);

  const applyFilters = useCallback((logsList, statusFilter, searchText) => {
    let filtered = [...logsList];

    if (statusFilter === "notified") {
      filtered = filtered.filter((log) => log.securityNotified === "notified");
    } else if (statusFilter !== "All") {
      filtered = filtered.filter(
        (log) => log.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter((log) =>
        [log.occurAt, log.deviceId, log.location].some(
          (field) => field && field.toLowerCase().includes(searchLower)
        )
      );
    }

    setFilteredLogs(filtered);
  }, []);

  const copyToClipboard = useCallback((log) => {
    try {
      const logData = {
        alertId: log.id,
        status: log.status,
        occurAt: log.occurAt,
        resolvedAt: log.resolvedAt,
        resolvedBy: log.resolvedBy,
        deviceId: log.deviceId,
        location: log.location,
        securityNotified: log.securityNotified,
        notes: log.notes,
      };
      const jsonString = JSON.stringify(logData, null, 2);
      Clipboard.setString(jsonString);
      Alert.alert(
        "Copied to Clipboard",
        `Details for Alert #${log.id} have been copied as JSON.`
      );
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      Alert.alert("Error", "Failed to copy to clipboard: " + error.message);
    }
  }, []);

  const pageData = useMemo(
    () => [
      { type: "header", id: "header" },
      { type: "searchFilter", id: "searchFilter" },
      { type: "logs", id: "logs", data: filteredLogs },
    ],
    [filteredLogs]
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      switch (item.type) {
        case "header":
          return (
            <View style={styles.header}>
              <Text style={styles.headerText}>Alert History Logs</Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => fetchLogs()}
              >
                <Icon name="refresh" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          );
        case "searchFilter":
          return (
            <View style={styles.searchFilterContainer}>
              <View style={styles.searchContainer}>
                <Icon
                  name="search"
                  size={20}
                  color="#fff"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  onChangeText={(text) => {
                    setSearch(text);
                    applyFilters(logs, filter, text);
                  }}
                  placeholder="Search by time, device, or location"
                  placeholderTextColor="#999"
                />
              </View>
              <Picker
                selectedValue={filter}
                onValueChange={(itemValue) => {
                  setFilter(itemValue);
                  applyFilters(logs, itemValue, search);
                }}
                style={styles.picker}
              >
                <Picker.Item label="All" value="All" />
                <Picker.Item label="Pending" value="pending" />
                <Picker.Item label="Approved" value="approved" />
                <Picker.Item label="Rejected" value="rejected" />
                <Picker.Item label="Notified" value="notified" />
              </Picker>
            </View>
          );
        case "logs":
          return item.data.length > 0 ? (
            item.data.map((log, idx) => (
              <Animated.View
                key={log.id}
                entering={SlideInRight.delay(idx * 100)}
              >
                <View style={styles.logCard}>
                  <View style={styles.logHeader}>
                    <Icon
                      name="alert-circle-outline"
                      size={20}
                      color={getStatusColor(log.status)}
                    />
                    <Text style={styles.logTitle}>Alert #{log.id}</Text>
                    <Text
                      style={[
                        styles.logStatus,
                        { backgroundColor: getStatusColor(log.status) },
                      ]}
                    >
                      {log.status}
                    </Text>
                  </View>
                  <Text style={styles.logTimestamp}>
                    Occurred: {log.occurAt}
                  </Text>
                  {log.resolvedAt !== "N/A" && (
                    <Text style={styles.logTimestamp}>
                      Resolved: {log.resolvedAt}
                    </Text>
                  )}
                  {log.resolvedBy !== "N/A" && (
                    <Text style={styles.logDetail}>
                      Resolved By: {log.resolvedBy}
                    </Text>
                  )}
                  <Text style={styles.logDetail}>Device: {log.deviceId}</Text>
                  <Text style={styles.logDetail}>Location: {log.location}</Text>
                  <Text style={styles.logDetail}>
                    Security Notified: {log.securityNotified}
                  </Text>
                  <Text style={styles.logNotes}>Notes: {log.notes}</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => copyToClipboard(log)}
                    >
                      <Icon name="copy-outline" size={16} color="#4CAF50" />
                      <Text style={styles.actionButtonText}>Copy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        router.push({
                          pathname: "/(tabs)/AlertDetailPage",
                          params: { alertId: log.id },
                        })
                      }
                    >
                      <Icon name="eye-outline" size={16} color="#4CAF50" />
                      <Text style={styles.actionButtonText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            ))
          ) : (
            <Text style={styles.emptyText}>No alert history logs found</Text>
          );
        default:
          return null;
      }
    },
    [
      filter,
      search,
      logs,
      filteredLogs,
      copyToClipboard,
      router,
      applyFilters,
      fetchLogs,
    ]
  );

  if (loading && !error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Alert History Logs</Text>
          <TouchableOpacity style={styles.refreshButton}>
            <Icon name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchFilterContainer}>
          <View style={styles.skeletonSearch} />
          <View style={styles.skeletonPicker} />
        </View>
        {[...Array(5)].map((_, index) => (
          <View key={index} style={styles.skeletonLogCard}>
            <View style={styles.skeletonHeader}>
              <View style={[styles.skeletonText, { width: "40%" }]} />
              <View style={styles.skeletonStatus} />
            </View>
            <View style={[styles.skeletonText, { width: "60%" }]} />
            <View style={[styles.skeletonText, { width: "50%" }]} />
            <View style={[styles.skeletonText, { width: "70%" }]} />
            <View style={styles.skeletonButtons}>
              <View style={[styles.skeletonButton, { width: 80 }]} />
              <View style={[styles.skeletonButton, { width: 100 }]} />
            </View>
          </View>
        ))}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchLogs} style={styles.retryButton}>
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
      />
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
      return "#FFFFFF";
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
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
  errorText: { color: "#D32F2F", fontSize: 14 },
  retryButton: {
    backgroundColor: "#4CAF50",
    padding: 5,
    borderRadius: 5,
  },
  retryText: { color: "#fff", fontSize: 14 },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  headerText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  refreshButton: { padding: 5 },
  searchFilterContainer: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  searchIcon: { position: "absolute", left: 10, zIndex: 1 },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: "#4CAF50",
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 40,
    paddingRight: 10,
    color: "#fff",
    backgroundColor: "#1a1a1a",
    fontSize: 14,
  },
  picker: {
    width: 150,
    color: "#fff",
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },
  logCard: {
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  logTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  logStatus: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textTransform: "capitalize",
  },
  logTimestamp: {
    color: "#bbb",
    fontSize: 14,
    marginBottom: 4,
  },
  logDetail: {
    color: "#999",
    fontSize: 12,
    marginBottom: 4,
  },
  logNotes: {
    color: "#999",
    fontSize: 12,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  actionButtonText: {
    color: "#4CAF50",
    fontSize: 12,
    marginLeft: 4,
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 8,
  },
  skeletonLogCard: {
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 10,
  },
  skeletonHeader: {
    flexDirection: "row",
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
  skeletonButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  skeletonButton: {
    backgroundColor: "#333",
    height: 30,
    borderRadius: 8,
    marginLeft: 8,
  },
  skeletonSearch: {
    flex: 1,
    height: 40,
    backgroundColor: "#333",
    borderRadius: 12,
    marginRight: 10,
  },
  skeletonPicker: {
    width: 150,
    height: 40,
    backgroundColor: "#333",
    borderRadius: 5,
  },
});

export default LogsPage;
