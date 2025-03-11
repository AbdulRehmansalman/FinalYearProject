// import React, { useState, useEffect } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   Dimensions,
// } from "react-native";
// import { useRouter } from "expo-router";
// import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
// import Icon from "react-native-vector-icons/Ionicons";
// import { LineChart } from "react-native-chart-kit";

// const { width } = Dimensions.get("window");

// const Dashboard = () => {
//   const [device, setDevice] = useState({
//     status: "active",
//     lastPing: "2025-02-25T14:30:00Z",
//   });
//   const [sensorReadings, setSensorReadings] = useState([
//     {
//       timestamp: "2025-02-25T14:25:00Z",
//       type: "smoke",
//       value: { smokeLevel: 0.0 },
//     },
//     {
//       timestamp: "2025-02-25T14:24:00Z",
//       type: "motion",
//       value: { motionDetected: true },
//     },
//     {
//       timestamp: "2025-02-25T14:23:00Z",
//       type: "smoke",
//       value: { smokeLevel: 0.1 },
//     },
//     {
//       timestamp: "2025-02-25T14:22:00Z",
//       type: "motion",
//       value: { motionDetected: false },
//     },
//     {
//       timestamp: "2025-02-25T14:21:00Z",
//       type: "smoke",
//       value: { smokeLevel: 0.0 },
//     },
//     {
//       timestamp: "2025-02-25T14:20:00Z",
//       type: "motion",
//       value: { motionDetected: true },
//     },
//     {
//       timestamp: "2025-02-25T14:19:00Z",
//       type: "smoke",
//       value: { smokeLevel: 0.2 },
//     },
//     {
//       timestamp: "2025-02-25T14:18:00Z",
//       type: "motion",
//       value: { motionDetected: false },
//     },
//     {
//       timestamp: "2025-02-25T14:17:00Z",
//       type: "smoke",
//       value: { smokeLevel: 0.0 },
//     },
//     {
//       timestamp: "2025-02-25T14:16:00Z",
//       type: "motion",
//       value: { motionDetected: true },
//     },
//   ]);
//   const [alerts, setAlerts] = useState([
//     {
//       id: "1",
//       timestamp: "2025-02-25T14:30:00Z",
//       status: "pending",
//       soundConfidence: 0.92,
//       weaponConfidence: 0.87,
//     },
//     {
//       id: "2",
//       timestamp: "2025-02-25T14:25:00Z",
//       status: "approved",
//       soundConfidence: 0.95,
//       weaponConfidence: 0.91,
//     },
//     {
//       id: "3",
//       timestamp: "2025-02-25T14:20:00Z",
//       status: "rejected",
//       soundConfidence: 0.88,
//       weaponConfidence: 0.82,
//     },
//     {
//       id: "4",
//       timestamp: "2025-02-25T14:15:00Z",
//       status: "pending",
//       soundConfidence: 0.93,
//       weaponConfidence: 0.89,
//     },
//     {
//       id: "5",
//       timestamp: "2025-02-25T14:10:00Z",
//       status: "approved",
//       soundConfidence: 0.97,
//       weaponConfidence: 0.94,
//     },
//   ]);
//   const [stats, setStats] = useState({ pending: 2, approved: 2, rejected: 1 });
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     const timer = setTimeout(() => setLoading(false), 1000);
//     return () => clearTimeout(timer);
//   }, []);

//   //  Dummy Chart data for sensor readings
//   const chartData = {
//     labels: sensorReadings
//       .map((reading) => reading.timestamp.split("T")[1].slice(0, 5))
//       .slice(0, 10),
//     datasets: [
//       {
//         data: sensorReadings
//           .map((reading) =>
//             reading.type === "smoke"
//               ? reading.value.smokeLevel || 0
//               : reading.value.motionDetected
//               ? 1
//               : 0
//           )
//           .slice(0, 10),
//         color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
//         strokeWidth: 2,
//       },
//     ],
//     legend: ["Sensor Activity"],
//   };

//   // Combined data structure used for the  FlatList sections
//   const dashboardData = [
//     { type: "header", id: "header" },
//     { type: "deviceStatus", id: "deviceStatus", data: device },
//     { type: "sensorChart", id: "sensorChart", data: chartData },
//     { type: "alertStats", id: "alertStats", data: stats },
//     { type: "recentAlerts", id: "recentAlerts", data: alerts },
//     { type: "quickActions", id: "quickActions" },
//   ];

//   const renderItem = ({ item }) => {
//     switch (item.type) {
//       case "header":
//         return (
//           <View style={styles.header}>
//             <Text style={styles.headerTitle}>Wildlife Dashboard</Text>
//             <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
//               <Icon name="log-out-outline" size={24} color="#fff" />
//             </TouchableOpacity>
//           </View>
//         );
//       case "deviceStatus":
//         return (
//           <Animated.View entering={FadeIn} style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>Device Status</Text>
//               <Icon name="hardware-chip" size={20} color="#4CAF50" />
//             </View>
//             <View style={styles.statusRow}>
//               <Text style={styles.statusLabel}>Pi Unit 001</Text>
//               <View
//                 style={[
//                   styles.statusIndicator,
//                   {
//                     backgroundColor:
//                       item.data.status === "active" ? "#4CAF50" : "#D32F2F",
//                   },
//                 ]}
//               >
//                 <Text style={styles.statusText}>
//                   {item.data.status || "Offline"}
//                 </Text>
//               </View>
//             </View>
//             <Text style={styles.statusDetail}>
//               Last Ping:{" "}
//               {item.data.lastPing?.split("T")[1].slice(0, 5) || "N/A"}
//             </Text>
//           </Animated.View>
//         );
//       case "sensorChart":
//         return (
//           <Animated.View entering={FadeIn} style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>Sensor Activity</Text>
//               <Icon name="analytics" size={20} color="#4CAF50" />
//             </View>
//             <LineChart
//               data={item.data}
//               width={width - 40}
//               height={200}
//               yAxisLabel=""
//               yAxisSuffix=""
//               chartConfig={{
//                 backgroundColor: "#1a1a1a",
//                 backgroundGradientFrom: "#1a1a1a",
//                 backgroundGradientTo: "#1a1a1a",
//                 decimalPlaces: 1,
//                 color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
//                 labelColor: (opacity = 1) => `#fff`,
//                 style: { borderRadius: 16 },
//                 propsForDots: { r: "4", strokeWidth: "2", stroke: "#4CAF50" },
//               }}
//               bezier
//               style={{ marginVertical: 8, borderRadius: 16 }}
//             />
//             <Text style={styles.chartLabel}>
//               Last 10 Readings (Motion/Smoke)
//             </Text>
//           </Animated.View>
//         );
//       case "alertStats":
//         return (
//           <Animated.View entering={FadeIn} style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>Alert Statistics</Text>
//               <Icon name="alert-circle" size={20} color="#4CAF50" />
//             </View>
//             <View style={styles.statsGrid}>
//               <View style={styles.statItem}>
//                 <Text style={styles.statNumber}>{item.data.pending}</Text>
//                 <Text style={styles.statLabel}>Pending</Text>
//               </View>
//               <View style={styles.statItem}>
//                 <Text style={styles.statNumber}>{item.data.approved}</Text>
//                 <Text style={styles.statLabel}>Approved</Text>
//               </View>
//               <View style={styles.statItem}>
//                 <Text style={styles.statNumber}>{item.data.rejected}</Text>
//                 <Text style={styles.statLabel}>Rejected</Text>
//               </View>
//             </View>
//           </Animated.View>
//         );
//       case "recentAlerts":
//         return (
//           <Animated.View entering={FadeIn} style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>Recent Alerts</Text>
//               <Icon name="notifications" size={20} color="#4CAF50" />
//             </View>
//             {item.data.map((alert) => (
//               <TouchableOpacity
//                 key={alert.id}
//                 style={styles.alertCard}
//                 onPress={() =>
//                   router.push({
//                     pathname: "/(tabs)/AlertDetailPage",
//                     params: { alertId: alert.id },
//                   })
//                 }
//               >
//                 <Animated.View entering={SlideInRight}>
//                   <View style={styles.alertHeader}>
//                     <Text style={styles.alertTime}>
//                       {alert.timestamp.split("T")[1].slice(0, 5)}
//                     </Text>
//                     <Text
//                       style={[
//                         styles.alertStatus,
//                         {
//                           color:
//                             alert.status === "pending"
//                               ? "#FF9800"
//                               : alert.status === "approved"
//                               ? "#4CAF50"
//                               : "#D32F2F",
//                         },
//                       ]}
//                     >
//                       {alert.status}
//                     </Text>
//                   </View>
//                   <Text style={styles.alertDetails}>
//                     Sound: {(alert.soundConfidence || 0).toFixed(2)}, Weapon:{" "}
//                     {(alert.weaponConfidence || 0).toFixed(2)}
//                   </Text>
//                 </Animated.View>
//               </TouchableOpacity>
//             ))}
//             {item.data.length === 0 && (
//               <Text style={styles.emptyText}>No recent alerts</Text>
//             )}
//           </Animated.View>
//         );
//       case "quickActions":
//         return (
//           <View style={styles.quickActions}>
//             <TouchableOpacity
//               style={styles.quickActionButton}
//               onPress={() => router.push("/(tabs)/AlertsPage")}
//             >
//               <Icon name="alert-circle-outline" size={24} color="#fff" />
//               <Text style={styles.quickActionText}>View All Alerts</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.quickActionButton}
//               onPress={() => router.push("/(tabs)/Settings")}
//             >
//               <Icon name="settings-outline" size={24} color="#fff" />
//               <Text style={styles.quickActionText}>Settings</Text>
//             </TouchableOpacity>
//           </View>
//         );
//       default:
//         return null;
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
//         data={dashboardData}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 20 }}
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
//     padding: 16,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderBottomWidth: 1,
//     borderBottomColor: "#2d2d2d",
//   },
//   headerTitle: { color: "#fff", fontSize: 24, fontWeight: "bold" },
//   card: {
//     backgroundColor: "#1a1a1a",
//     borderRadius: 16,
//     padding: 16,
//     marginHorizontal: 10,
//     marginVertical: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   cardTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
//   statusRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
//   statusLabel: { color: "#fff", fontSize: 16, marginRight: 12 },
//   statusIndicator: {
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//     borderRadius: 12,
//   },
//   statusText: { color: "#fff", fontSize: 14 },
//   statusDetail: { color: "#999", fontSize: 14 },
//   statsGrid: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 12,
//   },
//   statItem: { alignItems: "center" },
//   statNumber: { color: "#fff", fontSize: 24, fontWeight: "bold" },
//   statLabel: { color: "#999", fontSize: 14 },
//   alertCard: {
//     backgroundColor: "#2d2d2d",
//     borderRadius: 12,
//     padding: 12,
//     marginVertical: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   alertHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 8,
//   },
//   alertTime: { color: "#fff", fontSize: 14 },
//   alertStatus: { fontSize: 14, fontWeight: "500" },
//   alertDetails: { color: "#999", fontSize: 12 },
//   emptyText: {
//     color: "#fff",
//     fontSize: 16,
//     textAlign: "center",
//     marginVertical: 8,
//   },
//   quickActions: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginHorizontal: 10,
//     marginVertical: 16,
//   },
//   quickActionButton: {
//     backgroundColor: "#4CAF50",
//     borderRadius: 12,
//     padding: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   quickActionText: { color: "#fff", fontSize: 16, marginLeft: 8 },
//   chartLabel: {
//     color: "#999",
//     fontSize: 12,
//     textAlign: "center",
//     marginTop: 8,
//   },
// });

