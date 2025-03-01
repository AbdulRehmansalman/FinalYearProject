// import React, { useState, useEffect } from "react";
// import {
//   SafeAreaView,
//   ScrollView,
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
//   Modal,
// } from "react-native";
// // import { useAuth } from "../contexts/AuthContext";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
// } from "react-native-reanimated";
// import { PinchGestureHandler, State } from "react-native-gesture-handler";
// import { useNavigation, useRoute } from "@react-navigation/native";

// const AlertDetail = () => {
//   const [alert, setAlert] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalMessage, setModalMessage] = useState("");
//   const { role } = useAuth();
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { alertId } = route.params;

//   const scale = useSharedValue(1);
//   const animatedStyles = useAnimatedStyle(() => {
//     return {
//       transform: [{ scale: scale.value }],
//     };
//   });

//   useEffect(() => {
//     // Simulating API call to fetch alert details
//     setTimeout(() => {
//       setAlert({
//         id: alertId,
//         timestamp: "2025-02-21 10:30",
//         location: { lat: 12.3456, lon: 78.9012 },
//         soundConfidence: 0.92,
//         weaponConfidence: 0.87,
//         sensors: { motion: true, smoke: false },
//         status: "pending",
//         imageUrl: "https://example.com/alert-image.jpg",
//       });
//       setLoading(false);
//     }, 1000);
//   }, [alertId]);

//   const handlePinch = (event) => {
//     if (event.nativeEvent.state === State.ACTIVE) {
//       scale.value = withTiming(event.nativeEvent.scale, { duration: 100 });
//     } else if (event.nativeEvent.state === State.END) {
//       scale.value = withTiming(1, { duration: 100 });
//     }
//   };

//   const handleApprove = () => {
//     setAlert((prev) => ({ ...prev, status: "approved" }));
//     showModal("Approved!");
//   };

//   const handleReject = () => {
//     setAlert((prev) => ({ ...prev, status: "rejected" }));
//     showModal("Rejected!");
//   };

//   const showModal = (message) => {
//     setModalMessage(message);
//     setModalVisible(true);
//     setTimeout(() => setModalVisible(false), 2000);
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <ActivityIndicator size="large" color="white" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerText}>Alert Details - {alertId}</Text>
//       </View>
//       <ScrollView style={styles.content}>
//         <PinchGestureHandler onGestureEvent={handlePinch}>
//           <Animated.Image
//             source={{ uri: alert.imageUrl }}
//             style={[styles.image, animatedStyles]}
//           />
//         </PinchGestureHandler>
//         <View style={styles.details}>
//           <Text style={styles.detailText}>Timestamp: {alert.timestamp}</Text>
//           <Text style={styles.detailText}>
//             Location: Lat {alert.location.lat}, Lon {alert.location.lon}
//           </Text>
//           <Text style={styles.detailText}>
//             Sound: {alert.soundConfidence.toFixed(2)}
//           </Text>
//           <Text style={styles.detailText}>
//             Weapon: {alert.weaponConfidence.toFixed(2)}
//           </Text>
//           <Text style={styles.detailText}>
//             Sensors: Motion {alert.sensors.motion ? "true" : "false"}, Smoke{" "}
//             {alert.sensors.smoke ? "true" : "false"}
//           </Text>
//           <Text style={[styles.detailText, styles[alert.status]]}>
//             Status: {alert.status}
//           </Text>
//         </View>
//         {role === "admin" && alert.status === "pending" && (
//           <View style={styles.actionContainer}>
//             <TouchableOpacity
//               style={styles.approveButton}
//               onPress={handleApprove}
//             >
//               <Text style={styles.buttonText}>Approve</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.rejectButton}
//               onPress={handleReject}
//             >
//               <Text style={styles.buttonText}>Reject</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//         {alert.status !== "pending" && (
//           <Text style={styles.decisionText}>
//             Decision: {alert.status} at {alert.timestamp}
//           </Text>
//         )}
//         {role === "security" && alert.status === "approved" && (
//           <Text style={styles.notifiedText}>Notified at {alert.timestamp}</Text>
//         )}
//       </ScrollView>
//       <TouchableOpacity
//         style={styles.backButton}
//         onPress={() => navigation.navigate("AlertsPage")}
//       >
//         <Text style={styles.buttonText}>Back</Text>
//       </TouchableOpacity>
//       <Modal animationType="fade" transparent={true} visible={modalVisible}>
//         <View style={styles.modalView}>
//           <Text style={styles.modalText}>{modalMessage}</Text>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = {
//   container: {
//     flex: 1,
//     backgroundColor: "#000",
//   },
//   header: {
//     padding: 15,
//   },
//   headerText: {
//     color: "white",
//     fontSize: 24,
//     fontWeight: "bold",
//   },
//   content: {
//     padding: 10,
//   },
//   image: {
//     width: 350,
//     height: 250,
//     resizeMode: "contain",
//     borderRadius: 10,
//     alignSelf: "center",
//   },
//   details: {
//     backgroundColor: "#333",
//     padding: 15,
//     borderRadius: 10,
//     marginVertical: 10,
//   },
//   detailText: {
//     color: "white",
//     fontSize: 16,
//     marginBottom: 5,
//   },
//   pending: {
//     color: "#FF9800",
//     fontWeight: "bold",
//   },
//   approved: {
//     color: "#4CAF50",
//     fontWeight: "bold",
//   },
//   rejected: {
//     color: "#D32F2F",
//     fontWeight: "bold",
//   },
//   actionContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginVertical: 10,
//   },
//   approveButton: {
//     backgroundColor: "#4CAF50",
//     width: "45%",
//     height: 50,
//     borderRadius: 10,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   rejectButton: {
//     backgroundColor: "#D32F2F",
//     width: "45%",
//     height: 50,
//     borderRadius: 10,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "white",
//     fontSize: 18,
//   },
//   decisionText: {
//     color: "white",
//     fontSize: 16,
//     marginTop: 10,
//   },
//   notifiedText: {
//     color: "#4CAF50",
//     fontSize: 16,
//     marginTop: 10,
//   },
//   backButton: {
//     backgroundColor: "grey",
//     width: "90%",
//     height: 50,
//     borderRadius: 10,
//     justifyContent: "center",
//     alignItems: "center",
//     alignSelf: "center",
//     marginVertical: 10,
//   },
//   modalView: {
//     margin: 20,
//     backgroundColor: "white",
//     borderRadius: 20,
//     padding: 35,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   modalText: {
//     marginBottom: 15,
//     textAlign: "center",
//     fontSize: 18,
//   },
// };

