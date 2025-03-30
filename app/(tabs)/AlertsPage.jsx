// //! AlertPage
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
//   RefreshControl,
// } from "react-native";
// import { useRouter } from "expo-router";
// import Animated, { FadeIn } from "react-native-reanimated";
// import Icon from "react-native-vector-icons/Ionicons";
// import { Picker } from "@react-native-picker/picker";
// import { db } from "../../services/firebase";
// import {
//   collection,
//   query,
//   where,
//   orderBy,
//   limit,
//   getDocs,
//   onSnapshot,
//   Timestamp,
// } from "firebase/firestore";
// import { useAuth } from "../../context/authContext";

// const AlertsPage = () => {
//   const [alerts, setAlerts] = useState([]);
//   const [filteredAlerts, setFilteredAlerts] = useState([]);
//   const [filter, setFilter] = useState("All");
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const router = useRouter();
//   const { user, role } = useAuth();

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
//         const alertData = doc.data();
//         // Ensure timestamp is properly converted
//         alertData.timestamp = alertData.timestamp.toDate();
//         alertsList.push({
//           id: doc.id,
//           ...alertData,
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

//         unsubscribe = onSnapshot(
//           alertsQuery,
//           (querySnapshot) => {
//             const alertsList = [];

//             querySnapshot.forEach((doc) => {
//               const alertData = doc.data();
//               // Ensure timestamp is properly converted
//               alertData.timestamp = alertData.timestamp.toDate();
//               alertsList.push({
//                 id: doc.id,
//                 ...alertData,
//               });
//             });

//             setAlerts(alertsList);
//             applyFilters(alertsList, filter, search);
//             setLoading(false);
//           },
//           (error) => {
//             console.error("Error in real-time alerts listener:", error);
//             fetchAlerts(); // Fallback to regular fetching
//           }
//         );
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
//       filtered = filtered.filter(
//         (alert) => alert.status?.toLowerCase() === statusFilter.toLowerCase()
//       );
//     }

//     // Apply search filter
//     if (searchText) {
//       filtered = filtered.filter((alert) => {
//         const dateStr = formatDate(alert.timestamp);
//         return dateStr.toLowerCase().includes(searchText.toLowerCase());
//       });
//     }

//     setFilteredAlerts(filtered);
//   };

//   // Combined data structure for FlatList
//   const pageData = [
//     { type: "header", id: "header" },
//     ...(role === "admin" ? [{ type: "filterSearch", id: "filterSearch" }] : []),
//     { type: "alerts", id: "alerts", data: filteredAlerts },
//   ];

//   const renderItem = useCallback(
//     ({ item }) => {
//       switch (item.type) {
//         case "header":
//           return (
//             <View style={styles.header}>
//               <Text style={styles.headerText}>Alerts</Text>
//               {role === "admin" && (
//                 <View style={styles.filterContainer}>
//                   <Picker
//                     selectedValue={filter}
//                     onValueChange={(itemValue) => setFilter(itemValue)}
//                     style={styles.picker}
//                   >
//                     <Picker.Item label="All" value="All" />
//                     <Picker.Item label="Pending" value="Pending" />
//                     <Picker.Item label="Approved" value="Approved" />
//                     <Picker.Item label="Rejected" value="Rejected" />
//                   </Picker>
//                   <TouchableOpacity
//                     style={styles.refreshButton}
//                     onPress={fetchAlerts}
//                   >
//                     <Icon name="refresh" size={20} color="#fff" />
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </View>
//           );
//         case "filterSearch":
//           return (
//             <View style={styles.searchContainer}>
//               <Icon
//                 name="search"
//                 size={20}
//                 color="white"
//                 style={styles.searchIcon}
//               />
//               <TextInput
//                 style={styles.searchInput}
//                 placeholder="Search by timestamp"
//                 placeholderTextColor="#999"
//                 value={search}
//                 onChangeText={setSearch}
//               />
//             </View>
//           );
//         case "alerts":
//           return item.data.length > 0 ? (
//             item.data.map((alert) => (
//               <Animated.View key={alert.id} entering={FadeIn}>
//                 <TouchableOpacity
//                   style={styles.alertItem}
//                   onPress={() =>
//                     router.push({
//                       pathname: "/(tabs)/AlertDetailPage",
//                       params: { alertId: alert.id },
//                     })
//                   }
//                 >
//                   <View style={styles.alertContent}>
//                     <View>
//                       <Text style={styles.alertTimestamp}>
//                         Detected: {formatDate(alert.timestamp)}
//                       </Text>
//                       <Text
//                         style={[
//                           styles.alertStatus,
//                           { color: getStatusColor(alert.status) },
//                         ]}
//                       >
//                         {alert.status}
//                       </Text>
//                       <Text style={styles.alertConfidence}>
//                         Sound: {(alert.soundConfidence || 0).toFixed(2)},
//                         Weapon: {(alert.weaponConfidence || 0).toFixed(2)}
//                       </Text>
//                       {role === "security" && alert.status === "approved" && (
//                         <Text style={styles.receivedText}>Received</Text>
//                       )}
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               </Animated.View>
//             ))
//           ) : (
//             <Text style={styles.emptyText}>No alerts found</Text>
//           );
//         default:
//           return null;
//       }
//     },
//     [filter, search, role, filteredAlerts, fetchAlerts]
//   );

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "#FF9800";
//       case "approved":
//         return "#4CAF50";
//       case "rejected":
//         return "#D32F2F";
//       default:
//         return "white";
//     }
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4CAF50" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <FlatList
//         data={pageData}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 20 }}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={fetchAlerts} />
//         }
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#000" },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     backgroundColor: "#000",
//   },
//   header: {
//     padding: 15,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   headerText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
//   filterContainer: { flexDirection: "row", alignItems: "center" },
//   picker: { width: 150, color: "#fff", backgroundColor: "#4CAF50" },
//   refreshButton: { marginLeft: 10, padding: 5 },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//     marginHorizontal: 10,
//   },
//   searchIcon: { position: "absolute", left: 10, zIndex: 1 },
//   searchInput: {
//     flex: 1,
//     height: 50,
//     borderColor: "white",
//     borderWidth: 1,
//     borderRadius: 5,
//     paddingLeft: 40,
//     paddingRight: 10,
//     color: "white",
//   },
//   alertItem: {
//     backgroundColor: "#333",
//     padding: 10,
//     borderRadius: 5,
//     marginVertical: 5,
//     marginHorizontal: 10,
//   },
//   alertContent: { flexDirection: "row", justifyContent: "space-between" },
//   alertTimestamp: { color: "#fff", fontSize: 14 },
//   alertStatus: { fontSize: 14, fontWeight: "bold" },
//   alertConfidence: { color: "#999", fontSize: 12 },
//   receivedText: { color: "#4CAF50", fontSize: 12, marginTop: 5 },
//   emptyText: {
//     color: "#fff",
//     fontSize: 16,
//     textAlign: "center",
//     marginTop: 20,
//   },
// });

// export default AlertsPage;
// !Working code
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
//   RefreshControl,
// } from "react-native";
// import { useRouter } from "expo-router";
// import Animated, { FadeIn } from "react-native-reanimated";
// import Icon from "react-native-vector-icons/Ionicons";
// import { Picker } from "@react-native-picker/picker";
// import { db } from "../../services/firebase";
// import {
//   collection,
//   query,
//   where,
//   orderBy,
//   limit,
//   getDocs,
//   onSnapshot,
//   Timestamp,
// } from "firebase/firestore";
// import { useAuth } from "../../context/authContext";

// const AlertsPage = () => {
//   const [alerts, setAlerts] = useState([]);
//   const [filteredAlerts, setFilteredAlerts] = useState([]);
//   const [filter, setFilter] = useState("All");
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);

//   const router = useRouter();
//   const { user, role } = useAuth();

//   // Helper function to convert Firestore Timestamp to Date
//   const convertTimestampToDate = (timestamp) => {
//     if (!timestamp) {
//       console.warn("Timestamp is undefined or null");
//       return new Date();
//     }
//     if (timestamp instanceof Timestamp) {
//       return timestamp.toDate();
//     }
//     console.warn("Unexpected timestamp format:", timestamp);
//     return new Date();
//   };

//   // Format the timestamp for display
//   const formatDate = (timestamp) => {
//     const date = convertTimestampToDate(timestamp);
//     return date.toLocaleString();
//   };

//   // Transform Firestore data into a flat, UI-ready structure
//   const transformAlertData = (doc) => {
//     const data = doc.data();
//     const detections = data.detections || {};

//     const occurAt = convertTimestampToDate(data.occur_at);
//     const resolvedAt = data.resolvedAt
//       ? convertTimestampToDate(data.resolvedAt)
//       : null;

//     return {
//       id: doc.id,
//       occurAt: occurAt,
//       resolvedAt: resolvedAt,
//       status: data.status || "pending",
//       deviceId: data.deviceId || "Unknown",
//       notes: data.notes || "",
//       soundConfidence: detections.sound?.confidence || 0,
//       imageConfidence: detections.image?.confidence || 0,
//       smokeLevel: detections.smoke?.level || 0,
//       occurAtString: formatDate(occurAt),
//       resolvedAtString: resolvedAt ? formatDate(resolvedAt) : "Not resolved",
//     };
//   };

//   // Fetch alerts from Firestore
//   const fetchAlerts = useCallback(async () => {
//     setRefreshing(true);
//     setError(null);
//     try {
//       let alertsQuery;

//       if (role === "admin") {
//         alertsQuery = query(
//           collection(db, "alerts"),
//           orderBy("occur_at", "desc"),
//           limit(50)
//         );
//       } else {
//         alertsQuery = query(
//           collection(db, "alerts"),
//           where("status", "==", "approved"),
//           orderBy("occur_at", "desc"),
//           limit(50)
//         );
//       }

//       const querySnapshot = await getDocs(alertsQuery);
//       const alertsList = querySnapshot.docs.map(transformAlertData);

//       setAlerts(alertsList);
//       applyFilters(alertsList, filter, search);
//     } catch (error) {
//       console.error("Error fetching alerts:", error);
//       setError("Failed to fetch alerts: " + error.message);
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
//           alertsQuery = query(
//             collection(db, "alerts"),
//             orderBy("occur_at", "desc"),
//             limit(50)
//           );
//         } else {
//           alertsQuery = query(
//             collection(db, "alerts"),
//             where("status", "==", "approved"),
//             orderBy("occur_at", "desc"),
//             limit(50)
//           );
//         }

//         unsubscribe = onSnapshot(
//           alertsQuery,
//           (querySnapshot) => {
//             const alertsList = querySnapshot.docs.map(transformAlertData);
//             setAlerts(alertsList);
//             applyFilters(alertsList, filter, search);
//             setLoading(false);
//           },
//           (error) => {
//             console.error("Error in real-time alerts listener:", error);
//             setError("Failed to load alerts in real-time: " + error.message);
//             fetchAlerts();
//           }
//         );
//       } catch (error) {
//         console.error("Error setting up alerts listener:", error);
//         setError("Error setting up real-time listener: " + error.message);
//         fetchAlerts();
//       }
//     };

//     if (user) {
//       setupAlertsListener();
//     }

//     return () => {
//       if (unsubscribe) {
//         unsubscribe();
//       }
//     };
//   }, [user, role]);

//   // Apply filters when filter or search changes
//   useEffect(() => {
//     applyFilters(alerts, filter, search);
//   }, [filter, search, alerts]);

//   // Filter alerts based on status and search
//   const applyFilters = (alertsList, statusFilter, searchText) => {
//     let filtered = [...alertsList];

//     // Apply status filter
//     if (statusFilter !== "All") {
//       filtered = filtered.filter(
//         (alert) => alert.status.toLowerCase() === statusFilter.toLowerCase()
//       );
//     }

//     // Apply search filter
//     if (searchText) {
//       filtered = filtered.filter((alert) => {
//         const searchableFields = [
//           alert.occurAtString,
//           alert.deviceId,
//           alert.notes,
//         ]
//           .join(" ")
//           .toLowerCase();
//         return searchableFields.includes(searchText.toLowerCase());
//       });
//     }

//     setFilteredAlerts(filtered);
//   };

//   // Combined data structure for FlatList
//   const pageData = useMemo(
//     () => [
//       { type: "header", id: "header" },
//       ...(role === "admin"
//         ? [{ type: "filterSearch", id: "filterSearch" }]
//         : []),
//       { type: "alerts", id: "alerts", data: filteredAlerts },
//     ],
//     [role, filteredAlerts]
//   );

//   const renderItem = useCallback(
//     ({ item }) => {
//       switch (item.type) {
//         case "header":
//           return (
//             <View style={styles.header}>
//               <Text style={styles.headerText}>Alerts</Text>
//               {role === "admin" && (
//                 <View style={styles.filterContainer}>
//                   <Picker
//                     selectedValue={filter}
//                     onValueChange={(itemValue) => setFilter(itemValue)}
//                     style={styles.picker}
//                   >
//                     <Picker.Item label="All" value="All" />
//                     <Picker.Item label="Pending" value="pending" />
//                     <Picker.Item label="Approved" value="approved" />
//                     <Picker.Item label="Rejected" value="rejected" />
//                   </Picker>
//                   <TouchableOpacity
//                     style={styles.refreshButton}
//                     onPress={fetchAlerts}
//                   >
//                     <Icon name="refresh" size={20} color="#fff" />
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </View>
//           );
//         case "filterSearch":
//           return (
//             <View style={styles.searchContainer}>
//               <Icon
//                 name="search"
//                 size={20}
//                 color="white"
//                 style={styles.searchIcon}
//               />
//               <TextInput
//                 style={styles.searchInput}
//                 placeholder="Search by date, device, or notes"
//                 placeholderTextColor="#999"
//                 value={search}
//                 onChangeText={setSearch}
//               />
//             </View>
//           );
//         case "alerts":
//           return item.data.length > 0 ? (
//             item.data.map((alert) => (
//               <Animated.View key={alert.id} entering={FadeIn}>
//                 <TouchableOpacity
//                   style={styles.alertItem}
//                   onPress={() =>
//                     router.push({
//                       pathname: "/(tabs)/AlertDetailPage",
//                       params: { alertId: alert.id },
//                     })
//                   }
//                 >
//                   <View style={styles.alertContent}>
//                     <View>
//                       <Text style={styles.alertTimestamp}>
//                         Detected: {alert.occurAtString}
//                       </Text>
//                       <Text
//                         style={[
//                           styles.alertStatus,
//                           { color: getStatusColor(alert.status) },
//                         ]}
//                       >
//                         {alert.status}
//                       </Text>
//                       <Text style={styles.alertConfidence}>
//                         Sound: {(alert.soundConfidence * 100).toFixed(0)}%,
//                         Image: {(alert.imageConfidence * 100).toFixed(0)}%
//                       </Text>
//                       {alert.smokeLevel > 0 && (
//                         <Text style={styles.alertConfidence}>
//                           Smoke Level: {alert.smokeLevel}
//                         </Text>
//                       )}
//                       {role === "security" && alert.status === "approved" && (
//                         <Text style={styles.receivedText}>Received</Text>
//                       )}
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               </Animated.View>
//             ))
//           ) : (
//             <Text style={styles.emptyText}>No alerts found</Text>
//           );
//         default:
//           return null;
//       }
//     },
//     [filter, search, role, filteredAlerts, fetchAlerts]
//   );

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "#FF9800";
//       case "approved":
//         return "#4CAF50";
//       case "rejected":
//         return "#D32F2F";
//       default:
//         return "white";
//     }
//   };

//   if (loading && !error) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4CAF50" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {error && (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity onPress={fetchAlerts} style={styles.retryButton}>
//             <Text style={styles.retryText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//       <FlatList
//         data={pageData}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 20 }}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={fetchAlerts} />
//         }
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#000" },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     backgroundColor: "#000",
//   },
//   errorContainer: {
//     backgroundColor: "#2a2a2a",
//     padding: 10,
//     margin: 10,
//     borderRadius: 5,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   errorText: { color: "#D32F2F", fontSize: 14 },
//   retryButton: {
//     backgroundColor: "#4CAF50",
//     padding: 5,
//     borderRadius: 5,
//   },
//   retryText: { color: "#fff", fontSize: 14 },
//   header: {
//     padding: 15,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#1a1a1a",
//   },
//   headerText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
//   filterContainer: { flexDirection: "row", alignItems: "center" },
//   picker: {
//     width: 150,
//     color: "#fff",
//     backgroundColor: "#4CAF50",
//     borderRadius: 5,
//   },
//   refreshButton: { marginLeft: 10, padding: 5 },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     margin: 10,
//     marginBottom: 0,
//   },
//   searchIcon: { position: "absolute", left: 10, zIndex: 1 },
//   searchInput: {
//     flex: 1,
//     height: 50,
//     borderColor: "#4CAF50",
//     borderWidth: 1,
//     borderRadius: 5,
//     paddingLeft: 40,
//     paddingRight: 10,
//     color: "white",
//     backgroundColor: "#1a1a1a",
//   },
//   alertItem: {
//     backgroundColor: "#333",
//     padding: 10,
//     borderRadius: 5,
//     marginVertical: 5,
//     marginHorizontal: 10,
//   },
//   alertContent: { flexDirection: "row", justifyContent: "space-between" },
//   alertTimestamp: { color: "#fff", fontSize: 14 },
//   alertStatus: { fontSize: 14, fontWeight: "bold" },
//   alertConfidence: { color: "#999", fontSize: 12 },
//   receivedText: { color: "#4CAF50", fontSize: 12, marginTop: 5 },
//   emptyText: {
//     color: "#fff",
//     fontSize: 16,
//     textAlign: "center",
//     marginTop: 20,
//   },
// });

