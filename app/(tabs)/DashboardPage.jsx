// !Working one
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
// import { auth, db } from "../../services/firebase";
// import {
//   doc,
//   onSnapshot,
//   collection,
//   query,
//   where,
//   orderBy,
//   limit,
//   Timestamp,
// } from "firebase/firestore";
// import { onAuthStateChanged } from "firebase/auth";

// const { width } = Dimensions.get("window");

// const DashboardPage = () => {
//   const [device, setDevice] = useState(null);
//   const [alerts, setAlerts] = useState([]);
//   const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const [selectedDeviceId, setSelectedDeviceId] = useState(null);
//   const [alertTrendsData, setAlertTrendsData] = useState({
//     labels: [],
//     datasets: [{ data: [] }],
//   });
//   const [tooltip, setTooltip] = useState({
//     visible: false,
//     x: 0,
//     y: 0,
//     value: 0,
//     label: "",
//   });

//   const router = useRouter();

//   const fabScale = useSharedValue(0.8);
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
//   const formatTime = (timestamp) => {
//     if (!timestamp) return "N/A";

//     const date = convertFirestoreTimestamp(timestamp);
//     if (!(date instanceof Date) || isNaN(date.getTime())) return "Invalid Date";

//     return date.toLocaleTimeString([], {
//       hour: "numeric",
//       minute: "2-digit",
//     });
//   };

//   // Fetch current user
//   const fetchCurrentUser = useCallback(() => {
//     return onAuthStateChanged(auth, (firebaseUser) => {
//       if (firebaseUser) {
//         setCurrentUserId(firebaseUser.uid);
//         fetchUserData(firebaseUser.uid);
//         console.log("Current User ID:", firebaseUser.uid);
//       } else {
//         setCurrentUserId(null);
//         setUser(null);
//         setError("No authenticated user found. Please log in.");
//         router.replace("/(auth)/SignIn");
//       }
//     });
//   }, []);

//   // Fetch user data
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
//           setError("Failed to load user data. Please try again.");
//         }
//       );
//     } catch (error) {
//       console.error("Error in fetchUserData:", error);
//       setError("Failed to fetch user data. Please try again.");
//     }
//   }, []);

//   // Fetch the first device
//   const fetchDeviceId = useCallback(() => {
//     try {
//       const devicesQuery = query(collection(db, "devices"));
//       return onSnapshot(
//         devicesQuery,
//         (querySnapshot) => {
//           if (!querySnapshot.empty) {
//             const deviceDoc = querySnapshot.docs[0];
//             const deviceData = deviceDoc.data();
//             const deviceId = deviceData.deviceId || deviceDoc.id;
//             setSelectedDeviceId(deviceId);
//             setDevice({ id: deviceDoc.id, ...deviceData });
//             console.log("Selected Device ID:", deviceId);
//           } else {
//             setSelectedDeviceId(null);
//             setDevice(null);
//             console.warn("No devices found.");
//           }
//         },
//         (error) => {
//           console.error("Error fetching devices:", error);
//           setError("Failed to load device data. Please try again.");
//         }
//       );
//     } catch (error) {
//       console.error("Error in fetchDeviceId:", error);
//       setError("Failed to fetch device ID. Please try again.");
//     }
//   }, []);

//   // Fetch alerts
//   const fetchAlerts = useCallback(() => {
//     try {
//       const now = new Date();
//       const startTime = new Date();
//       startTime.setUTCHours(startTime.getUTCHours() - 24); // Last 24 hours in UTC

//       console.log("Current time (UTC):", now.toISOString());
//       console.log("Start time (UTC):", startTime.toISOString());

//       const alertsQuery = query(
//         collection(db, "alerts"),
//         where("occur_at", ">=", startTime),
//         orderBy("occur_at", "desc"),
//         limit(5)
//       );

