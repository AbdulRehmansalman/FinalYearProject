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
// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   TextInput,
//   Platform,
//   RefreshControl,
//   Image
// } from "react-native";
// import { useRouter } from "expo-router";
// import Animated, {
//   FadeIn,
//   SlideInRight,
//   FadeInUp,
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming
// } from "react-native-reanimated";
// import { LinearGradient } from "expo-linear-gradient";
// import { StatusBar } from "expo-status-bar";
// import Icon from "react-native-vector-icons/Ionicons";
// import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
// import { Picker } from "@react-native-picker/picker";
// import { useAuth } from "../../src/contexts/AuthContext";
// import { db } from "../../src/services/firebase";
// import {
//   collection,
//   query,
//   where,
//   orderBy,
//   limit,
//   getDocs,
//   onSnapshot,
//   Timestamp
// } from "firebase/firestore";

// const AlertsPage = () => {
//   // State
//   const [alerts, setAlerts] = useState([]);
//   const [filteredAlerts, setFilteredAlerts] = useState([]);
//   const [filter, setFilter] = useState("All");
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   // Animation values
//   const headerY = useSharedValue(-50);
//   const listOpacity = useSharedValue(0);

//   // Router and auth context
//   const router = useRouter();
//   const { user, role } = useAuth();

//   // Animated styles
//   const headerStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: headerY.value }]
//   }));

//   const listStyle = useAnimatedStyle(() => ({
//     opacity: listOpacity.value
//   }));

//   // Helper function to convert Firestore timestamps
//   const convertTimestampToDate = (timestamp) => {
//     if (!timestamp) return new Date();
//     if (timestamp.seconds) {
//       return new Date(timestamp.seconds * 1000);
//     } else if (timestamp.toDate) {
//       return timestamp.toDate();
//     }
//     return new Date(timestamp);
//   };

//   // Format the timestamp for display
//   const formatDate = (timestamp) => {
//     const date = convertTimestampToDate(timestamp);
//     return date.toLocaleString();
//   };

//   // Format time ago
//   const getTimeAgo = (timestamp) => {
//     if (!timestamp) return "Unknown";

//     const date = convertTimestampToDate(timestamp);
//     const now = new Date();
//     const diffInSeconds = Math.floor((now - date) / 1000);

//     if (diffInSeconds < 60) {
//       return ${diffInSeconds} sec ago;
//     } else if (diffInSeconds < 3600) {
//       return ${Math.floor(diffInSeconds / 60)} min ago;
//     } else if (diffInSeconds < 86400) {
//       return ${Math.floor(diffInSeconds / 3600)} hours ago;
//     } else {
//       return ${Math.floor(diffInSeconds / 86400)} days ago;
//     }
//   };

//   // Fetch alerts from Firestore
//   const fetchAlerts = useCallback(async () => {
//     setRefreshing(true);
//     try {
//       let alertsQuery;

//       if (role === "admin") {
//         // Admin sees all alerts
//         alertsQuery = query(
//           collection(db, "alerts"),
//           orderBy("timestamp", "desc"),
//           limit(50)
//         );
//       } else {
//         // Security personnel only see approved alerts
//         alertsQuery = query(
//           collection(db, "alerts"),
//           where("status", "==", "approved"),
//           orderBy("timestamp", "desc"),
//           limit(50)
//         );
//       }

//       const querySnapshot = await getDocs(alertsQuery);
//       const alertsList = [];

//       querySnapshot.forEach((doc) => {
//         alertsList.push({
//           id: doc.id,
//           ...doc.data()
//         });
//       });

//       setAlerts(alertsList);
//       applyFilters(alertsList, filter, search);
//     } catch (error) {
//       console.error("Error fetching alerts:", error);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [role, filter, search]);

//   // Set up real-time listener for alerts
//   useEffect(() => {
//     let unsubscribe;

//     const setupAlertsListener = async () => {
//       try {
//         let alertsQuery;

//         if (role === "admin") {
//           // Admin sees all alerts
//           alertsQuery = query(
//             collection(db, "alerts"),
//             orderBy("timestamp", "desc"),
//             limit(50)
//           );
//         } else {
//           // Security personnel only see approved alerts
//           alertsQuery = query(
//             collection(db, "alerts"),
//             where("status", "==", "approved"),
//             orderBy("timestamp", "desc"),
//             limit(50)
//           );
//         }