// export default AlertsPage;
// !Working
// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   RefreshControl,
// } from "react-native";
// import { useRouter } from "expo-router";
// import Animated, { FadeIn } from "react-native-reanimated";
// import Icon from "react-native-vector-icons/Ionicons";
// import { Picker } from "@react-native-picker/picker";
// import { db } from "../../services/firebase";
// import {
//   collection,
//   query,
//   where,
//   orderBy,
//   limit,
//   getDocs,
//   onSnapshot,
//   getDoc,
// } from "firebase/firestore";
// import { useAuth } from "../../context/authContext";

// const AlertsPage = () => {
//   const [alerts, setAlerts] = useState([]);
//   const [filteredAlerts, setFilteredAlerts] = useState([]);
//   const [filter, setFilter] = useState("All");
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);

//   const router = useRouter();
//   const { user, role } = useAuth(); // Role: "admin" or "security"

//   // Helper function to convert Firestore Timestamp to string
//   const formatDate = (timestamp) => {
//     if (!timestamp) return "N/A";
//     try {
//       const date = timestamp.toDate();
//       return date.toLocaleString();
//     } catch (error) {
//       console.warn("Invalid timestamp format:", timestamp);
//       return "N/A";
//     }
//   };

//   // Resolve Firestore references (e.g., deviceId, resolvedBy)
//   const resolveReference = async (ref) => {
//     if (!ref) return "Unknown";
//     try {
//       const docSnap = await getDoc(ref);
//       if (docSnap.exists()) {
//         const data = docSnap.data();
//         if (ref.path.startsWith("devices")) {
//           return data.name || docSnap.id;
//         } else if (ref.path.startsWith("users")) {
//           return data.username || docSnap.id;
//         }
//       }
//       return docSnap.id;
//     } catch (error) {
//       console.error("Error resolving reference:", error);
//       return "Unknown";
//     }
//   };

//   // Transform alert data for UI
//   const transformAlertData = async (doc) => {
//     const data = doc.data();
//     const deviceId = await resolveReference(data.deviceId);
//     const resolvedBy = await resolveReference(data.resolvedBy);

//     return {
//       id: doc.id,
//       occurAt: formatDate(data.occur_at),
//       resolvedAt: formatDate(data.resolvedAt),
//       status: data.status || "pending",
//       deviceId: deviceId,
//       notes: data.notes || "",
//       location: data.location
//         ? `${data.location.latitude || "N/A"}, ${
//             data.location.longitude || "N/A"
//           }`
//         : "N/A",
//       resolvedBy: resolvedBy,
//       detections: data.detections || {},
//     };
//   };

//   // Fetch alerts from Firestore
//   const fetchAlerts = useCallback(async () => {
//     setRefreshing(true);
//     setError(null);
//     try {
//       let alertsQuery;

//       if (role === "admin") {
//         alertsQuery = query(
//           collection(db, "alerts"),
//           orderBy("occur_at", "desc"),
//           limit(50)
//         );
//       } else if (role === "security") {
//         alertsQuery = query(
//           collection(db, "alerts"),
//           where("status", "==", "approved"),
//           orderBy("occur_at", "desc"),
//           limit(50)
//         );
//       } else {
//         throw new Error("Invalid user role");
//       }

//       const querySnapshot = await getDocs(alertsQuery);
//       if (querySnapshot.empty) {
//         setAlerts([]);
//         setFilteredAlerts([]);
//       } else {
//         const alertsList = await Promise.all(
//           querySnapshot.docs.map((doc) => transformAlertData(doc))
//         );
//         setAlerts(alertsList);
//         applyFilters(alertsList, filter, search);
//       }
//     } catch (error) {
//       console.error("Error fetching alerts:", error);
//       setError("Failed to fetch alerts: " + error.message);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [role, filter, search]);

//   // Set up real-time listener for alerts
//   useEffect(() => {
//     if (!user) return;

//     let unsubscribe;
//     const setupAlertsListener = async () => {
//       try {
//         let alertsQuery;

//         if (role === "admin") {
//           alertsQuery = query(
//             collection(db, "alerts"),
//             orderBy("occur_at", "desc"),
//             limit(50)
//           );
//         } else if (role === "security") {
//           alertsQuery = query(
//             collection(db, "alerts"),
//             where("status", "==", "approved"),
//             orderBy("occur_at", "desc"),
//             limit(50)
//           );
//         } else {
//           throw new Error("Invalid user role");
//         }

//         unsubscribe = onSnapshot(
//           alertsQuery,
//           async (querySnapshot) => {
//             const alertsList = await Promise.all(
//               querySnapshot.docs.map((doc) => transformAlertData(doc))
//             );
//             setAlerts(alertsList);
//             applyFilters(alertsList, filter, search);
//             setLoading(false);
//           },
//           (error) => {
//             console.error("Error in real-time alerts listener:", error);
//             setError("Failed to load alerts in real-time: " + error.message);
//             fetchAlerts();
//           }
//         );
//       } catch (error) {
//         console.error("Error setting up alerts listener:", error);
//         setError("Error setting up real-time listener: " + error.message);
//         fetchAlerts();
//       }
//     };

//     setupAlertsListener();

//     return () => {
//       if (unsubscribe) unsubscribe();
//     };
//   }, [user, role, fetchAlerts, filter, search]);

//   // Apply filters based on status and search
//   const applyFilters = useCallback((alertsList, statusFilter, searchText) => {
//     let filtered = [...alertsList];

//     // Apply status filter
//     if (statusFilter !== "All") {
//       filtered = filtered.filter(
//         (alert) => alert.status.toLowerCase() === statusFilter.toLowerCase()
//       );
//     }

//     // Apply search filter
//     if (searchText) {
//       const searchLower = searchText.toLowerCase();
//       filtered = filtered.filter((alert) =>
//         [alert.occurAt, alert.deviceId, alert.notes, alert.location].some(
//           (field) => field && field.toLowerCase().includes(searchLower)
//         )
//       );
//     }

//     setFilteredAlerts(filtered);
//   }, []);

//   // Combined data structure for FlatList
//   const pageData = useMemo(
//     () => [
//       { type: "header", id: "header" },
//       ...(role === "admin"
//         ? [{ type: "filterSearch", id: "filterSearch" }]
//         : []),
//       { type: "alerts", id: "alerts", data: filteredAlerts },
//     ],
//     [role, filteredAlerts]
//   );

//   const renderItem = useCallback(
//     ({ item }) => {
//       switch (item.type) {
//         case "header":
//           return (
//             <View style={styles.header}>
//               <Text style={styles.headerText}>Alerts</Text>
//               <TouchableOpacity
//                 style={styles.refreshButton}
//                 onPress={fetchAlerts}
//               >
//                 <Icon name="refresh" size={20} color="#fff" />
//               </TouchableOpacity>
//             </View>
//           );
//         case "filterSearch":
//           return (
//             <View style={styles.filterContainer}>
//               <Picker
//                 selectedValue={filter}
//                 onValueChange={(itemValue) => setFilter(itemValue)}
//                 style={styles.picker}
//               >
//                 <Picker.Item label="All" value="All" />
//                 <Picker.Item label="Pending" value="pending" />
//                 <Picker.Item label="Approved" value="approved" />
//                 <Picker.Item label="Rejected" value="rejected" />
//               </Picker>
//               <View style={styles.searchContainer}>
//                 <Icon
//                   name="search"
//                   size={20}
//                   color="white"
//                   style={styles.searchIcon}
//                 />
//                 <TextInput
//                   style={styles.searchInput}
//                   placeholder="Search by date, device, or notes"
//                   placeholderTextColor="#999"
//                   value={search}
//                   onChangeText={setSearch}
//                 />
//               </View>
//             </View>
//           );
//         case "alerts":
//           return item.data.length > 0 ? (
//             item.data.map((alert) => (
//               <Animated.View key={alert.id} entering={FadeIn}>
//                 <TouchableOpacity
//                   style={styles.alertItem}
//                   onPress={() =>
//                     router.push({
//                       pathname: "/(tabs)/AlertDetailPage",
//                       params: { alertId: alert.id },
//                     })
//                   }
//                 >
//                   <View style={styles.alertContent}>
//                     <View>
//                       <Text style={styles.alertTimestamp}>
//                         Detected: {alert.occurAt}
//                       </Text>
//                       <Text
//                         style={[
//                           styles.alertStatus,
//                           { color: getStatusColor(alert.status) },
//                         ]}
//                       >
//                         {alert.status}
//                       </Text>
//                       <Text style={styles.alertConfidence}>
//                         Device: {alert.deviceId}
//                       </Text>
//                       <Text style={styles.alertConfidence}>
//                         Location: {alert.location}
//                       </Text>
//                       {role === "security" && alert.status === "approved" && (
//                         <Text style={styles.receivedText}>Received</Text>
//                       )}
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               </Animated.View>
//             ))
//           ) : (
//             <Text style={styles.emptyText}>No alerts found</Text>
//           );
//         default:
//           return null;
//       }
//     },
//     [filter, search, role, filteredAlerts, fetchAlerts]
//   );

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "#FF9800";
//       case "approved":
//         return "#4CAF50";
//       case "rejected":
//         return "#D32F2F";
//       default:
//         return "white";
//     }
//   };

//   if (loading && !error) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4CAF50" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {error && (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity onPress={fetchAlerts} style={styles.retryButton}>
//             <Text style={styles.retryText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//       <FlatList
//         data={pageData}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 20 }}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={fetchAlerts} />
//         }
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#121212" },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     backgroundColor: "#121212",
//   },
//   errorContainer: {
//     backgroundColor: "#2a2a2a",
//     padding: 10,
//     margin: 10,
//     borderRadius: 5,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   errorText: { color: "#D32F2F", fontSize: 14 },
//   retryButton: {
//     backgroundColor: "#4CAF50",
//     padding: 5,
//     borderRadius: 5,
//   },
//   retryText: { color: "#fff", fontSize: 14 },
//   header: {
//     padding: 15,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#1a1a1a",
//   },
//   headerText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
//   filterContainer: {
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//   },
//   picker: {
//     width: "100%",
//     color: "#fff",
//     backgroundColor: "#4CAF50",
//     borderRadius: 5,
//     marginBottom: 10,
//   },
//   refreshButton: { padding: 5 },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 5,
//   },
//   searchIcon: { position: "absolute", left: 10, zIndex: 1 },
//   searchInput: {
//     flex: 1,
//     height: 50,
//     borderColor: "#4CAF50",
//     borderWidth: 1,
//     borderRadius: 5,
//     paddingLeft: 40,
//     paddingRight: 10,
//     color: "white",
//     backgroundColor: "#1a1a1a",
//   },
//   alertItem: {
//     backgroundColor: "#333",
//     padding: 10,
//     borderRadius: 5,
//     marginVertical: 5,
//     marginHorizontal: 10,
//   },
//   alertContent: { flexDirection: "row", justifyContent: "space-between" },
//   alertTimestamp: { color: "#fff", fontSize: 14 },
//   alertStatus: { fontSize: 14, fontWeight: "bold" },
//   alertConfidence: { color: "#999", fontSize: 12 },
//   receivedText: { color: "#4CAF50", fontSize: 12, marginTop: 5 },
//   emptyText: {
//     color: "#fff",
//     fontSize: 16,
//     textAlign: "center",
//     marginTop: 20,
//   },
// });

// export default AlertsPage;
// !not sending in log
// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   RefreshControl,
// } from "react-native";
// import { useRouter } from "expo-router";
// import Animated, { FadeIn } from "react-native-reanimated";
// import Icon from "react-native-vector-icons/Ionicons";
// import { Picker } from "@react-native-picker/picker";
// import { db } from "../../services/firebase";
// import {
//   collection,
//   query,
//   where,
//   orderBy,
//   limit,
//   getDocs,
//   onSnapshot,
//   getDoc,
//   doc,
// } from "firebase/firestore";
// import { useAuth } from "../../context/authContext";

// const AlertsPage = () => {
//   const [alerts, setAlerts] = useState([]);
//   const [filteredAlerts, setFilteredAlerts] = useState([]);
//   const [filter, setFilter] = useState("All");
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);

//   const router = useRouter();
//   const { user, role } = useAuth(); // Role: "admin" or "security"

//   // Helper function to convert Firestore Timestamp to string
//   const formatDate = useCallback((timestamp) => {
//     if (!timestamp) return "N/A";
//     try {
//       const date = timestamp.toDate();
//       return date.toLocaleString();
//     } catch (error) {
//       console.warn("Invalid timestamp format:", timestamp);
//       return "N/A";
//     }
//   }, []);

//   // Resolve Firestore references (e.g., deviceId, resolvedBy)
//   const resolveReference = useCallback(async (field, path) => {
//     if (!field) return "Unknown";

//     try {
//       let docRef;
//       // Check if field is a DocumentReference (has a path property)
//       if (field && typeof field === "object" && "path" in field) {
//         docRef = field; // Use the DocumentReference directly
//       } else if (typeof field === "string") {
//         // If field is a string, create a DocumentReference
//         docRef = doc(db, path, field);
//       } else {
//         // If field is neither a string nor a DocumentReference, return "Unknown"
//         return "Unknown";
//       }

//       const docSnap = await getDoc(docRef);
//       if (docSnap.exists()) {
//         const data = docSnap.data();
//         if (path === "devices") {
//           return data.name || docSnap.id;
//         } else if (path === "users") {
//           return data.username || docSnap.id;
//         }
//       }
//       return docRef.id; // Return the ID if the document doesn't exist
//     } catch (error) {
//       console.error(`Error resolving ${path} reference:`, error);
//       return "Unknown";
//     }
//   }, []);

//   // Transform alert data for UI
//   const transformAlertData = useCallback(
//     async (doc) => {
//       const data = doc.data();
//       const deviceId = await resolveReference(data.deviceId, "devices");
//       const resolvedBy = await resolveReference(
//         data.resolvedBy || "unknown",
//         "users"
//       );

//       return {
//         id: doc.id,
//         occurAt: formatDate(data.occur_at),
//         resolvedAt: formatDate(data.resolvedAt),
//         status: data.status || "pending",
//         deviceId: deviceId,
//         notes: data.notes || "",
//         location: data.location
//           ? `${data.location.latitude || "N/A"}, ${
//               data.location.longitude || "N/A"
//             }`
//           : "N/A",
//         resolvedBy: resolvedBy,
//         detections: data.detections || {},
//       };
//     },
//     [formatDate, resolveReference]
//   );

//   // Fetch alerts from Firestore
//   const fetchAlerts = useCallback(async () => {
//     setRefreshing(true);
//     setError(null);
//     try {
//       let alertsQuery;

//       if (role === "admin") {
//         alertsQuery = query(
//           collection(db, "alerts"),
//           orderBy("occur_at", "desc"),
//           limit(50)
//         );
//       } else if (role === "security") {
//         alertsQuery = query(
//           collection(db, "alerts"),
//           where("status", "==", "approved"),
//           orderBy("occur_at", "desc"),
//           limit(50)
//         );
//       } else {
//         throw new Error("Invalid user role");
//       }

//       const querySnapshot = await getDocs(alertsQuery);
//       if (querySnapshot.empty) {
//         setAlerts([]);
//         setFilteredAlerts([]);
//       } else {
//         const alertsList = await Promise.all(
//           querySnapshot.docs.map((doc) => transformAlertData(doc))
//         );
//         setAlerts(alertsList);
//         applyFilters(alertsList, filter, search);
//       }
//     } catch (error) {
//       console.error("Error fetching alerts:", error);
//       setError("Failed to fetch alerts: " + error.message);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [role, filter, search, transformAlertData]);

//   // Set up real-time listener for alerts
//   useEffect(() => {
//     if (!user) return;

//     let unsubscribe;
//     const setupAlertsListener = async () => {
//       try {
//         let alertsQuery;