// export default Dashboard;
// $$$$$$$$$$$$$$$$$$$$$$$
// import React, { useState, useEffect, useCallback } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   Dimensions,
// } from "react-native";
// import { useRouter } from "expo-router";
// import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
// import Icon from "react-native-vector-icons/Ionicons";
// import { LineChart } from "react-native-chart-kit";
// import { db } from "../../services/firebase"; // Ensure Firebase is set up
// import {
//   doc,
//   onSnapshot,
//   collection,
//   query,
//   orderBy,
//   limit,
// } from "firebase/firestore";

// const { width } = Dimensions.get("window");

// // Static userId for now (replace with useAuth hook)
// const userId = "someUserId123"; // Replace with dynamic userId from auth context
// const deviceId = "pi_unit_001"; // Hardcoded deviceId

// const DashboardPage = () => {
//   const [device, setDevice] = useState(null);
//   const [sensorReadings, setSensorReadings] = useState([]);
//   const [alerts, setAlerts] = useState([]);
//   const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
//   const [user, setUser] = useState(null); // Added user state
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const router = useRouter();

//   // Convert Firestore timestamp to Date
//   const convertFirestoreTimestamp = (timestamp) => {
//     if (!timestamp) return new Date();
//     if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
//     if (timestamp.toDate) return timestamp.toDate();
//     return new Date(timestamp);
//   };

//   // Format time for display
//   const formatTime = (timestamp) =>
//     !timestamp
//       ? "N/A"
//       : convertFirestoreTimestamp(timestamp).toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//         });

//   // Fetch user data
//   const fetchUserData = useCallback(() => {
//     try {
//       const userRef = doc(db, "users", userId);
//       return onSnapshot(
//         userRef,
//         (docSnap) => {
//           if (docSnap.exists()) {
//             setUser(docSnap.data());
//           } else {
//             setUser(null);
//             console.warn("User data not found for userId:", userId);
//           }
//         },
//         (error) => {
//           console.error("Error fetching user data:", error);
//           setError("Failed to load user data.");
//         }
//       );
//     } catch (error) {
//       console.error("Error in fetchUserData:", error);
//       setError("Failed to fetch user data.");
//       return null;
//     }
//   }, [userId]);

//   // Fetch sensor data
//   const fetchDeviceData = useCallback(() => {
//     try {
//       const deviceRef = doc(db, "sensors", deviceId);
//       return onSnapshot(
//         deviceRef,
//         (docSnap) => {
//           if (docSnap.exists()) {
//             const deviceData = docSnap.data();
//             setDevice(deviceData.deviceInfo || {});
//             const readings = [
//               ...(deviceData.sensorReadings?.sound
//                 ? [{ type: "sound", ...deviceData.sensorReadings.sound }]
//                 : []),
//               ...(deviceData.sensorReadings?.smoke
//                 ? [{ type: "smoke", ...deviceData.sensorReadings.smoke }]
//                 : []),
//               ...(deviceData.sensorReadings?.motion
//                 ? [{ type: "motion", ...deviceData.sensorReadings.motion }]
//                 : []),
//             ]
//               .filter((r) => r.last_updated)
//               .sort(
//                 (a, b) =>
//                   convertFirestoreTimestamp(b.last_updated) -
//                   convertFirestoreTimestamp(a.last_updated)
//               )
//               .slice(0, 10);
//             setSensorReadings(readings);
//           } else {
//             setDevice({});
//             setSensorReadings([]);
//           }
//         },
//         (error) => {
//           console.error("Error fetching device data:", error);
//           setError("Failed to load device data.");
//         }
//       );
//     } catch (error) {
//       console.error("Error in fetchDeviceData:", error);
//       setError("Failed to fetch device data.");
//       return null;
//     }
//   }, [deviceId]);

//   // Fetch alerts
//   const fetchAlerts = useCallback(() => {
//     try {
//       const alertsQuery = query(
//         collection(db, "alerts"),
//         orderBy("timestamp", "desc"),
//         limit(5)
//       );
//       return onSnapshot(
//         alertsQuery,
//         (querySnapshot) => {
//           const alertsList = querySnapshot.docs.map((doc) => ({
//             id: doc.id,
//             ...doc.data(),
//           }));
//           setAlerts(alertsList);
//           const stats = alertsList.reduce(
//             (acc, alert) => {
//               if (alert.status === "pending") acc.pending++;
//               else if (alert.status === "approved") acc.approved++;
//               else if (alert.status === "rejected") acc.rejected++;
//               return acc;
//             },
//             { pending: 0, approved: 0, rejected: 0 }
//           );
//           setStats(stats);
//         },
//         (error) => {
//           console.error("Error fetching alerts:", error);
//           setError("Failed to load alerts.");
//         }
//       );
//     } catch (error) {
//       console.error("Error in fetchAlerts:", error);
//       setError("Failed to fetch alerts.");
//       return null;
//     }
//   }, []);

//   useEffect(() => {
//     setLoading(true);
//     setError(null);
//     const unsubscribeUser = fetchUserData();
//     const unsubscribeDevice = fetchDeviceData();
//     const unsubscribeAlerts = fetchAlerts();
//     const timer = setTimeout(() => setLoading(false), 1000); // Simulate initial load
//     return () => {
//       unsubscribeUser?.();
//       unsubscribeDevice?.();
//       unsubscribeAlerts?.();
//       clearTimeout(timer);
//     };
//   }, [fetchUserData, fetchDeviceData, fetchAlerts]);

//   // Chart data with validation
//   const chartData = {
//     labels: sensorReadings
//       .map((reading) => formatTime(reading.last_updated))
//       .slice(0, 10)
//       .reverse(),
//     datasets: [
//       {
//         data: sensorReadings
//           .map((reading) => {
//             const value =
//               reading.type === "smoke"
//                 ? reading.level || 0
//                 : reading.type === "motion" &&
//                   reading.status === "Motion Detected"
//                 ? 1
//                 : reading.type === "sound"
//                 ? reading.value || 0
//                 : 0;
//             // Debug log with proper template literal
//             console.log(`Chart data for ${reading.type}: ${value}`);
//             return isFinite(value) ? value : 0; // Replace Infinity/NaN with 0
//           })
//           .slice(0, 10)
//           .reverse(),
//         color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Fixed template literal
//         strokeWidth: 2,
//       },
//     ],
//     legend: ["Sensor Activity"],
//   };

//   // Combined data structure for FlatList
//   const dashboardData = [
//     { type: "header", id: "header" },
//     { type: "deviceStatus", id: "deviceStatus", data: device },
//     { type: "sensorChart", id: "sensorChart", data: chartData },
//     { type: "alertStats", id: "alertStats", data: stats },
//     { type: "recentAlerts", id: "recentAlerts", data: alerts },
//     { type: "quickActions", id: "quickActions" },
//   ];

