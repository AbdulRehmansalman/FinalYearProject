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
// import Animated, { FadeIn, BounceIn } from "react-native-reanimated";
// import Icon from "react-native-vector-icons/Ionicons";

// const { width } = Dimensions.get("window");

// const SensorData = () => {
//   const [sensors, setSensors] = useState([
//     {
//       id: "smoke",
//       name: "Smoke Sensor",
//       status: "Active",
//       lastChecked: "2 min ago",
//       icon: "cloud",
//     },
//     {
//       id: "sound",
//       name: "Sound Detection",
//       status: "Active",
//       lastChecked: "1 min ago",
//       icon: "volume-high",
//     },
//     {
//       id: "gsm",
//       name: "GSM Module",
//       status: "Active",
//       lastChecked: "3 min ago",
//       icon: "signal-cellular",
//     },
//     {
//       id: "motion",
//       name: "Motion Sensor",
//       status: "Active",
//       lastChecked: "5 min ago",
//       icon: "walk",
//     },
//     {
//       id: "camera",
//       name: "Camera Sensor",
//       status: "Active",
//       lastChecked: "4 min ago",
//       icon: "camera",
//     },
//   ]);
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     const timer = setTimeout(() => setLoading(false), 1000);
//     return () => clearTimeout(timer);
//   }, []);

//   // Combined data structure for FlatList
//   const pageData = [
//     { type: "header", id: "header" },
//     { type: "sensors", id: "sensors", data: sensors },
//     { type: "refresh", id: "refresh" },
//   ];

//   const renderItem = ({ item }) => {
//     switch (item.type) {
//       case "header":
//         return (
//           <View style={styles.header}>
//             <Text style={styles.headerTitle}>Sensor Status - Pi Unit 001</Text>
//             <TouchableOpacity
//               onPress={() => router.replace("/(tabs)/dashboard")}
//             >
//               <Icon name="arrow-back" size={24} color="#fff" />
//             </TouchableOpacity>
//           </View>
//         );
//       case "sensors":
//         return item.data.length > 0 ? (
//           item.data.map((sensor) => (
//             <Animated.View
//               key={sensor.id}
//               entering={FadeIn}
//               style={styles.sensorCard}
//             >
//               <View style={styles.sensorHeader}>
//                 <Icon name={sensor.icon} size={24} color="#4CAF50" />
//                 <Text style={styles.sensorTitle}>{sensor.name}</Text>
//               </View>
//               <View style={styles.sensorStatusRow}>
//                 <Text style={styles.sensorStatus}>
//                   Status:{" "}
//                   <Text
//                     style={{
//                       color: sensor.status === "Active" ? "#4CAF50" : "#D32F2F",
//                     }}
//                   >
//                     {sensor.status}
//                   </Text>
//                 </Text>
//                 <Animated.View
//                   entering={BounceIn}
//                   style={[
//                     styles.statusDot,
//                     {
//                       backgroundColor:
//                         sensor.status === "Active" ? "#4CAF50" : "#D32F2F",
//                     },
//                   ]}
//                 />
//               </View>
//               <Text style={styles.sensorDetail}>
//                 Last Checked: {sensor.lastChecked}
//               </Text>
//             </Animated.View>
//           ))
//         ) : (
//           <Text style={styles.emptyText}>No sensors available</Text>
//         );
//       case "refresh":
//         return (
//           <TouchableOpacity
//             style={styles.refreshButton}
//             onPress={() => setLoading(true)}
//           >
//             <Text style={styles.refreshButtonText}>Refresh Status</Text>
//           </TouchableOpacity>
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
//         data={pageData}
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
//   sensorCard: {
//     backgroundColor: "#1a1a1a",
//     borderRadius: 16,
//     padding: 16,
//     marginVertical: 12,
//     marginHorizontal: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   sensorHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   sensorTitle: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "600",
//     marginLeft: 12,
//   },
//   sensorStatusRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   sensorStatus: { color: "#fff", fontSize: 16 },
//   sensorDetail: { color: "#999", fontSize: 14 },
//   statusDot: { width: 12, height: 12, borderRadius: 6 },
//   emptyText: {
//     color: "#fff",
//     fontSize: 16,
//     textAlign: "center",
//     marginVertical: 8,
//   },
//   refreshButton: {
//     backgroundColor: "#4CAF50",
//     width: 150,
//     height: 50,
//     borderRadius: 12,
//     justifyContent: "center",
//     alignItems: "center",
//     alignSelf: "center",
//     marginVertical: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   refreshButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
// });