//       return onSnapshot(
//         alertsQuery,
//         (querySnapshot) => {
//           console.log("Snapshot received:", querySnapshot.docs.length);
//           const alertsList = querySnapshot.docs.map((doc) => {
//             const data = doc.data();
//             const occurAt =
//               data.occur_at instanceof Timestamp
//                 ? data.occur_at.toDate()
//                 : convertFirestoreTimestamp(data.occur_at);

//             console.log(
//               `Alert ${doc.id} occur_at (UTC):`,
//               occurAt.toISOString()
//             );

//             return {
//               id: doc.id,
//               occur_at: occurAt,
//               status: data.status || "pending",
//               detections: data.detections || {},
//             };
//           });

//           setAlerts(alertsList);
//           console.log("Alerts List:", alertsList);

//           const stats = alertsList.reduce(
//             (acc, alert) => {
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

//           const alertTrends = {};
//           alertsList.forEach((alert) => {
//             if (alert.occur_at) {
//               const hour = alert.occur_at.toLocaleTimeString([], {
//                 hour: "numeric",
//               });
//               alertTrends[hour] = (alertTrends[hour] || 0) + 1;
//             }
//           });

//           const trendLabels = [];
//           const trendData = [];
//           for (let i = 1; i >= 0; i--) {
//             const hourDate = new Date(now.getTime() - i * 60 * 60 * 1000);
//             const hour = hourDate.toLocaleTimeString([], { hour: "numeric" });
//             trendLabels.push(hour);
//             trendData.push(alertTrends[hour] || 0);
//           }

//           setAlertTrendsData({
//             labels: trendLabels,
//             datasets: [
//               {
//                 data: trendData,
//                 color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
//                 strokeWidth: 2,
//               },
//             ],
//             legend: ["Alerts per Hour"],
//           });
//         },
//         (error) => {
//           console.error("Error fetching alerts:", error);
//           if (
//             error.code === "failed-precondition" &&
//             error.message.includes("index")
//           ) {
//             setError(
//               "Firestore query requires an index. Please create an index for 'occur_at' and 'desc' order in Firestore. See console for details or visit: " +
//                 (error.message.match(/https:\/\/[^ ]+/)?.[0] ||
//                   "Firestore Console")
//             );
//           } else {
//             setError("Failed to load alerts: " + error.message);
//           }
//         }
//       );
//     } catch (error) {
//       console.error("Error in fetchAlerts:", error);
//       setError("Failed to fetch alerts: " + error.message);
//     }
//   }, []);

//   useEffect(() => {
//     setLoading(true);
//     setError(null);

//     const unsubscribeAuth = fetchCurrentUser();
//     const unsubscribeDevices = fetchDeviceId();
//     const unsubscribeAlerts = fetchAlerts();

//     fabScale.value = withTiming(1, { duration: 500 });
//     setLoading(false);

//     return () => {
//       unsubscribeAuth?.();
//       unsubscribeDevices?.();
//       unsubscribeAlerts?.();
//     };
//   }, [fetchCurrentUser, fetchDeviceId, fetchAlerts]);