//         unsubscribe = onSnapshot(alertsQuery, (querySnapshot) => {
//           const alertsList = [];

//           querySnapshot.forEach((doc) => {
//             alertsList.push({
//               id: doc.id,
//               ...doc.data()
//             });
//           });

//           setAlerts(alertsList);
//           applyFilters(alertsList, filter, search);
//           setLoading(false);

//           // Start animations
//           headerY.value = withTiming(0, { duration: 800 });
//           listOpacity.value = withTiming(1, { duration: 800 });
//         }, (error) => {
//           console.error("Error in real-time alerts listener:", error);
//           fetchAlerts(); // Fallback to regular fetching
//         });
//       } catch (error) {
//         console.error("Error setting up alerts listener:", error);
//         fetchAlerts();
//       }
//     };

//     setupAlertsListener();

//     return () => {
//       if (unsubscribe) {
//         unsubscribe();
//       }
//     };
//   }, [role]);

//   // Apply filters when filter or search changes
//   useEffect(() => {
//     applyFilters(alerts, filter, search);
//   }, [filter, search]);

//   // Filter alerts based on status and search
//   const applyFilters = (alertsList, statusFilter, searchText) => {
//     let filtered = [...alertsList];

//     // Apply status filter
//     if (statusFilter !== "All") {
//       filtered = filtered.filter(alert =>
//         alert.status?.toLowerCase() === statusFilter.toLowerCase()
//       );
//     }

//     // Apply search filter
//     if (searchText) {
//       filtered = filtered.filter(alert => {
//         const dateStr = formatDate(alert.timestamp);
//         return dateStr.toLowerCase().includes(searchText.toLowerCase()) ||
//                alert.id.toLowerCase().includes(searchText.toLowerCase());
//       });
//     }

//     setFilteredAlerts(filtered);
//   };

//   // Refresh alerts list
//   const onRefresh = () => {
//     fetchAlerts();
//   };

//   // Handle alert item press
//   const handleAlertPress = (alertId) => {
//     router.push({
//       pathname: "/(tabs)/AlertDetailPage",
//       params: { alertId }
//     });
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar style="light" />
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#4CAF50" />
//           <Text style={styles.loadingText}>Loading alerts...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar style="light" />

//       {/* Header */}
//       <Animated.View style={[styles.headerContainer, headerStyle]}>
//         <LinearGradient
//           colors={["#4CAF50", "#2E7D32"]}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 0 }}
//           style={styles.header}
//         >
//           <View style={styles.headerContent}>
//             <Text style={styles.headerTitle}>Alerts</Text>

//             {role === "admin" && (
//               <View style={styles.filterWrapper}>
//                 <Picker
//                   selectedValue={filter}
//                   onValueChange={(itemValue) => setFilter(itemValue)}
//                   style={styles.picker}
//                   dropdownIconColor="#fff"
//                   mode="dropdown"
//                 >
//                   <Picker.Item label="All Alerts" value="All" />
//                   <Picker.Item label="Pending" value="pending" />
//                   <Picker.Item label="Approved" value="approved" />
//                   <Picker.Item label="Rejected" value="rejected" />
//                 </Picker>
//               </View>
//             )}
//           </View>

//           <View style={styles.searchContainer}>
//             <Icon
//               name="search-outline"
//               size={20}
//               color="#e0e0e0"
//               style={styles.searchIcon}
//             />
//             <TextInput
//               style={styles.searchInput}
//               placeholder="Search by date or ID"
//               placeholderTextColor="#aaa"
//               value={search}
//               onChangeText={setSearch}
//             />
//             {search !== "" && (
//               <TouchableOpacity onPress={() => setSearch("")} style={styles.clearButton}>
//                 <Icon name="close-circle" size={16} color="#e0e0e0" />
//               </TouchableOpacity>
//             )}
//           </View>
//         </LinearGradient>
//       </Animated.View>