//   const renderItem = ({ item }) => {
//     switch (item.type) {
//       case "header":
//         return (
//           <View style={styles.header}>
//             <Text style={styles.headerTitle}>Wildlife Dashboard</Text>
//             <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
//               <Icon name="log-out-outline" size={24} color="#fff" />
//             </TouchableOpacity>
//           </View>
//         );
//       case "deviceStatus":
//         return (
//           <Animated.View entering={FadeIn} style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>Device Status</Text>
//               <Icon name="hardware-chip" size={20} color="#4CAF50" />
//             </View>
//             <View style={styles.statusRow}>
//               <Text style={styles.statusLabel}>Pi Unit 001</Text>
//               <View
//                 style={[
//                   styles.statusIndicator,
//                   {
//                     backgroundColor:
//                       item.data?.status === "active" ? "#4CAF50" : "#D32F2F",
//                   },
//                 ]}
//               >
//                 <Text style={styles.statusText}>
//                   {item.data?.status || "Offline"}
//                 </Text>
//               </View>
//             </View>
//             <Text style={styles.statusDetail}>
//               Last Ping:{" "}
//               {item.data?.lastPing ? formatTime(item.data.lastPing) : "N/A"}
//             </Text>
//           </Animated.View>
//         );
//       case "sensorChart":
//         return (
//           <Animated.View entering={FadeIn} style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>Sensor Activity</Text>
//               <Icon name="analytics" size={20} color="#4CAF50" />
//             </View>
//             <LineChart
//               data={item.data}
//               width={width - 40}
//               height={200}
//               yAxisLabel=""
//               yAxisSuffix=""
//               chartConfig={{
//                 backgroundColor: "#1a1a1a",
//                 backgroundGradientFrom: "#1a1a1a",
//                 backgroundGradientTo: "#1a1a1a",
//                 decimalPlaces: 1,
//                 color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
//                 labelColor: (opacity = 1) => `#fff`,
//                 style: { borderRadius: 16 },
//                 propsForDots: { r: "4", strokeWidth: "2", stroke: "#4CAF50" },
//               }}
//               bezier
//               style={{ marginVertical: 8, borderRadius: 16 }}
//             />
//             <Text style={styles.chartLabel}>
//               Last 10 Readings (Motion/Smoke/Sound)
//             </Text>
//           </Animated.View>
//         );
//       case "alertStats":
//         return (
//           <Animated.View entering={FadeIn} style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>Alert Statistics</Text>
//               <Icon name="alert-circle" size={20} color="#4CAF50" />
//             </View>
//             <View style={styles.statsGrid}>
//               <View style={styles.statItem}>
//                 <Text style={styles.statNumber}>{item.data.pending}</Text>
//                 <Text style={styles.statLabel}>Pending</Text>
//               </View>
//               <View style={styles.statItem}>
//                 <Text style={styles.statNumber}>{item.data.approved}</Text>
//                 <Text style={styles.statLabel}>Approved</Text>
//               </View>
//               <View style={styles.statItem}>
//                 <Text style={styles.statNumber}>{item.data.rejected}</Text>
//                 <Text style={styles.statLabel}>Rejected</Text>
//               </View>
//             </View>
//           </Animated.View>
//         );
//       case "recentAlerts":
//         return (
//           <Animated.View entering={FadeIn} style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>Recent Alerts</Text>
//               <Icon name="notifications" size={20} color="#4CAF50" />
//             </View>
//             {item.data.length > 0 ? (
//               item.data.map((alert) => (
//                 <TouchableOpacity
//                   key={alert.id}
//                   style={styles.alertCard}
//                   onPress={() =>
//                     router.push({
//                       pathname: "/(tabs)/AlertDetailPage",
//                       params: { alertId: alert.id },
//                     })
//                   }
//                 >
//                   <Animated.View entering={SlideInRight}>
//                     <View style={styles.alertHeader}>
//                       <Text style={styles.alertTime}>
//                         {formatTime(alert.timestamp)}
//                       </Text>
//                       <Text
//                         style={[
//                           styles.alertStatus,
//                           {
//                             color:
//                               alert.status === "pending"
//                                 ? "#FF9800"
//                                 : alert.status === "approved"
//                                 ? "#4CAF50"
//                                 : "#D32F2F",
//                           },
//                         ]}
//                       >
//                         {alert.status}
//                       </Text>
//                     </View>
//                     <Text style={styles.alertDetails}>
//                       Sound: {(alert.soundConfidence || 0).toFixed(2)}, Weapon:{" "}
//                       {(alert.weaponConfidence || 0).toFixed(2)}
//                     </Text>
//                   </Animated.View>
//                 </TouchableOpacity>
//               ))
//             ) : (
//               <Text style={styles.emptyText}>No recent alerts</Text>
//             )}
//           </Animated.View>
//         );
//       case "quickActions":
//         return (
//           <View style={styles.quickActions}>
//             <TouchableOpacity
//               style={styles.quickActionButton}
//               onPress={() => router.push("/(tabs)/AlertsPage")}
//             >
//               <Icon name="alert-circle-outline" size={24} color="#fff" />
//               <Text style={styles.quickActionText}>View All Alerts</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.quickActionButton}
//               onPress={() => router.push("/(tabs)/Settings")}
//             >
//               <Icon name="settings-outline" size={24} color="#fff" />
//               <Text style={styles.quickActionText}>Settings</Text>
//             </TouchableOpacity>
//           </View>
//         );
//       default:
//         return null;
//     }
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4CAF50" />
//       </SafeAreaView>
//     );
//   }

//   if (error) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <Text style={styles.loadingText}>{error}</Text>
//         <TouchableOpacity
//           style={styles.retryButton}
//           onPress={() => router.reload()}
//         >
//           <Text style={styles.retryText}>Retry</Text>
//         </TouchableOpacity>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <FlatList
//         data={dashboardData}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 20 }}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#000" },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#000",
//   },
//   loadingText: { color: "#fff", marginTop: 15, fontSize: 16 },
//   retryButton: {
//     backgroundColor: "#4CAF50",
//     padding: 10,
//     borderRadius: 8,
//     marginTop: 15,
//   },
//   retryText: { color: "#fff", fontSize: 16, fontWeight: "600" },
//   header: {
//     padding: 16,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#1a1a1a", // Subtle gradient-like effect
//     borderBottomWidth: 1,
//     borderBottomColor: "#2d2d2d",
//     // ...Platform.select({
//     //   ios: {
//     //     shadowColor: "#000",
//     //     shadowOffset: { width: 0, height: 4 },
//     //     shadowOpacity: 0.3,
//     //     shadowRadius: 6,
//     //   },
//     //   android: { elevation: 6 },
//     // }),
//   },
//   headerTitle: {
//     color: "#fff",
//     fontSize: 24,
//     fontWeight: "bold",
//     fontFamily: "System",
//   },
//   card: {
//     backgroundColor: "#1a1a1a",
//     borderRadius: 16,
//     padding: 16,
//     marginHorizontal: 10,
//     marginVertical: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   cardTitle: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "600",
//     fontFamily: "System",
//   },
//   statusRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
//   statusLabel: { color: "#fff", fontSize: 16, marginRight: 12 },
//   statusIndicator: {
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//     borderRadius: 12,
//     backgroundColor: "#333", // Subtle modern touch
//   },
//   statusText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
//   statusDetail: { color: "#999", fontSize: 14 },
//   statsGrid: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 12,
//   },
//   statItem: { alignItems: "center" },
//   statNumber: { color: "#fff", fontSize: 24, fontWeight: "bold" },
//   statLabel: { color: "#999", fontSize: 14 },
//   alertCard: {
//     backgroundColor: "#2d2d2d",
//     borderRadius: 12,
//     padding: 12,
//     marginVertical: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   alertHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 8,
//   },
//   alertTime: { color: "#fff", fontSize: 14 },
//   alertStatus: { fontSize: 14, fontWeight: "500", textTransform: "capitalize" },
//   alertDetails: { color: "#999", fontSize: 12 },
//   emptyText: {
//     color: "#999",
//     fontSize: 16,
//     textAlign: "center",
//     marginVertical: 8,
//   },
//   quickActions: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginHorizontal: 10,
//     marginVertical: 16,
//   },
//   quickActionButton: {
//     backgroundColor: "#4CAF50",
//     borderRadius: 12,
//     padding: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   quickActionText: {
//     color: "#fff",
//     fontSize: 16,
//     marginLeft: 8,
//     fontWeight: "600",
//   },
//   chartLabel: {
//     color: "#999",
//     fontSize: 12,
//     textAlign: "center",
//     marginTop: 8,
//   },
// });

// export default DashboardPage;
//! Firebase

// import React, { useState, useEffect, useCallback } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   Dimensions,
//   Platform,
// } from "react-native";
// import { useRouter } from "expo-router";
// import Animated, {
//   FadeIn,
//   SlideInRight,
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
// } from "react-native-reanimated";
// import { LinearGradient } from "expo-linear-gradient";
// import { StatusBar } from "expo-status-bar";
// import Icon from "react-native-vector-icons/Ionicons";
// import { LineChart } from "react-native-chart-kit";
// import { db } from "../../services/firebase"; // Ensure Firebase is set up
// import {
//   doc,
//   onSnapshot,
//   collection,
//   query,
//   orderBy,
//   limit,
// } from "firebase/firestore";

// const { width } = Dimensions.get("window");

// // Static userId and deviceId (replace with dynamic values from auth context)
// const userId = "someUserId123"; // Replace with dynamic userId from auth context
// const deviceId = "pi_unit_001"; // Hardcoded deviceId

// const DashboardPage = () => {
//   const [device, setDevice] = useState(null);
//   const [sensorReadings, setSensorReadings] = useState([]);
//   const [alerts, setAlerts] = useState([]);
//   const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const router = useRouter();

//   const fabScale = useSharedValue(0.8); // For FAB animation
//   const fabStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: fabScale.value }],
//   }));

