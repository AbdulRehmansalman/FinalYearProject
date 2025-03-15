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
// import { useAuth } from "../../context/authContext";
// import {
//   doc,
//   onSnapshot,
//   collection,
//   query,
//   orderBy,
//   limit,
//   where,
//   getDocs, // Added for querying sensors
// } from "firebase/firestore";
// import { onAuthStateChanged } from "firebase/auth";

// const { width } = Dimensions.get("window");

// const DashboardPage = () => {
//   const { logout } = useAuth();
//   const [device, setDevice] = useState(null);
//   // const [sensorReadings, setSensorReadings] = useState([]);
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

//   // Format time for display (shorter format to avoid collision)
//   const formatTime = (timestamp) => {
//     if (!timestamp) return "N/A";

//     const date = convertFirestoreTimestamp(timestamp);
//     if (!(date instanceof Date) || isNaN(date.getTime())) return "Invalid Date";

//     return date.toLocaleTimeString([], {
//       hour: "numeric", // Shorter format (e.g., "9:30" instead of "9:30 AM")
//       minute: "2-digit",
//     });
//   };

//   // Step 1: Get current user from Firebase Auth
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

//   // Step 3: Fetch the first device for the user
//   const fetchDeviceId = useCallback(() => {
//     try {
//       const devicesQuery = query(collection(db, "devices"), limit(1));
//       return onSnapshot(
//         devicesQuery,
//         (querySnapshot) => {
//           if (!querySnapshot.empty) {
//             const deviceDoc = querySnapshot.docs[0];
//             const deviceData = deviceDoc.data();
//             setSelectedDeviceId(deviceData.deviceId || deviceDoc.id);
//             setDevice({ id: deviceDoc.id, ...deviceData });
//             console.log("Selected Device ID:", selectedDeviceId);
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
//   // const fetchSensorData = useCallback(() => {
//   //   let unsubscribeSensors = () => {};

//   //   const detectAndFetchSensorData = async () => {
//   //     if (!selectedDeviceId) {
//   //       console.log("No selectedDeviceId available to fetch sensor data.");
//   //       setSelectedDeviceId("pi_unit_001");
//   //       console.log("Fallback selectedDeviceId set to:", "pi_unit_001");
//   //       return;
//   //     }

//   //     try {
//   //       console.log("Fetching sensor data for deviceId:", selectedDeviceId);
//   //       const sensorsRef = collection(db, "sensors");
//   //       const q = query(sensorsRef, where("deviceId", "==", selectedDeviceId));
//   //       const querySnapshot = await getDocs(q);

//   //       if (!querySnapshot.empty) {
//   //         const sensorDoc = querySnapshot.docs[0];
//   //         const sensorId = sensorDoc.id;
//   //         console.log("Matched document ID:", sensorId);

//   //         unsubscribeSensors = onSnapshot(
//   //           doc(db, "sensors", sensorId),
//   //           (sensorSnap) => {
//   //             if (sensorSnap.exists()) {
//   //               const sensorData = sensorSnap.data();
//   //               console.log("Raw Sensor Data:", sensorData);

//   //               if (!sensorData.sensorReading) {
//   //                 console.warn(
//   //                   "No sensorReading field in sensor data for deviceId:",
//   //                   selectedDeviceId
//   //                 );
//   //                 setSensorReadings([]);
//   //                 return;
//   //               }

//   //               const readings = [
//   //                 ...(sensorData.sensorReading?.camera
//   //                   ? [{ type: "camera", ...sensorData.sensorReading.camera }]
//   //                   : []),
//   //                 ...(sensorData.sensorReading?.gsm
//   //                   ? [{ type: "gsm", ...sensorData.sensorReading.gsm }]
//   //                   : []),
//   //                 ...(sensorData.sensorReading?.motion
//   //                   ? [{ type: "motion", ...sensorData.sensorReading.motion }]
//   //                   : []),
//   //                 ...(sensorData.sensorReading?.smoke
//   //                   ? [{ type: "smoke", ...sensorData.sensorReading.smoke }]
//   //                   : []),
//   //                 ...(sensorData.sensorReading?.sound
//   //                   ? [{ type: "sound", ...sensorData.sensorReading.sound }]
//   //                   : []),
//   //                 ...(sensorData.sensorReading?.wifi
//   //                   ? [{ type: "wifi", ...sensorData.sensorReading.wifi }]
//   //                   : []),
//   //               ]
//   //                 .filter((r) => {
//   //                   const hasTimestamp = !!r.last_updated;
//   //                   const hasValue =
//   //                     r.level != null ||
//   //                     r.value != null ||
//   //                     r.signal_strength != null ||
//   //                     r.status != null;
//   //                   console.log(
//   //                     `Filtering reading for ${r.type}: hasTimestamp=${hasTimestamp}, hasValue=${hasValue}`,
//   //                     r
//   //                   );
//   //                   return hasTimestamp && hasValue;
//   //                 })
//   //                 .sort(
//   //                   (a, b) =>
//   //                     convertFirestoreTimestamp(b.last_updated) -
//   //                     convertFirestoreTimestamp(a.last_updated)
//   //                 );