//       {/* Alerts List */}
//       <Animated.View style={[styles.listContainer, listStyle]}>
//         <FlatList
//           data={filteredAlerts}
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               colors={["#4CAF50"]}
//               tintColor="#4CAF50"
//             />
//           }
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               <MaterialIcons name="shield-check" size={64} color="#4CAF50" />
//               <Text style={styles.emptyText}>
//                 {search || filter !== "All"
//                   ? "No alerts match your filters"
//                   : "No alerts found"}
//               </Text>
//             </View>
//           }
//           renderItem={({ item, index }) => (
//             <Animated.View
//               entering={FadeInUp.delay(index * 100).duration(400)}
//               style={styles.alertItemContainer}
//             >
//               <TouchableOpacity
//                 style={styles.alertItem}
//                 onPress={() => handleAlertPress(item.id)}
//                 activeOpacity={0.7}
//               >
//                 <View style={styles.alertHeader}>
//                   <View style={styles.alertTypeContainer}>
//                     <MaterialIcons
//                       name={getAlertTypeIcon(item.alertType)}
//                       size={22}
//                       color="#fff"
//                     />
//                     <Text style={styles.alertType}>
//                       {formatAlertType(item.alertType)}
//                     </Text>
//                   </View>

//                   <View
//                     style={[
//                       styles.statusBadge,
//                       { backgroundColor: getStatusColor(item.status) },
//                     ]}
//                   >
//                     <Text style={styles.statusText}>{item.status}</Text>
//                   </View>
//                 </View>

//                 <View style={styles.alertContent}>
//                   {item.detections?.image?.imageUrl && (
//                     <Image
//                       source={{ uri: item.detections.image.imageUrl }}
//                       style={styles.alertImage}
//                       resizeMode="cover"
//                     />
//                   )}

//                   <View style={styles.alertDetails}>
//                     <View style={styles.timestampContainer}>
//                       <Icon name="time-outline" size={14} color="#bbb" />
//                       <Text style={styles.timestampText}>
//                         {getTimeAgo(item.timestamp)}
//                       </Text>
//                     </View>

//                     {/* Show confidence scores if available */}
//                     {item.detections?.image?.detected && (
//                       <View style={styles.confidenceRow}>
//                         <Text style={styles.confidenceLabel}>Image:</Text>
//                         <View style={styles.confidenceBar}>
//                           <View
//                             style={[
//                               styles.confidenceFill,
//                               {
//                                 width: ${item.detections.image.confidence * 100}%,
//                                 backgroundColor: getConfidenceColor(item.detections.image.confidence)
//                               }
//                             ]}
//                           />
//                         </View>
//                         <Text style={styles.confidenceValue}>
//                           {(item.detections.image.confidence * 100).toFixed(0)}%
//                         </Text>
//                       </View>
//                     )}

//                     {item.detections?.sound?.detected && (
//                       <View style={styles.confidenceRow}>
//                         <Text style={styles.confidenceLabel}>Sound:</Text>
//                         <View style={styles.confidenceBar}>
//                           <View
//                             style={[
//                               styles.confidenceFill,
//                               {
//                                 width: ${item.detections.sound.confidence * 100}%,
//                                 backgroundColor: getConfidenceColor(item.detections.sound.confidence)
//                               }
//                             ]}
//                           />
//                         </View>
//                         <Text style={styles.confidenceValue}>
//                           {(item.detections.sound.confidence * 100).toFixed(0)}%
//                         </Text>
//                       </View>
//                     )}

//                     {/* For backward compatibility with old data */}
//                     {!item.detections && item.soundConfidence && (
//                       <Text style={styles.alertDetail}>
//                         Sound: {item.soundConfidence.toFixed(2)}, Weapon: {item.weaponConfidence.toFixed(2)}
//                       </Text>
//                     )}
//                   </View>
//                 </View>
//               </TouchableOpacity>
//             </Animated.View>
//           )}
//         />
//       </Animated.View>

//       <View style={styles.statsBar}>
//         <Text style={styles.statsText}>
//           {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''} found
//         </Text>
//       </View>
//     </SafeAreaView>
//   );
// };

// // Helper function to get alert type icon
// const getAlertTypeIcon = (alertType) => {
//   switch (alertType) {
//     case 'weapon_sound':
//       return 'volume-high';
//     case 'weapon_image':
//       return 'gun';
//     case 'fire':
//       return 'fire';
//     default:
//       return 'alert-circle';
//   }
// };