//   // Convert Firestore timestamp to Date
//   const convertFirestoreTimestamp = (timestamp) => {
//     if (!timestamp) return new Date();
//     if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
//     if (timestamp.toDate) return timestamp.toDate();
//     return new Date(timestamp);
//   };

//   // Format time for display
//   const formatTime = (timestamp) =>
//     !timestamp
//       ? "N/A"
//       : convertFirestoreTimestamp(timestamp).toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//         });

//   // Fetch user data
//   const fetchUserData = useCallback(() => {
//     try {
//       const userRef = doc(db, "users", userId);
//       return onSnapshot(
//         userRef,
//         (docSnap) => {
//           if (docSnap.exists()) {
//             setUser(docSnap.data());
//           } else {
//             setUser(null);
//             console.warn("User data not found for userId:", userId);
//           }
//         },
//         (error) => {
//           console.error("Error fetching user data:", error);
//           setError("Failed to load user data.");
//         }
//       );
//     } catch (error) {
//       console.error("Error in fetchUserData:", error);
//       setError("Failed to fetch user data.");
//       return null;
//     }
//   }, [userId]);

//   // Fetch sensor data
//   const fetchDeviceData = useCallback(() => {
//     try {
//       const deviceRef = doc(db, "Sensors", deviceId);
//       return onSnapshot(
//         deviceRef,
//         (docSnap) => {
//           if (docSnap.exists()) {
//             const deviceData = docSnap.data();
//             setDevice(deviceData.deviceId || {});
//             const readings = [
//               ...(deviceData.sensorReadings?.sound
//                 ? [{ type: "sound", ...deviceData.sensorReadings.sound }]
//                 : []),
//               ...(deviceData.sensorReadings?.smoke
//                 ? [{ type: "smoke", ...deviceData.sensorReadings.smoke }]
//                 : []),
//               ...(deviceData.sensorReadings?.motion
//                 ? [{ type: "motion", ...deviceData.sensorReadings.motion }]
//                 : []),
//               ...(deviceData.sensorReadings?.camera
//                 ? [{ type: "camera", ...deviceData.sensorReadings.camera }]
//                 : []),
//               ...(deviceData.sensorReadings?.gsm
//                 ? [{ type: "gsm", ...deviceData.sensorReadings.gsm }]
//                 : []),
//               ...(deviceData.sensorReadings?.wifi
//                 ? [{ type: "wifi", ...deviceData.sensorReadings.wifi }]
//                 : []),
//             ]
//               .filter((r) => r.last_updated)
//               .sort(
//                 (a, b) =>
//                   convertFirestoreTimestamp(b.last_updated) -
//                   convertFirestoreTimestamp(a.last_updated)
//               )
//               .slice(0, 10);
//             setSensorReadings(readings);
//           } else {
//             setDevice({});
//             setSensorReadings([]);
//           }
//         },
//         (error) => {
//           console.error("Error fetching device data:", error);
//           setError("Failed to load device data.");
//         }
//       );
//     } catch (error) {
//       console.error("Error in fetchDeviceData:", error);
//       setError("Failed to fetch device data.");
//       return null;
//     }
//   }, [deviceId]);

//   // Fetch alerts
//   const fetchAlerts = useCallback(() => {
//     try {
//       const alertsQuery = query(
//         collection(db, "alerts"),
//         orderBy("timestamp", "desc"),
//         limit(5)
//       );
//       return onSnapshot(
//         alertsQuery,
//         (querySnapshot) => {
//           const alertsList = querySnapshot.docs.map((doc) => ({
//             id: doc.id,
//             ...doc.data(),
//           }));
//           setAlerts(alertsList);
//           const stats = alertsList.reduce(
//             (acc, alert) => {
//               if (alert.status === "pending") acc.pending++;
//               else if (alert.status === "approved") acc.approved++;
//               else if (alert.status === "rejected") acc.rejected++;
//               return acc;
//             },
//             { pending: 0, approved: 0, rejected: 0 }
//           );
//           setStats(stats);
//         },
//         (error) => {
//           console.error("Error fetching alerts:", error);
//           setError("Failed to load alerts.");
//         }
//       );
//     } catch (error) {
//       console.error("Error in fetchAlerts:", error);
//       setError("Failed to fetch alerts.");
//       return null;
//     }
//   }, []);

//   useEffect(() => {
//     setLoading(true);
//     setError(null);
//     const unsubscribeUser = fetchUserData();
//     const unsubscribeDevice = fetchDeviceData();
//     const unsubscribeAlerts = fetchAlerts();
//     fabScale.value = withTiming(1, { duration: 500 });
//     setLoading(false);
//     return () => {
//       unsubscribeUser?.();
//       unsubscribeDevice?.();
//       unsubscribeAlerts?.();
//     };
//   }, [fetchUserData, fetchDeviceData, fetchAlerts]);

//   // Chart data with validation
//   // const chartData = {
//   //   labels: sensorReadings
//   //     .map((reading) => formatTime(reading.last_updated))
//   //     .slice(0, 10)
//   //     .reverse(),
//   //   datasets: [
//   //     {
//   //       data: sensorReadings
//   //         .map((reading) => {
//   //           const value =
//   //             reading.type === "smoke"
//   //               ? reading.level || 0
//   //               : reading.type === "motion" &&
//   //                 reading.status === "Motion Detected"
//   //               ? 1
//   //               : reading.type === "sound"
//   //               ? reading.value || 0
//   //               : 0;
//   //           console.log(`Chart data for ${reading.type}: ${value}`);
//   //           return isFinite(value) ? value : 0; // Replace Infinity/NaN with 0
//   //         })
//   //         .slice(0, 10)
//   //         .reverse(),
//   //       color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
//   //       strokeWidth: 2,
//   //     },
//   //   ],
//   //   legend: ["Sensor Activity"],
//   // };

//   // Combined data structure for FlatList
//   const dashboardData = [
//     { type: "header", id: "header" },
//     { type: "deviceStatus", id: "deviceStatus", data: device },
//     // { type: "sensorChart", id: "sensorChart", data: chartData },
//     { type: "alertStats", id: "alertStats", data: stats },
//     { type: "recentAlerts", id: "recentAlerts", data: alerts },
//     { type: "quickActions", id: "quickActions" },
//   ];

//   const handleViewSensors = () => {
//     fabScale.value = withTiming(
//       1.2,
//       { duration: 200 },
//       () => (fabScale.value = withTiming(1, { duration: 200 }))
//     );
//     router.push("/(tabs)/SensorsPage");
//   };