// export default SensorData;

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
import { db } from "../../services/firebase"; // Adjust the import path as needed
import { onSnapshot, doc } from "firebase/firestore";

const { width } = Dimensions.get("window");

const SensorData = () => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Convert Firestore timestamp to relative time
  const getTimeElapsed = (timestamp) => {
    if (!timestamp) return "Unknown";

    const date =
      timestamp instanceof Date
        ? timestamp
        : new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }
  };

  // Fetch sensor data from Firestore
  useEffect(() => {
    const sensorRef = doc(db, "sensors", "sensor_id"); // Use the specific document ID

    const unsubscribe = onSnapshot(
      sensorRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const sensorReadings = data.sensorReadings || {};

          // Transform sensor readings into array format
          const sensorsArray = Object.entries(sensorReadings).map(
            ([key, value]) => ({
              id: key,
              name: getSensorName(key),
              status: value.status || "Unknown",
              lastChecked: getTimeElapsed(value.last_updated),
              icon: getSensorIcon(key, value.status),
              ...(key === "gsm" && { signalStrength: value.signal_strength }),
              ...(key === "smoke" && { level: value.level }),
              ...(key === "sound" && { value: value.value }),
            })
          );

          setSensors(sensorsArray);
          setLoading(false);
        } else {
          console.log("No sensor data found!");
          setSensors([]);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error fetching sensor data:", error);
        setSensors([]);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Helper function to get name for sensor type
  const getSensorName = (type) => {
    switch (type) {
      case "smoke":
        return "Smoke Sensor";
      case "sound":
        return "Sound Detection";
      case "camera":
        return "Camera Sensor";
      case "motion":
        return "Motion Sensor";
      case "gsm":
        return "GSM Module";
      case "wifi":
        return "WiFi Connection";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1) + " Sensor";
    }
  };

  // Helper function to get icon for sensor type
  const getSensorIcon = (type, status) => {
    switch (type) {
      case "smoke":
        return status === "Safe" || status === "Connected"
          ? "cloud"
          : "cloud-off";
      case "sound":
        return status === "Detected" ? "volume-high" : "volume-mute";
      case "camera":
        return status === "Connected" ? "camera" : "camera-off";
      case "motion":
        return status === "Detected" ? "walk" : "walk-off";
      case "gsm":
        return status === "Connected"
          ? "signal-cellular"
          : "signal-cellular-off";
      case "wifi":
        return status === "Connected" ? "wifi" : "wifi-off";
      default:
        return "access-point";
    }
  };

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
                      color:
                        sensor.status === "Connected" ||
                        sensor.status === "Safe" ||
                        sensor.status === "Active"
                          ? "#4CAF50"
                          : sensor.status === "Detected"
                          ? "#FFC107"
                          : "#D32F2F",
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
                        sensor.status === "Connected" ||
                        sensor.status === "Safe" ||
                        sensor.status === "Active"
                          ? "#4CAF50"
                          : sensor.status === "Detected"
                          ? "#FFC107"
                          : "#D32F2F",
                    },
                  ]}
                />
              </View>
              <Text style={styles.sensorDetail}>
                Last Checked: {sensor.lastChecked}
              </Text>
              {sensor.signalStrength && (
                <Text style={styles.sensorDetail}>
                  Signal Strength: {sensor.signalStrength}%
                </Text>
              )}
              {sensor.level && (
                <Text style={styles.sensorDetail}>Level: {sensor.level}</Text>
              )}
              {sensor.value && (
                <Text style={styles.sensorDetail}>Value: {sensor.value}</Text>
              )}
            </Animated.View>
          ))
        ) : (
          <Text style={styles.emptyText}>No sensors available</Text>
        );
      case "refresh":
        return (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => setLoading(true)} // Trigger reload (handled by useEffect)
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
