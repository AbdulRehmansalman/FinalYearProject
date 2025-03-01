import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";

const { width } = Dimensions.get("window");

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const role = "admin"; // Hardcoded role for frontend demo
  const router = useRouter();

  // Mock log data reflecting history of alert actions
  const mockLogs = [
    {
      id: "log1",
      alertId: "1",
      action: "approved",
      timestamp: "2025-02-25T14:30:00Z",
      userId: "admin123",
      alertTimestamp: "2025-02-25T14:25:00Z",
      securityNotified: true,
    },
    {
      id: "log2",
      alertId: "2",
      action: "rejected",
      timestamp: "2025-02-25T14:25:00Z",
      userId: "admin456",
      alertTimestamp: "2025-02-25T14:20:00Z",
      securityNotified: false,
    },
    {
      id: "log3",
      alertId: "3",
      action: "notified",
      timestamp: "2025-02-25T14:20:00Z",
      userId: "admin789",
      alertTimestamp: "2025-02-25T14:15:00Z",
      securityNotified: true,
    },
    {
      id: "log4",
      alertId: "4",
      action: "approved",
      timestamp: "2025-02-25T14:15:00Z",
      userId: "admin101",
      alertTimestamp: "2025-02-25T14:10:00Z",
      securityNotified: true,
    },
    {
      id: "log5",
      alertId: "5",
      action: "rejected",
      timestamp: "2025-02-25T14:10:00Z",
      userId: "admin202",
      alertTimestamp: "2025-02-25T14:05:00Z",
      securityNotified: false,
    },
  ];

  useEffect(() => {
    // Simulate loading with mock data
    setTimeout(() => {
      setLogs(mockLogs);
      setLoading(false);
    }, 1000); // Simulated delay for UI feedback
  }, []);

  const filteredLogs = useCallback(() => {
    let filtered = logs;
    if (filter !== "All") {
      filtered = filtered.filter(
        (log) => log.action.toLowerCase() === filter.toLowerCase()
      );
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.timestamp.toLowerCase().includes(searchLower) ||
          log.userId.toLowerCase().includes(searchLower) ||
          log.action.toLowerCase().includes(searchLower) ||
          log.alertTimestamp.toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  }, [logs, filter, search]);

  const renderLog = ({ item, index }) => (
    <Animated.View entering={SlideInRight.delay(index * 100)}>
      <TouchableOpacity
        style={styles.logCard}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/alert-detail",
            params: { alertId: item.alertId },
          })
        }
      >
        <View style={styles.logHeader}>
          <Icon name="time-outline" size={20} color="#4CAF50" />
          <Text style={styles.logTitle}>Alert #{item.alertId}</Text>
        </View>
        <Text style={styles.logTimestamp}>
          Action Time: {item.timestamp.split("T")[1].slice(0, 5)}
        </Text>
        <Text style={styles.logAlertTime}>
          Alert Time: {item.alertTimestamp.split("T")[1].slice(0, 5)}
        </Text>
        <Text style={styles.logAction}>Action: {item.action}</Text>
        <Text style={styles.logUser}>By: {item.userId}</Text>
        {item.securityNotified && (
          <Text style={styles.logNotified}>Security Notified</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const exportLogs = () => {
    console.log("Exporting alert history logs:", filteredLogs());
    Alert.alert(
      "Logs Exported",
      "Alert history logs have been exported successfully (simulated)."
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  // Combine all content into FlatList
  const pageData = [
    { type: "header", id: "header" },
    { type: "searchFilter", id: "searchFilter" },
    { type: "logs", id: "logs", data: filteredLogs() },
    { type: "export", id: "export" },
  ];

  const renderItem = ({ item }) => {
    switch (item.type) {
      case "header":
        return (
          <View style={styles.header}>
            <Text style={styles.headerText}>Alert History Logs</Text>
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
                onChangeText={setSearch}
                placeholder="Search by time, user, or action"
                placeholderTextColor="#999"
              />
            </View>
            <Picker
              selectedValue={filter}
              onValueChange={(itemValue) => setFilter(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="All" value="All" />
              <Picker.Item label="Approved" value="Approved" />
              <Picker.Item label="Rejected" value="Rejected" />
              <Picker.Item label="Notified" value="Notified" />
            </Picker>
          </View>
        );
      case "logs":
        return item.data.length > 0 ? (
          item.data.map((log, index) => (
            <Animated.View
              key={log.id}
              entering={SlideInRight.delay(index * 100)}
            >
              <TouchableOpacity
                style={styles.logCard}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/alert-detail",
                    params: { alertId: log.alertId },
                  })
                }
              >
                <View style={styles.logHeader}>
                  <Icon name="time-outline" size={20} color="#4CAF50" />
                  <Text style={styles.logTitle}>Alert #{log.alertId}</Text>
                </View>
                <Text style={styles.logTimestamp}>
                  Action Time: {log.timestamp.split("T")[1].slice(0, 5)}
                </Text>
                <Text style={styles.logAlertTime}>
                  Alert Time: {log.alertTimestamp.split("T")[1].slice(0, 5)}
                </Text>
                <Text style={styles.logAction}>Action: {log.action}</Text>
                <Text style={styles.logUser}>By: {log.userId}</Text>
                {log.securityNotified && (
                  <Text style={styles.logNotified}>Security Notified</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))
        ) : (
          <Text style={styles.emptyText}>No alert history logs found</Text>
        );
      case "export":
        return (
          <TouchableOpacity style={styles.exportButton} onPress={exportLogs}>
            <Icon name="download-outline" size={20} color="#fff" />
            <Text style={styles.exportButtonText}>Export Alert History</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

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
  },
  header: {
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#2d2d2d",
  },
  headerText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
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
  picker: { width: 150, color: "#fff", backgroundColor: "#4CAF50" },
  logCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  logTitle: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8 },
  logTimestamp: { color: "#fff", fontSize: 14, marginBottom: 4 },
  logAlertTime: { color: "#fff", fontSize: 14, marginBottom: 4 },
  logAction: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  logUser: { color: "#999", fontSize: 12, marginBottom: 4 },
  logNotified: { color: "#4CAF50", fontSize: 12 },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 8,
  },
  exportButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  exportButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default Logs;