//   const renderItem = ({ item }) => {
//     switch (item.type) {
//       case "header":
//         return (
//           <LinearGradient colors={["#4CAF50", "#388E3C"]} style={styles.header}>
//             <Text style={styles.headerTitle}>Wildlife Dashboard</Text>
//             <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
//               <Icon name="log-out-outline" size={24} color="#fff" />
//             </TouchableOpacity>
//           </LinearGradient>
//         );
//       case "deviceStatus":
//         return (
//           <Animated.View entering={FadeIn.duration(800)} style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>Device Status</Text>
//               <Icon name="hardware-chip" size={20} color="#4CAF50" />
//             </View>
//             <View style={styles.statusRow}>
//               <Text style={styles.statusLabel}>
//                 {item.data?.name || "Pi Unit 001"}
//               </Text>
//               <View
//                 style={[
//                   styles.statusIndicator,
//                   {
//                     backgroundColor:
//                       item.data?.status === "active"
//                         ? "#4CAF50"
//                         : item.data?.status === "maintenance"
//                         ? "#FF9800"
//                         : "#D32F2F",
//                   },
//                 ]}
//               >
//                 <Text style={styles.statusText}>
//                   {item.data?.status || "Offline"}
//                 </Text>
//               </View>
//             </View>
//             <Text style={styles.statusDetail}>
//               Last Ping:{" "}
//               {item.data?.lastPing ? formatTime(item.data.lastPing) : "N/A"}
//             </Text>
//             {item.data?.location?.areaName && (
//               <Text style={styles.statusDetail}>
//                 Location: {item.data.location.areaName}
//               </Text>
//             )}
//           </Animated.View>
//         );
//       // case "sensorChart":
//       //   return (
//       //     <Animated.View
//       //       entering={SlideInRight.duration(800)}
//       //       style={styles.card}
//       //     >
//       //       <View style={styles.cardHeader}>
//       //         <Text style={styles.cardTitle}>Sensor Activity</Text>
//       //         <Icon name="analytics" size={20} color="#4CAF50" />
//       //       </View>
//       //       <LineChart
//       //         data={item.data}
//       //         width={width - 40}
//       //         height={200}
//       //         yAxisLabel=""
//       //         yAxisSuffix=""
//       //         chartConfig={{
//       //           backgroundColor: "#1a1a1a",
//       //           backgroundGradientFrom: "#1a1a1a",
//       //           backgroundGradientTo: "#1a1a1a",
//       //           decimalPlaces: 1,
//       //           color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
//       //           labelColor: (opacity = 1) => `#fff`,
//       //           style: { borderRadius: 16 },
//       //           propsForDots: { r: "4", strokeWidth: "2", stroke: "#4CAF50" },
//       //         }}
//       //         bezier
//       //         style={styles.chart}
//       //       />
//       //       <Text style={styles.chartLabel}>
//       //         Last 10 Readings (Motion/Smoke/Sound)
//       //       </Text>
//       //     </Animated.View>
//       //   );
//       case "alertStats":
//         return (
//           <Animated.View entering={FadeIn.duration(1000)} style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>Alert Statistics</Text>
//               <Icon name="alert-circle" size={20} color="#4CAF50" />
//             </View>
//             <View style={styles.statsGrid}>
//               <View
//                 style={[
//                   styles.statItem,
//                   { backgroundColor: "rgba(255, 193, 7, 0.2)" },
//                 ]}
//               >
//                 <Text style={styles.statNumber}>{item.data.pending}</Text>
//                 <Text style={styles.statLabel}>Pending</Text>
//               </View>
//               <View
//                 style={[
//                   styles.statItem,
//                   { backgroundColor: "rgba(76, 175, 80, 0.2)" },
//                 ]}
//               >
//                 <Text style={styles.statNumber}>{item.data.approved}</Text>
//                 <Text style={styles.statLabel}>Approved</Text>
//               </View>
//               <View
//                 style={[
//                   styles.statItem,
//                   { backgroundColor: "rgba(244, 67, 54, 0.2)" },
//                 ]}
//               >
//                 <Text style={styles.statNumber}>{item.data.rejected}</Text>
//                 <Text style={styles.statLabel}>Rejected</Text>
//               </View>
//             </View>
//           </Animated.View>
//         );
//       case "recentAlerts":
//         return (
//           <Animated.View entering={FadeIn.duration(800)} style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>Recent Alerts</Text>
//               <Icon name="notifications" size={20} color="#4CAF50" />
//             </View>
//             {item.data.length > 0 ? (
//               item.data.map((alert) => (
//                 <TouchableOpacity
//                   key={alert.id}
//                   style={styles.alertCard}
//                   onPress={() =>
//                     router.push({
//                       pathname: "/(tabs)/AlertDetailPage",
//                       params: { alertId: alert.id },
//                     })
//                   }
//                 >
//                   <Animated.View entering={SlideInRight}>
//                     <View style={styles.alertHeader}>
//                       <Text style={styles.alertTime}>
//                         {formatTime(alert.timestamp)}
//                       </Text>
//                       <Text
//                         style={[
//                           styles.alertStatus,
//                           {
//                             color:
//                               alert.status === "pending"
//                                 ? "#FF9800"
//                                 : alert.status === "approved"
//                                 ? "#4CAF50"
//                                 : "#D32F2F",
//                           },
//                         ]}
//                       >
//                         {alert.status}
//                       </Text>
//                     </View>
//                     <Text style={styles.alertDetails}>
//                       {alert.detections?.sound?.detected &&
//                         `Sound (${alert.detections.sound.type}): ${(
//                           alert.detections.sound.confidence * 100
//                         ).toFixed(0)}%`}
//                       {alert.detections?.image?.detected &&
//                         `, Image (${alert.detections.image.type}): ${(
//                           alert.detections.image.confidence * 100
//                         ).toFixed(0)}%`}
//                       {alert.detections?.smoke?.detected &&
//                         `, Smoke: ${alert.detections.smoke.level}`}
//                     </Text>
//                     {alert.detections?.image?.imageUrl && (
//                       <Text style={styles.alertDetails}>
//                         Image: {alert.detections.image.imageUrl}
//                       </Text>
//                     )}
//                   </Animated.View>
//                 </TouchableOpacity>
//               ))
//             ) : (
//               <Text style={styles.emptyText}>No recent alerts</Text>
//             )}
//           </Animated.View>
//         );
//       case "quickActions":
//         return (
//           <View style={styles.quickActions}>
//             <TouchableOpacity
//               style={styles.quickActionButton}
//               onPress={() => router.push("/(tabs)/AlertsPage")}
//             >
//               <Icon name="alert-circle-outline" size={24} color="#fff" />
//               <Text style={styles.quickActionText}>View All Alerts</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.quickActionButton}
//               onPress={() => router.push("/(tabs)/Settings")}
//             >
//               <Icon name="settings-outline" size={24} color="#fff" />
//               <Text style={styles.quickActionText}>Settings</Text>
//             </TouchableOpacity>
//           </View>
//         );
//       default:
//         return null;
//     }
//   };

//   // if (loading) {
//   //   return (
//   //     <SafeAreaView style={styles.loadingContainer}>
//   //       <StatusBar style="light" />
//   //       <ActivityIndicator size="large" color="#4CAF50" />
//   //       <Text style={styles.loadingText}>Loading dashboard data...</Text>
//   //     </SafeAreaView>
//   //   );
//   // }

//   // if (error) {
//   //   return (
//   //     <SafeAreaView style={styles.loadingContainer}>
//   //       <StatusBar style="light" />
//   //       <Text style={styles.loadingText}>{error}</Text>
//   //       <TouchableOpacity
//   //         style={styles.retryButton}
//   //         onPress={() => router.reload()}
//   //       >
//   //         <Text style={styles.retryText}>Retry</Text>
//   //       </TouchableOpacity>
//   //     </SafeAreaView>
//   //   );
//   // }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar style="light" />
//       <FlatList
//         data={dashboardData}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.listContent}
//       />
//       <Animated.View style={[styles.fab, fabStyle]}>
//         <TouchableOpacity style={styles.fabButton} onPress={handleViewSensors}>
//           <Icon name="speedometer-outline" size={24} color="#fff" />
//           <Text style={styles.fabText}>Sensors Data</Text>
//         </TouchableOpacity>
//       </Animated.View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#121212" },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#121212",
//   },
//   loadingText: {
//     color: "#fff",
//     marginTop: 15,
//     fontSize: 16,
//     fontFamily: "System",
//   },
//   retryButton: {
//     backgroundColor: "#4CAF50",
//     padding: 10,
//     borderRadius: 8,
//     marginTop: 15,
//   },
//   retryText: { color: "#fff", fontSize: 16, fontWeight: "600" },
//   header: {
//     padding: 20,
//     paddingTop: Platform.OS === "ios" ? 10 : 40,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     ...Platform.select({
//       ios: {
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 6,
//       },
//       android: { elevation: 6 },
//     }),
//   },
//   headerTitle: {
//     color: "#fff",
//     fontSize: 28,
//     fontWeight: "bold",
//     fontFamily: "System",
//   },
//   listContent: { padding: 15, paddingBottom: 100 },
//   card: {
//     backgroundColor: "#1e1e1e",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
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
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   cardTitle: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "700",
//     fontFamily: "System",
//   },
//   statusRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   statusLabel: { color: "#fff", fontSize: 16, fontWeight: "600" },
//   statusIndicator: {
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//     borderRadius: 12,
//   },
//   statusText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "bold",
//     textTransform: "uppercase",
//   },
//   statusDetail: { color: "#bbb", fontSize: 14 },
//   chart: { marginVertical: 8, borderRadius: 16 },
//   chartLabel: {
//     color: "#999",
//     fontSize: 12,
//     textAlign: "center",
//     marginTop: 8,
//   },
//   statsGrid: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 12,
//   },
//   statItem: {
//     width: "30%",
//     alignItems: "center",
//     padding: 12,
//     borderRadius: 12,
//   },
//   statNumber: { color: "#fff", fontSize: 24, fontWeight: "bold" },
//   statLabel: { color: "#bbb", fontSize: 14, marginTop: 4 },
//   alertCard: {
//     backgroundColor: "#2d2d2d",
//     borderRadius: 12,
//     padding: 12,
//     marginVertical: 8,
//   },
//   alertHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   alertTime: { color: "#fff", fontSize: 14 },
//   alertStatus: { fontSize: 14, fontWeight: "500", textTransform: "capitalize" },
//   alertDetails: { color: "#999", fontSize: 12 },
//   emptyText: {
//     color: "#999",
//     fontSize: 16,
//     textAlign: "center",
//     marginVertical: 20,
//   },
//   quickActions: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginVertical: 16,
//   },
//   quickActionButton: {
//     backgroundColor: "#4CAF50",
//     borderRadius: 12,
//     padding: 12,
//     flexDirection: "row",
//     alignItems: "center",
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
//   quickActionText: {
//     color: "#fff",
//     fontSize: 16,
//     marginLeft: 8,
//     fontWeight: "600",
//   },
//   fab: {
//     position: "absolute",
//     bottom: 20,
//     right: 20,
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
//   fabButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#4CAF50",
//     borderRadius: 12,
//     padding: 12,
//   },
//   fabText: { color: "#fff", fontSize: 10, fontWeight: "600", marginLeft: 8 },
// });

// export default DashboardPage;

// !Firebase actual Code
// import React, { useState, useEffect, useCallback } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   Dimensions,
//   Platform,
// } from "react-native";
// import { useRouter } from "expo-router";
// import Animated, {
//   FadeIn,
//   SlideInRight,
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
// } from "react-native-reanimated";
// import { LinearGradient } from "expo-linear-gradient";
// import { StatusBar } from "expo-status-bar";
// import Icon from "react-native-vector-icons/Ionicons";
// import { auth, db } from "../../services/firebase"; // Import auth and db from Firebase config
// import {
//   doc,
//   onSnapshot,
//   collection,
//   query,
//   orderBy,
//   limit,
//   where,
// } from "firebase/firestore";
// import { onAuthStateChanged } from "firebase/auth"; // For user authentication

// const { width } = Dimensions.get("window");

// const DashboardPage = () => {
//   const [device, setDevice] = useState(null);
//   const [sensorReadings, setSensorReadings] = useState([]);
//   const [alerts, setAlerts] = useState([]);
//   const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const [selectedDeviceId, setSelectedDeviceId] = useState(null);
//   const router = useRouter();

//   const fabScale = useSharedValue(0.8); // For FAB animation
//   const fabStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: fabScale.value }],
//   }));

