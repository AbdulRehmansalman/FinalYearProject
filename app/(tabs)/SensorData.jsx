import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, BounceIn } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");

const SensorData = () => {
  const [sensors, setSensors] = useState([
    {
      id: "smoke",
      name: "Smoke Sensor",
      status: "Active",
      lastChecked: "2 min ago",
      icon: "cloud",
    },
    {
      id: "sound",
      name: "Sound Detection",
      status: "Active",
      lastChecked: "1 min ago",
      icon: "volume-high",
    },
    {
      id: "gsm",
      name: "GSM Module",
      status: "Active",
      lastChecked: "3 min ago",
      icon: "signal-cellular",
    },
    {
      id: "motion",
      name: "Motion Sensor",
      status: "Active",
      lastChecked: "5 min ago",
      icon: "walk",
    },
    {
      id: "camera",
      name: "Camera Sensor",
      status: "Active",
      lastChecked: "4 min ago",
      icon: "camera",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Combined data structure for FlatList
  const pageData = [
    { type: "header", id: "header" },
    { type: "sensors", id: "sensors", data: sensors },
    { type: "refresh", id: "refresh" },
  ];

  const renderItem = ({ item }) => {
    switch (item.type) {
      case "header":
        return (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Sensor Status - Pi Unit 001</Text>
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/dashboard")}
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        );
      case "sensors":
        return item.data.length > 0 ? (
          item.data.map((sensor) => (
            <Animated.View
              key={sensor.id}
              entering={FadeIn}
              style={styles.sensorCard}
            >
              <View style={styles.sensorHeader}>
                <Icon name={sensor.icon} size={24} color="#4CAF50" />
                <Text style={styles.sensorTitle}>{sensor.name}</Text>
              </View>
              <View style={styles.sensorStatusRow}>
                <Text style={styles.sensorStatus}>
                  Status:{" "}
                  <Text
                    style={{
                      color: sensor.status === "Active" ? "#4CAF50" : "#D32F2F",
                    }}
                  >
                    {sensor.status}
                  </Text>
                </Text>
                <Animated.View
                  entering={BounceIn}
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        sensor.status === "Active" ? "#4CAF50" : "#D32F2F",
                    },
                  ]}
                />
              </View>
              <Text style={styles.sensorDetail}>
                Last Checked: {sensor.lastChecked}
              </Text>
            </Animated.View>
          ))
        ) : (
          <Text style={styles.emptyText}>No sensors available</Text>
        );
      case "refresh":
        return (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => setLoading(true)}
          >
            <Text style={styles.refreshButtonText}>Refresh Status</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#2d2d2d",
  },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  sensorCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sensorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sensorTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  sensorStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sensorStatus: { color: "#fff", fontSize: 16 },
  sensorDetail: { color: "#999", fontSize: 14 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 8,
  },
  refreshButton: {
    backgroundColor: "#4CAF50",
    width: 150,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  refreshButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default SensorData;

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
//   RefreshControl,
//   Platform
// } from "react-native";
// import { useRouter } from "expo-router";
// import Animated, {
//   FadeIn,
//   BounceIn,
//   SlideInUp,
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withRepeat,
//   withSequence
// } from "react-native-reanimated";
// import { LinearGradient } from "expo-linear-gradient";
// import { StatusBar } from "expo-status-bar";
// import Icon from "react-native-vector-icons/Ionicons";
// import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
// import { useAuth } from "../../src/contexts/AuthContext";
// import { db } from "../../src/services/firebase";
// import {
//   doc,
//   onSnapshot,
//   getDoc
// } from "firebase/firestore";

// const { width } = Dimensions.get("window");

// const SensorsPage = () => {
//   // State
//   const [deviceInfo, setDeviceInfo] = useState(null);
//   const [sensors, setSensors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   // Animation values
//   const headerY = useSharedValue(-50);
//   const contentOpacity = useSharedValue(0);

//   // Router and auth context
//   const router = useRouter();
//   const { user } = useAuth();

//   // Animated styles
//   const headerStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: headerY.value }]
//   }));

//   const contentStyle = useAnimatedStyle(() => ({
//     opacity: contentOpacity.value
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

//   // Format the time elapsed since last update
//   const getTimeElapsed = (timestamp) => {
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

//   // Fetch device and sensor data from Firebase
//   const fetchSensorData = useCallback(async () => {
//     try {
//       setRefreshing(true);

//       const deviceDoc = await getDoc(doc(db, "sensors", "pi_unit_001"));

//       if (deviceDoc.exists()) {
//         const deviceData = deviceDoc.data();
//         setDeviceInfo(deviceData.deviceInfo || {});

//         // Transform sensor readings into array format for display
//         if (deviceData.sensorReadings) {
//           const sensorsArray = Object.entries(deviceData.sensorReadings).map(([key, value]) => ({
//             id: key,
//             name: getSensorName(key),
//             status: value.status,
//             lastChecked: getTimeElapsed(value.last_updated),
//             lastUpdated: value.last_updated,
//             icon: getSensorIcon(key, value.status),
//             signalStrength: value.signal_strength || null
//           }));

//           setSensors(sensorsArray);
//         }
//       } else {
//         console.log("No device found!");
//       }

//       // Start animations
//       headerY.value = withTiming(0, { duration: 800 });
//       contentOpacity.value = withTiming(1, { duration: 1000 });

//       setLoading(false);
//       setRefreshing(false);
//     } catch (error) {
//       console.error("Error fetching sensor data:", error);
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   // Set up real-time listener for sensor data
//   useEffect(() => {
//     let unsubscribe;

//     const setupSensorListener = async () => {
//       try {
//         const deviceRef = doc(db, "sensors", "pi_unit_001");

//         unsubscribe = onSnapshot(deviceRef, (docSnap) => {
//           if (docSnap.exists()) {
//             const deviceData = docSnap.data();
//             setDeviceInfo(deviceData.deviceInfo || {});

//             // Transform sensor readings into array format for display
//             if (deviceData.sensorReadings) {
//               const sensorsArray = Object.entries(deviceData.sensorReadings).map(([key, value]) => ({
//                 id: key,
//                 name: getSensorName(key),
//                 status: value.status,
//                 lastChecked: getTimeElapsed(value.last_updated),
//                 lastUpdated: value.last_updated,
//                 icon: getSensorIcon(key, value.status),
//                 signalStrength: value.signal_strength || null
//               }));

//               setSensors(sensorsArray);
//             }
//           } else {
//             console.log("No device found!");
//           }

//           // Start animations
//           headerY.value = withTiming(0, { duration: 800 });
//           contentOpacity.value = withTiming(1, { duration: 1000 });

//           setLoading(false);
//         }, (error) => {
//           console.error("Error in real-time sensor listener:", error);
//           fetchSensorData(); // Fallback to regular fetching
//         });
//       } catch (error) {
//         console.error("Error setting up sensor listener:", error);
//         fetchSensorData();
//       }
//     };

//     setupSensorListener();

//     return () => {
//       if (unsubscribe) {
//         unsubscribe();
//       }
//     };
//   }, [fetchSensorData]);

//   // Helper function to get name for sensor type
//   const getSensorName = (type) => {
//     switch (type) {
//       case 'smoke':
//         return 'Smoke Sensor';
//       case 'sound':
//         return 'Sound Detection';
//       case 'camera':
//         return 'Camera Module';
//       case 'motion':
//         return 'Motion Sensor';
//       case 'gsm':
//         return 'GSM Module';
//       case 'wifi':
//         return 'WiFi Connection';
//       default:
//         return type.charAt(0).toUpperCase() + type.slice(1) + ' Sensor';
//     }
//   };

//   // Helper function to get icon for sensor type
//   const getSensorIcon = (type, status) => {
//     switch (type) {
//       case 'smoke':
//         return status === 'Safe' ? 'smoke-detector' : 'smoke-detector-alert';
//       case 'sound':
//         return status === 'Detected' ? 'volume-high' : 'volume-medium';
//       case 'camera':
//         return status === 'Active' ? 'camera' : 'camera-off';
//       case 'motion':
//         return status === 'Motion Detected' ? 'motion-sensor' : 'motion-sensor-off';
//       case 'gsm':
//         return status === 'Connected' ? 'signal' : 'signal-off';
//       case 'wifi':
//         return status === 'Stable' ? 'wifi' : 'wifi-off';
//       default:
//         return 'access-point';
//     }
//   };

//   // Helper function to get color based on status
//   const getStatusColor = (type, status) => {
//     if (type === 'smoke' && status !== 'Safe') return '#F44336';
//     if (type === 'sound' && status === 'Detected') return '#F44336';
//     if (type === 'motion' && status === 'Motion Detected') return '#FFC107';
//     if (type === 'gsm' && status !== 'Connected') return '#F44336';
//     if (type === 'wifi' && status !== 'Stable') return '#F44336';
//     return '#4CAF50';
//   };

//   // Helper function to get signal strength color
//   const getSignalColor = (strength) => {
//     if (strength >= 70) return '#4CAF50';
//     if (strength >= 40) return '#FFC107';
//     return '#F44336';
//   };

//   // Refresh sensor data
//   const onRefresh = () => {
//     fetchSensorData();
//   };

//   // Handle navigation back to dashboard
//   const handleBackPress = () => {
//     router.replace("/(tabs)/dashboard");
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar style="light" />
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#4CAF50" />
//           <Text style={styles.loadingText}>Loading sensor data...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // Render sensor item
//   const renderSensorItem = ({ item, index }) => {
//     // Create pulse animation for active sensors
//     const pulseOpacity = useSharedValue(0.5);

//     useEffect(() => {
//       if (item.status === 'Active' || item.status === 'Detected' || item.status === 'Motion Detected') {
//         pulseOpacity.value = withRepeat(
//           withSequence(
//             withTiming(1, { duration: 1000 }),
//             withTiming(0.5, { duration: 1000 })
//           ),
//           -1, // Infinite repeat
//           true // Reverse
//         );
//       }
//     }, [item.status]);

//     const pulseStyle = useAnimatedStyle(() => ({
//       opacity: pulseOpacity.value
//     }));

//     const isActive = item.status === 'Active' ||
//                     item.status === 'Connected' ||
//                     item.status === 'Stable' ||
//                     item.status === 'Safe';

//     return (
//       <Animated.View
//         entering={SlideInUp.delay(index * 100).duration(500)}
//         style={styles.sensorCardContainer}
//       >
//         <LinearGradient
//           colors={[
//             getStatusColor(item.id, item.status) + '20', // 20% opacity
//             getStatusColor(item.id, item.status) + '10'  // 10% opacity
//           ]}
//           style={styles.sensorCard}
//         >
//           <View style={styles.sensorHeader}>
//             <View style={styles.sensorTitleContainer}>
//               <MaterialIcons
//                 name={item.icon}
//                 size={30}
//                 color={getStatusColor(item.id, item.status)}
//               />
//               <Text style={styles.sensorTitle}>{item.name}</Text>
//             </View>

//             <Animated.View
//               entering={BounceIn}
//               style={[
//                 styles.statusDot,
//                 {
//                   backgroundColor: getStatusColor(item.id, item.status),
//                   opacity: isActive ? 1 : 0.7
//                 },
//                 isActive ? pulseStyle : null
//               ]}
//             />
//           </View>

//           <View style={styles.sensorInfo}>
//             <View style={styles.infoRow}>
//               <Text style={styles.infoLabel}>Status:</Text>
//               <Text style={[
//                 styles.infoValue,
//                 { color: getStatusColor(item.id, item.status) }
//               ]}>
//                 {item.status}
//               </Text>
//             </View>

//             <View style={styles.infoRow}>
//               <Text style={styles.infoLabel}>Last Updated:</Text>
//               <Text style={styles.infoValue}>{item.lastChecked}</Text>
//             </View>

//             {(item.id === 'gsm' || item.id === 'wifi') && item.signalStrength && (
//               <View>
//                 <View style={styles.infoRow}>
//                   <Text style={styles.infoLabel}>Signal Strength:</Text>
//                   <Text style={[
//                     styles.infoValue,
//                     { color: getSignalColor(item.signalStrength) }
//                   ]}>
//                     {item.signalStrength}%
//                   </Text>
//                 </View>

//                 <View style={styles.signalBarContainer}>
//                   <View
//                     style={[
//                       styles.signalBar,
//                       { width: ${item.signalStrength}% },
//                       { backgroundColor: getSignalColor(item.signalStrength) }
//                     ]}
//                   />
//                 </View>
//               </View>
//             )}
//           </View>
//         </LinearGradient>
//       </Animated.View>
//     );
//   };

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
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={handleBackPress}
//             activeOpacity={0.7}
//           >
//             <Icon name="arrow-back" size={24} color="#fff" />
//           </TouchableOpacity>

//           <Text style={styles.headerTitle}>Sensor Status</Text>

//           {deviceInfo && (
//             <View style={styles.deviceInfoChip}>
//               <MaterialIcons
//                 name={deviceInfo.status === 'active' ? 'check-circle' : 'alert-circle'}
//                 size={16}
//                 color="#fff"
//               />
//               <Text style={styles.deviceInfoText}>Pi Unit 001</Text>
//             </View>
//           )}
//         </LinearGradient>
//       </Animated.View>

//       {/* Device Status Card */}
//       {deviceInfo && (
//         <Animated.View style={[styles.deviceCard, contentStyle]}>
//           <LinearGradient
//             colors={
//               deviceInfo.status === 'active'
//                 ? ["#4CAF50", "#388E3C"]
//                 : ["#F44336", "#D32F2F"]
//             }
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 0 }}
//             style={styles.deviceCardContent}
//           >
//             <View style={styles.deviceStatusRow}>
//               <Text style={styles.deviceStatusLabel}>Device Status:</Text>
//               <View style={styles.deviceStatusChip}>
//                 <Text style={styles.deviceStatusText}>
//                   {deviceInfo.status === 'active' ? 'ONLINE' : 'OFFLINE'}
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.deviceDetailsRow}>
//               <View style={styles.deviceDetailItem}>
//                 <Icon name="time-outline" size={18} color="#fff" />
//                 <Text style={styles.deviceDetailText}>
//                   Last Ping: {getTimeElapsed(deviceInfo.lastPing)}
//                 </Text>
//               </View>