//         if (role === "admin") {
//           alertsQuery = query(
//             collection(db, "alerts"),
//             orderBy("occur_at", "desc"),
//             limit(50)
//           );
//         } else if (role === "security") {
//           alertsQuery = query(
//             collection(db, "alerts"),
//             where("status", "==", "approved"),
//             orderBy("occur_at", "desc"),
//             limit(50)
//           );
//         } else {
//           throw new Error("Invalid user role");
//         }

//         unsubscribe = onSnapshot(
//           alertsQuery,
//           async (querySnapshot) => {
//             const alertsList = await Promise.all(
//               querySnapshot.docs.map((doc) => transformAlertData(doc))
//             );
//             setAlerts(alertsList);
//             applyFilters(alertsList, filter, search);
//             setLoading(false);
//           },
//           (error) => {
//             console.error("Error in real-time alerts listener:", error);
//             setError("Failed to load alerts in real-time: " + error.message);
//             fetchAlerts();
//           }
//         );
//       } catch (error) {
//         console.error("Error setting up alerts listener:", error);
//         setError("Error setting up real-time listener: " + error.message);
//         fetchAlerts();
//       }
//     };

//     setupAlertsListener();

//     return () => {
//       if (unsubscribe) unsubscribe();
//     };
//   }, [user, role, fetchAlerts, filter, search, transformAlertData]);

//   // Apply filters based on status and search
//   const applyFilters = useCallback((alertsList, statusFilter, searchText) => {
//     let filtered = [...alertsList];

//     // Apply status filter
//     if (statusFilter !== "All") {
//       filtered = filtered.filter(
//         (alert) => alert.status.toLowerCase() === statusFilter.toLowerCase()
//       );
//     }

//     // Apply search filter
//     if (searchText) {
//       const searchLower = searchText.toLowerCase();
//       filtered = filtered.filter((alert) =>
//         [alert.occurAt, alert.deviceId, alert.notes, alert.location].some(
//           (field) => field && field.toLowerCase().includes(searchLower)
//         )
//       );
//     }

//     setFilteredAlerts(filtered);
//   }, []);

//   // Combined data structure for FlatList
//   const pageData = useMemo(
//     () => [
//       { type: "header", id: "header" },
//       ...(role === "admin"
//         ? [{ type: "filterSearch", id: "filterSearch" }]
//         : []),
//       { type: "alerts", id: "alerts", data: filteredAlerts },
//     ],
//     [role, filteredAlerts]
//   );

//   const renderItem = useCallback(
//     ({ item }) => {
//       switch (item.type) {
//         case "header":
//           return (
//             <View style={styles.header}>
//               <Text style={styles.headerText}>Alerts</Text>
//               <TouchableOpacity
//                 style={styles.refreshButton}
//                 onPress={fetchAlerts}
//               >
//                 <Icon name="refresh" size={20} color="#fff" />
//               </TouchableOpacity>
//             </View>
//           );
//         case "filterSearch":
//           return (
//             <View style={styles.filterContainer}>
//               <Picker
//                 selectedValue={filter}
//                 onValueChange={(itemValue) => {
//                   setFilter(itemValue);
//                   applyFilters(alerts, itemValue, search);
//                 }}
//                 style={styles.picker}
//               >
//                 <Picker.Item label="All" value="All" />
//                 <Picker.Item label="Pending" value="pending" />
//                 <Picker.Item label="Approved" value="approved" />
//                 <Picker.Item label="Rejected" value="rejected" />
//               </Picker>
//               <View style={styles.searchContainer}>
//                 <Icon
//                   name="search"
//                   size={20}
//                   color="white"
//                   style={styles.searchIcon}
//                 />
//                 <TextInput
//                   style={styles.searchInput}
//                   placeholder="Search by date, device, or notes"
//                   placeholderTextColor="#999"
//                   value={search}
//                   onChangeText={(text) => {
//                     setSearch(text);
//                     applyFilters(alerts, filter, text);
//                   }}
//                 />
//               </View>
//             </View>
//           );
//         case "alerts":
//           return item.data.length > 0 ? (
//             item.data.map((alert) => (
//               <Animated.View key={alert.id} entering={FadeIn}>
//                 <TouchableOpacity
//                   style={styles.alertItem}
//                   onPress={() =>
//                     router.push({
//                       pathname: "/(tabs)/AlertDetailPage",
//                       params: { alertId: alert.id },
//                     })
//                   }
//                 >
//                   <View style={styles.alertContent}>
//                     <View>
//                       <Text style={styles.alertTimestamp}>
//                         Detected: {alert.occurAt}
//                       </Text>
//                       <Text
//                         style={[
//                           styles.alertStatus,
//                           { color: getStatusColor(alert.status) },
//                         ]}
//                       >
//                         Status: {alert.status}
//                       </Text>
//                       <Text style={styles.alertConfidence}>
//                         Device: {alert.deviceId}
//                       </Text>
//                       <Text style={styles.alertConfidence}>
//                         Location: {alert.location}
//                       </Text>
//                       {alert.resolvedBy !== "unknown" && (
//                         <Text style={styles.alertConfidence}>
//                           Resolved By: {alert.resolvedBy}
//                         </Text>
//                       )}
//                       {role === "security" && alert.status === "approved" && (
//                         <Text style={styles.receivedText}>Received</Text>
//                       )}
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               </Animated.View>
//             ))
//           ) : (
//             <Text style={styles.emptyText}>No alerts found</Text>
//           );
//         default:
//           return null;
//       }
//     },
//     [filter, search, role, alerts, filteredAlerts, fetchAlerts, applyFilters]
//   );

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "#FF9800";
//       case "approved":
//         return "#4CAF50";
//       case "rejected":
//         return "#D32F2F";
//       default:
//         return "white";
//     }
//   };

//   if (loading && !error) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4CAF50" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {error && (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity onPress={fetchAlerts} style={styles.retryButton}>
//             <Text style={styles.retryText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//       <FlatList
//         data={pageData}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 20 }}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={fetchAlerts} />
//         }
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#121212" },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     backgroundColor: "#121212",
//   },
//   errorContainer: {
//     backgroundColor: "#2a2a2a",
//     padding: 10,
//     margin: 10,
//     borderRadius: 5,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   errorText: { color: "#D32F2F", fontSize: 14 },
//   retryButton: {
//     backgroundColor: "#4CAF50",
//     padding: 5,
//     borderRadius: 5,
//   },
//   retryText: { color: "#fff", fontSize: 14 },
//   header: {
//     padding: 15,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#1a1a1a",
//   },
//   headerText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
//   filterContainer: {
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//   },
//   picker: {
//     width: "100%",
//     color: "#fff",
//     backgroundColor: "#4CAF50",
//     borderRadius: 5,
//     marginBottom: 10,
//   },
//   refreshButton: { padding: 5 },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 5,
//   },
//   searchIcon: { position: "absolute", left: 10, zIndex: 1 },
//   searchInput: {
//     flex: 1,
//     height: 50,
//     borderColor: "#4CAF50",
//     borderWidth: 1,
//     borderRadius: 5,
//     paddingLeft: 40,
//     paddingRight: 10,
//     color: "white",
//     backgroundColor: "#1a1a1a",
//   },
//   alertItem: {
//     backgroundColor: "#333",
//     padding: 10,
//     borderRadius: 5,
//     marginVertical: 5,
//     marginHorizontal: 10,
//   },
//   alertContent: { flexDirection: "row", justifyContent: "space-between" },
//   alertTimestamp: { color: "#fff", fontSize: 14 },
//   alertStatus: { fontSize: 14, fontWeight: "bold" },
//   alertConfidence: { color: "#999", fontSize: 12 },
//   receivedText: { color: "#4CAF50", fontSize: 12, marginTop: 5 },
//   emptyText: {
//     color: "#fff",
//     fontSize: 16,
//     textAlign: "center",
//     marginTop: 20,
//   },
// });

// export default AlertsPage;

// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
// } from "react-native";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import Animated, { FadeIn } from "react-native-reanimated";
// import Icon from "react-native-vector-icons/Ionicons";
// import { Picker } from "@react-native-picker/picker";
// import { db } from "../../services/firebase";
// import {
//   collection,
//   query,
//   where,
//   orderBy,
//   limit,
//   getDocs,
//   onSnapshot,
//   getDoc,
//   doc,
//   runTransaction,
// } from "firebase/firestore";
// import { useAuth } from "../../context/authContext";

// const AlertsPage = () => {
//   const [alerts, setAlerts] = useState([]);
//   const [filteredAlerts, setFilteredAlerts] = useState([]);
//   const [filter, setFilter] = useState("All");
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);
//   const [processedAlertIds, setProcessedAlertIds] = useState(new Set()); // Local cache for processed alertIds

//   const router = useRouter();
//   const { user, role } = useAuth();
//   const { logId } = useLocalSearchParams();

//   const formatDate = useCallback((timestamp) => {
//     if (!timestamp) return "N/A";
//     try {
//       const date = timestamp.toDate();
//       return date.toLocaleString();
//     } catch (error) {
//       console.warn("Invalid timestamp format:", timestamp);
//       return "N/A";
//     }
//   }, []);

//   const resolveReference = useCallback(async (field, path) => {
//     if (!field) return "Unknown";
//     try {
//       let docRef;
//       if (field && typeof field === "object" && "path" in field) {
//         docRef = field;
//       } else if (typeof field === "string") {
//         docRef = doc(db, path, field);
//       } else {
//         return "Unknown";
//       }
//       const docSnap = await getDoc(docRef);
//       if (docSnap.exists()) {
//         const data = docSnap.data();
//         if (path === "devices") {
//           return data.name || docSnap.id;
//         } else if (path === "users") {
//           return data.username || docSnap.id;
//         } else if (path === "alerts") {
//           return { id: docSnap.id, ...data };
//         }
//       }
//       return docRef.id;
//     } catch (error) {
//       console.error(`Error resolving ${path} reference:`, error);
//       return "Unknown";
//     }
//   }, []);

//   const transformAlertData = useCallback(
//     async (doc) => {
//       const data = doc.data();
//       const deviceId = await resolveReference(data.deviceId, "devices");
//       const resolvedBy = await resolveReference(
//         data.resolvedBy || "unknown",
//         "users"
//       );

//       const detections = data.detections || {};
//       const detectionDetails = [];

//       if (detections.image) {
//         detectionDetails.push({
//           type: detections.image.type || "image",
//           confidence: detections.image.confidence || 0,
//           timestamp: formatDate(detections.image.timestamp),
//           detected: detections.image.detected || false,
//           urls: detections.image.imageUrl || [],
//         });
//       }
//       if (detections.smoke) {
//         detectionDetails.push({
//           type: "smoke",
//           level: detections.smoke.level || 0,
//           timestamp: formatDate(detections.smoke.timestamp),
//           detected: detections.smoke.detected || false,
//         });
//       }
//       if (detections.sound) {
//         detectionDetails.push({
//           type: detections.sound.type || "sound",
//           confidence: detections.sound.confidence || 0,
//           timestamp: formatDate(detections.sound.timestamp),
//           detected: detections.sound.detected || false,
//           urls: detections.sound.soundUrl || [],
//         });
//       }

//       return {
//         id: doc.id,
//         occurAt: formatDate(data.occur_at),
//         resolvedAt: formatDate(data.resolvedAt),
//         status: data.status || "pending",
//         deviceId: deviceId,
//         notes: data.notes || "",
//         location:
//           Array.isArray(data.location) && data.location.length === 2
//             ? `${data.location[0] || "N/A"}, ${data.location[1] || "N/A"}`
//             : "N/A",
//         resolvedBy: resolvedBy,
//         detections: detectionDetails,
//       };
//     },
//     [formatDate, resolveReference]
//   );

//   const createLogEntry = useCallback(
//     async (alertId, alertData, action) => {
//       try {
//         await runTransaction(db, async (transaction) => {
//           const q = query(
//             collection(db, "logs"),
//             where("alertId", "==", doc(db, "alerts", alertId)),
//             limit(1)
//           );
//           const querySnapshot = await getDocs(q);

//           if (!querySnapshot.empty) {
//             console.log(
//               `Log entry for alert ${alertId} already exists in logs collection`
//             );
//             return;
//           }

//           const logEntry = {
//             alertId: doc(db, "alerts", alertId),
//             action: action,
//             occur_at:
//               action === "alert_created"
//                 ? alertData.occur_at || new Date()
//                 : new Date(),
//             deviceId: alertData.deviceId || "unknown",
//             userId:
//               alertData.resolvedBy ||
//               (user ? doc(db, "users", user.uid) : "system"),
//             securityNotified: alertData.status === "approved" || false,
//             notes: alertData.notes || "",
//           };

//           const newLogRef = doc(collection(db, "logs"));
//           transaction.set(newLogRef, logEntry);
//           console.log(
//             `Log entry created for alert ${alertId} with action ${action}`
//           );
//           setProcessedAlertIds((prev) => new Set(prev).add(alertId));
//         });
//       } catch (error) {
//         console.error("Error creating log entry:", error);
//         let errorMessage = "Failed to create log entry.";
//         if (error.code === "permission-denied") {
//           errorMessage = "Permission denied: Unable to create log entry.";
//         } else if (error.code === "unavailable") {
//           errorMessage =
//             "Network error: Please check your internet connection.";
//         }
//         setError(errorMessage);
//         Alert.alert("Error", errorMessage);
//       }
//     },
//     [user]
//   );

//   const fetchAlerts = useCallback(async () => {
//     setRefreshing(true);
//     setError(null);
//     try {
//       let alertsList = [];

//       if (logId) {
//         const logDocRef = doc(db, "logs", logId);
//         const logDocSnap = await getDoc(logDocRef);
//         if (logDocSnap.exists()) {
//           const logData = logDocSnap.data();
//           const alertRef = logData.alertId;

//           if (alertRef) {
//             const alertData = await resolveReference(alertRef, "alerts");
//             if (alertData !== "Unknown") {
//               const transformedAlert = await transformAlertData({
//                 id: alertData.id,
//                 data: () => alertData,
//               });
//               alertsList = [transformedAlert];
//             }
//           }
//         } else {
//           throw new Error("Log entry not found");
//         }
//       } else {
//         let alertsQuery;
//         if (role === "admin") {
//           alertsQuery = query(
//             collection(db, "alerts"),
//             orderBy("occur_at", "desc"),
//             limit(50)
//           );
//         } else if (role === "security") {
//           alertsQuery = query(
//             collection(db, "alerts"),
//             where("status", "==", "approved"),
//             orderBy("occur_at", "desc"),
//             limit(50)
//           );
//         } else {
//           throw new Error("Invalid user role");
//         }

//         const querySnapshot = await getDocs(alertsQuery);
//         if (querySnapshot.empty) {
//           setAlerts([]);
//           setFilteredAlerts([]);
//           return;
//         }

//         alertsList = await Promise.all(
//           querySnapshot.docs.map((doc) => transformAlertData(doc))
//         );
//       }

//       setAlerts(alertsList);
//       applyFilters(alertsList, filter, search);
//     } catch (error) {
//       console.error("Error fetching alerts:", error);
//       let errorMessage = "Failed to fetch alerts.";
//       if (error.code === "permission-denied") {
//         errorMessage = "Permission denied: Unable to fetch alerts.";
//       } else if (error.code === "unavailable") {
//         errorMessage = "Network error: Please check your internet connection.";
//       }
//       setError(errorMessage);
//       Alert.alert("Error", errorMessage);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [role, filter, search, logId, transformAlertData]);

//   useEffect(() => {
//     if (!user) return;

//     let unsubscribeAlerts;
//     let unsubscribeLog;

//     const setupListeners = async () => {
//       try {
//         if (logId) {
//           const logDocRef = doc(db, "logs", logId);
//           unsubscribeLog = onSnapshot(
//             logDocRef,
//             async (logDocSnap) => {
//               if (logDocSnap.exists()) {
//                 const logData = logDocSnap.data();
//                 const alertRef = logData.alertId;

//                 if (alertRef) {
//                   const alertData = await resolveReference(alertRef, "alerts");
//                   if (alertData !== "Unknown") {
//                     const transformedAlert = await transformAlertData({
//                       id: alertData.id,
//                       data: () => alertData,
//                     });
//                     const alertsList = [transformedAlert];
//                     setAlerts(alertsList);
//                     applyFilters(alertsList, filter, search);
//                   } else {
//                     setAlerts([]);
//                     setFilteredAlerts([]);
//                   }
//                 } else {
//                   setAlerts([]);
//                   setFilteredAlerts([]);
//                 }
//               } else {
//                 setError("Log entry not found");
//                 setAlerts([]);
//                 setFilteredAlerts([]);
//               }
//               setLoading(false);
//             },
//             (error) => {
//               console.error("Error in real-time log listener:", error);
//               let errorMessage = "Failed to load log in real-time.";
//               if (error.code === "permission-denied") {
//                 errorMessage = "Permission denied: Unable to load log.";
//               } else if (error.code === "unavailable") {
//                 errorMessage =
//                   "Network error: Please check your internet connection.";
//               }
//               setError(errorMessage);
//               Alert.alert("Error", errorMessage);
//               fetchAlerts();
//             }
//           );
//         } else {
//           let alertsQuery;
//           if (role === "admin") {
//             alertsQuery = query(
//               collection(db, "alerts"),
//               orderBy("occur_at", "desc"),
//               limit(50)
//             );
//           } else if (role === "security") {
//             alertsQuery = query(
//               collection(db, "alerts"),
//               where("status", "==", "approved"),
//               orderBy("occur_at", "desc"),
//               limit(50)
//             );
//           } else {
//             throw new Error("Invalid user role");
//           }