// // Helper function to get status color
// const getStatusColor = (status) => {
//   switch (status) {
//     case 'pending':
//       return '#FFC107';
//     case 'approved':
//       return '#4CAF50';
//     case 'rejected':
//       return '#F44336';
//     default:
//       return '#BBBBBB';
//   }
// };

// // Helper function to get confidence color
// const getConfidenceColor = (confidence) => {
//   if (confidence >= 0.7) return '#4CAF50';
//   if (confidence >= 0.4) return '#FFC107';
//   return '#F44336';
// };

// // Helper function to format alert type
// const formatAlertType = (type) => {
//   if (!type) return "Unknown";
//   return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#121212",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     color: "#fff",
//     fontSize: 16,
//     marginTop: 12,
//   },
//   headerContainer: {
//     ...Platform.select({
//       ios: {
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 6,
//       },
//       android: { elevation: 8 },
//     }),
//   },
//   header: {
//     paddingTop: Platform.OS === 'ios' ? 10 : 40,
//     paddingBottom: 15,
//     paddingHorizontal: 15,
//     borderBottomLeftRadius: 15,
//     borderBottomRightRadius: 15,
//   },
//   headerContent: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   headerTitle: {
//     color: "#fff",
//     fontSize: 28,
//     fontWeight: "bold",
//   },
//   filterWrapper: {
//     backgroundColor: "rgba(0,0,0,0.2)",
//     borderRadius: 10,
//     overflow: "hidden",
//   },
//   picker: {
//     width: 150,
//     height: 40,
//     color: "#fff",
//     backgroundColor: "transparent",
//   },
//   searchContainer: {
//     height: 45,
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.3)",
//     borderRadius: 10,
//     paddingHorizontal: 10,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     height: "100%",
//     color: "#fff",
//     fontSize: 16,
//   },
//   clearButton: {
//     padding: 5,
//   },
//   listContainer: {
//     flex: 1,
//   },
//   listContent: {
//     padding: 15,
//     paddingBottom: 60,
//   },
//   alertItemContainer: {
//     marginBottom: 15,
//     borderRadius: 12,
//     overflow: "hidden",
//     ...Platform.select({
//       ios: {
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.2,
//         shadowRadius: 4,
//       },
//       android: { elevation: 4 },
//     }),
//   },
//   alertItem: {
//     backgroundColor: "#1e1e1e",
//     borderRadius: 12,
//     padding: 15,
//   },
//   alertHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   alertTypeContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   alertType: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//     marginLeft: 8,
//   },
//   statusBadge: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 20,
//   },
//   statusText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "bold",
//     textTransform: "uppercase",
//   },
//   alertContent: {
//     flexDirection: "row",
//   },
//   alertImage: {
//     width: 70,
//     height: 70,
//     borderRadius: 8,
//     marginRight: 12,
//     backgroundColor: "#2a2a2a",
//   },
//   alertDetails: {
//     flex: 1,
//     justifyContent: "center",
//   },
//   timestampContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   timestampText: {
//     color: "#bbb",
//     fontSize: 14,
//     marginLeft: 4,
//   },
//   confidenceRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 6,
//   },
//   confidenceLabel: {
//     color: "#bbb",
//     fontSize: 14,
//     width: 50,
//   },
//   confidenceBar: {
//     flex: 1,
//     height: 8,
//     backgroundColor: "#333",
//     borderRadius: 4,
//     overflow: "hidden",
//     marginRight: 8,
//   },
//   confidenceFill: {
//     height: "100%",
//   },
//   confidenceValue: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "bold",
//     width: 35,
//     textAlign: "right",
//   },
//   alertDetail: {
//     color: "#bbb",
//     fontSize: 14,
//   },
//   emptyContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 60,
//   },
//   emptyText: {
//     color: "#999",
//     fontSize: 16,
//     marginTop: 12,
//     textAlign: "center",
//   },
//   statsBar: {
//     backgroundColor: "#1e1e1e",
//     padding: 10,
//     borderTopWidth: 1,
//     borderTopColor: "#333",
//   },
//   statsText: {
//     color: "#bbb",
//     fontSize: 14,
//     textAlign: "center",
//   },
// });

// export default AlertsPage;
