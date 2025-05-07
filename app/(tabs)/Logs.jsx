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
  FlatList,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  Clipboard,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { SlideInRight } from "react-native-reanimated";
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
import { Timestamp } from "firebase/firestore";

const MAX_CACHE_SIZE = 50;
const DEBOUNCE_MS = 300;
const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filter, setFilter] = useState("All");
  const [dateInput, setDateInput] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user, role } = useAuth();
  const [referenceCache, setReferenceCache] = useState({
    users: {},
    devices: {},
  });
  const debounceTimeoutRef = useRef(null);

  const formatTimestamp = useCallback((timestamp) => {
    if (!timestamp) return "Unknown";
    try {
      let date;
      if (timestamp instanceof Timestamp) {
        date = timestamp.toDate();
      } else if (typeof timestamp === "string") {
        date = new Date(timestamp);
        if (isNaN(date.getTime())) return "Unknown";
      } else {
        return "Unknown";
      }
      return date.toLocaleString();
    } catch {
      return "Unknown";
    }
  }, []);

  const formatDateForDisplay = useCallback((date) => {
    if (!date) return "None";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const parseDateInput = useCallback((input) => {
    const regex = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = input.match(regex);
    if (!match) return null;
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
  }, []);

  const handleDateInputChange = useCallback(
    (text) => {
      setDateInput(text);
      const parsedDate = parseDateInput(text);
      setSelectedDate(parsedDate);
      applyFilters(logs, filter, parsedDate);
    },
    [logs, filter, parseDateInput]
  );

  const clearDate = useCallback(() => {
    setDateInput("");
    setSelectedDate(null);
    applyFilters(logs, filter, null);
  }, [logs, filter]);

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
        let resolvedValue = docSnap.id;
        if (docSnap.exists()) {
          const data = docSnap.data();
          resolvedValue =
            path === "users"
              ? data.username || docSnap.id
              : data.name || docSnap.id;
        }

        setReferenceCache((prev) => {
          const newCache = { ...prev };
          const cacheType = path === "users" ? "users" : "devices";
          newCache[cacheType] = {
            ...newCache[cacheType],
            [cacheKey]: resolvedValue,
          };

          // Limit cache size
          if (Object.keys(newCache[cacheType]).length > MAX_CACHE_SIZE) {
            newCache[cacheType] = Object.fromEntries(
              Object.entries(newCache[cacheType]).slice(-MAX_CACHE_SIZE)
            );
          }
          return newCache;
        });

        return resolvedValue;
      } catch {
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
        occurAtTimestamp: data.occur_at,
        resolvedAt: data.resolvedAt ? formatTimestamp(data.resolvedAt) : "N/A",
        resolvedBy,
        deviceId,
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
      const logsQuery =
        role === "admin"
          ? query(
              collection(db, "alerts"),
              orderBy("occur_at", "desc"),
              limit(20)
            )
          : query(
              collection(db, "alerts"),
              where("securityNotified", "==", "notified"),
              orderBy("occur_at", "desc"),
              limit(20)
            );

      const querySnapshot = await getDocs(logsQuery);
      const logsList = querySnapshot.empty
        ? []
        : await Promise.all(querySnapshot.docs.map(transformAlertData));
      setLogs(logsList);
      applyFilters(logsList, filter, selectedDate);
    } catch (error) {
      setError(
        error.code === "permission-denied"
          ? "Permission denied: Unable to fetch logs."
          : error.code === "unavailable"
          ? "Network error: Please check your internet connection."
          : "Failed to fetch logs."
      );
    } finally {
      setLoading(false);
    }
  }, [role, filter, selectedDate, transformAlertData]);

  useEffect(() => {
    if (!user) return;

    let unsubscribe;
    const setupLogsListener = async () => {
      try {
        const logsQuery =
          role === "admin"
            ? query(
                collection(db, "alerts"),
                orderBy("occur_at", "desc"),
                limit(20)
              )
            : query(
                collection(db, "alerts"),
                where("securityNotified", "==", "notified"),
                orderBy("occur_at", "desc"),
                limit(20)
              );

        unsubscribe = onSnapshot(
          logsQuery,
          (querySnapshot) => {
            if (debounceTimeoutRef.current) {
              clearTimeout(debounceTimeoutRef.current);
            }
            debounceTimeoutRef.current = setTimeout(async () => {
              const logsList = querySnapshot.empty
                ? []
                : await Promise.all(querySnapshot.docs.map(transformAlertData));
              setLogs(logsList);
              applyFilters(logsList, filter, selectedDate);
              setLoading(false);
            }, DEBOUNCE_MS);
          },
          (error) => {
            setError(
              error.code === "permission-denied"
                ? "Permission denied: Unable to load logs."
                : error.code === "unavailable"
                ? "Network error: Please check your internet connection."
                : "Failed to load logs in real-time."
            );
            fetchLogs();
          }
        );
      } catch (error) {
        setError(
          error.code === "permission-denied"
            ? "Permission denied: Unable to set up listener."
            : error.code === "unavailable"
            ? "Network error: Please check your internet connection."
            : "Error setting up real-time listener."
        );
        fetchLogs();
      }
    };

    setupLogsListener();

    return () => {
      if (unsubscribe) unsubscribe();
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [user, role, fetchLogs, filter, selectedDate, transformAlertData]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/(tabs)/SensorData");
        return true;
      }
    );
    return () => backHandler.remove();
  }, [router]);

  const applyFilters = useCallback((logsList, statusFilter, date) => {
    let filtered = [...logsList];

    if (statusFilter === "notified") {
      filtered = filtered.filter((log) => log.securityNotified === "notified");
    } else if (statusFilter !== "All") {
      filtered = filtered.filter(
        (log) => log.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (date) {
      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const endOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59,
        999
      );

      filtered = filtered.filter((log) => {
        if (!log.occurAtTimestamp) return false;
        try {
          const logTime = log.occurAtTimestamp.toDate();
          return logTime >= startOfDay && logTime <= endOfDay;
        } catch {
          return false;
        }
      });
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
      Clipboard.setString(JSON.stringify(logData, null, 2));
    } catch (error) {
      // Handle error silently
    }
  }, []);

  const pageData = useMemo(
    () => [
      { type: "header", id: "header" },
      { type: "filter", id: "filter" },
      { type: "logs", id: "logs", data: filteredLogs },
    ],
    [filteredLogs]
  );

  const renderItem = useCallback(
    ({ item }) => {
      switch (item.type) {
        case "header":
          return (
            <View style={styles.header}>
              <Text style={styles.headerText}>Alert History Logs</Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={fetchLogs}
              >
                <Icon name="refresh" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          );
        case "filter":
          return (
            <View style={styles.filterContainer}>
              <View style={styles.datePickerContainer}>
                <View style={styles.dateInputContainer}>
                  <Icon
                    name="calendar-outline"
                    size={20}
                    color="#fff"
                    style={styles.dateIcon}
                  />
                  <TextInput
                    style={styles.dateInput}
                    value={dateInput}
                    onChangeText={handleDateInputChange}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>
                {selectedDate && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearDate}
                  >
                    <Icon name="close-circle" size={20} color="#D32F2F" />
                  </TouchableOpacity>
                )}
              </View>
              <Picker
                selectedValue={filter}
                onValueChange={(itemValue) => {
                  setFilter(itemValue);
                  applyFilters(logs, itemValue, selectedDate);
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
                entering={idx < 5 ? SlideInRight.delay(idx * 100) : undefined}
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
            <Text style={styles.emptyText}>
              {selectedDate
                ? "No logs match the selected date"
                : "No alert history logs found"}
            </Text>
          );
        default:
          return null;
      }
    },
    [
      filter,
      logs,
      filteredLogs,
      selectedDate,
      dateInput,
      fetchLogs,
      clearDate,
      handleDateInputChange,
      copyToClipboard,
      router,
      applyFilters,
    ]
  );

  const getItemLayout = useCallback(
    (data, index) => {
      const lengths = {
        header: 60,
        filter: 60,
        logs: filteredLogs.length > 0 ? filteredLogs.length * 220 : 50,
      };
      let offset = 0;
      if (index === 0) return { length: lengths.header, offset: 0, index };
      if (index === 1)
        return { length: lengths.filter, offset: lengths.header, index };
      return {
        length: lengths.logs,
        offset: lengths.header + lengths.filter,
        index,
      };
    },
    [filteredLogs.length]
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
        <View style={styles.filterContainer}>
          <View style={styles.skeletonDatePicker} />
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
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
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
  errorText: { color: "#D32F2F", fontSize: 14, fontFamily: "Poppins-Regular" },
  retryButton: { backgroundColor: "#4CAF50", padding: 5, borderRadius: 5 },
  retryText: { color: "#fff", fontSize: 14, fontFamily: "Poppins-Bold" },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  headerText: { color: "#fff", fontSize: 24, fontFamily: "Poppins-Bold" },
  refreshButton: { padding: 5 },
  filterContainer: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  datePickerContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  dateInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderColor: "#4CAF50",
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "#1a1a1a",
  },
  dateIcon: { marginLeft: 10 },
  dateInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    paddingHorizontal: 10,
    fontFamily: "Poppins-Regular",
  },
  clearButton: { padding: 5 },
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
  },
  logHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  logTitle: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    marginLeft: 8,
    flex: 1,
  },
  logStatus: {
    fontSize: 12,
    fontFamily: "Poppins-Bold",
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
    fontFamily: "Poppins-Regular",
  },
  logDetail: {
    color: "#999",
    fontSize: 12,
    marginBottom: 4,
    fontFamily: "Poppins-Regular",
  },
  logNotes: {
    color: "#999",
    fontSize: 12,
    marginBottom: 8,
    fontFamily: "Poppins-Regular",
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
    fontFamily: "Poppins-Bold",
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 8,
    fontFamily: "Poppins-Regular",
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
  skeletonDatePicker: {
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