//           unsubscribeAlerts = onSnapshot(
//             alertsQuery,
//             async (querySnapshot) => {
//               const changes = querySnapshot.docChanges();

//               for (const change of changes) {
//                 const doc = change.doc;
//                 const alertId = doc.id;
//                 const alertData = doc.data();

//                 if (
//                   change.type === "added" &&
//                   !processedAlertIds.has(alertId)
//                 ) {
//                   await createLogEntry(alertId, alertData, "alert_created");
//                 }
//               }

//               const alertsList = await Promise.all(
//                 querySnapshot.docs.map((doc) => transformAlertData(doc))
//               );
//               setAlerts(alertsList);
//               applyFilters(alertsList, filter, search);
//               setLoading(false);
//             },
//             (error) => {
//               console.error("Error in real-time alerts listener:", error);
//               let errorMessage = "Failed to load alerts in real-time.";
//               if (error.code === "permission-denied") {
//                 errorMessage = "Permission denied: Unable to load alerts.";
//               } else if (error.code === "unavailable") {
//                 errorMessage =
//                   "Network error: Please check your internet connection.";
//               }
//               setError(errorMessage);
//               Alert.alert("Error", errorMessage);
//               fetchAlerts();
//             }
//           );
//         }
//       } catch (error) {
//         console.error("Error setting up alerts listener:", error);
//         let errorMessage = "Error setting up real-time listener.";
//         if (error.code === "permission-denied") {
//           errorMessage = "Permission denied: Unable to set up listener.";
//         } else if (error.code === "unavailable") {
//           errorMessage =
//             "Network error: Please check your internet connection.";
//         }
//         setError(errorMessage);
//         Alert.alert("Error", errorMessage);
//         fetchAlerts();
//       }
//     };

//     setupListeners();

//     return () => {
//       if (unsubscribeAlerts) unsubscribeAlerts();
//       if (unsubscribeLog) unsubscribeLog();
//     };
//   }, [
//     user,
//     role,
//     fetchAlerts,
//     filter,
//     search,
//     logId,
//     transformAlertData,
//     createLogEntry,
//     processedAlertIds,
//   ]);

//   const applyFilters = useCallback((alertsList, statusFilter, searchText) => {
//     let filtered = [...alertsList];

//     if (statusFilter !== "All") {
//       filtered = filtered.filter(
//         (alert) => alert.status.toLowerCase() === statusFilter.toLowerCase()
//       );
//     }

//     if (searchText) {
//       const searchLower = searchText.toLowerCase();
//       filtered = filtered.filter((alert) =>
//         [alert.occurAt, alert.deviceId, alert.notes, alert.location].some(
//           (field) => field && field.toLowerCase().includes(searchLower)
//         )
//       );
//     }

//     setFilteredAlerts(filtered);
//   }, []);

//   const pageData = useMemo(
//     () => [
//       { type: "header", id: "header" },
//       ...(role === "admin"
//         ? [{ type: "filterSearch", id: "filterSearch" }]
//         : []),
//       { type: "alerts", id: "alerts", data: filteredAlerts },
//     ],
//     [role, filteredAlerts]
//   );

//   const renderItem = useCallback(
//     ({ item }) => {
//       switch (item.type) {
//         case "header":
//           return (
//             <View style={styles.header}>
//               <Text style={styles.headerText}>
//                 {logId ? `Alert for Log ${logId}` : "Alerts"}
//               </Text>
//               <TouchableOpacity
//                 style={styles.refreshButton}
//                 onPress={fetchAlerts}
//               >
//                 <Icon name="refresh" size={20} color="#fff" />
//               </TouchableOpacity>
//             </View>
//           );
//         case "filterSearch":
//           return (
//             <View style={styles.filterContainer}>
//               <Picker
//                 selectedValue={filter}
//                 onValueChange={(itemValue) => {
//                   setFilter(itemValue);
//                   applyFilters(alerts, itemValue, search);
//                 }}
//                 style={styles.picker}
//               >
//                 <Picker.Item label="All" value="All" />
//                 <Picker.Item label="Pending" value="pending" />
//                 <Picker.Item label="Approved" value="approved" />
//                 <Picker.Item label="Rejected" value="rejected" />
//               </Picker>
//               <View style={styles.searchContainer}>
//                 <Icon
//                   name="search"
//                   size={20}
//                   color="white"
//                   style={styles.searchIcon}
//                 />
//                 <TextInput
//                   style={styles.searchInput}
//                   placeholder="Search by date, device, or notes"
//                   placeholderTextColor="#999"
//                   value={search}
//                   onChangeText={(text) => {
//                     setSearch(text);
//                     applyFilters(alerts, filter, text);
//                   }}
//                 />
//               </View>
//             </View>
//           );
//         case "alerts":
//           return item.data.length > 0 ? (
//             item.data.map((alert) => (
//               <Animated.View key={alert.id} entering={FadeIn}>
//                 <TouchableOpacity
//                   style={styles.alertItem}
//                   onPress={() =>
//                     router.push({
//                       pathname: "/(tabs)/AlertDetailPage",
//                       params: { alertId: alert.id },
//                     })
//                   }
//                 >
//                   <View style={styles.alertContent}>
//                     <View>
//                       <Text style={styles.alertTimestamp}>
//                         Detected: {alert.occurAt}
//                       </Text>
//                       <Text
//                         style={[
//                           styles.alertStatus,
//                           { color: getStatusColor(alert.status) },
//                         ]}
//                       >
//                         Status: {alert.status}
//                       </Text>
//                       <Text style={styles.alertConfidence}>
//                         Device: {alert.deviceId}
//                       </Text>
//                       <Text style={styles.alertConfidence}>
//                         Location: {alert.location}
//                       </Text>
//                       {alert.notes && (
//                         <Text style={styles.alertConfidence}>
//                           Notes: {alert.notes}
//                         </Text>
//                       )}
//                       {alert.resolvedBy !== "unknown" && (
//                         <Text style={styles.alertConfidence}>
//                           Resolved By: {alert.resolvedBy}
//                         </Text>
//                       )}
//                       {alert.resolvedAt !== "N/A" && (
//                         <Text style={styles.alertConfidence}>
//                           Resolved At: {alert.resolvedAt}
//                         </Text>
//                       )}
//                       {alert.detections.length > 0 && (
//                         <View style={styles.detectionsContainer}>
//                           <Text style={styles.detectionsTitle}>
//                             Detections:
//                           </Text>
//                           {alert.detections.map((detection, index) => (
//                             <View key={index} style={styles.detectionItem}>
//                               <Text style={styles.detectionText}>
//                                 Type: {detection.type}
//                               </Text>
//                               {detection.confidence && (
//                                 <Text style={styles.detectionText}>
//                                   Confidence:{" "}
//                                   {(detection.confidence * 100).toFixed(2)}%
//                                 </Text>
//                               )}
//                               {detection.level && (
//                                 <Text style={styles.detectionText}>
//                                   Level: {detection.level}
//                                 </Text>
//                               )}
//                               <Text style={styles.detectionText}>
//                                 Timestamp: {detection.timestamp}
//                               </Text>
//                               {detection.urls && detection.urls.length > 0 && (
//                                 <Text style={styles.detectionText}>
//                                   Media URLs: {detection.urls.join(", ")}
//                                 </Text>
//                               )}
//                             </View>
//                           ))}
//                         </View>
//                       )}
//                       {role === "security" && alert.status === "approved" && (
//                         <Text style={styles.receivedText}>Received</Text>
//                       )}
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               </Animated.View>
//             ))
//           ) : (
//             <Text style={styles.emptyText}>No alerts found</Text>
//           );
//         default:
//           return null;
//       }
//     },
//     [filter, search, role, alerts, filteredAlerts, fetchAlerts, logId]
//   );

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "#FF9800";
//       case "approved":
//         return "#4CAF50";
//       case "rejected":
//         return "#D32F2F";
//       default:
//         return "white";
//     }
//   };

//   if (loading && !error) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4CAF50" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {error && (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity onPress={fetchAlerts} style={styles.retryButton}>
//             <Text style={styles.retryText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//       <FlatList
//         data={pageData}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 20 }}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={fetchAlerts} />
//         }
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#121212" },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     backgroundColor: "#121212",
//   },
//   errorContainer: {
//     backgroundColor: "#2a2a2a",
//     padding: 10,
//     margin: 10,
//     borderRadius: 5,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   errorText: { color: "#D32F2F", fontSize: 14 },
//   retryButton: {
//     backgroundColor: "#4CAF50",
//     padding: 5,
//     borderRadius: 5,
//   },
//   retryText: { color: "#fff", fontSize: 14 },
//   header: {
//     padding: 15,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#1a1a1a",
//   },
//   headerText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
//   filterContainer: {
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//   },
//   picker: {
//     width: "100%",
//     color: "#fff",
//     backgroundColor: "#4CAF50",
//     borderRadius: 5,
//     marginBottom: 10,
//   },
//   refreshButton: { padding: 5 },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 5,
//   },
//   searchIcon: { position: "absolute", left: 10, zIndex: 1 },
//   searchInput: {
//     flex: 1,
//     height: 50,
//     borderColor: "#4CAF50",
//     borderWidth: 1,
//     borderRadius: 5,
//     paddingLeft: 40,
//     paddingRight: 10,
//     color: "white",
//     backgroundColor: "#1a1a1a",
//   },
//   alertItem: {
//     backgroundColor: "#333",
//     padding: 10,
//     borderRadius: 5,
//     marginVertical: 5,
//     marginHorizontal: 10,
//   },
//   alertContent: { flexDirection: "row", justifyContent: "space-between" },
//   alertTimestamp: { color: "#fff", fontSize: 14 },
//   alertStatus: { fontSize: 14, fontWeight: "bold" },
//   alertConfidence: { color: "#999", fontSize: 12 },
//   receivedText: { color: "#4CAF50", fontSize: 12, marginTop: 5 },
//   emptyText: {
//     color: "#fff",
//     fontSize: 16,
//     textAlign: "center",
//     marginTop: 20,
//   },
//   detectionsContainer: {
//     marginTop: 10,
//   },
//   detectionsTitle: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "bold",
//     marginBottom: 5,
//   },
//   detectionItem: {
//     marginBottom: 5,
//   },
//   detectionText: {
//     color: "#999",
//     fontSize: 12,
//   },
// });

// export default AlertsPage;

// !Full UPdated ALerts PAge with all the features
// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
//   useRef,
// } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
// } from "react-native";
// import { useRouter, useFocusEffect } from "expo-router";
// import Animated, { FadeIn } from "react-native-reanimated";
// import Icon from "react-native-vector-icons/Ionicons";
// import { db } from "../../services/firebase";
// import {
//   collection,
//   query,
//   where,
//   limit,
//   getDocs,
//   onSnapshot,
//   getDoc,
//   doc,
//   startAfter,
// } from "firebase/firestore";
// import { useAuth } from "../../context/authContext";

// const AlertsPage = () => {
//   const [alerts, setAlerts] = useState([]);
//   const [filteredAlerts, setFilteredAlerts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);
//   const [lastDoc, setLastDoc] = useState(null);
//   const [hasMore, setHasMore] = useState(true);
//   const [isLoadingMore, setIsLoadingMore] = useState(false);
//   const [listenerErrorCount, setListenerErrorCount] = useState(0);

//   const deviceCache = useRef(new Map()).current;
//   const userCache = useRef(new Map()).current;
//   const unsubscribeRef = useRef(null); // Use a ref to store the unsubscribe function

//   const router = useRouter();
//   const { user, role } = useAuth();

//   // Debug mounting/unmounting
//   useEffect(() => {
//     console.log("AlertsPage mounted");
//     return () => {
//       console.log("AlertsPage unmounted");
//     };
//   }, []);

//   const formatDate = useCallback((timestamp) => {
//     if (!timestamp) return "N/A";
//     try {
//       const date = timestamp.toDate();
//       return date.toLocaleString();
//     } catch (error) {
//       console.warn("Invalid timestamp format:", timestamp);
//       return "N/A";
//     }
//   }, []);

//   const resolveReference = useCallback(
//     async (field, path) => {
//       if (!field) return "Unknown";

//       const cache = path === "devices" ? deviceCache : userCache;
//       const fieldId = typeof field === "string" ? field : field.id;

//       if (cache.has(fieldId)) {
//         return cache.get(fieldId);
//       }

//       try {
//         let docRef;
//         if (field && typeof field === "object" && "path" in field) {
//           docRef = field;
//         } else if (typeof field === "string") {
//           docRef = doc(db, path, field);
//         } else {
//           return "Unknown";
//         }
//         const docSnap = await getDoc(docRef);
//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           const resolvedValue =
//             path === "devices"
//               ? data.name || docSnap.id
//               : data.username || docSnap.id;
//           cache.set(fieldId, resolvedValue);
//           return resolvedValue;
//         }
//         return docRef.id;
//       } catch (error) {
//         console.error(`Error resolving ${path} reference:`, error);
//         return "Unknown";
//       }
//     },
//     [deviceCache, userCache]
//   );

//   const transformAlertData = useCallback(
//     async (doc) => {
//       const data = doc.data();
//       const deviceId = await resolveReference(data.deviceId, "devices");

//       const detections = data.detections || {};
//       const detectionDetails = [];

//       if (detections.image) {
//         detectionDetails.push({
//           type: detections.image.type || "image",
//           confidence: detections.image.confidence || 0,
//           timestamp: formatDate(detections.image.timestamp),
//           detected: detections.image.detected || false,
//           imageUrl: detections.image.imageUrl || "N/A",
//         });
//       }
//       if (detections.smoke) {
//         detectionDetails.push({
//           type: "smoke",
//           level: detections.smoke.level || 0,
//           timestamp: formatDate(detections.smoke.timestamp),
//           detected: detections.smoke.detected || false,
//         });
//       }
//       if (detections.sound) {
//         detectionDetails.push({
//           type: detections.sound.type || "sound",
//           confidence: detections.sound.confidence || 0,
//           timestamp: formatDate(detections.sound.timestamp),
//           detected: detections.sound.detected || false,
//           soundUrl: detections.sound.soundUrl || "N/A",
//         });
//       }

//       return {
//         id: doc.id,
//         occurAt: formatDate(data.occur_at),
//         occurAtTimestamp: data.occur_at,
//         status: data.status || "pending",
//         deviceId: deviceId,
//         location:
//           Array.isArray(data.location) && data.location.length === 2
//             ? `${data.location[0] || "N/A"}, ${data.location[1] || "N/A"}`
//             : "N/A",
//         detections: detectionDetails,
//       };
//     },
//     [formatDate, resolveReference]
//   );

//   const fetchAlerts = useCallback(
//     async (isRefresh = false) => {
//       if (isRefresh) {
//         setRefreshing(true);
//         setLastDoc(null);
//         setHasMore(true);
//       }
//       setError(null);
//       try {
//         let alertsQuery;
//         if (role === "admin") {
//           alertsQuery = query(collection(db, "alerts"), limit(10));
//         } else if (role === "security") {
//           alertsQuery = query(
//             collection(db, "alerts"),
//             where("status", "==", "approved"),
//             limit(10)
//           );
//         } else {
//           throw new Error("Invalid user role");
//         }

//         if (!isRefresh && lastDoc && !isLoadingMore) {
//           alertsQuery = query(
//             collection(db, "alerts"),
//             where("status", "==", "approved"),
//             startAfter(lastDoc),
//             limit(10)
//           );
//         }

//         const querySnapshot = await getDocs(alertsQuery);
//         if (querySnapshot.empty) {
//           if (isRefresh) {
//             setAlerts([]);
//             setFilteredAlerts([]);
//           }
//           setHasMore(false);
//           return;
//         }

//         const newAlerts = await Promise.all(
//           querySnapshot.docs.map((doc) => transformAlertData(doc))
//         );

//         const sortedAlerts = newAlerts.sort((a, b) => {
//           const aTime = a.occurAtTimestamp
//             ? a.occurAtTimestamp.toDate().getTime()
//             : 0;
//           const bTime = b.occurAtTimestamp
//             ? b.occurAtTimestamp.toDate().getTime()
//             : 0;
//           return bTime - aTime;
//         });