//   const dashboardData = [
//     { type: "header", id: "header" },
//     { type: "deviceStatus", id: "deviceStatus", data: device },
//     { type: "alertTrendsChart", id: "alertTrendsChart", data: alertTrendsData },
//     { type: "alertStats", id: "alertStats", data: stats },
//     { type: "recentAlerts", id: "recentAlerts", data: alerts },
//     { type: "quickActions", id: "quickActions" },
//   ];

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
//       case "alertTrendsChart":
//         return (
//           <Animated.View
//             entering={SlideInRight.duration(800)}
//             style={styles.card}
//           >
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>Alert Trends (Last 1 Hour)</Text>
//               <Icon name="trending-up" size={20} color="#FF9800" />
//             </View>
//             {item.data.labels.length > 0 ? (
//               <View style={styles.chartContainer}>
//                 <LineChart
//                   data={item.data}
//                   width={width - 40}
//                   height={220}
//                   yAxisLabel=""
//                   yAxisSuffix=""
//                   chartConfig={{
//                     backgroundGradientFrom: "#1e1e1e",
//                     backgroundGradientTo: "#2d2d2d",
//                     color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
//                     labelColor: (opacity = 1) =>
//                       `rgba(255, 255, 255, ${opacity})`,
//                     strokeWidth: 3,
//                     propsForDots: {
//                       r: "6",
//                       strokeWidth: "2",
//                       stroke: "#FF9800",
//                       fill: "white",
//                     },
//                     propsForBackgroundLines: { stroke: "#444" },
//                     decimalPlaces: 0,
//                     style: {
//                       borderRadius: 16,
//                       paddingRight: 10,
//                     },
//                   }}
//                   bezier
//                   style={styles.chart}
//                   onDataPointClick={({ value, dataset, index, x, y }) => {
//                     setTooltip({
//                       visible: true,
//                       x: x + 10,
//                       y: y - 40,
//                       value,
//                       label: item.data.labels[index],
//                     });
//                     setTimeout(
//                       () => setTooltip({ ...tooltip, visible: false }),
//                       2000
//                     );
//                   }}
//                 />
//                 {tooltip.visible && (
//                   <Animated.View
//                     entering={FadeIn.duration(200)}
//                     exiting={FadeIn.duration(200)}
//                     style={[
//                       styles.tooltip,
//                       { left: tooltip.x, top: tooltip.y },
//                     ]}
//                   >
//                     <Text style={styles.tooltipText}>
//                       {`Hour: ${tooltip.label}\nAlerts: ${tooltip.value}`}
//                     </Text>
//                   </Animated.View>
//                 )}
//               </View>
//             ) : (
//               <Text style={styles.emptyText}>No alert trends available</Text>
//             )}
//             <Text style={styles.chartLabel}>Tap points for details</Text>
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
//                   { backgroundColor: "rgba(255, 152, 0, 0.2)" },
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
//               item.data.map((alert) => {
//                 const detectionDetails = [];
//                 if (alert.detections?.sound?.detected) {
//                   const soundConfidence = parseFloat(
//                     alert.detections.sound.confidence
//                   );
//                   detectionDetails.push(
//                     `Sound (${alert.detections.sound.type}): ${(
//                       soundConfidence * 100
//                     ).toFixed(0)}%`
//                   );
//                 }
//                 if (alert.detections?.image?.detected) {
//                   detectionDetails.push(
//                     `Image (${alert.detections.image.type}): ${(
//                       alert.detections.image.confidence * 100
//                     ).toFixed(0)}%`
//                   );
//                 }
//                 if (alert.detections?.smoke?.detected) {
//                   detectionDetails.push(
//                     `Smoke: ${alert.detections.smoke.level}`
//                   );
//                 }
//                 const detectionText = detectionDetails.join(", ");