//               {deviceInfo.location && (
//                 <View style={styles.deviceDetailItem}>
//                   <Icon name="location-outline" size={18} color="#fff" />
//                   <Text style={styles.deviceDetailText}>
//                     {deviceInfo.location.areaName || ${deviceInfo.location.latitude.toFixed(4)}, ${deviceInfo.location.longitude.toFixed(4)}}
//                   </Text>
//                 </View>
//               )}

//               {deviceInfo.firmwareVersion && (
//                 <View style={styles.deviceDetailItem}>
//                   <Icon name="hardware-chip-outline" size={18} color="#fff" />
//                   <Text style={styles.deviceDetailText}>
//                     Firmware: v{deviceInfo.firmwareVersion}
//                   </Text>
//                 </View>
//               )}
//             </View>
//           </LinearGradient>
//         </Animated.View>
//       )}

//       {/* Sensors List */}
//       <Animated.View style={[styles.sensorsContainer, contentStyle]}>
//         <View style={styles.sensorsHeader}>
//           <Text style={styles.sensorsTitle}>
//             {sensors.length} Sensors Connected
//           </Text>
//           <View style={styles.statusLegend}>
//             <View style={styles.legendItem}>
//               <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
//               <Text style={styles.legendText}>Active</Text>
//             </View>
//             <View style={styles.legendItem}>
//               <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
//               <Text style={styles.legendText}>Alert</Text>
//             </View>
//           </View>
//         </View>