// export default AlertDetail;

import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import {
  PinchGestureHandler,
  GestureHandlerRootView,
  State,
} from "react-native-gesture-handler";
import { useNavigation, useRoute } from "@react-navigation/native";

const AlertDetailPage = () => {
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const navigation = useNavigation();
  const route = useRoute();
  const { alertId } = route.params;

  const scale = useSharedValue(1);
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    setTimeout(() => {
      setAlert({
        id: alertId,
        timestamp: "2025-02-21 10:30",
        location: { lat: 12.3456, lon: 78.9012 },
        soundConfidence: 0.92,
        weaponConfidence: 0.87,
        sensors: { motion: true, smoke: false },
        status: "pending",
        imageUrl: "https://example.com/alert-image.jpg",
      });
      setLoading(false);
    }, 1000);
  }, [alertId]);

  const handlePinch = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      scale.value = withTiming(event.nativeEvent.scale, { duration: 100 });
    } else if (event.nativeEvent.state === State.END) {
      scale.value = withTiming(1, { duration: 100 });
    }
  };

  const handleApprove = () => {
    setAlert((prev) => ({ ...prev, status: "approved" }));
    showModal("Approved!");
  };

  const handleReject = () => {
    setAlert((prev) => ({ ...prev, status: "rejected" }));
    showModal("Rejected!");
  };

  const showModal = (message) => {
    setModalMessage(message);
    setModalVisible(true);
    setTimeout(() => setModalVisible(false), 2000);
  };

  if (loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <ActivityIndicator size="large" color="white" />
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Alert Details - {alertId}</Text>
        </View>
        <ScrollView style={styles.content}>
          <PinchGestureHandler onGestureEvent={handlePinch}>
            <Animated.Image
              source={{ uri: alert.imageUrl }}
              style={[styles.image, animatedStyles]}
            />
          </PinchGestureHandler>
          <View style={styles.details}>
            <Text style={styles.detailText}>Timestamp: {alert.timestamp}</Text>
            <Text style={styles.detailText}>
              Location: Lat {alert.location.lat}, Lon {alert.location.lon}
            </Text>
            <Text style={styles.detailText}>
              Sound: {alert.soundConfidence.toFixed(2)}
            </Text>
            <Text style={styles.detailText}>
              Weapon: {alert.weaponConfidence.toFixed(2)}
            </Text>
            <Text style={styles.detailText}>
              Sensors: Motion {alert.sensors.motion ? "true" : "false"}, Smoke{" "}
              {alert.sensors.smoke ? "true" : "false"}
            </Text>
            <Text style={[styles.detailText, styles[alert.status]]}>
              Status: {alert.status}
            </Text>
          </View>
        </ScrollView>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("AlertsPage")}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <Modal animationType="fade" transparent={true} visible={modalVisible}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{modalMessage}</Text>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    padding: 15,
  },
  headerText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    padding: 10,
  },
  image: {
    width: 350,
    height: 250,
    resizeMode: "contain",
    borderRadius: 10,
    alignSelf: "center",
  },
  details: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  detailText: {
    color: "white",
    fontSize: 16,
    marginBottom: 5,
  },
  backButton: {
    backgroundColor: "grey",
    width: "90%",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
  },
  modalText: {
    textAlign: "center",
    fontSize: 18,
  },
};

export default AlertDetailPage;