//                 return (
//                   <TouchableOpacity
//                     key={alert.id}
//                     style={styles.alertCard}
//                     onPress={() =>
//                       router.push({
//                         pathname: "/(tabs)/AlertDetailPage",
//                         params: { alertId: alert.id },
//                       })
//                     }
//                   >
//                     <Animated.View entering={SlideInRight}>
//                       <View style={styles.alertHeader}>
//                         <Text style={styles.alertTime}>
//                           {alert.occur_at ? formatTime(alert.occur_at) : "N/A"}
//                         </Text>
//                         <Text
//                           style={[
//                             styles.alertStatus,
//                             {
//                               color:
//                                 (alert.status || "pending") === "pending"
//                                   ? "#FF9800"
//                                   : (alert.status || "pending") === "approved"
//                                   ? "#4CAF50"
//                                   : "#D32F2F",
//                             },
//                           ]}
//                         >
//                           {alert.status || "pending"}
//                         </Text>
//                       </View>
//                       {detectionText ? (
//                         <Text style={styles.alertDetails}>{detectionText}</Text>
//                       ) : null}
//                       {alert.detections?.image?.imageUrl && (
//                         <Text style={styles.alertDetails}>
//                           Image: {alert.detections.image.imageUrl}
//                         </Text>
//                       )}
//                     </Animated.View>
//                   </TouchableOpacity>
//                 );
//               })
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
//         console.warn("Unexpected item type in dashboardData:", item.type);
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
//       <StatusBar style="inverted" />
//       <FlatList
//         data={dashboardData}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.listContent}
//       />
//     </SafeAreaView>
//   );
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
//     backgroundColor: "#121212",
//   },
//   loadingText: {
//     color: "#fff",
//     marginTop: 15,
//     fontSize: 16,
//     fontFamily: "System",
//     textAlign: "center",
//   },
//   retryButton: {
//     backgroundColor: "#4CAF50",
//     padding: 10,
//     borderRadius: 8,
//     marginTop: 15,
//   },
//   retryText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//     textAlign: "center",
//   },
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
//       android: {
//         elevation: 6,
//       },
//     }),
//   },
//   headerTitle: {
//     color: "#fff",
//     fontSize: 28,
//     fontWeight: "bold",
//     fontFamily: "System",
//   },
//   listContent: {
//     padding: 15,
//     paddingBottom: 100,
//   },
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
//       android: {
//         elevation: 4,
//       },
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
//   statusLabel: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
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
//   statusDetail: {
//     color: "#bbb",
//     fontSize: 14,
//   },
//   chartContainer: {
//     position: "relative",
//     marginVertical: 8,
//   },
//   chart: {
//     borderRadius: 16,
//     alignSelf: "center",
//   },
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
//   statNumber: {
//     color: "#fff",
//     fontSize: 24,
//     fontWeight: "bold",
//   },
//   statLabel: {
//     color: "#bbb",
//     fontSize: 14,
//     marginTop: 4,
//   },
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
//   alertTime: {
//     color: "#fff",
//     fontSize: 14,
//   },
//   alertStatus: {
//     fontSize: 14,
//     fontWeight: "500",
//     textTransform: "capitalize",
//   },
//   alertDetails: {
//     color: "#999",
//     fontSize: 12,
//   },
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
//       android: {
//         elevation: 4,
//       },
//     }),
//   },
//   quickActionText: {
//     color: "#fff",
//     fontSize: 16,
//     marginLeft: 8,
//     fontWeight: "600",
//   },
//   tooltip: {
//     position: "absolute",
//     backgroundColor: "rgba(0, 0, 0, 0.8)",
//     padding: 8,
//     borderRadius: 8,
//     zIndex: 10,
//   },
//   tooltipText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "600",
//   },
// });