//   // Convert Firestore timestamp to Date
//   const convertFirestoreTimestamp = (timestamp) => {
//     if (!timestamp) return new Date();
//     if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
//     if (timestamp.toDate) return timestamp.toDate();
//     return new Date(timestamp);
//   };

//   // Format time for display
//   const formatTime = (timestamp) =>
//     !timestamp
//       ? "N/A"
//       : convertFirestoreTimestamp(timestamp).toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//         });

//   // Step 1: Get current user from Firebase Auth
//   const fetchCurrentUser = useCallback(() => {
//     return onAuthStateChanged(auth, (firebaseUser) => {
//       if (firebaseUser) {
//         setCurrentUserId(firebaseUser.uid);
//         fetchUserData(firebaseUser.uid);
//         console.log(currentUserId);
//       } else {
//         setCurrentUserId(null);
//         setUser(null);
//         setError("No authenticated user found. Please log in.");
//         router.replace("/(auth)/SignIn"); // Redirect to login if not authenticated
//       }
//     });
//   }, []);

//   // Step 2: Fetch user data from Firestore
//   const fetchUserData = useCallback((uid) => {
//     try {
//       const userRef = doc(db, "users", uid);
//       return onSnapshot(
//         userRef,
//         (docSnap) => {
//           if (docSnap.exists()) {
//             setUser(docSnap.data());
//           } else {
//             setUser(null);
//             console.warn("User data not found for uid:", uid);
//           }
//         },
//         (error) => {
//           console.error("Error fetching user data:", error);
//           setError("Failed to load user data.");
//         }
//       );
//     } catch (error) {
//       console.error("Error in fetchUserData:", error);
//       setError("Failed to fetch user data.");
//     }
//   }, []);

//   // Step 3: Fetch the first device for the user (or modify based on your logic)
//   const fetchDeviceId = useCallback(() => {
//     try {
//       const devicesQuery = query(
//         collection(db, "devices"),
//         limit(1) // Fetch the first device as an example; adjust as needed
//       );
//       return onSnapshot(
//         devicesQuery,
//         (querySnapshot) => {
//           if (!querySnapshot.empty) {
//             const deviceDoc = querySnapshot.docs[0];
//             setSelectedDeviceId(deviceDoc.id);
//             setDevice({ id: deviceDoc.id, ...deviceDoc.data() });
//           } else {
//             setSelectedDeviceId(null);
//             setDevice(null);
//             console.warn("No devices found.");
//           }
//         },
//         (error) => {
//           console.error("Error fetching devices:", error);
//           setError("Failed to load device data.");
//         }
//       );
//     } catch (error) {
//       console.error("Error in fetchDeviceId:", error);
//       setError("Failed to fetch device ID.");
//     }
//   }, []);

//   // Step 4: Fetch sensor data based on selectedDeviceId
//   const fetchSensorData = useCallback(() => {
//     if (!selectedDeviceId) return;

//     try {
//       const sensorRef = doc(db, "sensors", selectedDeviceId);
//       return onSnapshot(
//         sensorRef,
//         (sensorSnap) => {
//           if (sensorSnap.exists()) {
//             const sensorData = sensorSnap.data();
//             const readings = [
//               ...(sensorData.sensorReadings?.sound
//                 ? [{ type: "sound", ...sensorData.sensorReadings.sound }]
//                 : []),
//               ...(sensorData.sensorReadings?.smoke
//                 ? [{ type: "smoke", ...sensorData.sensorReadings.smoke }]
//                 : []),
//               ...(sensorData.sensorReadings?.motion
//                 ? [{ type: "motion", ...sensorData.sensorReadings.motion }]
//                 : []),
//               ...(sensorData.sensorReadings?.camera
//                 ? [{ type: "camera", ...sensorData.sensorReadings.camera }]
//                 : []),
//               ...(sensorData.sensorReadings?.gsm
//                 ? [{ type: "gsm", ...sensorData.sensorReadings.gsm }]
//                 : []),
//               ...(sensorData.sensorReadings?.wifi
//                 ? [{ type: "wifi", ...sensorData.sensorReadings.wifi }]
//                 : []),
//             ]
//               .filter((r) => r.last_updated)
//               .sort(
//                 (a, b) =>
//                   convertFirestoreTimestamp(b.last_updated) -
//                   convertFirestoreTimestamp(a.last_updated)
//               )
//               .slice(0, 10);
//             setSensorReadings(readings);
//           } else {
//             setSensorReadings([]);
//           }
//         },
//         (error) => {
//           console.error("Error fetching sensor data:", error);
//           setError("Failed to load sensor data.");
//         }
//       );
//     } catch (error) {
//       console.error("Error in fetchSensorData:", error);
//       setError("Failed to fetch sensor data.");
//     }
//   }, [selectedDeviceId]);

//   // Step 5: Fetch alerts
//   const fetchAlerts = useCallback(() => {
//     try {
//       const alertsQuery = query(
//         collection(db, "alerts"),
//         orderBy("occur_at", "desc"), // Changed from "timestamp" to "occur_at"
//         limit(5) // Adjusted to 5 for recent alerts (changed from 1 for testing)
//       );
//       return onSnapshot(
//         alertsQuery,
//         (querySnapshot) => {
//           console.log("Snapshot received:", querySnapshot.docs.length); // Log the number of documents
//           const alertsList = querySnapshot.docs.map((doc) => ({
//             id: doc.id,
//             ...doc.data(),
//           }));
//           setAlerts(alertsList);
//           console.log("Alerts List:", alertsList);

//           const stats = alertsList.reduce(
//             (acc, alert) => {
//               // Default to "pending" if status is missing
//               const alertStatus = alert.status || "pending";
//               if (alertStatus === "pending") acc.pending++;
//               else if (alertStatus === "approved") acc.approved++;
//               else if (alertStatus === "rejected") acc.rejected++;
//               return acc;
//             },
//             { pending: 0, approved: 0, rejected: 0 }
//           );
//           setStats(stats);
//           console.log("The stats are:", stats);
//         },
//         (error) => {
//           console.error("Error fetching alerts:", error);
//           setError("Failed to load alerts.");
//         }
//       );
//     } catch (error) {
//       console.error("Error in fetchAlerts:", error);
//       setError("Failed to fetch alerts.");
//     }
//   }, []);

//   // Step 6: Set up effect to fetch all data
//   useEffect(() => {
//     setLoading(true);
//     setError(null);

//     const unsubscribeAuth = fetchCurrentUser();
//     const unsubscribeDevices = fetchDeviceId();
//     const unsubscribeSensors = fetchSensorData();
//     const unsubscribeAlerts = fetchAlerts();

//     fabScale.value = withTiming(1, { duration: 500 });
//     setLoading(false);

//     return () => {
//       unsubscribeAuth?.();
//       unsubscribeDevices?.();
//       unsubscribeSensors?.();
//       unsubscribeAlerts?.();
//     };
//   }, [fetchCurrentUser, fetchDeviceId, fetchSensorData, fetchAlerts]);

//   // Combined data structure for FlatList
//   const dashboardData = [
//     { type: "header", id: "header" },
//     { type: "deviceStatus", id: "deviceStatus", data: device },
//     { type: "alertStats", id: "alertStats", data: stats },
//     { type: "recentAlerts", id: "recentAlerts", data: alerts },
//     { type: "quickActions", id: "quickActions" },
//   ];

//   const handleViewSensors = () => {
//     fabScale.value = withTiming(
//       1.2,
//       { duration: 200 },
//       () => (fabScale.value = withTiming(1, { duration: 200 }))
//     );
//     router.push("/(tabs)/SensorsPage");
//   };

//   const renderItem = ({ item }) => {
//     switch (item.type) {
//       case "header":
//         return (
//           <LinearGradient colors={["#4CAF50", "#388E3C"]} style={styles.header}>
//             <Text style={styles.headerTitle}>Wildlife Dashboard</Text>
//             <TouchableOpacity onPress={() => router.replace("/(auth)/SignIn")}>
//               <Icon name="log-out-outline" size={24} color="#fff" />
//             </TouchableOpacity>
//           </LinearGradient>
//         );
//       case "deviceStatus":
//         return (
//           <Animated.View entering={FadeIn.duration(800)} style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>Device Status</Text>
//               <Icon name="hardware-chip" size={20} color="#4CAF50" />
//             </View>
//             <View style={styles.statusRow}>
//               <Text style={styles.statusLabel}>
//                 {item.data?.name || "Unknown Device"}
//               </Text>
//               <View
//                 style={[
//                   styles.statusIndicator,
//                   {
//                     backgroundColor:
//                       item.data?.status === "active"
//                         ? "#4CAF50"
//                         : item.data?.status === "maintenance"
//                         ? "#FF9800"
//                         : "#D32F2F",
//                   },
//                 ]}
//               >
//                 <Text style={styles.statusText}>
//                   {item.data?.status || "Offline"}
//                 </Text>
//               </View>
//             </View>
//             <Text style={styles.statusDetail}>
//               Last Ping:{" "}
//               {item.data?.lastPing ? formatTime(item.data.lastPing) : "N/A"}
//             </Text>
//             {item.data?.areaName && (
//               <Text style={styles.statusDetail}>
//                 Location: {item.data.areaName}
//               </Text>
//             )}
//           </Animated.View>
//         );
//       case "alertStats":
//         return (
//           <Animated.View entering={FadeIn.duration(1000)} style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>Alert Statistics</Text>
//               <Icon name="alert-circle" size={20} color="#4CAF50" />
//             </View>
//             <View style={styles.statsGrid}>
//               <View
//                 style={[
//                   styles.statItem,
//                   { backgroundColor: "rgba(255, 193, 7, 0.2)" },
//                 ]}
//               >
//                 <Text style={styles.statNumber}>{item.data.pending}</Text>
//                 <Text style={styles.statLabel}>Pending</Text>
//               </View>
//               <View
//                 style={[
//                   styles.statItem,
//                   { backgroundColor: "rgba(76, 175, 80, 0.2)" },
//                 ]}
//               >
//                 <Text style={styles.statNumber}>{item.data.approved}</Text>
//                 <Text style={styles.statLabel}>Approved</Text>
//               </View>
//               <View
//                 style={[
//                   styles.statItem,
//                   { backgroundColor: "rgba(244, 67, 54, 0.2)" },
//                 ]}
//               >
//                 <Text style={styles.statNumber}>{item.data.rejected}</Text>
//                 <Text style={styles.statLabel}>Rejected</Text>
//               </View>
//             </View>
//           </Animated.View>
//         );