//   //               if (readings.length > 0) {
//   //                 setSensorReadings(readings);
//   //               } else {
//   //                 console.warn(
//   //                   "No valid readings after processing for deviceId:",
//   //                   selectedDeviceId
//   //                 );
//   //                 setSensorReadings([]);
//   //               }
//   //             } else {
//   //               setSensorReadings([]);
//   //               console.warn(
//   //                 "No sensor data found for deviceId:",
//   //                 selectedDeviceId
//   //               );
//   //             }
//   //           },
//   //           (error) => {
//   //             console.error("Error fetching sensor data:", error.message);
//   //             setError("Failed to load sensor data.");
//   //           }
//   //         );
//   //       } else {
//   //         console.warn(
//   //           "No document found matching deviceId:",
//   //           selectedDeviceId
//   //         );
//   //         setSensorReadings([]);
//   //       }
//   //     } catch (error) {
//   //       console.error("Error in fetchSensorData:", error.message);
//   //       setError("Failed to fetch sensor data.");
//   //     }

//   //     return () => unsubscribeSensors();
//   //   };

//   //   detectAndFetchSensorData();
//   // }, [selectedDeviceId]);

//   //!Previous  Step 5: Fetch alerts
//   // const fetchAlerts = useCallback(() => {
//   //   try {
//   //     const alertsQuery = query(
//   //       collection(db, "alerts"),
//   //       orderBy("occur_at", "desc"),
//   //       limit(5)
//   //     );
//   //     return onSnapshot(
//   //       alertsQuery,
//   //       (querySnapshot) => {
//   //         console.log("Snapshot received:", querySnapshot.docs.length);
//   //         const alertsList = querySnapshot.docs.map((doc) => ({
//   //           id: doc.id,
//   //           ...doc.data(),
//   //         }));
//   //         setAlerts(alertsList);
//   //         console.log("Alerts List:", alertsList);

//   //         const stats = alertsList.reduce(
//   //           (acc, alert) => {
//   //             const alertStatus = alert.status || "pending";
//   //             if (alertStatus === "pending") acc.pending++;
//   //             else if (alertStatus === "approved") acc.approved++;
//   //             else if (alertStatus === "rejected") acc.rejected++;
//   //             return acc;
//   //           },
//   //           { pending: 0, approved: 0, rejected: 0 }
//   //         );
//   //         setStats(stats);
//   //         console.log("The stats are:", stats);
//   //       },
//   //       (error) => {
//   //         console.error("Error fetching alerts:", error);
//   //         setError("Failed to load alerts.");
//   //       }
//   //     );
//   //   } catch (error) {
//   //     console.error("Error in fetchAlerts:", error);
//   //     setError("Failed to fetch alerts.");
//   //   }
//   // }, []);
//   const fetchAlerts = useCallback(() => {
//     try {
//       const startTime = new Date();
//       startTime.setHours(startTime.getHours() - 1); // Last 1 hour

//       const alertsQuery = query(
//         collection(db, "alerts"),
//         where("occur_at", ">=", startTime), // Assumes occur_at is a Timestamp or Date
//         orderBy("occur_at", "desc")
//       );

//       return onSnapshot(
//         alertsQuery,
//         (querySnapshot) => {
//           console.log("Snapshot received:", querySnapshot.docs.length);
//           const alertsList = querySnapshot.docs.map((doc) => {
//             const data = doc.data();
//             // Ensure occur_at is converted to a Date object if it's a Timestamp
//             const occurAt =
//               data.occur_at instanceof firebase.firestore.Timestamp
//                 ? data.occur_at.toDate()
//                 : convertFirestoreTimestamp(data.occur_at);

//             return {
//               id: doc.id,
//               occur_at: occurAt,
//               status: data.status || "pending", // Default to "pending" if status is missing
//               detections: data.detections || {}, // Default to empty object if detections is missing
//             };
//           });

//           // Limit to the last 5 alerts for the Recent Alerts section
//           setAlerts(alertsList.slice(0, 5));
//           console.log("Alerts List:", alertsList);