// export default DashboardPage;
//! newn ew one
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
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const DashboardPage = () => {
  const [device, setDevice] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [alertTrendsData, setAlertTrendsData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    value: 0,
    label: "",
  });

  const router = useRouter();
  const unsubscribeRef = useRef({ auth: null, devices: null, alerts: null });

  const fabScale = useSharedValue(0.8);
  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  // Convert Firestore timestamp to Date
  const convertFirestoreTimestamp = (timestamp) => {
    if (!timestamp) {
      console.warn("Timestamp is null or undefined");
      return null;
    }
    try {
      if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
      }
      if (
        timestamp.seconds &&
        typeof timestamp.seconds === "number" &&
        (timestamp.nanoseconds || timestamp.nanoseconds === 0)
      ) {
        return new Date(
          timestamp.seconds * 1000 +
            Math.floor((timestamp.nanoseconds || 0) / 1e6)
        );
      }
      if (timestamp instanceof Date) {
        return timestamp;
      }
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date;
      }
      console.warn("Invalid timestamp format:", timestamp);
      return null;
    } catch (error) {
      console.error("Error converting timestamp:", error, timestamp);
      return null;
    }
  };

  // Format time for display
  const formatTime = (timestamp) => {
    const date = convertFirestoreTimestamp(timestamp);
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "N/A";
    }
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
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
          fetchUserData(firebaseUser.uid);
          console.log("Current User ID:", firebaseUser.uid);
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
  }, []);

  // Fetch user data
  const fetchUserData = useCallback((uid) => {
    if (!db) {
      setError("Firestore db not initialized.");
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
    unsubscribeRef.current.user = unsubscribe;
    return unsubscribe;
  }, []);

  // Fetch the first device
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

          console.log("Selected Device ID:", deviceId);

          // Store deviceId in AsyncStorage
          try {
            await AsyncStorage.setItem("device_id", deviceId);
            console.log("Device ID stored in AsyncStorage.");
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

  // Fetch alerts
  const fetchAlerts = useCallback(() => {
    if (!db) {
      setError("Firestore db not initialized.");
      return () => {};
    }
    try {
      const now = new Date();
      const startTime = new Date();
      startTime.setUTCHours(startTime.getUTCHours() - 24);

      console.log("Current time (UTC):", now.toISOString());
      console.log("Start time (UTC):", startTime.toISOString());

      const alertsQuery = query(
        collection(db, "alerts"),
        where("occur_at", ">=", startTime),
        orderBy("occur_at", "desc"),
        limit(5)
      );

      const unsubscribe = onSnapshot(
        alertsQuery,
        (querySnapshot) => {
          console.log("Snapshot received:", querySnapshot.docs.length);
          const alertsList = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            const occurAt = data.occur_at;
            console.log(`Alert ${doc.id} occur_at (raw):`, occurAt);
            const convertedOccurAt = convertFirestoreTimestamp(occurAt);
            console.log(
              `Alert ${doc.id} occur_at (converted):`,
              convertedOccurAt
            );
            return {
              id: doc.id,
              occur_at: convertedOccurAt,
              status: data.status || "pending",
              detections: data.detections || {},
            };
          });

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

          const alertTrends = {};
          alertsList.forEach((alert) => {
            if (alert.occur_at) {
              const hour = alert.occur_at.toLocaleTimeString([], {
                hour: "numeric",
              });
              alertTrends[hour] = (alertTrends[hour] || 0) + 1;
            }
          });

          const trendLabels = [];
          const trendData = [];
          for (let i = 1; i >= 0; i--) {
            const hourDate = new Date(now.getTime() - i * 60 * 60 * 1000);
            const hour = hourDate.toLocaleTimeString([], { hour: "numeric" });
            trendLabels.push(hour);
            trendData.push(alertTrends[hour] || 0);
          }

          setAlertTrendsData({
            labels: trendLabels,
            datasets: [
              {
                data: trendData,
                color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
                strokeWidth: 2,
              },
            ],
            legend: ["Alerts per Hour"],
          });
        },
        (error) => {
          console.error("Error fetching alerts:", error);
          if (
            error.code === "failed-precondition" &&
            error.message.includes("index")
          ) {
            setError(
              "Firestore query requires an index. Please create an index for 'occur_at' and 'desc' order in Firestore. See console for details or visit: " +
                (error.message.match(/https:\/\/[^ ]+/)?.[0] ||
                  "Firestore Console")
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
      unsubscribeRef.current.auth?.();
      unsubscribeRef.current.devices?.();
      unsubscribeRef.current.alerts?.();
    };
  }, [fetchCurrentUser, fetchDeviceId, fetchAlerts]);

  const dashboardData = [
    { type: "header", id: "header" },
    { type: "deviceStatus", id: "deviceStatus", data: device },
    { type: "alertTrendsChart", id: "alertTrendsChart", data: alertTrendsData },
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
      case "alertTrendsChart":
        return (
          <Animated.View
            entering={SlideInRight.duration(800)}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Alert Trends (Last 1 Hour)</Text>
              <Icon name="trending-up" size={20} color="#FF9800" />
            </View>
            {item.data.labels.length > 0 ? (
              <View style={styles.chartContainer}>
                <LineChart
                  data={item.data}
                  width={width - 40}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={{
                    backgroundGradientFrom: "#1e1e1e",
                    backgroundGradientTo: "#2d2d2d",
                    color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
                    labelColor: (opacity = 1) =>
                      `rgba(255, 255, 255, ${opacity})`,
                    strokeWidth: 3,
                    propsForDots: {
                      r: "6",
                      strokeWidth: "2",
                      stroke: "#FF9800",
                      fill: "white",
                    },
                    propsForBackgroundLines: { stroke: "#444" },
                    decimalPlaces: 0,
                    style: {
                      borderRadius: 16,
                      paddingRight: 10,
                    },
                  }}
                  bezier
                  style={styles.chart}
                  onDataPointClick={({ value, dataset, index, x, y }) => {
                    setTooltip({
                      visible: true,
                      x: x + 10,
                      y: y - 40,
                      value,
                      label: item.data.labels[index],
                    });
                    setTimeout(
                      () => setTooltip({ ...tooltip, visible: false }),
                      2000
                    );
                  }}
                />
                {tooltip.visible && (
                  <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeIn.duration(200)}
                    style={[
                      styles.tooltip,
                      { left: tooltip.x, top: tooltip.y },
                    ]}
                  >
                    <Text style={styles.tooltipText}>
                      {`Hour: ${tooltip.label}\nAlerts: ${tooltip.value}`}
                    </Text>
                  </Animated.View>
                )}
              </View>
            ) : (
              <Text style={styles.emptyText}>No alert trends available</Text>
            )}
            <Text style={styles.chartLabel}>Tap points for details</Text>
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
                  { backgroundColor: "rgba(255, 152, 0, 0.2)" },
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
              item.data.map((alert) => {
                const detectionDetails = [];
                if (alert.detections?.sound?.detected) {
                  const soundConfidence = parseFloat(
                    alert.detections.sound.confidence
                  );
                  detectionDetails.push(
                    `Sound (${alert.detections.sound.type}): ${(
                      soundConfidence * 100
                    ).toFixed(0)}%`
                  );
                  if (alert.detections.sound.soundUrl?.length) {
                    alert.detections.sound.soundUrl.forEach((url, index) => {
                      detectionDetails.push(`Audio ${index + 1}: ${url}`);
                    });
                  }
                }
                if (alert.detections?.image?.detected) {
                  detectionDetails.push(
                    `Image (${alert.detections.image.type}): ${(
                      alert.detections.image.confidence * 100
                    ).toFixed(0)}%`
                  );
                  if (alert.detections.image.imageUrl?.length) {
                    alert.detections.image.imageUrl.forEach((url, index) => {
                      detectionDetails.push(`Image ${index + 1}: ${url}`);
                    });
                  }
                }
                if (alert.detections?.smoke?.detected) {
                  detectionDetails.push(
                    `Smoke: ${alert.detections.smoke.level}`
                  );
                }
                const detectionText = detectionDetails.join(", ");

                return (
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
                      {detectionText ? (
                        <Text style={styles.alertDetails}>{detectionText}</Text>
                      ) : null}
                    </Animated.View>
                  </TouchableOpacity>
                );
              })
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
        console.warn("Unexpected item type in dashboardData:", item.type);
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
    fontFamily: "System",
    textAlign: "center",
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
    fontWeight: "600",
    textAlign: "center",
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
    fontWeight: "bold",
    fontFamily: "System",
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
    fontWeight: "700",
    fontFamily: "System",
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
    fontWeight: "600",
  },
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
  statusDetail: {
    color: "#bbb",
    fontSize: 14,
  },
  chartContainer: {
    position: "relative",
    marginVertical: 8,
  },
  chart: {
    borderRadius: 16,
    alignSelf: "center",
  },
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
  statNumber: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#bbb",
    fontSize: 14,
    marginTop: 4,
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
  },
  alertStatus: {
    fontSize: 14,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  alertDetails: {
    color: "#999",
    fontSize: 12,
  },
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
      android: {
        elevation: 4,
      },
    }),
  },
  quickActionText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "600",
  },
  tooltip: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 8,
    borderRadius: 8,
    zIndex: 10,
  },
  tooltipText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default DashboardPage;