//       case "recentAlerts":
//         return (
//           <Animated.View entering={FadeIn.duration(800)} style={styles.card}>
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>Recent Alerts</Text>
//               <Icon name="notifications" size={20} color="#4CAF50" />
//             </View>
//             {item.data.length > 0 ? (
//               item.data.map((alert) => (
//                 <TouchableOpacity
//                   key={alert.id}
//                   style={styles.alertCard}
//                   onPress={() =>
//                     router.push({
//                       pathname: "/(tabs)/AlertDetailPage",
//                       params: { alertId: alert.id },
//                     })
//                   }
//                 >
//                   <Animated.View entering={SlideInRight}>
//                     <View style={styles.alertHeader}>
//                       <Text style={styles.alertTime}>
//                         {alert.occur_at ? formatTime(alert.occur_at) : "N/A"}{" "}
//                         {/* Changed from alert.timestamp to alert.occur_at */}
//                       </Text>
//                       <Text
//                         style={[
//                           styles.alertStatus,
//                           {
//                             color:
//                               (alert.status || "pending") === "pending"
//                                 ? "#FF9800"
//                                 : (alert.status || "pending") === "approved"
//                                 ? "#4CAF50"
//                                 : "#D32F2F",
//                           },
//                         ]}
//                       >
//                         {alert.status || "pending"}{" "}
//                         {/* Default to "pending" if status is missing */}
//                       </Text>
//                     </View>
//                     <Text style={styles.alertDetails}>
//                       {alert.detections?.sound?.detected &&
//                         `Sound (${alert.detections.sound.type}): ${(
//                           alert.detections.sound.confidence * 100
//                         ).toFixed(0)}%`}
//                       {alert.detections?.image?.detected &&
//                         `, Image (${alert.detections.image.type}): ${(
//                           alert.detections.image.confidence * 100
//                         ).toFixed(0)}%`}
//                       {alert.detections?.smoke?.detected &&
//                         `, Smoke: ${alert.detections.smoke.level}`}
//                     </Text>
//                     {alert.detections?.image?.imageUrl && (
//                       <Text style={styles.alertDetails}>
//                         Image: {alert.detections.image.imageUrl}
//                       </Text>
//                     )}
//                   </Animated.View>
//                 </TouchableOpacity>
//               ))
//             ) : (
//               <Text style={styles.emptyText}>No recent alerts</Text>
//             )}
//           </Animated.View>
//         );
//       case "quickActions":
//         return (
//           <View style={styles.quickActions}>
//             <TouchableOpacity
//               style={styles.quickActionButton}
//               onPress={() => router.push("/(tabs)/AlertsPage")}
//             >
//               <Icon name="alert-circle-outline" size={24} color="#fff" />
//               <Text style={styles.quickActionText}>View All Alerts</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.quickActionButton}
//               onPress={() => router.push("/(tabs)/Settings")}
//             >
//               <Icon name="settings-outline" size={24} color="#fff" />
//               <Text style={styles.quickActionText}>Settings</Text>
//             </TouchableOpacity>
//           </View>
//         );
//       default:
//         return null;
//     }
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <StatusBar style="light" />
//         <ActivityIndicator size="large" color="#4CAF50" />
//         <Text style={styles.loadingText}>Loading dashboard data...</Text>
//       </SafeAreaView>
//     );
//   }

//   if (error) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <StatusBar style="light" />
//         <Text style={styles.loadingText}>{error}</Text>
//         <TouchableOpacity
//           style={styles.retryButton}
//           onPress={() => {
//             setLoading(true);
//             setError(null);
//             fetchCurrentUser();
//             fetchDeviceId();
//             fetchSensorData();
//             fetchAlerts();
//           }}
//         >
//           <Text style={styles.retryText}>Retry</Text>
//         </TouchableOpacity>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar style="light" />
//       <FlatList
//         data={dashboardData}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.listContent}
//       />
//       <Animated.View style={[styles.fab, fabStyle]}>
//         <TouchableOpacity style={styles.fabButton} onPress={handleViewSensors}>
//           <Icon name="speedometer-outline" size={24} color="#fff" />
//           <Text style={styles.fabText}>Sensors Data</Text>
//         </TouchableOpacity>
//       </Animated.View>
//     </SafeAreaView>
//   );
// };

// // Styles (unchanged)
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#121212" },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#121212",
//   },
//   loadingText: {
//     color: "#fff",
//     marginTop: 15,
//     fontSize: 16,
//     fontFamily: "System",
//   },
//   retryButton: {
//     backgroundColor: "#4CAF50",
//     padding: 10,
//     borderRadius: 8,
//     marginTop: 15,
//   },
//   retryText: { color: "#fff", fontSize: 16, fontWeight: "600" },
//   header: {
//     padding: 20,
//     paddingTop: Platform.OS === "ios" ? 10 : 40,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     ...Platform.select({
//       ios: {
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 6,
//       },
//       android: { elevation: 6 },
//     }),
//   },
//   headerTitle: {
//     color: "#fff",
//     fontSize: 28,
//     fontWeight: "bold",
//     fontFamily: "System",
//   },
//   listContent: { padding: 15, paddingBottom: 100 },
//   card: {
//     backgroundColor: "#1e1e1e",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
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
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   cardTitle: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "700",
//     fontFamily: "System",
//   },
//   statusRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   statusLabel: { color: "#fff", fontSize: 16, fontWeight: "600" },
//   statusIndicator: {
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//     borderRadius: 12,
//   },
//   statusText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "bold",
//     textTransform: "uppercase",
//   },
//   statusDetail: { color: "#bbb", fontSize: 14 },
//   statsGrid: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 12,
//   },
//   statItem: {
//     width: "30%",
//     alignItems: "center",
//     padding: 12,
//     borderRadius: 12,
//   },
//   statNumber: { color: "#fff", fontSize: 24, fontWeight: "bold" },
//   statLabel: { color: "#bbb", fontSize: 14, marginTop: 4 },
//   alertCard: {
//     backgroundColor: "#2d2d2d",
//     borderRadius: 12,
//     padding: 12,
//     marginVertical: 8,
//   },
//   alertHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   alertTime: { color: "#fff", fontSize: 14 },
//   alertStatus: { fontSize: 14, fontWeight: "500", textTransform: "capitalize" },
//   alertDetails: { color: "#999", fontSize: 12 },
//   emptyText: {
//     color: "#999",
//     fontSize: 16,
//     textAlign: "center",
//     marginVertical: 20,
//   },
//   quickActions: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginVertical: 16,
//   },
//   quickActionButton: {
//     backgroundColor: "#4CAF50",
//     borderRadius: 12,
//     padding: 12,
//     flexDirection: "row",
//     alignItems: "center",
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
//   quickActionText: {
//     color: "#fff",
//     fontSize: 16,
//     marginLeft: 8,
//     fontWeight: "600",
//   },
//   fab: {
//     position: "absolute",
//     bottom: 20,
//     right: 20,
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
//   fabButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#4CAF50",
//     borderRadius: 12,
//     padding: 12,
//   },
//   fabText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8 },
// });

// export default DashboardPage;
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
import { LineChart } from "react-native-chart-kit";
import { auth, db } from "../../services/firebase";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const { width } = Dimensions.get("window");

