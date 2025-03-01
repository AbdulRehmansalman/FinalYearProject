import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const role = "admin"; // Hardcoded role for frontend demo
  const router = useRouter();

  // Mock alert data
  const mockAlerts = [
    {
      id: "1",
      timestamp: "2025-02-21T10:30:00Z",
      status: "pending",
      soundConfidence: 0.92,
      weaponConfidence: 0.87,
    },
    {
      id: "2",
      timestamp: "2025-02-22T14:15:00Z",
      status: "approved",
      soundConfidence: 0.95,
      weaponConfidence: 0.91,
    },
    {
      id: "3",
      timestamp: "2025-02-23T09:45:00Z",
      status: "rejected",
      soundConfidence: 0.88,
      weaponConfidence: 0.82,
    },
    {
      id: "4",
      timestamp: "2025-02-24T16:20:00Z",
      status: "pending",
      soundConfidence: 0.89,
      weaponConfidence: 0.85,
    },
    {
      id: "5",
      timestamp: "2025-02-25T08:10:00Z",
      status: "approved",
      soundConfidence: 0.97,
      weaponConfidence: 0.93,
    },
  ];

  // Simulate loading and set mock data
  useEffect(() => {
    setTimeout(() => {
      setAlerts(mockAlerts);
      setLoading(false);
    }, 500);
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesFilter =
        role === "admin"
          ? filter === "All" || alert.status === filter.toLowerCase()
          : alert.status === "approved";
      const matchesSearch = alert.timestamp
        ?.toLowerCase()
        .includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [alerts, filter, search, role]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setAlerts(mockAlerts);
      setLoading(false);
    }, 1000);
  };

  // Combined data structure for FlatList
  const pageData = [
    { type: "header", id: "header" },
    ...(role === "admin" ? [{ type: "filterSearch", id: "filterSearch" }] : []),
    { type: "alerts", id: "alerts", data: filteredAlerts },
  ];

  const renderItem = useCallback(
    ({ item }) => {
      switch (item.type) {
        case "header":
          return (
            <View style={styles.header}>
              <Text style={styles.headerText}>Alerts</Text>
              {role === "admin" && (
                <View style={styles.filterContainer}>
                  <Picker
                    selectedValue={filter}
                    onValueChange={(itemValue) => setFilter(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="All" value="All" />
                    <Picker.Item label="Pending" value="Pending" />
                    <Picker.Item label="Approved" value="Approved" />
                    <Picker.Item label="Rejected" value="Rejected" />
                  </Picker>
                  <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={handleRefresh}
                  >
                    <Icon name="refresh" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        case "filterSearch":
          return (
            <View style={styles.searchContainer}>
              <Icon
                name="search"
                size={20}
                color="white"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by timestamp"
                placeholderTextColor="#999"
                value={search}
                onChangeText={setSearch}
              />
            </View>
          );
        case "alerts":
          return item.data.length > 0 ? (
            item.data.map((alert) => (
              <Animated.View key={alert.id} entering={FadeIn}>
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
                    <View>
                      <Text style={styles.alertTimestamp}>
                        Detected:{" "}
                        {alert.timestamp?.split("T")[1]?.slice(0, 5) || "N/A"}
                      </Text>
                      <Text
                        style={[
                          styles.alertStatus,
                          { color: getStatusColor(alert.status) },
                        ]}
                      >
                        {alert.status}
                      </Text>
                      <Text style={styles.alertConfidence}>
                        Sound: {(alert.soundConfidence || 0).toFixed(2)},
                        Weapon: {(alert.weaponConfidence || 0).toFixed(2)}
                      </Text>
                      {role === "security" && alert.status === "approved" && (
                        <Text style={styles.receivedText}>Received</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          ) : (
            <Text style={styles.emptyText}>No alerts found</Text>
          );
        default:
          return null;
      }
    },
    [filter, search, role, router, filteredAlerts, handleRefresh]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
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

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "#FF9800";
    case "approved":
      return "#4CAF50";
    case "rejected":
      return "#D32F2F";
    default:
      return "white";
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  header: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  filterContainer: { flexDirection: "row", alignItems: "center" },
  picker: { width: 150, color: "#fff", backgroundColor: "#4CAF50" },
  refreshButton: { marginLeft: 10, padding: 5 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 10,
  },
  searchIcon: { position: "absolute", left: 10, zIndex: 1 },
  searchInput: {
    flex: 1,
    height: 50,
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 40,
    paddingRight: 10,
    color: "white",
  },
  alertItem: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  alertContent: { flexDirection: "row", justifyContent: "space-between" },
  alertTimestamp: { color: "#fff", fontSize: 14 },
  alertStatus: { fontSize: 14, fontWeight: "bold" },
  alertConfidence: { color: "#999", fontSize: 12 },
  receivedText: { color: "#4CAF50", fontSize: 12, marginTop: 5 },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

export default AlertsPage;