//         <FlatList
//           data={sensors}
//           renderItem={renderSensorItem}
//           keyExtractor={(item) => item.id}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.sensorsList}
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
//               <MaterialIcons name="access-point-network-off" size={64} color="#666" />
//               <Text style={styles.emptyText}>No sensors available</Text>
//             </View>
//           }
//         />
//       </Animated.View>
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
//       android: { elevation: 6 },
//     }),
//   },
//   header: {
//     paddingTop: Platform.OS === 'ios' ? 10 : 40,
//     paddingBottom: 15,
//     paddingHorizontal: 15,
//     borderBottomLeftRadius: 15,
//     borderBottomRightRadius: 15,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.2)",
//     marginRight: 15,
//   },
//   headerTitle: {
//     color: "#fff",
//     fontSize: 24,
//     fontWeight: "bold",
//     flex: 1,
//   },
//   deviceInfoChip: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.2)",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 15,
//   },
//   deviceInfoText: {
//     color: "#fff",
//     fontSize: 14,
//     marginLeft: 5,
//   },
//   deviceCard: {
//     margin: 15,
//     marginTop: 20,
//     borderRadius: 15,
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
//   deviceCardContent: {
//     padding: 15,
//   },
//   deviceStatusRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   deviceStatusLabel: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   deviceStatusChip: {
//     backgroundColor: "rgba(0,0,0,0.2)",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//   },
//   deviceStatusText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "bold",
//   },
//   deviceDetailsRow: {
//     gap: 10,
//   },
//   deviceDetailItem: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   deviceDetailText: {
//     color: "#fff",
//     fontSize: 14,
//     marginLeft: 8,
//   },
//   sensorsContainer: {
//     flex: 1,
//     paddingHorizontal: 15,
//   },
//   sensorsHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginVertical: 15,
//   },
//   sensorsTitle: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   statusLegend: {
//     flexDirection: "row",
//     gap: 15,
//   },
//   legendItem: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   legendDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginRight: 5,
//   },
//   legendText: {
//     color: "#bbb",
//     fontSize: 12,
//   },
//   sensorsList: {
//     paddingBottom: 20,
//   },
//   sensorCardContainer: {
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
//       android: { elevation: 3 },
//     }),
//   },
//   sensorCard: {
//     backgroundColor: "#1e1e1e",
//     borderRadius: 12,
//     padding: 15,
//   },
//   sensorHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   sensorTitleContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   sensorTitle: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "600",
//     marginLeft: 12,
//   },
//   statusDot: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//   },
//   sensorInfo: {
//     backgroundColor: "#262626",
//     borderRadius: 10,
//     padding: 12,
//   },
//   infoRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 8,
//   },
//   infoLabel: {
//     color: "#bbb",
//     fontSize: 14,
//   },
//   infoValue: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   signalBarContainer: {
//     width: "100%",
//     height: 6,
//     backgroundColor: "#333",
//     borderRadius: 3,
//     marginTop: 8,
//     marginBottom: 5,
//     overflow: "hidden",
//   },
//   signalBar: {
//     height: "100%",
//   },
//   emptyContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 40,
//   },
//   emptyText: {
//     color: "#999",
//     fontSize: 16,
//     marginTop: 12,
//   },
// });

// export default SensorsPage;