//         setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);

//         if (isRefresh) {
//           setAlerts(sortedAlerts);
//           setFilteredAlerts(sortedAlerts);
//         } else {
//           setAlerts((prev) => {
//             const updatedAlerts = [...prev, ...sortedAlerts];
//             return updatedAlerts.sort((a, b) => {
//               const aTime = a.occurAtTimestamp
//                 ? a.occurAtTimestamp.toDate().getTime()
//                 : 0;
//               const bTime = b.occurAtTimestamp
//                 ? b.occurAtTimestamp.toDate().getTime()
//                 : 0;
//               return bTime - aTime;
//             });
//           });
//           setFilteredAlerts((prev) => {
//             const updatedFilteredAlerts = [...prev, ...sortedAlerts];
//             return updatedFilteredAlerts.sort((a, b) => {
//               const aTime = a.occurAtTimestamp
//                 ? a.occurAtTimestamp.toDate().getTime()
//                 : 0;
//               const bTime = b.occurAtTimestamp
//                 ? b.occurAtTimestamp.toDate().getTime()
//                 : 0;
//               return bTime - aTime;
//             });
//           });
//         }

//         setHasMore(querySnapshot.docs.length === 10);
//       } catch (error) {
//         console.error("Error fetching alerts:", error);
//         let errorMessage = "Failed to fetch alerts.";
//         if (error.code === "permission-denied") {
//           errorMessage = "Permission denied: Unable to fetch alerts.";
//         } else if (error.code === "unavailable") {
//           errorMessage =
//             "Network error: Please check your internet connection.";
//         }
//         setError(errorMessage);
//         Alert.alert("Error", errorMessage);
//       } finally {
//         setLoading(false);
//         setRefreshing(false);
//         setIsLoadingMore(false);
//       }
//     },
//     [role, transformAlertData, lastDoc, isLoadingMore]
//   );

//   const loadMoreAlerts = useCallback(() => {
//     if (!hasMore || isLoadingMore) return;
//     setIsLoadingMore(true);
//     fetchAlerts();
//   }, [hasMore, isLoadingMore, fetchAlerts]);

//   // Use useFocusEffect to manage the listener based on screen focus
//   useFocusEffect(
//     useCallback(() => {
//       if (!user) return;

//       console.log(
//         "AlertsPage focused - Setting up listener for user:",
//         user.uid,
//         "role:",
//         role
//       );

//       const setupListeners = async () => {
//         try {
//           let alertsQuery;
//           if (role === "admin") {
//             alertsQuery = query(collection(db, "alerts"), limit(10));
//           } else if (role === "security") {
//             alertsQuery = query(
//               collection(db, "alerts"),
//               where("status", "==", "approved"),
//               limit(10)
//             );
//           } else {
//             throw new Error("Invalid user role");
//           }

//           // Ensure any existing listener is unsubscribed before setting up a new one
//           if (unsubscribeRef.current) {
//             console.log(
//               "Unsubscribing existing listener before setting up new one"
//             );
//             unsubscribeRef.current();
//           }

//           unsubscribeRef.current = onSnapshot(
//             alertsQuery,
//             async (querySnapshot) => {
//               if (querySnapshot.empty) {
//                 setAlerts([]);
//                 setFilteredAlerts([]);
//                 setHasMore(false);
//                 setLoading(false);
//                 return;
//               }

//               const alertsList = await Promise.all(
//                 querySnapshot.docs.map((doc) => transformAlertData(doc))
//               );

//               const sortedAlerts = alertsList.sort((a, b) => {
//                 const aTime = a.occurAtTimestamp
//                   ? a.occurAtTimestamp.toDate().getTime()
//                   : 0;
//                 const bTime = b.occurAtTimestamp
//                   ? b.occurAtTimestamp.toDate().getTime()
//                   : 0;
//                 return bTime - aTime;
//               });

//               setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
//               setAlerts(sortedAlerts);
//               setFilteredAlerts(sortedAlerts);
//               setHasMore(querySnapshot.docs.length === 10);
//               setLoading(false);
//               setListenerErrorCount(0);
//             },
//             (error) => {
//               console.error("Detailed error in real-time alerts listener:", {
//                 errorCode: error.code,
//                 errorMessage: error.message,
//                 role: role,
//                 userId: user?.uid,
//               });

//               let errorMessage = "Failed to load alerts in real-time.";
//               if (error.code === "permission-denied") {
//                 errorMessage =
//                   "Permission denied: Unable to load alerts in real-time.";
//               } else if (error.code === "unavailable") {
//                 errorMessage =
//                   "Network error: Please check your internet connection.";
//               }

//               setListenerErrorCount((prev) => prev + 1);

//               if (listenerErrorCount < 1) {
//                 setError(errorMessage);
//                 Alert.alert("Error", errorMessage);
//                 fetchAlerts(true);
//               } else {
//                 console.warn(
//                   "Suppressing repeated real-time listener error to prevent loop."
//                 );
//               }
//             }
//           );
//         } catch (error) {
//           console.error("Error setting up alerts listener:", error);
//           let errorMessage = "Error setting up real-time listener.";
//           if (error.code === "permission-denied") {
//             errorMessage = "Permission denied: Unable to set up listener.";
//           } else if (error.code === "unavailable") {
//             errorMessage =
//               "Network error: Please check your internet connection.";
//           }
//           setError(errorMessage);
//           Alert.alert("Error", errorMessage);
//           fetchAlerts(true);
//         }
//       };

//       setupListeners();

//       return () => {
//         if (unsubscribeRef.current) {
//           console.log(
//             "AlertsPage unfocused - Unsubscribing from alerts listener"
//           );
//           unsubscribeRef.current();
//           unsubscribeRef.current = null;
//         }
//       };
//     }, [user, role, transformAlertData])
//   );

//   const pageData = useMemo(
//     () => [
//       { type: "header", id: "header" },
//       { type: "alerts", id: "alerts", data: filteredAlerts },
//     ],
//     [filteredAlerts]
//   );

//   const renderItem = useCallback(
//     ({ item }) => {
//       switch (item.type) {
//         case "header":
//           return (
//             <View style={styles.header}>
//               <Text style={styles.headerText}>Alerts</Text>
//               <TouchableOpacity
//                 style={styles.refreshButton}
//                 onPress={() => fetchAlerts(true)}
//               >
//                 <Icon name="refresh" size={20} color="#fff" />
//               </TouchableOpacity>
//             </View>
//           );
//         case "alerts":
//           return item.data.length > 0 ? (
//             item.data.map((alert) => (
//               <Animated.View key={alert.id} entering={FadeIn}>
//                 <TouchableOpacity
//                   style={styles.alertItem}
//                   onPress={() => {
//                     console.log(
//                       "Navigating to AlertDetailPage with alertId:",
//                       alert.id
//                     );
//                     router.push({
//                       pathname: "/(tabs)/AlertDetailPage",
//                       params: { alertId: alert.id },
//                     });
//                   }}
//                 >
//                   <View style={styles.alertContent}>
//                     <View style={styles.alertHeader}>
//                       <Text style={styles.alertTimestamp}>{alert.occurAt}</Text>
//                       <Text
//                         style={[
//                           styles.alertStatus,
//                           { backgroundColor: getStatusColor(alert.status) },
//                         ]}
//                       >
//                         {alert.status}
//                       </Text>
//                     </View>
//                     <View style={styles.alertDetails}>
//                       <View style={styles.detailRow}>
//                         <Icon
//                           name="cube-outline"
//                           size={16}
//                           color="#4CAF50"
//                           style={styles.detailIcon}
//                         />
//                         <Text style={styles.alertDetailText}>
//                           {alert.deviceId}
//                         </Text>
//                       </View>
//                       <View style={styles.detailRow}>
//                         <Icon
//                           name="location-outline"
//                           size={16}
//                           color="#4CAF50"
//                           style={styles.detailIcon}
//                         />
//                         <Text style={styles.alertDetailText}>
//                           {alert.location}
//                         </Text>
//                       </View>
//                     </View>
//                     {alert.detections.length > 0 && (
//                       <View style={styles.detectionsContainer}>
//                         {alert.detections.map((detection, index) => (
//                           <View key={index} style={styles.detectionItem}>
//                             <View style={styles.detectionHeader}>
//                               <Text style={styles.detectionType}>
//                                 {detection.type.toUpperCase()}
//                               </Text>
//                               {detection.confidence ? (
//                                 <Text style={styles.detectionConfidence}>
//                                   {(detection.confidence * 100).toFixed(0)}%
//                                 </Text>
//                               ) : (
//                                 <Text style={styles.detectionLevel}>
//                                   Level: {detection.level}
//                                 </Text>
//                               )}
//                             </View>
//                             <Text style={styles.detectionTimestamp}>
//                               {detection.timestamp}
//                             </Text>
//                           </View>
//                         ))}
//                       </View>
//                     )}
//                     {role === "security" && alert.status === "approved" && (
//                       <Text style={styles.receivedText}>Received</Text>
//                     )}
//                   </View>
//                 </TouchableOpacity>
//               </Animated.View>
//             ))
//           ) : (
//             <Text style={styles.emptyText}>No approved alerts found</Text>
//           );
//         default:
//           return null;
//       }
//     },
//     [role, filteredAlerts, fetchAlerts, router]
//   );

//   const renderFooter = useCallback(() => {
//     if (!isLoadingMore) return null;
//     return (
//       <View style={styles.footerLoader}>
//         <ActivityIndicator size="small" color="#4CAF50" />
//       </View>
//     );
//   }, [isLoadingMore]);

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "#FF9800";
//       case "approved":
//         return "#4CAF50";
//       case "rejected":
//         return "#D32F2F";
//       default:
//         return "#FFFFFF";
//     }
//   };