//           // Calculate alert statistics
//           const stats = alertsList.reduce(
//             (acc, alert) => {
//               const alertStatus = alert.status || "pending"; // Fallback to "pending"
//               if (alertStatus === "pending") acc.pending++;
//               else if (alertStatus === "approved") acc.approved++;
//               else if (alertStatus === "rejected") acc.rejected++;
//               return acc;
//             },
//             { pending: 0, approved: 0, rejected: 0 }
//           );
//           setStats(stats);
//           console.log("The stats are:", stats);

//           // Group alerts by hour for the Alert Trends Chart
//           const alertTrends = {};
//           alertsList.forEach((alert) => {
//             if (alert.occur_at) {
//               const hour = alert.occur_at.toLocaleTimeString([], {
//                 hour: "numeric",
//               });
//               alertTrends[hour] = (alertTrends[hour] || 0) + 1;
//             }
//           });

//           // Prepare data for the Alert Trends Chart (last 12 hours)
//           const trendLabels = [];
//           const trendData = [];
//           const now = new Date();
//           for (let i = 11; i >= 0; i--) {
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
//     // const unsubscribeSensors = fetchSensorData();
//     const unsubscribeAlerts = fetchAlerts();

//     fabScale.value = withTiming(1, { duration: 500 });
//     setLoading(false);

//     return () => {
//       unsubscribeAuth?.();
//       unsubscribeDevices?.();
//       // unsubscribeSensors?.();
//       unsubscribeAlerts?.();
//     };
//     // }, [fetchCurrentUser, fetchDeviceId, fetchSensorData, fetchAlerts]);
//   }, [fetchCurrentUser, fetchDeviceId, fetchAlerts]);

//   // Chart data with validation and custom label formatting
//   // const chartData =
//   //   sensorReadings && sensorReadings.length > 0
//   //     ? {
//   //         labels: sensorReadings
//   //           .map((reading, index) =>
//   //             index % 2 === 0 ? formatTime(reading.last_updated) : ""
//   //           ) // Show every other label to avoid collision
//   //           .slice(0, 10)
//   //           .reverse(),
//   //         datasets: [
//   //           {
//   //             data: sensorReadings
//   //               .map((reading) => {
//   //                 const value =
//   //                   reading.type === "smoke"
//   //                     ? reading.level || 0
//   //                     : reading.type === "motion" &&
//   //                       reading.status === "detected"
//   //                     ? 1
//   //                     : reading.type === "motion" &&
//   //                       reading.status !== "detected"
//   //                     ? 0
//   //                     : reading.type === "sound"
//   //                     ? reading.value || 0
//   //                     : reading.type === "gsm"
//   //                     ? reading.signal_strength || 0
//   //                     : 0;
//   //                 console.log(`Chart data for ${reading.type}: ${value}`);
//   //                 return isFinite(value) ? value : 0;
//   //               })
//   //               .slice(0, 10)
//   //               .reverse(),
//   //             color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
//   //             strokeWidth: 2,
//   //           },
//   //         ],
//   //         legend: ["Sensor Activity"],
//   //       }
//   //     : { labels: [], datasets: [{ data: [] }] };