const DashboardPage = () => {
  const [device, setDevice] = useState(null);
  const [sensorReadings, setSensorReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const router = useRouter();

  const fabScale = useSharedValue(0.8);
  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  // Convert Firestore timestamp to Date
  const convertFirestoreTimestamp = (timestamp) => {
    if (!timestamp) return new Date();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
    if (timestamp.toDate) return timestamp.toDate();
    return new Date(timestamp);
  };

  // Format time for display
  const formatTime = (timestamp) =>
    !timestamp
      ? "N/A"
      : convertFirestoreTimestamp(timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

  // Step 1: Get current user from Firebase Auth
  const fetchCurrentUser = useCallback(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUserId(firebaseUser.uid);
        fetchUserData(firebaseUser.uid);
        console.log("Current User ID:", firebaseUser.uid);
      } else {
        setCurrentUserId(null);
        setUser(null);
        setError("No authenticated user found. Please log in.");
        router.replace("/(auth)/SignIn");
      }
    });
  }, []);

  // Step 2: Fetch user data from Firestore
  const fetchUserData = useCallback((uid) => {
    try {
      const userRef = doc(db, "users", uid);
      return onSnapshot(
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
          setError("Failed to load user data.");
        }
      );
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      setError("Failed to fetch user data.");
    }
  }, []);

  // Step 3: Fetch the first device for the user (or modify based on your logic)
  const fetchDeviceId = useCallback(() => {
    try {
      const devicesQuery = query(collection(db, "devices"), limit(1));
      return onSnapshot(
        devicesQuery,
        (querySnapshot) => {
          if (!querySnapshot.empty) {
            const deviceDoc = querySnapshot.docs[0];
            setSelectedDeviceId(deviceDoc.id);
            setDevice({ id: deviceDoc.id, ...deviceDoc.data() });
          } else {
            setSelectedDeviceId(null);
            setDevice(null);
            console.warn("No devices found.");
          }
        },
        (error) => {
          console.error("Error fetching devices:", error);
          setError("Failed to load device data.");
        }
      );
    } catch (error) {
      console.error("Error in fetchDeviceId:", error);
      setError("Failed to fetch device ID.");
    }
  }, []);

  // Step 4: Fetch sensor data based on selectedDeviceId
  const fetchSensorData = useCallback(() => {
    if (!selectedDeviceId) {
      console.log("No selectedDeviceId available to fetch sensor data.");
      // Fallback to test with known deviceId
      setSelectedDeviceId("pi_unit_001"); // Hardcode for testing
      console.log("Fallback selectedDeviceId set to:", "pi_unit_001");
    }

    try {
      console.log("Fetching sensor data for deviceId:", selectedDeviceId);
      const sensorRef = doc(db, "sensors", selectedDeviceId);
      return onSnapshot(
        sensorRef,
        (sensorSnap) => {
          if (sensorSnap.exists()) {
            const sensorData = sensorSnap.data();
            console.log("Raw Sensor Data:", sensorData);

            if (!sensorData.sensorReadings) {
              console.warn(
                "No sensorReadings field in sensor data for deviceId:",
                selectedDeviceId
              );
              setSensorReadings([]);
              return;
            }

            const readings = [
              ...(sensorData.sensorReadings?.sound
                ? [{ type: "sound", ...sensorData.sensorReadings.sound }]
                : []),
              ...(sensorData.sensorReadings?.smoke
                ? [{ type: "smoke", ...sensorData.sensorReadings.smoke }]
                : []),
              ...(sensorData.sensorReadings?.motion
                ? [{ type: "motion", ...sensorData.sensorReadings.motion }]
                : []),
              ...(sensorData.sensorReadings?.camera
                ? [{ type: "camera", ...sensorData.sensorReadings.camera }]
                : []),
              ...(sensorData.sensorReadings?.gsm
                ? [{ type: "gsm", ...sensorData.sensorReadings.gsm }]
                : []),
              ...(sensorData.sensorReadings?.wifi
                ? [{ type: "wifi", ...sensorData.sensorReadings.wifi }]
                : []),
            ]
              .filter(
                (r) =>
                  r.last_updated &&
                  (r.level || r.value || r.signal_strength || r.status)
              ) // Ensure valid data
              .sort(
                (a, b) =>
                  convertFirestoreTimestamp(b.last_updated) -
                  convertFirestoreTimestamp(a.last_updated)
              )
              .slice(0, 10);

            console.log("Processed Sensor Readings:", readings); // Log before setting
            if (readings.length > 0) {
              setSensorReadings(readings);
            } else {
              console.warn(
                "No valid readings after processing for deviceId:",
                selectedDeviceId
              );
              setSensorReadings([]);
            }
          } else {
            setSensorReadings([]);
            console.warn(
              "No sensor data found for deviceId:",
              selectedDeviceId
            );
          }
        },
        (error) => {
          console.error("Error fetching sensor data:", error.message);
          setError("Failed to load sensor data.");
        }
      );
    } catch (error) {
      console.error("Error in fetchSensorData:", error.message);
      setError("Failed to fetch sensor data.");
    }
  }, [selectedDeviceId]);

  // Step 5: Fetch alerts
  const fetchAlerts = useCallback(() => {
    try {
      const alertsQuery = query(
        collection(db, "alerts"),
        orderBy("occur_at", "desc"),
        limit(5)
      );
      return onSnapshot(
        alertsQuery,
        (querySnapshot) => {
          console.log("Snapshot received:", querySnapshot.docs.length);
          const alertsList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setAlerts(alertsList);
          console.log("Alerts List:", alertsList);

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
          console.log("The stats are:", stats);
        },
        (error) => {
          console.error("Error fetching alerts:", error);
          setError("Failed to load alerts.");
        }
      );
    } catch (error) {
      console.error("Error in fetchAlerts:", error);
      setError("Failed to fetch alerts.");
    }
  }, []);

  // Step 6: Set up effect to fetch all data
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribeAuth = fetchCurrentUser();
    const unsubscribeDevices = fetchDeviceId();
    const unsubscribeSensors = fetchSensorData();
    const unsubscribeAlerts = fetchAlerts();

    fabScale.value = withTiming(1, { duration: 500 });
    setLoading(false);

    return () => {
      unsubscribeAuth?.();
      unsubscribeDevices?.();
      unsubscribeSensors?.();
      unsubscribeAlerts?.();
    };
  }, [fetchCurrentUser, fetchDeviceId, fetchSensorData, fetchAlerts]);

  // Chart data with validation
  const chartData = {
    labels: sensorReadings
      .map((reading) => formatTime(reading.last_updated))
      .slice(0, 10)
      .reverse(),
    datasets: [
      {
        data: sensorReadings
          .map((reading) => {
            const value =
              reading.type === "smoke"
                ? reading.level || 0
                : reading.type === "motion" && reading.status === "detected"
                ? 1
                : reading.type === "motion" && reading.status !== "detected"
                ? 0
                : reading.type === "sound"
                ? reading.value || 0
                : reading.type === "gsm"
                ? reading.signal_strength || 0
                : 0; // Camera and WiFi default to 0
            console.log(`Chart data for ${reading.type}: ${value}`);
            return isFinite(value) ? value : 0;
          })
          .slice(0, 10)
          .reverse(),
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ["Sensor Activity"],
  };

  // Combined data structure for FlatList
  const dashboardData = [
    { type: "header", id: "header" },
    { type: "deviceStatus", id: "deviceStatus", data: device },
    { type: "sensorChart", id: "sensorChart", data: chartData },
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
      case "sensorChart":
        return (
          <Animated.View
            entering={SlideInRight.duration(800)}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Sensor Activity</Text>
              <Icon name="analytics" size={20} color="#4CAF50" />
            </View>
            {sensorReadings.length > 0 ? (
              <LineChart
                data={chartData}
                width={width - 40}
                height={200}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: "#1a1a1a",
                  backgroundGradientFrom: "#1a1a1a",
                  backgroundGradientTo: "#1a1a1a",
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                  labelColor: (opacity = 1) => `#fff`,
                  style: { borderRadius: 16 },
                  propsForDots: { r: "4", strokeWidth: "2", stroke: "#4CAF50" },
                }}
                bezier
                style={styles.chart}
              />
            ) : (
              <Text style={styles.emptyText}>No sensor data available</Text>
            )}
            <Text style={styles.chartLabel}>
              Last 10 Readings (Motion/Smoke/Sound/GSM)
            </Text>
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
                  { backgroundColor: "rgba(255, 193, 7, 0.2)" },
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
              item.data.map((alert) => (
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
                        {alert.occur_at ? formatTime(alert.occur_at) : "N/A"}
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
                    <Text style={styles.alertDetails}>
                      {alert.detections?.sound?.detected &&
                        `Sound (${alert.detections.sound.type}): ${(
                          alert.detections.sound.confidence * 100
                        ).toFixed(0)}%`}
                      {alert.detections?.image?.detected &&
                        `, Image (${alert.detections.image.type}): ${(
                          alert.detections.image.confidence * 100
                        ).toFixed(0)}%`}
                      {alert.detections?.smoke?.detected &&
                        `, Smoke: ${alert.detections.smoke.level}`}
                    </Text>
                    {alert.detections?.image?.imageUrl && (
                      <Text style={styles.alertDetails}>
                        Image: {alert.detections.image.imageUrl}
                      </Text>
                    )}
                  </Animated.View>
                </TouchableOpacity>
              ))
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
              onPress={() => router.push("/(tabs)/Settings")}
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
        <Text style={styles.loadingText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            fetchCurrentUser();
            fetchDeviceId();
            fetchSensorData();
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
      <StatusBar style="inverted" />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
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
    fontFamily: "System",
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  retryText: { color: "#fff", fontSize: 16, fontWeight: "600" },
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
      android: { elevation: 6 },
    }),
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: "System",
  },
  listContent: { padding: 15, paddingBottom: 100 },
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
      android: { elevation: 4 },
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
    fontFamily: "System",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusLabel: { color: "#fff", fontSize: 16, fontWeight: "600" },
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
  statusDetail: { color: "#bbb", fontSize: 14 },
  chart: { marginVertical: 8, borderRadius: 16 },
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
  statNumber: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  statLabel: { color: "#bbb", fontSize: 14, marginTop: 4 },
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
  alertTime: { color: "#fff", fontSize: 14 },
  alertStatus: { fontSize: 14, fontWeight: "500", textTransform: "capitalize" },
  alertDetails: { color: "#999", fontSize: 12 },
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
      android: { elevation: 4 },
    }),
  },
  quickActionText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: { elevation: 8 },
    }),
  },
  fabButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 12,
  },
  fabText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8 },
});

export default DashboardPage;