//   if (loading && !error) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <View style={styles.header}>
//           <Text style={styles.headerText}>Alerts</Text>
//           <TouchableOpacity style={styles.refreshButton}>
//             <Icon name="refresh" size={20} color="#fff" />
//           </TouchableOpacity>
//         </View>
//         {[...Array(5)].map((_, index) => (
//           <View key={index} style={styles.skeletonItem}>
//             <View style={styles.skeletonHeader}>
//               <View style={[styles.skeletonText, { width: "60%" }]} />
//               <View style={styles.skeletonStatus} />
//             </View>
//             <View style={styles.skeletonDetails}>
//               <View style={[styles.skeletonText, { width: "40%" }]} />
//               <View style={[styles.skeletonText, { width: "50%" }]} />
//             </View>
//             <View style={styles.skeletonDetection}>
//               <View style={[styles.skeletonText, { width: "30%" }]} />
//               <View style={[styles.skeletonText, { width: "70%" }]} />
//             </View>
//           </View>
//         ))}
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {error && (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity
//             onPress={() => {
//               setError(null);
//               fetchAlerts(true);
//             }}
//             style={styles.retryButton}
//           >
//             <Text style={styles.retryText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//       <FlatList
//         data={pageData}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 20 }}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={() => fetchAlerts(true)}
//           />
//         }
//         onEndReached={loadMoreAlerts}
//         onEndReachedThreshold={0.5}
//         ListFooterComponent={renderFooter}
//         initialNumToRender={5}
//         windowSize={5}
//         removeClippedSubviews={true}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "rgb(0,0,0)" },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: "#121212",
//   },
//   errorContainer: {
//     backgroundColor: "#2a2a2a",
//     padding: 10,
//     margin: 10,
//     borderRadius: 5,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   errorText: { color: "#D32F2F", fontSize: 14 },
//   retryButton: {
//     backgroundColor: "#4CAF50",
//     padding: 5,
//     borderRadius: 5,
//   },
//   retryText: { color: "#fff", fontSize: 14 },
//   header: {
//     padding: 15,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#1a1a1a",
//   },
//   headerText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
//   refreshButton: { padding: 5 },
//   alertItem: {
//     backgroundColor: "#222",
//     padding: 12,
//     borderRadius: 8,
//     marginVertical: 5,
//     marginHorizontal: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   alertContent: {
//     flexDirection: "column",
//   },
//   alertHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   alertTimestamp: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   alertStatus: {
//     fontSize: 12,
//     fontWeight: "bold",
//     color: "#fff",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     textTransform: "capitalize",
//   },
//   alertDetails: {
//     marginBottom: 8,
//   },
//   detailRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   detailIcon: {
//     marginRight: 6,
//   },
//   alertDetailText: {
//     color: "#bbb",
//     fontSize: 13,
//   },
//   detectionsContainer: {
//     borderTopWidth: 1,
//     borderTopColor: "#333",
//     paddingTop: 8,
//   },
//   detectionItem: {
//     backgroundColor: "#2a2a2a",
//     padding: 8,
//     borderRadius: 6,
//     marginBottom: 6,
//   },
//   detectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   detectionType: {
//     color: "#4CAF50",
//     fontSize: 13,
//     fontWeight: "600",
//     textTransform: "uppercase",
//   },
//   detectionConfidence: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "600",
//     backgroundColor: "#4CAF50",
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   detectionLevel: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "600",
//     backgroundColor: "#FF9800",
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   detectionTimestamp: {
//     color: "#999",
//     fontSize: 12,
//   },
//   receivedText: {
//     color: "#4CAF50",
//     fontSize: 12,
//     fontWeight: "600",
//     marginTop: 4,
//     textAlign: "right",
//   },
//   emptyText: {
//     color: "#fff",
//     fontSize: 16,
//     textAlign: "center",
//     marginTop: 20,
//   },
//   footerLoader: {
//     padding: 10,
//     alignItems: "center",
//   },
//   skeletonItem: {
//     backgroundColor: "#222",
//     padding: 12,
//     borderRadius: 8,
//     marginVertical: 5,
//     marginHorizontal: 10,
//   },
//   skeletonHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   skeletonText: {
//     backgroundColor: "#333",
//     height: 14,
//     borderRadius: 4,
//     marginBottom: 4,
//   },
//   skeletonStatus: {
//     backgroundColor: "#333",
//     height: 20,
//     width: 60,
//     borderRadius: 12,
//   },
//   skeletonDetails: {
//     marginBottom: 8,
//   },
//   skeletonDetection: {
//     backgroundColor: "#2a2a2a",
//     padding: 8,
//     borderRadius: 6,
//   },
// });

// export default AlertsPage;
// !DTAtIme Error
// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
//   useRef,
// } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
//   Modal,
//   Pressable,
// } from "react-native";
// import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
// import Animated, { FadeIn } from "react-native-reanimated";
// import Icon from "react-native-vector-icons/Ionicons";
// import { Picker } from "@react-native-picker/picker";
// import { db } from "../../services/firebase";
// import {
//   collection,
//   query,
//   where,
//   orderBy,
//   limit,
//   getDocs,
//   onSnapshot,
//   getDoc,
//   doc,
//   runTransaction,
// } from "firebase/firestore";
// import { useAuth } from "../../context/authContext";
// import DateTimePicker from "@react-native-community/datetimepicker";

// const AlertsPage = () => {
//   const [alerts, setAlerts] = useState([]);
//   const [filteredAlerts, setFilteredAlerts] = useState([]);
//   const [filter, setFilter] = useState({
//     status: "All",
//     device: "All",
//     detectionType: "All",
//     startDate: null,
//     endDate: null,
//   });
//   const [sortBy, setSortBy] = useState("dateDesc"); // Default: Sort by date descending
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);
//   const [processedAlertIds, setProcessedAlertIds] = useState(new Set());
//   const [devices, setDevices] = useState([]); // List of devices for filtering
//   const [showDatePicker, setShowDatePicker] = useState({
//     start: false,
//     end: false,
//   });

//   const router = useRouter();
//   const { user, role } = useAuth();
//   const { logId } = useLocalSearchParams();
//   const unsubscribeRef = useRef(null);

//   // Debug mounting/unmounting
//   useEffect(() => {
//     console.log("AlertsPage mounted");
//     return () => {
//       console.log("AlertsPage unmounted");
//     };
//   }, []);

//   // Fetch devices for admin filter
//   const fetchDevices = useCallback(async () => {
//     try {
//       const devicesQuery = query(collection(db, "devices"));
//       const querySnapshot = await getDocs(devicesQuery);
//       const deviceList = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         name: doc.data().name || doc.id,
//       }));
//       setDevices(deviceList);
//     } catch (error) {
//       console.error("Error fetching devices:", error);
//       setError("Failed to fetch devices for filtering.");
//     }
//   }, []);

//   useEffect(() => {
//     if (role === "admin") {
//       fetchDevices();
//     }
//   }, [role, fetchDevices]);

//   const formatDate = useCallback((timestamp) => {
//     if (!timestamp) return "N/A";
//     try {
//       if (timestamp instanceof Date) {
//         return timestamp.toLocaleString();
//       }
//       const date = timestamp.toDate();
//       return date.toLocaleString();
//     } catch (error) {
//       console.warn("Invalid timestamp format:", timestamp);
//       return "N/A";
//     }
//   }, []);

//   const resolveReference = useCallback(async (field, path) => {
//     if (!field) return "Unknown";
//     try {
//       let docRef;
//       if (field && typeof field === "object" && "path" in field) {
//         docRef = field;
//       } else if (typeof field === "string") {
//         docRef = doc(db, path, field);
//       } else {
//         return "Unknown";
//       }
//       const docSnap = await getDoc(docRef);
//       if (docSnap.exists()) {
//         const data = docSnap.data();
//         if (path === "devices") {
//           return data.name || docSnap.id;
//         } else if (path === "users") {
//           return data.username || docSnap.id;
//         } else if (path === "alerts") {
//           return { id: docSnap.id, ...data };
//         }
//       }
//       return docRef.id;
//     } catch (error) {
//       console.error(`Error resolving ${path} reference:`, error);
//       return "Unknown";
//     }
//   }, []);

//   const transformAlertData = useCallback(
//     async (doc) => {
//       const data = doc.data();
//       const deviceId = await resolveReference(data.deviceId, "devices");
//       const resolvedBy = await resolveReference(
//         data.resolvedBy || "unknown",
//         "users"
//       );

//       const detections = data.detections || {};
//       const detectionDetails = [];

//       if (detections.image) {
//         detectionDetails.push({
//           type: detections.image.type || "image",
//           confidence: detections.image.confidence || 0,
//           timestamp: formatDate(detections.image.timestamp),
//           detected: detections.image.detected || false,
//           urls: detections.image.imageUrl || [],
//         });
//       }
//       if (detections.smoke) {
//         detectionDetails.push({
//           type: "smoke",
//           level: detections.smoke.level || 0,
//           timestamp: formatDate(detections.smoke.timestamp),
//           detected: detections.smoke.detected || false,
//         });
//       }
//       if (detections.sound) {
//         detectionDetails.push({
//           type: detections.sound.type || "sound",
//           confidence: detections.sound.confidence || 0,
//           timestamp: formatDate(detections.sound.timestamp),
//           detected: detections.sound.detected || false,
//           urls: detections.sound.soundUrl || [],
//         });
//       }

//       return {
//         id: doc.id,
//         occurAt: formatDate(data.occur_at),
//         occurAtTimestamp: data.occur_at,
//         resolvedAt: formatDate(data.resolvedAt),
//         status: data.status || "pending",
//         deviceId: deviceId,
//         notes: data.notes || "",
//         location:
//           Array.isArray(data.location) && data.location.length === 2
//             ? `${data.location[0] || "N/A"}, ${data.location[1] || "N/A"}`
//             : "N/A",
//         resolvedBy: resolvedBy,
//         detections: detectionDetails,
//       };
//     },
//     [formatDate, resolveReference]
//   );

//   const createLogEntry = useCallback(
//     async (alertId, alertData, action) => {
//       try {
//         await runTransaction(db, async (transaction) => {
//           const q = query(
//             collection(db, "logs"),
//             where("alertId", "==", doc(db, "alerts", alertId)),
//             limit(1)
//           );
//           const querySnapshot = await getDocs(q);

//           if (!querySnapshot.empty) {
//             console.log(
//               `Log entry for alert ${alertId} already exists in logs collection`
//             );
//             return;
//           }

//           const logEntry = {
//             alertId: doc(db, "alerts", alertId),
//             action: action,
//             occur_at:
//               action === "alert_created"
//                 ? alertData.occur_at || new Date()
//                 : new Date(),
//             deviceId: alertData.deviceId || "unknown",
//             userId:
//               alertData.resolvedBy ||
//               (user ? doc(db, "users", user.uid) : "system"),
//             securityNotified: alertData.status === "approved" || false,
//             notes: alertData.notes || "",
//           };

//           const newLogRef = doc(collection(db, "logs"));
//           transaction.set(newLogRef, logEntry);
//           console.log(
//             `Log entry created for alert ${alertId} with action ${action}`
//           );
//           setProcessedAlertIds((prev) => new Set(prev).add(alertId));
//         });
//       } catch (error) {
//         console.error("Error creating log entry:", error);
//         let errorMessage = "Failed to create log entry.";
//         if (error.code === "permission-denied") {
//           errorMessage = "Permission denied: Unable to create log entry.";
//         } else if (error.code === "unavailable") {
//           errorMessage =
//             "Network error: Please check your internet connection.";
//         }
//         setError(errorMessage);
//         Alert.alert("Error", errorMessage);
//       }
//     },
//     [user]
//   );

//   const fetchAlerts = useCallback(async () => {
//     setRefreshing(true);
//     setError(null);
//     try {
//       let alertsList = [];

//       if (logId) {
//         const logDocRef = doc(db, "logs", logId);
//         const logDocSnap = await getDoc(logDocRef);
//         if (logDocSnap.exists()) {
//           const logData = logDocSnap.data();
//           const alertRef = logData.alertId;

//           if (alertRef) {
//             const alertData = await resolveReference(alertRef, "alerts");
//             if (alertData !== "Unknown") {
//               const transformedAlert = await transformAlertData({
//                 id: alertData.id,
//                 data: () => alertData,
//               });
//               alertsList = [transformedAlert];
//             }
//           }
//         } else {
//           throw new Error("Log entry not found");
//         }
//       } else {
//         let alertsQuery;
//         if (role === "admin") {
//           alertsQuery = query(
//             collection(db, "alerts"),
//             orderBy("occur_at", "desc"),
//             limit(50)
//           );
//         } else if (role === "security") {
//           alertsQuery = query(
//             collection(db, "alerts"),
//             where("status", "==", "approved"),
//             orderBy("occur_at", "desc"),
//             limit(50)
//           );
//         } else {
//           throw new Error("Invalid user role");
//         }

//         const querySnapshot = await getDocs(alertsQuery);
//         if (querySnapshot.empty) {
//           setAlerts([]);
//           setFilteredAlerts([]);
//           return;
//         }

//         alertsList = await Promise.all(
//           querySnapshot.docs.map((doc) => transformAlertData(doc))
//         );
//       }

//       setAlerts(alertsList);
//       applyFilters(alertsList, filter, search, sortBy);
//     } catch (error) {
//       console.error("Error fetching alerts:", error);
//       let errorMessage = "Failed to fetch alerts.";
//       if (error.code === "permission-denied") {
//         errorMessage = "Permission denied: Unable to fetch alerts.";
//       } else if (error.code === "unavailable") {
//         errorMessage = "Network error: Please check your internet connection.";
//       }
//       setError(errorMessage);
//       Alert.alert("Error", errorMessage);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [role, filter, search, sortBy, logId, transformAlertData]);

//   // Use useFocusEffect to manage the listener based on screen focus
//   useFocusEffect(
//     useCallback(() => {
//       if (!user) return;

//       console.log(
//         "AlertsPage focused - Setting up listener for user:",
//         user.uid,
//         "role:",
//         role
//       );

//       const setupListeners = async () => {
//         try {
//           if (logId) {
//             const logDocRef = doc(db, "logs", logId);
//             unsubscribeRef.current = onSnapshot(
//               logDocRef,
//               async (logDocSnap) => {
//                 if (logDocSnap.exists()) {
//                   const logData = logDocSnap.data();
//                   const alertRef = logData.alertId;

//                   if (alertRef) {
//                     const alertData = await resolveReference(
//                       alertRef,
//                       "alerts"
//                     );
//                     if (alertData !== "Unknown") {
//                       const transformedAlert = await transformAlertData({
//                         id: alertData.id,
//                         data: () => alertData,
//                       });
//                       const alertsList = [transformedAlert];
//                       setAlerts(alertsList);
//                       applyFilters(alertsList, filter, search, sortBy);
//                     } else {
//                       setAlerts([]);
//                       setFilteredAlerts([]);
//                     }
//                   } else {
//                     setAlerts([]);
//                     setFilteredAlerts([]);
//                   }
//                 } else {
//                   setError("Log entry not found");
//                   setAlerts([]);
//                   setFilteredAlerts([]);
//                 }
//                 setLoading(false);
//               },
//               (error) => {
//                 console.error("Error in real-time log listener:", error);
//                 let errorMessage = "Failed to load log in real-time.";
//                 if (error.code === "permission-denied") {
//                   errorMessage = "Permission denied: Unable to load log.";
//                 } else if (error.code === "unavailable") {
//                   errorMessage =
//                     "Network error: Please check your internet connection.";
//                 }
//                 setError(errorMessage);
//                 Alert.alert("Error", errorMessage);
//                 fetchAlerts();
//               }
//             );
//           } else {
//             let alertsQuery;
//             if (role === "admin") {
//               alertsQuery = query(
//                 collection(db, "alerts"),
//                 orderBy("occur_at", "desc"),
//                 limit(50)
//               );
//             } else if (role === "security") {
//               alertsQuery = query(
//                 collection(db, "alerts"),
//                 where("status", "==", "approved"),
//                 orderBy("occur_at", "desc"),
//                 limit(50)
//               );
//             } else {
//               throw new Error("Invalid user role");
//             }

//             unsubscribeRef.current = onSnapshot(
//               alertsQuery,
//               async (querySnapshot) => {
//                 const changes = querySnapshot.docChanges();

//                 for (const change of changes) {
//                   const doc = change.doc;
//                   const alertId = doc.id;
//                   const alertData = doc.data();

//                   if (
//                     change.type === "added" &&
//                     !processedAlertIds.has(alertId)
//                   ) {
//                     await createLogEntry(alertId, alertData, "alert_created");
//                   }
//                 }

//                 const alertsList = await Promise.all(
//                   querySnapshot.docs.map((doc) => transformAlertData(doc))
//                 );
//                 setAlerts(alertsList);
//                 applyFilters(alertsList, filter, search, sortBy);
//                 setLoading(false);
//               },
//               (error) => {
//                 console.error("Error in real-time alerts listener:", error);
//                 let errorMessage = "Failed to load alerts in real-time.";
//                 if (error.code === "permission-denied") {
//                   errorMessage = "Permission denied: Unable to load alerts.";
//                 } else if (error.code === "unavailable") {
//                   errorMessage =
//                     "Network error: Please check your internet connection.";
//                 }
//                 setError(errorMessage);
//                 Alert.alert("Error", errorMessage);
//                 fetchAlerts();
//               }
//             );
//           }
//         } catch (error) {
//           console.error("Error setting up alerts listener:", error);
//           let errorMessage = "Error setting up real-time listener.";
//           if (error.code === "permission-denied") {
//             errorMessage = "Permission denied: Unable to set up listener.";
//           } else if (error.code === "unavailable") {
//             errorMessage =
//               "Network error: Please check your internet connection.";
//           }
//           setError(errorMessage);
//           Alert.alert("Error", errorMessage);
//           fetchAlerts();
//         }
//       };

//       setupListeners();

//       return () => {
//         if (unsubscribeRef.current) {
//           console.log(
//             "AlertsPage unfocused - Unsubscribing from alerts listener"
//           );
//           unsubscribeRef.current();
//           unsubscribeRef.current = null;
//         }
//       };
//     }, [
//       user,
//       role,
//       filter,
//       search,
//       sortBy,
//       logId,
//       transformAlertData,
//       createLogEntry,
//       processedAlertIds,
//     ])
//   );

//   const applyFilters = useCallback(
//     (alertsList, filterObj, searchText, sortOption) => {
//       let filtered = [...alertsList];

//       // Filter by status
//       if (filterObj.status !== "All") {
//         filtered = filtered.filter(
//           (alert) =>
//             alert.status.toLowerCase() === filterObj.status.toLowerCase()
//         );
//       }

//       // Filter by device
//       if (filterObj.device !== "All") {
//         filtered = filtered.filter(
//           (alert) => alert.deviceId === filterObj.device
//         );
//       }

//       // Filter by detection type
//       if (filterObj.detectionType !== "All") {
//         filtered = filtered.filter((alert) =>
//           alert.detections.some(
//             (detection) => detection.type === filterObj.detectionType
//           )
//         );
//       }

//       // Filter by date range
//       if (filterObj.startDate || filterObj.endDate) {
//         filtered = filtered.filter((alert) => {
//           if (!alert.occurAtTimestamp) return false;
//           const alertDate = alert.occurAtTimestamp.toDate();
//           const start = filterObj.startDate
//             ? new Date(filterObj.startDate)
//             : null;
//           const end = filterObj.endDate ? new Date(filterObj.endDate) : null;

//           if (start && end) {
//             return alertDate >= start && alertDate <= end;
//           } else if (start) {
//             return alertDate >= start;
//           } else if (end) {
//             return alertDate <= end;
//           }
//           return true;
//         });
//       }

//       // Filter by search text
//       if (searchText) {
//         const searchLower = searchText.toLowerCase();
//         filtered = filtered.filter((alert) =>
//           [alert.occurAt, alert.deviceId, alert.notes, alert.location].some(
//             (field) => field && field.toLowerCase().includes(searchLower)
//           )
//         );
//       }

//       // Apply sorting
//       filtered.sort((a, b) => {
//         if (sortOption === "dateDesc") {
//           return (
//             (b.occurAtTimestamp?.toDate().getTime() || 0) -
//             (a.occurAtTimestamp?.toDate().getTime() || 0)
//           );
//         } else if (sortOption === "dateAsc") {
//           return (
//             (a.occurAtTimestamp?.toDate().getTime() || 0) -
//             (b.occurAtTimestamp?.toDate().getTime() || 0)
//           );
//         } else if (sortOption === "status") {
//           return a.status.localeCompare(b.status);
//         } else if (sortOption === "device") {
//           return a.deviceId.localeCompare(b.deviceId);
//         }
//         return 0;
//       });

//       setFilteredAlerts(filtered);
//     },
//     []
//   );

//   const clearFilters = () => {
//     setFilter({
//       status: "All",
//       device: "All",
//       detectionType: "All",
//       startDate: null,
//       endDate: null,
//     });
//     setSearch("");
//     setSortBy("dateDesc");
//     applyFilters(
//       alerts,
//       {
//         status: "All",
//         device: "All",
//         detectionType: "All",
//         startDate: null,
//         endDate: null,
//       },
//       "",
//       "dateDesc"
//     );
//   };

//   const pageData = useMemo(
//     () => [
//       { type: "header", id: "header" },
//       ...(role === "admin"
//         ? [{ type: "filterSearch", id: "filterSearch" }]
//         : []),
//       { type: "alerts", id: "alerts", data: filteredAlerts },
//     ],
//     [role, filteredAlerts]
//   );

//   const renderItem = useCallback(
//     ({ item }) => {
//       switch (item.type) {
//         case "header":
//           return (
//             <View style={styles.header}>
//               <Text style={styles.headerText}>
//                 {logId ? `Alert for Log ${logId}` : "Alerts"}
//               </Text>
//               <TouchableOpacity
//                 style={styles.refreshButton}
//                 onPress={fetchAlerts}
//               >
//                 <Icon name="refresh" size={20} color="#fff" />
//               </TouchableOpacity>
//             </View>
//           );
//         case "filterSearch":
//           return (
//             <View style={styles.filterContainer}>
//               <View style={styles.filterRow}>
//                 <View style={styles.pickerContainer}>
//                   <Text style={styles.filterLabel}>Status</Text>
//                   <Picker
//                     selectedValue={filter.status}
//                     onValueChange={(itemValue) => {
//                       const newFilter = { ...filter, status: itemValue };
//                       setFilter(newFilter);
//                       applyFilters(alerts, newFilter, search, sortBy);
//                     }}
//                     style={styles.picker}
//                   >
//                     <Picker.Item label="All" value="All" />
//                     <Picker.Item label="Pending" value="pending" />
//                     <Picker.Item label="Approved" value="approved" />
//                     <Picker.Item label="Rejected" value="rejected" />
//                   </Picker>
//                 </View>
//                 <View style={styles.pickerContainer}>
//                   <Text style={styles.filterLabel}>Device</Text>
//                   <Picker
//                     selectedValue={filter.device}
//                     onValueChange={(itemValue) => {
//                       const newFilter = { ...filter, device: itemValue };
//                       setFilter(newFilter);
//                       applyFilters(alerts, newFilter, search, sortBy);
//                     }}
//                     style={styles.picker}
//                   >
//                     <Picker.Item label="All" value="All" />
//                     {devices.map((device) => (
//                       <Picker.Item
//                         key={device.id}
//                         label={device.name}
//                         value={device.name}
//                       />
//                     ))}
//                   </Picker>
//                 </View>
//               </View>
//               <View style={styles.filterRow}>
//                 <View style={styles.pickerContainer}>
//                   <Text style={styles.filterLabel}>Detection Type</Text>
//                   <Picker
//                     selectedValue={filter.detectionType}
//                     onValueChange={(itemValue) => {
//                       const newFilter = { ...filter, detectionType: itemValue };
//                       setFilter(newFilter);
//                       applyFilters(alerts, newFilter, search, sortBy);
//                     }}
//                     style={styles.picker}
//                   >
//                     <Picker.Item label="All" value="All" />
//                     <Picker.Item label="Image" value="image" />
//                     <Picker.Item label="Smoke" value="smoke" />
//                     <Picker.Item label="Sound" value="sound" />
//                   </Picker>
//                 </View>
//                 <View style={styles.pickerContainer}>
//                   <Text style={styles.filterLabel}>Sort By</Text>
//                   <Picker
//                     selectedValue={sortBy}
//                     onValueChange={(itemValue) => {
//                       setSortBy(itemValue);
//                       applyFilters(alerts, filter, search, itemValue);
//                     }}
//                     style={styles.picker}
//                   >
//                     <Picker.Item label="Date (Newest First)" value="dateDesc" />
//                     <Picker.Item label="Date (Oldest First)" value="dateAsc" />
//                     <Picker.Item label="Status" value="status" />
//                     <Picker.Item label="Device" value="device" />
//                   </Picker>
//                 </View>
//               </View>
//               <View style={styles.filterRow}>
//                 <TouchableOpacity
//                   style={styles.dateButton}
//                   onPress={() => setShowDatePicker({ start: true, end: false })}
//                 >
//                   <Text style={styles.dateButtonText}>
//                     {filter.startDate
//                       ? `Start: ${formatDate(filter.startDate)}`
//                       : "Start Date"}
//                   </Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={styles.dateButton}
//                   onPress={() => setShowDatePicker({ start: false, end: true })}
//                 >
//                   <Text style={styles.dateButtonText}>
//                     {filter.endDate
//                       ? `End: ${formatDate(filter.endDate)}`
//                       : "End Date"}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//               {showDatePicker.start && (
//                 <DateTimePicker
//                   value={filter.startDate || new Date()}
//                   mode="date"
//                   display="default"
//                   onChange={(event, selectedDate) => {
//                     setShowDatePicker({ start: false, end: false });
//                     if (selectedDate) {
//                       const newFilter = { ...filter, startDate: selectedDate };
//                       setFilter(newFilter);
//                       applyFilters(alerts, newFilter, search, sortBy);
//                     }
//                   }}
//                 />
//               )}
//               {showDatePicker.end && (
//                 <DateTimePicker
//                   value={filter.endDate || new Date()}
//                   mode="date"
//                   display="default"
//                   onChange={(event, selectedDate) => {
//                     setShowDatePicker({ start: false, end: false });
//                     if (selectedDate) {
//                       const newFilter = { ...filter, endDate: selectedDate };
//                       setFilter(newFilter);
//                       applyFilters(alerts, newFilter, search, sortBy);
//                     }
//                   }}
//                 />
//               )}
//               <View style={styles.searchContainer}>
//                 <Icon
//                   name="search"
//                   size={20}
//                   color="white"
//                   style={styles.searchIcon}
//                 />
//                 <TextInput
//                   style={styles.searchInput}
//                   placeholder="Search by date, device, or notes"
//                   placeholderTextColor="#999"
//                   value={search}
//                   onChangeText={(text) => {
//                     setSearch(text);
//                     applyFilters(alerts, filter, text, sortBy);
//                   }}
//                 />
//               </View>
//               <TouchableOpacity
//                 style={styles.clearButton}
//                 onPress={clearFilters}
//               >
//                 <Text style={styles.clearButtonText}>Clear Filters</Text>
//               </TouchableOpacity>
//             </View>
//           );
//         case "alerts":
//           return item.data.length > 0 ? (
//             item.data.map((alert) => (
//               <Animated.View key={alert.id} entering={FadeIn}>
//                 <TouchableOpacity
//                   style={styles.alertItem}
//                   onPress={() =>
//                     router.push({
//                       pathname: "/(tabs)/AlertDetailPage",
//                       params: { alertId: alert.id },
//                     })
//                   }
//                 >
//                   <View style={styles.alertContent}>
//                     <View>
//                       <Text style={styles.alertTimestamp}>
//                         Detected: {alert.occurAt}
//                       </Text>
//                       <Text
//                         style={[
//                           styles.alertStatus,
//                           { color: getStatusColor(alert.status) },
//                         ]}
//                       >
//                         Status: {alert.status}
//                       </Text>
//                       <Text style={styles.alertConfidence}>
//                         Device: {alert.deviceId}
//                       </Text>
//                       <Text style={styles.alertConfidence}>
//                         Location: {alert.location}
//                       </Text>
//                       {alert.notes && (
//                         <Text style={styles.alertConfidence}>
//                           Notes: {alert.notes}
//                         </Text>
//                       )}
//                       {alert.resolvedBy !== "unknown" && (
//                         <Text style={styles.alertConfidence}>
//                           Resolved By: {alert.resolvedBy}
//                         </Text>
//                       )}
//                       {alert.resolvedAt !== "N/A" && (
//                         <Text style={styles.alertConfidence}>
//                           Resolved At: {alert.resolvedAt}
//                         </Text>
//                       )}
//                       {alert.detections.length > 0 && (
//                         <View style={styles.detectionsContainer}>
//                           <Text style={styles.detectionsTitle}>
//                             Detections:
//                           </Text>
//                           {alert.detections.map((detection, index) => (
//                             <View key={index} style={styles.detectionItem}>
//                               <Text style={styles.detectionText}>
//                                 Type: {detection.type}
//                               </Text>
//                               {detection.confidence && (
//                                 <Text style={styles.detectionText}>
//                                   Confidence:{" "}
//                                   {(detection.confidence * 100).toFixed(2)}%
//                                 </Text>
//                               )}
//                               {detection.level && (
//                                 <Text style={styles.detectionText}>
//                                   Level: {detection.level}
//                                 </Text>
//                               )}
//                               <Text style={styles.detectionText}>
//                                 Timestamp: {detection.timestamp}
//                               </Text>
//                               {detection.urls && detection.urls.length > 0 && (
//                                 <Text style={styles.detectionText}>
//                                   Media URLs: {detection.urls.join(", ")}
//                                 </Text>
//                               )}
//                             </View>
//                           ))}
//                         </View>
//                       )}
//                       {role === "security" && alert.status === "approved" && (
//                         <Text style={styles.receivedText}>Received</Text>
//                       )}
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               </Animated.View>
//             ))
//           ) : (
//             <Text style={styles.emptyText}>No alerts found</Text>
//           );
//         default:
//           return null;
//       }
//     },
//     [
//       filter,
//       search,
//       sortBy,
//       role,
//       alerts,
//       filteredAlerts,
//       fetchAlerts,
//       logId,
//       devices,
//     ]
//   );

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "#FF9800";
//       case "approved":
//         return "#4CAF50";
//       case "rejected":
//         return "#D32F2F";
//       default:
//         return "white";
//     }
//   };

//   if (loading && !error) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4CAF50" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {error && (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity onPress={fetchAlerts} style={styles.retryButton}>
//             <Text style={styles.retryText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//       <FlatList
//         data={pageData}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 20 }}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={fetchAlerts} />
//         }
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#121212" },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     backgroundColor: "#121212",
//   },
//   errorContainer: {
//     backgroundColor: "#2a2a2a",
//     padding: 10,
//     margin: 10,
//     borderRadius: 5,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   errorText: { color: "#D32F2F", fontSize: 14 },
//   retryButton: {
//     backgroundColor: "#4CAF50",
//     padding: 5,
//     borderRadius: 5,
//   },
//   retryText: { color: "#fff", fontSize: 14 },
//   header: {
//     padding: 15,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#1a1a1a",
//   },
//   headerText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
//   filterContainer: {
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//   },
//   filterRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 10,
//   },
//   pickerContainer: {
//     flex: 1,
//     marginHorizontal: 5,
//   },
//   filterLabel: {
//     color: "#fff",
//     fontSize: 14,
//     marginBottom: 5,
//   },
//   picker: {
//     width: "100%",
//     color: "#fff",
//     backgroundColor: "#4CAF50",
//     borderRadius: 5,
//   },
//   dateButton: {
//     flex: 1,
//     backgroundColor: "#4CAF50",
//     padding: 10,
//     borderRadius: 5,
//     marginHorizontal: 5,
//     alignItems: "center",
//   },
//   dateButtonText: {
//     color: "#fff",
//     fontSize: 14,
//   },
//   refreshButton: { padding: 5 },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 5,
//   },
//   searchIcon: { position: "absolute", left: 10, zIndex: 1 },
//   searchInput: {
//     flex: 1,
//     height: 50,
//     borderColor: "#4CAF50",
//     borderWidth: 1,
//     borderRadius: 5,
//     paddingLeft: 40,
//     paddingRight: 10,
//     color: "white",
//     backgroundColor: "#1a1a1a",
//   },
//   clearButton: {
//     backgroundColor: "#D32F2F",
//     padding: 10,
//     borderRadius: 5,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   clearButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   alertItem: {
//     backgroundColor: "#333",
//     padding: 10,
//     borderRadius: 5,
//     marginVertical: 5,
//     marginHorizontal: 10,
//   },
//   alertContent: { flexDirection: "row", justifyContent: "space-between" },
//   alertTimestamp: { color: "#fff", fontSize: 14 },
//   alertStatus: { fontSize: 14, fontWeight: "bold" },
//   alertConfidence: { color: "#999", fontSize: 12 },
//   receivedText: { color: "#4CAF50", fontSize: 12, marginTop: 5 },
//   emptyText: {
//     color: "#fff",
//     fontSize: 16,
//     textAlign: "center",
//     marginTop: 20,
//   },
//   detectionsContainer: {
//     marginTop: 10,
//   },
//   detectionsTitle: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "bold",
//     marginBottom: 5,
//   },
//   detectionItem: {
//     marginBottom: 5,
//   },
//   detectionText: {
//     color: "#999",
//     fontSize: 12,
//   },
// });

// export default AlertsPage;
// !Woring COde
// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
//   useRef,
// } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
// } from "react-native";
// import { useRouter, useFocusEffect } from "expo-router";
// import Animated, { FadeIn } from "react-native-reanimated";
// import Icon from "react-native-vector-icons/Ionicons";
// import { db } from "../../services/firebase";
// import {
//   collection,
//   query,
//   where,
//   limit,
//   getDocs,
//   onSnapshot,
//   getDoc,
//   doc,
//   startAfter,
// } from "firebase/firestore";
// import { useAuth } from "../../context/authContext";

// const AlertsPage = () => {
//   const [alerts, setAlerts] = useState([]);
//   const [filteredAlerts, setFilteredAlerts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);
//   const [lastDoc, setLastDoc] = useState(null);
//   const [hasMore, setHasMore] = useState(true);
//   const [isLoadingMore, setIsLoadingMore] = useState(false);
//   const [listenerErrorCount, setListenerErrorCount] = useState(0);

//   const deviceCache = useRef(new Map()).current;
//   const userCache = useRef(new Map()).current;
//   const unsubscribeRef = useRef(null); // Use a ref to store the unsubscribe function

//   const router = useRouter();
//   const { user, role } = useAuth();

//   // Debug mounting/unmounting
//   useEffect(() => {
//     console.log("AlertsPage mounted");
//     return () => {
//       console.log("AlertsPage unmounted");
//     };
//   }, []);

//   const formatDate = useCallback((timestamp) => {
//     if (!timestamp) return "N/A";
//     try {
//       const date = timestamp.toDate();
//       return date.toLocaleString();
//     } catch (error) {
//       console.warn("Invalid timestamp format:", timestamp);
//       return "N/A";
//     }
//   }, []);

//   const resolveReference = useCallback(
//     async (field, path) => {
//       if (!field) return "Unknown";

//       const cache = path === "devices" ? deviceCache : userCache;
//       const fieldId = typeof field === "string" ? field : field.id;

//       if (cache.has(fieldId)) {
//         return cache.get(fieldId);
//       }

//       try {
//         let docRef;
//         if (field && typeof field === "object" && "path" in field) {
//           docRef = field;
//         } else if (typeof field === "string") {
//           docRef = doc(db, path, field);
//         } else {
//           return "Unknown";
//         }
//         const docSnap = await getDoc(docRef);
//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           const resolvedValue =
//             path === "devices"
//               ? data.name || docSnap.id
//               : data.username || docSnap.id;
//           cache.set(fieldId, resolvedValue);
//           return resolvedValue;
//         }
//         return docRef.id;
//       } catch (error) {
//         console.error(`Error resolving ${path} reference:`, error);
//         return "Unknown";
//       }
//     },
//     [deviceCache, userCache]
//   );

//   const transformAlertData = useCallback(
//     async (doc) => {
//       const data = doc.data();
//       const deviceId = await resolveReference(data.deviceId, "devices");

//       const detections = data.detections || {};
//       const detectionDetails = [];

//       if (detections.image) {
//         detectionDetails.push({
//           type: detections.image.type || "image",
//           confidence: detections.image.confidence || 0,
//           timestamp: formatDate(detections.image.timestamp),
//           detected: detections.image.detected || false,
//           imageUrl: detections.image.imageUrl || "N/A",
//         });
//       }
//       if (detections.smoke) {
//         detectionDetails.push({
//           type: "smoke",
//           level: detections.smoke.level || 0,
//           timestamp: formatDate(detections.smoke.timestamp),
//           detected: detections.smoke.detected || false,
//         });
//       }
//       if (detections.sound) {
//         detectionDetails.push({
//           type: detections.sound.type || "sound",
//           confidence: detections.sound.confidence || 0,
//           timestamp: formatDate(detections.sound.timestamp),
//           detected: detections.sound.detected || false,
//           soundUrl: detections.sound.soundUrl || "N/A",
//         });
//       }

//       return {
//         id: doc.id,
//         occurAt: formatDate(data.occur_at),
//         occurAtTimestamp: data.occur_at,
//         status: data.status || "pending",
//         deviceId: deviceId,
//         location:
//           Array.isArray(data.location) && data.location.length === 2
//             ? `${data.location[0] || "N/A"}, ${data.location[1] || "N/A"}`
//             : "N/A",
//         detections: detectionDetails,
//       };
//     },
//     [formatDate, resolveReference]
//   );

//   const fetchAlerts = useCallback(
//     async (isRefresh = false) => {
//       if (isRefresh) {
//         setRefreshing(true);
//         setLastDoc(null);
//         setHasMore(true);
//       }
//       setError(null);
//       try {
//         let alertsQuery;
//         if (role === "admin") {
//           alertsQuery = query(collection(db, "alerts"), limit(10));
//         } else if (role === "security") {
//           alertsQuery = query(
//             collection(db, "alerts"),
//             where("status", "==", "approved"),
//             limit(10)
//           );
//         } else {
//           throw new Error("Invalid user role");
//         }

//         if (!isRefresh && lastDoc && !isLoadingMore) {
//           alertsQuery = query(
//             collection(db, "alerts"),
//             where("status", "==", "approved"),
//             startAfter(lastDoc),
//             limit(10)
//           );
//         }

//         const querySnapshot = await getDocs(alertsQuery);
//         if (querySnapshot.empty) {
//           if (isRefresh) {
//             setAlerts([]);
//             setFilteredAlerts([]);
//           }
//           setHasMore(false);
//           return;
//         }

//         const newAlerts = await Promise.all(
//           querySnapshot.docs.map((doc) => transformAlertData(doc))
//         );

//         const sortedAlerts = newAlerts.sort((a, b) => {
//           const aTime = a.occurAtTimestamp
//             ? a.occurAtTimestamp.toDate().getTime()
//             : 0;
//           const bTime = b.occurAtTimestamp
//             ? b.occurAtTimestamp.toDate().getTime()
//             : 0;
//           return bTime - aTime;
//         });

//         setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);

//         if (isRefresh) {
//           setAlerts(sortedAlerts);
//           setFilteredAlerts(sortedAlerts);
//         } else {
//           setAlerts((prev) => {
//             const updatedAlerts = [...prev, ...sortedAlerts];
//             return updatedAlerts.sort((a, b) => {
//               const aTime = a.occurAtTimestamp
//                 ? a.occurAtTimestamp.toDate().getTime()
//                 : 0;
//               const bTime = b.occurAtTimestamp
//                 ? b.occurAtTimestamp.toDate().getTime()
//                 : 0;
//               return bTime - aTime;
//             });
//           });
//           setFilteredAlerts((prev) => {
//             const updatedFilteredAlerts = [...prev, ...sortedAlerts];
//             return updatedFilteredAlerts.sort((a, b) => {
//               const aTime = a.occurAtTimestamp
//                 ? a.occurAtTimestamp.toDate().getTime()
//                 : 0;
//               const bTime = b.occurAtTimestamp
//                 ? b.occurAtTimestamp.toDate().getTime()
//                 : 0;
//               return bTime - aTime;
//             });
//           });
//         }

//         setHasMore(querySnapshot.docs.length === 10);
//       } catch (error) {
//         console.error("Error fetching alerts:", error);
//         let errorMessage = "Failed to fetch alerts.";
//         if (error.code === "permission-denied") {
//           errorMessage = "Permission denied: Unable to fetch alerts.";
//         } else if (error.code === "unavailable") {
//           errorMessage =
//             "Network error: Please check your internet connection.";
//         }
//         setError(errorMessage);
//         Alert.alert("Error", errorMessage);
//       } finally {
//         setLoading(false);
//         setRefreshing(false);
//         setIsLoadingMore(false);
//       }
//     },
//     [role, transformAlertData, lastDoc, isLoadingMore]
//   );

//   const loadMoreAlerts = useCallback(() => {
//     if (!hasMore || isLoadingMore) return;
//     setIsLoadingMore(true);
//     fetchAlerts();
//   }, [hasMore, isLoadingMore, fetchAlerts]);

//   // Use useFocusEffect to manage the listener based on screen focus
//   useFocusEffect(
//     useCallback(() => {
//       if (!user) return;

//       console.log(
//         "AlertsPage focused - Setting up listener for user:",
//         user.uid,
//         "role:",
//         role
//       );

//       const setupListeners = async () => {
//         try {
//           let alertsQuery;
//           if (role === "admin") {
//             alertsQuery = query(collection(db, "alerts"), limit(10));
//           } else if (role === "security") {
//             alertsQuery = query(
//               collection(db, "alerts"),
//               where("status", "==", "approved"),
//               limit(10)
//             );
//           } else {
//             throw new Error("Invalid user role");
//           }

//           // Ensure any existing listener is unsubscribed before setting up a new one
//           if (unsubscribeRef.current) {
//             console.log(
//               "Unsubscribing existing listener before setting up new one"
//             );
//             unsubscribeRef.current();
//           }

//           unsubscribeRef.current = onSnapshot(
//             alertsQuery,
//             async (querySnapshot) => {
//               if (querySnapshot.empty) {
//                 setAlerts([]);
//                 setFilteredAlerts([]);
//                 setHasMore(false);
//                 setLoading(false);
//                 return;
//               }

//               const alertsList = await Promise.all(
//                 querySnapshot.docs.map((doc) => transformAlertData(doc))
//               );

//               const sortedAlerts = alertsList.sort((a, b) => {
//                 const aTime = a.occurAtTimestamp
//                   ? a.occurAtTimestamp.toDate().getTime()
//                   : 0;
//                 const bTime = b.occurAtTimestamp
//                   ? b.occurAtTimestamp.toDate().getTime()
//                   : 0;
//                 return bTime - aTime;
//               });

//               setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
//               setAlerts(sortedAlerts);
//               setFilteredAlerts(sortedAlerts);
//               setHasMore(querySnapshot.docs.length === 10);
//               setLoading(false);
//               setListenerErrorCount(0);
//             },
//             (error) => {
//               console.error("Detailed error in real-time alerts listener:", {
//                 errorCode: error.code,
//                 errorMessage: error.message,
//                 role: role,
//                 userId: user?.uid,
//               });

//               let errorMessage = "Failed to load alerts in real-time.";
//               if (error.code === "permission-denied") {
//                 errorMessage =
//                   "Permission denied: Unable to load alerts in real-time.";
//               } else if (error.code === "unavailable") {
//                 errorMessage =
//                   "Network error: Please check your internet connection.";
//               }

//               setListenerErrorCount((prev) => prev + 1);

//               if (listenerErrorCount < 1) {
//                 setError(errorMessage);
//                 Alert.alert("Error", errorMessage);
//                 fetchAlerts(true);
//               } else {
//                 console.warn(
//                   "Suppressing repeated real-time listener error to prevent loop."
//                 );
//               }
//             }
//           );
//         } catch (error) {
//           console.error("Error setting up alerts listener:", error);
//           let errorMessage = "Error setting up real-time listener.";
//           if (error.code === "permission-denied") {
//             errorMessage = "Permission denied: Unable to set up listener.";
//           } else if (error.code === "unavailable") {
//             errorMessage =
//               "Network error: Please check your internet connection.";
//           }
//           setError(errorMessage);
//           Alert.alert("Error", errorMessage);
//           fetchAlerts(true);
//         }
//       };

//       setupListeners();

//       return () => {
//         if (unsubscribeRef.current) {
//           console.log(
//             "AlertsPage unfocused - Unsubscribing from alerts listener"
//           );
//           unsubscribeRef.current();
//           unsubscribeRef.current = null;
//         }
//       };
//     }, [user, role, transformAlertData])
//   );

//   const pageData = useMemo(
//     () => [
//       { type: "header", id: "header" },
//       { type: "alerts", id: "alerts", data: filteredAlerts },
//     ],
//     [filteredAlerts]
//   );

//   const renderItem = useCallback(
//     ({ item }) => {
//       switch (item.type) {
//         case "header":
//           return (
//             <View style={styles.header}>
//               <Text style={styles.headerText}>Alerts</Text>
//               <TouchableOpacity
//                 style={styles.refreshButton}
//                 onPress={() => fetchAlerts(true)}
//               >
//                 <Icon name="refresh" size={20} color="#fff" />
//               </TouchableOpacity>
//             </View>
//           );
//         case "alerts":
//           return item.data.length > 0 ? (
//             item.data.map((alert) => (
//               <Animated.View key={alert.id} entering={FadeIn}>
//                 <TouchableOpacity
//                   style={styles.alertItem}
//                   onPress={() => {
//                     console.log(
//                       "Navigating to AlertDetailPage with alertId:",
//                       alert.id
//                     );
//                     router.push({
//                       pathname: "/(tabs)/AlertDetailPage",
//                       params: { alertId: alert.id },
//                     });
//                   }}
//                 >
//                   <View style={styles.alertContent}>
//                     <View style={styles.alertHeader}>
//                       <Text style={styles.alertTimestamp}>{alert.occurAt}</Text>
//                       <Text
//                         style={[
//                           styles.alertStatus,
//                           { backgroundColor: getStatusColor(alert.status) },
//                         ]}
//                       >
//                         {alert.status}
//                       </Text>
//                     </View>
//                     <View style={styles.alertDetails}>
//                       <View style={styles.detailRow}>
//                         <Icon
//                           name="cube-outline"
//                           size={16}
//                           color="#4CAF50"
//                           style={styles.detailIcon}
//                         />
//                         <Text style={styles.alertDetailText}>
//                           {alert.deviceId}
//                         </Text>
//                       </View>
//                       <View style={styles.detailRow}>
//                         <Icon
//                           name="location-outline"
//                           size={16}
//                           color="#4CAF50"
//                           style={styles.detailIcon}
//                         />
//                         <Text style={styles.alertDetailText}>
//                           {alert.location}
//                         </Text>
//                       </View>
//                     </View>
//                     {alert.detections.length > 0 && (
//                       <View style={styles.detectionsContainer}>
//                         {alert.detections.map((detection, index) => (
//                           <View key={index} style={styles.detectionItem}>
//                             <View style={styles.detectionHeader}>
//                               <Text style={styles.detectionType}>
//                                 {detection.type.toUpperCase()}
//                               </Text>
//                               {detection.confidence ? (
//                                 <Text style={styles.detectionConfidence}>
//                                   {(detection.confidence * 100).toFixed(0)}%
//                                 </Text>
//                               ) : (
//                                 <Text style={styles.detectionLevel}>
//                                   Level: {detection.level}
//                                 </Text>
//                               )}
//                             </View>
//                             <Text style={styles.detectionTimestamp}>
//                               {detection.timestamp}
//                             </Text>
//                           </View>
//                         ))}
//                       </View>
//                     )}
//                     {role === "security" && alert.status === "approved" && (
//                       <Text style={styles.receivedText}>Received</Text>
//                     )}
//                   </View>
//                 </TouchableOpacity>
//               </Animated.View>
//             ))
//           ) : (
//             <Text style={styles.emptyText}>No approved alerts found</Text>
//           );
//         default:
//           return null;
//       }
//     },
//     [role, filteredAlerts, fetchAlerts, router]
//   );

//   const renderFooter = useCallback(() => {
//     if (!isLoadingMore) return null;
//     return (
//       <View style={styles.footerLoader}>
//         <ActivityIndicator size="small" color="#4CAF50" />
//       </View>
//     );
//   }, [isLoadingMore]);

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "#FF9800";
//       case "approved":
//         return "#4CAF50";
//       case "rejected":
//         return "#D32F2F";
//       default:
//         return "#FFFFFF";
//     }
//   };

//   if (loading && !error) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <View style={styles.header}>
//           <Text style={styles.headerText}>Alerts</Text>
//           <TouchableOpacity style={styles.refreshButton}>
//             <Icon name="refresh" size={20} color="#fff" />
//           </TouchableOpacity>
//         </View>
//         {[...Array(5)].map((_, index) => (
//           <View key={index} style={styles.skeletonItem}>
//             <View style={styles.skeletonHeader}>
//               <View style={[styles.skeletonText, { width: "60%" }]} />
//               <View style={styles.skeletonStatus} />
//             </View>
//             <View style={styles.skeletonDetails}>
//               <View style={[styles.skeletonText, { width: "40%" }]} />
//               <View style={[styles.skeletonText, { width: "50%" }]} />
//             </View>
//             <View style={styles.skeletonDetection}>
//               <View style={[styles.skeletonText, { width: "30%" }]} />
//               <View style={[styles.skeletonText, { width: "70%" }]} />
//             </View>
//           </View>
//         ))}
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {error && (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity
//             onPress={() => {
//               setError(null);
//               fetchAlerts(true);
//             }}
//             style={styles.retryButton}
//           >
//             <Text style={styles.retryText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//       <FlatList
//         data={pageData}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 20 }}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={() => fetchAlerts(true)}
//           />
//         }
//         onEndReached={loadMoreAlerts}
//         onEndReachedThreshold={0.5}
//         ListFooterComponent={renderFooter}
//         initialNumToRender={5}
//         windowSize={5}
//         removeClippedSubviews={true}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "rgb(0,0,0)" },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: "#121212",
//   },
//   errorContainer: {
//     backgroundColor: "#2a2a2a",
//     padding: 10,
//     margin: 10,
//     borderRadius: 5,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   errorText: { color: "#D32F2F", fontSize: 14 },
//   retryButton: {
//     backgroundColor: "#4CAF50",
//     padding: 5,
//     borderRadius: 5,
//   },
//   retryText: { color: "#fff", fontSize: 14 },
//   header: {
//     padding: 15,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#1a1a1a",
//   },
//   headerText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
//   refreshButton: { padding: 5 },
//   alertItem: {
//     backgroundColor: "#222",
//     padding: 12,
//     borderRadius: 8,
//     marginVertical: 5,
//     marginHorizontal: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   alertContent: {
//     flexDirection: "column",
//   },
//   alertHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   alertTimestamp: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   alertStatus: {
//     fontSize: 12,
//     fontWeight: "bold",
//     color: "#fff",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     textTransform: "capitalize",
//   },
//   alertDetails: {
//     marginBottom: 8,
//   },
//   detailRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   detailIcon: {
//     marginRight: 6,
//   },
//   alertDetailText: {
//     color: "#bbb",
//     fontSize: 13,
//   },
//   detectionsContainer: {
//     borderTopWidth: 1,
//     borderTopColor: "#333",
//     paddingTop: 8,
//   },
//   detectionItem: {
//     backgroundColor: "#2a2a2a",
//     padding: 8,
//     borderRadius: 6,
//     marginBottom: 6,
//   },
//   detectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   detectionType: {
//     color: "#4CAF50",
//     fontSize: 13,
//     fontWeight: "600",
//     textTransform: "uppercase",
//   },
//   detectionConfidence: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "600",
//     backgroundColor: "#4CAF50",
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   detectionLevel: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "600",
//     backgroundColor: "#FF9800",
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   detectionTimestamp: {
//     color: "#999",
//     fontSize: 12,
//   },
//   receivedText: {
//     color: "#4CAF50",
//     fontSize: 12,
//     fontWeight: "600",
//     marginTop: 4,
//     textAlign: "right",
//   },
//   emptyText: {
//     color: "#fff",
//     fontSize: 16,
//     textAlign: "center",
//     marginTop: 20,
//   },
//   footerLoader: {
//     padding: 10,
//     alignItems: "center",
//   },
//   skeletonItem: {
//     backgroundColor: "#222",
//     padding: 12,
//     borderRadius: 8,
//     marginVertical: 5,
//     marginHorizontal: 10,
//   },
//   skeletonHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   skeletonText: {
//     backgroundColor: "#333",
//     height: 14,
//     borderRadius: 4,
//     marginBottom: 4,
//   },
//   skeletonStatus: {
//     backgroundColor: "#333",
//     height: 20,
//     width: 60,
//     borderRadius: 12,
//   },
//   skeletonDetails: {
//     marginBottom: 8,
//   },
//   skeletonDetection: {
//     backgroundColor: "#2a2a2a",
//     padding: 8,
//     borderRadius: 6,
//   },
// });

// export default AlertsPage;

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
  const [searchQuery, setSearchQuery] = useState(""); // Admin only
  const [filterStatus, setFilterStatus] = useState("all"); // Admin only
  const [filterType, setFilterType] = useState("all"); // Admin only

  const deviceCache = useRef(new Map()).current;
  const unsubscribeRef = useRef(null);

  const router = useRouter();
  const { user, role, logout } = useAuth();

  // Log lifecycle events
  useEffect(() => {
    console.log("AlertsPage mounted");
    return () => {
      console.log("AlertsPage unmounted");
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

      return {
        id: doc.id,
        occurAt: formatDate(data.occur_at),
        occurAtTimestamp: data.occur_at,
        status: data.status || "pending",
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
        const sortedAlerts = newAlerts.sort(
          (a, b) =>
            (b.occurAtTimestamp?.toDate().getTime() || 0) -
            (a.occurAtTimestamp?.toDate().getTime() || 0)
        );

        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setAlerts((prev) =>
          isRefresh ? sortedAlerts : [...prev, ...sortedAlerts]
        );
        applyFiltersAndSearch(
          isRefresh ? sortedAlerts : [...alerts, ...sortedAlerts]
        );
        setHasMore(querySnapshot.docs.length === PAGE_SIZE);
      } catch (error) {
        console.error("Error fetching alerts:", error);
        setError("Failed to fetch alerts. Please try again.");
      } finally {
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
      alerts,
      applyFiltersAndSearch,
    ]
  );

  const loadMoreAlerts = useCallback(() => {
    fetchAlerts(false);
  }, [fetchAlerts]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      console.log("AlertsPage focused - Setting up listener");

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
            setAlerts([]);
            setFilteredAlerts([]);
            setHasMore(false);
            setLoading(false);
            return;
          }

          const alertsList = await Promise.all(
            querySnapshot.docs.map(transformAlertData)
          );
          const sortedAlerts = alertsList.sort(
            (a, b) =>
              (b.occurAtTimestamp?.toDate().getTime() || 0) -
              (a.occurAtTimestamp?.toDate().getTime() || 0)
          );

          setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
          setAlerts(sortedAlerts);
          applyFiltersAndSearch(sortedAlerts);
          setHasMore(querySnapshot.docs.length === PAGE_SIZE);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error("Real-time listener error:", error);
          setError("Failed to load alerts in real-time. Retrying...");
          fetchAlerts(true);
        }
      );

      return () => {
        if (unsubscribeRef.current) {
          console.log("AlertsPage unfocused - Unsubscribing");
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      };
    }, [user, role, transformAlertData, applyFiltersAndSearch])
  );

  const applyFiltersAndSearch = useCallback(
    (alertsList) => {
      if (role === "security") {
        setFilteredAlerts(alertsList); // No filtering for security
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

  useEffect(() => {
    applyFiltersAndSearch(alerts);
  }, [alerts, applyFiltersAndSearch]);

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
      { type: "alerts", id: "alerts", data: filteredAlerts },
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
            ))
          ) : (
            <Text style={styles.emptyText}>No alerts found</Text>
          );
        default:
          return null;
      }
    },
    [
      role,
      filteredAlerts,
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
    return (
      {
        pending: "#FF9800",
        approved: "#4CAF50",
        rejected: "#D32F2F",
      }[status] || "#FFFFFF"
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
  headerText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  headerButtons: { flexDirection: "row", alignItems: "center" },
  refreshButton: { padding: 5, marginRight: 10 },
  logoutButton: { padding: 5 },
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
});

export default AlertsPage;