//   const dashboardData = [
//     { type: "header", id: "header" },
//     { type: "deviceStatus", id: "deviceStatus", data: device },
//     // { type: "sensorChart", id: "sensorChart", data: chartData },
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
//             <TouchableOpacity>
//               <Icon
//                 name="log-out-outline"
//                 size={24}
//                 color="#fff"
//                 onPress={logout}
//               />
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
//       //       {sensorReadings.length > 0 ? (
//       //         <LineChart
//       //           data={chartData}
//       //           width={width - 40} // Adjusted width with padding
//       //           height={200}
//       //           yAxisLabel=""
//       //           yAxisSuffix=""
//       //           chartConfig={{
//       //             backgroundColor: "#1a1a1a",
//       //             backgroundGradientFrom: "#1a1a1a",
//       //             backgroundGradientTo: "#1a1a1a",
//       //             decimalPlaces: 1,
//       //             color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
//       //             labelColor: (opacity = 1) => `silver`,
//       //             style: { borderRadius: 16 },
//       //             propsForDots: { r: "4", strokeWidth: "0", stroke: "#4CAF50" },
//       //             // Optional: Adjust label spacing or rotation if needed
//       //             labelOffset: 7, // Adds slight spacing between labels
//       //           }}
//       //           bezier
//       //           style={styles.chart}
//       //         />
//       //       ) : (
//       //         <Text style={styles.emptyText}>No sensor data available</Text>
//       //       )}
//       //       <Text style={styles.chartLabel}>
//       //         Last 10 Readings (Motion/Smoke/Sound/GSM)
//       //       </Text>
//       //     </Animated.View>
//       //   );
//       case "alertTrendsChart":
//         return (
//           <Animated.View
//             entering={SlideInRight.duration(800)}
//             style={styles.card} // ✅ Removed `chartStyle`
//           >
//             <View style={styles.cardHeader}>
//               <Text style={styles.cardTitle}>Alert Trends (Last 24 Hours)</Text>
//               <Icon name="trending-up" size={20} color="#FF9800" />
//             </View>
//             {item.data.labels.length > 0 ? (
//               <LineChart
//                 data={item.data}
//                 width={width - 40}
//                 height={200}
//                 yAxisLabel=""
//                 yAxisSuffix=""
//                 chartConfig={{
//                   backgroundColor: "#1a1a1a",
//                   backgroundGradientFrom: "#1a1a1a",
//                   backgroundGradientTo: "#1a1a1a",
//                   decimalPlaces: 0,
//                   color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
//                   labelColor: (opacity = 1) => `silver`,
//                   style: { borderRadius: 16 },
//                   propsForDots: { r: "4", strokeWidth: "2", stroke: "#FF9800" },
//                   labelOffset: 7,
//                 }}
//                 bezier
//                 style={styles.chart}
//                 onDataPointClick={({ value, dataset, index }) => {
//                   const hour = item.data.labels[index];
//                   Alert.alert(
//                     "Alert Details",
//                     `Hour: ${hour}\nNumber of Alerts: ${value}`,
//                     [{ text: "OK", onPress: () => console.log("Alert closed") }]
//                   );
//                 }}
//               />
//             ) : (
//               <Text style={styles.emptyText}>No alert trends available</Text>
//             )}
//             <Text style={styles.chartLabel}>Tap on points to see details</Text>
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
//                         {alert.occur_at ? formatTime(alert.occur_at) : "N/A"}
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
//                         {alert.status || "pending"}
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
//             // fetchSensorData();
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
//   chart: {
//     marginVertical: 8,
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
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

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
  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";

    const date = convertFirestoreTimestamp(timestamp);
    if (!(date instanceof Date) || isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Fetch current user
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

  // Fetch user data
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
          setError("Failed to load user data. Please try again.");
        }
      );
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      setError("Failed to fetch user data. Please try again.");
    }
  }, []);

  // Fetch the first device
  const fetchDeviceId = useCallback(() => {
    try {
      const devicesQuery = query(collection(db, "devices"));
      return onSnapshot(
        devicesQuery,
        (querySnapshot) => {
          if (!querySnapshot.empty) {
            const deviceDoc = querySnapshot.docs[0];
            const deviceData = deviceDoc.data();
            const deviceId = deviceData.deviceId || deviceDoc.id;
            setSelectedDeviceId(deviceId);
            setDevice({ id: deviceDoc.id, ...deviceData });
            console.log("Selected Device ID:", deviceId);
          } else {
            setSelectedDeviceId(null);
            setDevice(null);
            console.warn("No devices found.");
          }
        },
        (error) => {
          console.error("Error fetching devices:", error);
          setError("Failed to load device data. Please try again.");
        }
      );
    } catch (error) {
      console.error("Error in fetchDeviceId:", error);
      setError("Failed to fetch device ID. Please try again.");
    }
  }, []);

  // Fetch alerts
  const fetchAlerts = useCallback(() => {
    try {
      const now = new Date();
      const startTime = new Date();
      startTime.setUTCHours(startTime.getUTCHours() - 24); // Last 24 hours in UTC

      console.log("Current time (UTC):", now.toISOString());
      console.log("Start time (UTC):", startTime.toISOString());

      const alertsQuery = query(
        collection(db, "alerts"),
        where("occur_at", ">=", startTime),
        orderBy("occur_at", "desc"),
        limit(5)
      );

      return onSnapshot(
        alertsQuery,
        (querySnapshot) => {
          console.log("Snapshot received:", querySnapshot.docs.length);
          const alertsList = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            const occurAt =
              data.occur_at instanceof Timestamp
                ? data.occur_at.toDate()
                : convertFirestoreTimestamp(data.occur_at);

            console.log(
              `Alert ${doc.id} occur_at (UTC):`,
              occurAt.toISOString()
            );

            return {
              id: doc.id,
              occur_at: occurAt,
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
    } catch (error) {
      console.error("Error in fetchAlerts:", error);
      setError("Failed to fetch alerts: " + error.message);
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
      unsubscribeAuth?.();
      unsubscribeDevices?.();
      unsubscribeAlerts?.();
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
                }
                if (alert.detections?.image?.detected) {
                  detectionDetails.push(
                    `Image (${alert.detections.image.type}): ${(
                      alert.detections.image.confidence * 100
                    ).toFixed(0)}%`
                  );
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
                      {alert.detections?.image?.imageUrl && (
                        <Text style={styles.alertDetails}>
                          Image: {alert.detections.image.imageUrl}
                        </Text>
                      )}
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
