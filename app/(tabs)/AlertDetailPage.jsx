import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import { Alert } from "react-native";

const AlertDetail = () => {
  const { alertId } = useLocalSearchParams();
  const [alert, setAlert] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = "security"; // Hardcoded role for frontend demo (replace with "security" if needed)
  const router = useRouter();

  // Mock data for alert and logs
  const mockAlert = {
    id: alertId,
    timestamp: "2025-02-25T14:30:00Z",
    status: "pending",
    soundConfidence: 0.92,
    weaponConfidence: 0.87,
    imageUrl: "https://via.placeholder.com/300x200", // Placeholder image
    sensorData: { motion: true, smoke: 0.1 },
    location: { latitude: 40.7128, longitude: -74.006 },
  };

  const mockLogs = [
    {
      id: "log1",
      alertId,
      action: "created",
      timestamp: "2025-02-25T14:31:00Z",
      userId: "user123",
    },
    {
      id: "log2",
      alertId,
      action: "viewed",
      timestamp: "2025-02-25T14:32:00Z",
      userId: "user456",
    },
  ];

  useEffect(() => {
    // Simulate data loading with mock data
    setTimeout(() => {
      setAlert(mockAlert);
      setLogs(mockLogs);
      setLoading(false);
    }, 1000); // Simulated delay for UI feedback
  }, [alertId]);

  const handleApprove = () => {
    if (role !== "admin" || alert.status !== "pending") return;
    setLoading(true);
    setTimeout(() => {
      setAlert({ ...alert, status: "approved" });
      setLogs([
        ...logs,
        {
          id: `log${logs.length + 1}`,
          alertId,
          action: "approved",
          timestamp: new Date().toISOString(),
          userId: "mockUser",
        },
      ]);
      Alert.alert("Success", "Alert approved successfully!");
      setLoading(false);
    }, 1000); // Simulate async action
  };

  const handleReject = () => {
    if (role !== "admin" || alert.status !== "pending") return;
    setLoading(true);
    setTimeout(() => {
      setAlert({ ...alert, status: "rejected" });
      setLogs([
        ...logs,
        {
          id: `log${logs.length + 1}`,
          alertId,
          action: "rejected",
          timestamp: new Date().toISOString(),
          userId: "mockUser",
        },
      ]);
      Alert.alert("Success", "Alert rejected successfully!");
      setLoading(false);
    }, 1000); // Simulate async action
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  if (!alert) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Alert not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn} style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Alert Details</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.timestamp}>
            Detected: {alert.timestamp.split("T")[1].slice(0, 5)}
          </Text>
          <Text
            style={[styles.status, { color: getStatusColor(alert.status) }]}
          >
            Status: {alert.status}
          </Text>
          <Text style={styles.confidence}>
            Sound Confidence: {alert.soundConfidence?.toFixed(2) || "N/A"},
            Weapon Confidence: {alert.weaponConfidence?.toFixed(2) || "N/A"}
          </Text>
          {alert.imageUrl && (
            <Image source={{ uri: alert.imageUrl }} style={styles.image} />
          )}
          <Text style={styles.sensorData}>
            Motion: {alert.sensorData?.motion ? "Detected" : "None"}
          </Text>
          <Text style={styles.sensorData}>
            Smoke: {alert.sensorData?.smoke || 0.0} ppm
          </Text>
          <Text style={styles.sensorData}>
            Location: Lat {alert.location?.latitude || "N/A"}, Lon{" "}
            {alert.location?.longitude || "N/A"}
          </Text>
          {logs.length > 0 && (
            <View style={styles.logsSection}>
              <Text style={styles.logsTitle}>Action History</Text>
              {logs.map((log) => (
                <Text key={log.id} style={styles.logEntry}>
                  {log.timestamp.split("T")[1].slice(0, 5)} - {log.action} by{" "}
                  {log.userId}
                </Text>
              ))}
            </View>
          )}
          {role === "admin" && alert.status === "pending" && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
                onPress={handleApprove}
              >
                <Text style={styles.actionText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#D32F2F" }]}
                onPress={handleReject}
              >
                <Text style={styles.actionText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
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
      return "#fff";
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    margin: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  timestamp: { color: "#fff", fontSize: 16, marginBottom: 8 },
  status: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  confidence: { color: "#999", fontSize: 14, marginBottom: 12 },
  image: { width: "100%", height: 200, borderRadius: 8, marginBottom: 12 },
  sensorData: { color: "#fff", fontSize: 14, marginBottom: 8 },
  logsSection: { marginTop: 12, marginBottom: 12 },
  logsTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  logEntry: { color: "#999", fontSize: 14, marginBottom: 4 },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    width: "45%",
  },
  actionText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

export default AlertDetail;

// 454
// import React, { useState, useEffect, useRef } from "react";
// import {
//   SafeAreaView,
//   ScrollView,
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   Alert,
//   Platform
// } from "react-native";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import Animated, { 
//   FadeIn, 
//   SlideInRight, 
//   SlideInUp, 
//   useSharedValue, 
//   useAnimatedStyle, 
//   withTiming,
//   withSpring
// } from "react-native-reanimated";
// import { LinearGradient } from "expo-linear-gradient";
// import { StatusBar } from "expo-status-bar";
// import Icon from "react-native-vector-icons/Ionicons";
// import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
// import { Audio } from "expo-av";
// import { useAuth } from "../../src/contexts/AuthContext";
// import { db } from "../../src/services/firebase";
// import {
//   doc,
//   getDoc,
//   updateDoc,
//   collection,
//   query,
//   where,
//   orderBy,
//   onSnapshot,
//   addDoc,
//   serverTimestamp
// } from "firebase/firestore";

// const AlertDetailPage = () => {
//   // State
//   const { alertId } = useLocalSearchParams();
//   const [alert, setAlert] = useState(null);
//   const [logs, setLogs] = useState([]);
//   const [device, setDevice] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [processingAction, setProcessingAction] = useState(false);
//   const [sound, setSound] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
  
//   // Animation values
//   const headerOpacity = useSharedValue(0);
//   const contentOpacity = useSharedValue(0);
//   const actionScale = useSharedValue(0.8);
  
//   // Refs
//   const scrollViewRef = useRef(null);
  
//   // Router and auth context
//   const router = useRouter();
//   const { user, role } = useAuth();
  
//   // Animated styles
//   const headerStyle = useAnimatedStyle(() => ({
//     opacity: headerOpacity.value
//   }));
  
//   const contentStyle = useAnimatedStyle(() => ({
//     opacity: contentOpacity.value,
//     transform: [{ 
//       translateY: interpolate(contentOpacity.value, [0, 1], [20, 0]) 
//     }]
//   }));
  
//   const actionStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: actionScale.value }]
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

//   // Format timestamp for display
//   const formatDate = (timestamp) => {
//     const date = convertTimestampToDate(timestamp);
//     return date.toLocaleString();
//   };

//   // Fetch alert data and logs
//   useEffect(() => {
//     const fetchAlertData = async () => {
//       try {
//         // Fetch alert details
//         const alertDoc = await getDoc(doc(db, "alerts", alertId));
        
//         if (alertDoc.exists()) {
//           const alertData = alertDoc.data();
//           setAlert(alertData);
          
//           // Fetch device data if deviceId is available
//           if (alertData.deviceId) {
//             const deviceDoc = await getDoc(doc(db, "sensors", alertData.deviceId));
//             if (deviceDoc.exists()) {
//               setDevice(deviceDoc.data().deviceInfo || {});
//             }
//           }
          
//           // Set up real-time listener for logs
//           const logsQuery = query(
//             collection(db, "logs"),
//             where("alertId", "==", alertId),
//             orderBy("timestamp", "desc")
//           );
          
//           const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
//             const logsData = snapshot.docs.map(doc => ({
//               id: doc.id,
//               ...doc.data()
//             }));
//             setLogs(logsData);
            
//             // Start animations
//             headerOpacity.value = withTiming(1, { duration: 500 });
//             contentOpacity.value = withTiming(1, { duration: 800 });
//             actionScale.value = withSpring(1);
            
//             setLoading(false);
//           }, (error) => {
//             console.error("Error fetching logs:", error);
//             setLoading(false);
//           });
          
//           return () => unsubscribeLogs();
//         } else {
//           Alert.alert("Error", "Alert not found");
//           router.back();
//         }
//       } catch (error) {
//         console.error("Error fetching alert data:", error);
//         Alert.alert("Error", "Failed to load alert details");
//         setLoading(false);
//       }
//     };
    
//     fetchAlertData();
    
//     // Clean up audio when component unmounts
//     return () => {
//       if (sound) {
//         sound.unloadAsync();
//       }
//     };
//   }, [alertId, router]);

//   // Handle audio playback
//   const handlePlaySound = async () => {
//     try {
//       if (alert?.detections?.sound?.audioUrl) {
//         if (sound) {
//           if (isPlaying) {
//             await sound.pauseAsync();
//             setIsPlaying(false);
//           } else {
//             await sound.playAsync();
//             setIsPlaying(true);
//           }
//         } else {
//           const { sound: newSound } = await Audio.Sound.createAsync(
//             { uri: alert.detections.sound.audioUrl },
//             { shouldPlay: true }
//           );
          
//           setSound(newSound);
//           setIsPlaying(true);
          
//           // Handle audio completion
//           newSound.setOnPlaybackStatusUpdate((status) => {
//             if (status.didJustFinish) {
//               setIsPlaying(false);
//             }
//           });
//         }
//       } else {
//         Alert.alert("Audio Unavailable", "No audio recording is available for this alert.");
//       }
//     } catch (error) {
//       console.error("Error playing sound:", error);
//       Alert.alert("Playback Error", "Could not play the audio recording.");
//     }
//   };

//   // Handle alert approval
//   const handleApprove = async () => {
//     if (role !== "admin" || alert.status !== "pending") return;
    
//     actionScale.value = withSpring(0.9, {}, () => {
//       actionScale.value = withSpring(1);
//     });
    
//     try {
//       setProcessingAction(true);
      
//       // Update alert status
//       await updateDoc(doc(db, "alerts", alertId), {
//         status: "approved",
//         resolved: true,
//         resolvedBy: user.uid,
//         resolvedAt: serverTimestamp()
//       });
      
//       // Create log entry
//       await addDoc(collection(db, "logs"), {
//         alertId: alertId,
//         deviceId: alert.deviceId,
//         action: "approved",
//         timestamp: serverTimestamp(),
//         userId: user.uid,
//         securityNotified: true
//       });
      
//       // Create notifications for security team
//       // In a real app, you would query for security users and create notifications for each
      
//       Alert.alert(
//         "Success",
//         "Alert has been approved and security team notified.",
//         [{ text: "OK" }]
//       );
//     } catch (error) {
//       console.error("Error approving alert:", error);
//       Alert.alert("Error", "Failed to approve alert. Please try again.");
//     } finally {
//       setProcessingAction(false);
//     }
//   };

//   // Handle alert rejection
//   const handleReject = async () => {
//     if (role !== "admin" || alert.status !== "pending") return;
    
//     actionScale.value = withSpring(0.9, {}, () => {
//       actionScale.value = withSpring(1);
//     });
    
//     try {
//       setProcessingAction(true);
      
//       // Update alert status
//       await updateDoc(doc(db, "alerts", alertId), {
//         status: "rejected",
//         resolved: true,
//         resolvedBy: user.uid,
//         resolvedAt: serverTimestamp()
//       });
      
//       // Create log entry
//       await addDoc(collection(db, "logs"), {
//         alertId: alertId,
//         deviceId: alert.deviceId,
//         action: "rejected",
//         timestamp: serverTimestamp(),
//         userId: user.uid,
//         securityNotified: false
//       });
      
//       Alert.alert(
//         "Success",
//         "Alert has been rejected.",
//         [{ text: "OK" }]
//       );
//     } catch (error) {
//       console.error("Error rejecting alert:", error);
//       Alert.alert("Error", "Failed to reject alert. Please try again.");
//     } finally {
//       setProcessingAction(false);
//     }
//   };

//   // Handle security acknowledgment
//   const handleAcknowledge = async () => {
//     if (role !== "security" || alert.status !== "approved") return;
    
//     actionScale.value = withSpring(0.9, {}, () => {
//       actionScale.value = withSpring(1);
//     });
    
//     try {
//       setProcessingAction(true);
      
//       // Create log entry for security acknowledgment
//       await addDoc(collection(db, "logs"), {
//         alertId: alertId,
//         action: "acknowledged",
//         timestamp: serverTimestamp(),
//         userId: user.uid
//       });
      
//       Alert.alert(
//         "Success",
//         "Alert has been acknowledged.",
//         [{ text: "OK", onPress: () => router.back() }]
//       );
//     } catch (error) {
//       console.error("Error acknowledging alert:", error);
//       Alert.alert("Error", "Failed to acknowledge alert. Please try again.");
//     } finally {
//       setProcessingAction(false);
//     }
//   };

//   // Render action buttons based on role and alert status
//   const renderActionButtons = () => {
//     if (role === "admin" && alert.status === "pending") {
//       return (
//         <Animated.View style={[styles.actionButtons, actionStyle]}>
//           <TouchableOpacity
//             style={[styles.actionButton, styles.rejectButton]}
//             onPress={handleReject}
//             disabled={processingAction}
//           >
//             <Icon name="close-circle-outline" size={24} color="#fff" />
//             <Text style={styles.actionButtonText}>Reject</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity
//             style={[styles.actionButton, styles.approveButton]}
//             onPress={handleApprove}
//             disabled={processingAction}
//           >
//             <Icon name="checkmark-circle-outline" size={24} color="#fff" />
//             <Text style={styles.actionButtonText}>Approve</Text>
//           </TouchableOpacity>
//         </Animated.View>
//       );
//     } else if (role === "security" && alert.status === "approved") {
//       // Check if security has already acknowledged
//       const hasAcknowledged = logs.some(
//         log => log.action === "acknowledged" && log.userId === user.uid
//       );
      
//       if (!hasAcknowledged) {
//         return (
//           <Animated.View style={actionStyle}>
//             <TouchableOpacity
//               style={[styles.actionButton, styles.acknowledgeButton]}
//               onPress={handleAcknowledge}
//               disabled={processingAction}
//             >
//               <Icon name="checkmark-done-outline" size={24} color="#fff" />
//               <Text style={styles.actionButtonText}>Acknowledge</Text>
//             </TouchableOpacity>
//           </Animated.View>
//         );
//       }
//     }
    
//     // Display status for already processed alerts
//     return (
//       <View style={styles.statusContainer}>
//         <Icon
//           name={alert.status === "approved" ? "checkmark-circle" : "close-circle"}
//           size={30}
//           color={getStatusColor(alert.status)}
//         />
//         <Text style={[styles.statusText, { color: getStatusColor(alert.status) }]}>
//           This alert has been {alert.status}
//         </Text>
//         {alert.resolvedBy && alert.resolvedAt && (
//           <Text style={styles.resolvedByText}>
//             By: {alert.resolvedBy} on {formatDate(alert.resolvedAt)}
//           </Text>
//         )}
//       </View>
//     );
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar style="light" />
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#4CAF50" />
//           <Text style={styles.loadingText}>Loading alert details...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar style="light" />
      
//       {/* Header */}
//       <Animated.View style={[styles.header, headerStyle]}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => router.back()}
//         >
//           <Icon name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Alert Details</Text>
//         <View style={styles.headerRight} />
//       </Animated.View>
      
//       {/* Content */}
//       <ScrollView
//         ref={scrollViewRef}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//       >
//         <Animated.View style={[styles.card, contentStyle]}>
//           {/* Alert Type & Status Header */}
//           <View style={styles.alertHeader}>
//             <View style={styles.alertTypeContainer}>
//               <MaterialIcons
//                 name={getAlertTypeIcon(alert.alertType)}
//                 size={24}
//                 color="#fff"
//               />
//               <Text style={styles.alertType}>
//                 {formatAlertType(alert.alertType)}
//               </Text>
//             </View>
            
//             <View style={[
//               styles.statusBadge,
//               { backgroundColor: getStatusColor(alert.status) }
//             ]}>
//               <Text style={styles.statusBadgeText}>{alert.status}</Text>
//             </View>
//           </View>
          
//           <Text style={styles.timestamp}>
//             Detected: {formatDate(alert.timestamp)}
//           </Text>
          
//           {/* Detection Sections */}
//           {alert.detections?.sound?.detected && (
//             <Animated.View entering={SlideInUp.delay(100).duration(800)} style={styles.detectionSection}>
//               <Text style={styles.sectionTitle}>Sound Detection</Text>
              
//               <TouchableOpacity
//                 style={styles.audioPlayer}
//                 onPress={handlePlaySound}
//                 disabled={!alert.detections.sound.audioUrl}
//               >
//                 <LinearGradient
//                   colors={["#4CAF50", "#2E7D32"]}
//                   style={styles.audioButton}
//                 >
//                   <Icon
//                     name={isPlaying ? "pause" : "play"}
//                     size={28}
//                     color="#fff"
//                   />
//                 </LinearGradient>
//                 <Text style={styles.audioText}>
//                   {isPlaying ? "Pause Audio" : "Play Audio"}
//                 </Text>
//               </TouchableOpacity>
              
//               <View style={styles.confidence}>
//                 <Text style={styles.confidenceLabel}>Sound Type:</Text>
//                 <Text style={styles.confidenceValue}>
//                   {alert.detections.sound.type || "Unknown"}
//                 </Text>
//               </View>
              
//               <View style={styles.confidence}>
//                 <Text style={styles.confidenceLabel}>Confidence:</Text>
//                 <View style={styles.confidenceBar}>
//                   <View
//                     style={[
//                       styles.confidenceFill,
//                       {
//                         width: ${alert.detections.sound.confidence * 100}%,
//                         backgroundColor: getConfidenceColor(alert.detections.sound.confidence)
//                       }
//                     ]}
//                   />
//                 </View>
//                 <Text style={styles.confidencePercent}>
//                   {(alert.detections.sound.confidence * 100).toFixed(1)}%
//                 </Text>
//               </View>
//             </Animated.View>
//           )}
          
//           {alert.detections?.image?.detected && (
//             <Animated.View entering={SlideInUp.delay(200).duration(800)} style={styles.detectionSection}>
//               <Text style={styles.sectionTitle}>Image Detection</Text>
              
//               {alert.detections.image.imageUrl ? (
//                 <Image
//                   source={{ uri: alert.detections.image.imageUrl }}
//                   style={styles.detectionImage}
//                   resizeMode="contain"
//                 />
//               ) : (
//                 <View style={styles.noImageContainer}>
//                   <MaterialIcons name="image-off" size={48} color="#666" />
//                   <Text style={styles.noImageText}>No image available</Text>
//                 </View>
//               )}
              
//               <View style={styles.confidence}>
//                 <Text style={styles.confidenceLabel}>Weapon Type:</Text>
//                 <Text style={styles.confidenceValue}>
//                   {alert.detections.image.type || "Unknown"}
//                 </Text>
//               </View>
              
//               <View style={styles.confidence}>
//                 <Text style={styles.confidenceLabel}>Confidence:</Text>
//                 <View style={styles.confidenceBar}>
//                   <View
//                     style={[
//                       styles.confidenceFill,
//                       {
//                         width: ${alert.detections.image.confidence * 100}%,
//                         backgroundColor: getConfidenceColor(alert.detections.image.confidence)
//                       }
//                     ]}
//                   />
//                 </View>
//                 <Text style={styles.confidencePercent}>
//                   {(alert.detections.image.confidence * 100).toFixed(1)}%
//                 </Text>
//               </View>
//             </Animated.View>
//           )}
          
//           {alert.detections?.smoke?.detected && (
//             <Animated.View entering={SlideInUp.delay(300).duration(800)} style={styles.detectionSection}>
//               <Text style={styles.sectionTitle}>Smoke Detection</Text>
              
//               {alert.detections.smoke.smokeUrl ? (
//                 <Image
//                   source={{ uri: alert.detections.smoke.smokeUrl }}
//                   style={styles.detectionImage}
//                   resizeMode="contain"
//                 />
//               ) : (
//                 <View style={styles.noImageContainer}>
//                   <MaterialIcons name="smoke" size={48} color="#666" />
//                   <Text style={styles.noImageText}>No smoke image available</Text>
//                 </View>
//               )}
              
//               <View style={styles.confidence}>
//                 <Text style={styles.confidenceLabel}>Smoke Level:</Text>
//                 <View style={styles.confidenceBar}>
//                   <View
//                     style={[
//                       styles.confidenceFill,
//                       {
//                         width: ${alert.detections.smoke.level}%,
//                         backgroundColor: getSmokeColor(alert.detections.smoke.level)
//                       }
//                     ]}
//                   />
//                 </View>
//                 <Text style={styles.confidencePercent}>
//                   {alert.detections.smoke.level}%
//                 </Text>
//               </View>
//             </Animated.View>
//           )}
          
//           {/* Device Information */}
//           {device && (
//             <Animated.View entering={SlideInUp.delay(400).duration(800)} style={styles.detectionSection}>
//               <Text style={styles.sectionTitle}>Device Information</Text>
              
//               <View style={styles.deviceInfoItem}>
//                 <MaterialIcons name="raspberry-pi" size={20} color="#bbb" />
//                 <Text style={styles.deviceInfoLabel}>Device:</Text>
//                 <Text style={styles.deviceInfoValue}>{device.name || alert.deviceId}</Text>
//               </View>
              
//               <View style={styles.deviceInfoItem}>
//                 <Icon name="pulse-outline" size={20} color="#bbb" />
//                 <Text style={styles.deviceInfoLabel}>Status:</Text>
//                 <Text style={[
//                   styles.deviceInfoValue,
//                   { color: device.status === "active" ? "#4CAF50" : "#F44336" }
//                 ]}>
//                   {device.status || "Unknown"}
//                 </Text>
//               </View>
              
//               {alert.latitude && alert.longitude && (
//                 <View style={styles.deviceInfoItem}>
//                   <Icon name="location-outline" size={20} color="#bbb" />
//                   <Text style={styles.deviceInfoLabel}>Location:</Text>
//                   <Text style={styles.deviceInfoValue}>
//                     {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
//                     {device.location?.areaName && ` (${device.location.areaName})`}
//                   </Text>
//                 </View>
//               )}
              
//               <View style={styles.mapPlaceholder}>
//                 <MaterialIcons name="map-marker" size={48} color="#666" />
//                 <Text style={styles.mapPlaceholderText}>Map View</Text>
//               </View>
//             </Animated.View>
//           )}
          
//           {/* Action Logs */}
//           {logs.length > 0 && (
//             <Animated.View entering={SlideInUp.delay(500).duration(800)} style={styles.detectionSection}>
//               <Text style={styles.sectionTitle}>Action History</Text>
              
//               {logs.map((log, index) => (
//                 <View key={log.id} style={styles.logItem}>
//                   <View style={[
//                     styles.logIconContainer,
//                     { backgroundColor: getLogColor(log.action, 0.2) }
//                   ]}>
//                     <Icon
//                       name={getLogIcon(log.action)}
//                       size={18}
//                       color={getLogColor(log.action)}
//                     />
//                   </View>
//                   <View style={styles.logContent}>
//                     <Text style={styles.logAction}>
//                       {formatLogAction(log.action)}
//                     </Text>
//                     <Text style={styles.logTime}>
//                       {formatDate(log.timestamp)}
//                     </Text>
//                     {log.userId && (
//                       <Text style={styles.logUser}>by {log.userId}</Text>
//                     )}
//                   </View>
//                 </View>
//               ))}
//             </Animated.View>
//           )}
          
//           {/* Action Buttons */}
//           {renderActionButtons()}
//         </Animated.View>
//       </ScrollView>
      
//       {processingAction && (
//         <View style={styles.processingOverlay}>
//           <ActivityIndicator size="large" color="#fff" />
//           <Text style={styles.processingText}>Processing...</Text>
//         </View>
//       )}
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

// // Helper function to format alert type
// const formatAlertType = (type) => {
//   if (!type) return "Unknown";
//   return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

// // Helper function to get smoke color
// const getSmokeColor = (level) => {
//   if (level < 30) return '#4CAF50';
//   if (level < 70) return '#FFC107';
//   return '#F44336';
// };

// // Helper function to get log icon
// const getLogIcon = (action) => {
//   switch (action) {
//     case 'created':
//       return 'add-circle-outline';
//     case 'approved':
//       return 'checkmark-circle-outline';
//     case 'rejected':
//       return 'close-circle-outline';
//     case 'acknowledged':
//       return 'eye-outline';
//     case 'notified':
//       return 'notifications-outline';
//     default:
//       return 'information-circle-outline';
//   }
// };

// // Helper function to get log color
// const getLogColor = (action, opacity = 1) => {
//   switch (action) {
//     case 'created':
//       return rgba(33, 150, 243, ${opacity});
//     case 'approved':
//       return rgba(76, 175, 80, ${opacity});
//     case 'rejected':
//       return rgba(244, 67, 54, ${opacity});
//     case 'acknowledged':
//       return rgba(156, 39, 176, ${opacity});
//     case 'notified':
//       return rgba(255, 152, 0, ${opacity});
//     default:
//       return rgba(187, 187, 187, ${opacity});
//   }
// };

// // Helper function to format log action
// const formatLogAction = (action) => {
//   switch (action) {
//     case 'created':
//       return 'Alert Created';
//     case 'approved':
//       return 'Approved';
//     case 'rejected':
//       return 'Rejected';
//     case 'acknowledged':
//       return 'Acknowledged';
//     case 'notified':
//       return 'Security Notified';
//     default:
//       return action.charAt(0).toUpperCase() + action.slice(1);
//   }
// };

// // Interpolate helper function (since it's not imported directly)
// const interpolate = (value, inputRange, outputRange) => {
//   if (value <= inputRange[0]) return outputRange[0];
//   if (value >= inputRange[1]) return outputRange[1];
//   return outputRange[0] + (value - inputRange[0]) * (outputRange[1] - outputRange[0]) / (inputRange[1] - inputRange[0]);
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
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 15,
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#333",
//     backgroundColor: "#1e1e1e",
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     color: "#fff",
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   headerRight: {
//     width: 40,
//   },
//   scrollContent: {
//     padding: 15,
//     paddingBottom: 30,
//   },
//   card: {
//     backgroundColor: "#1e1e1e",
//     borderRadius: 15,
//     padding: 20,
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
//   alertHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   alertTypeContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   alertType: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "bold",
//     marginLeft: 10,
//   },
//   statusBadge: {
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 20,
//   },
//   statusBadgeText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "bold",
//     textTransform: "uppercase",
//   },
//   timestamp: {
//     color: "#bbb",
//     fontSize: 14,
//     marginBottom: 20,
//   },
//   detectionSection: {
//     backgroundColor: "#262626",
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "600",
//     marginBottom: 15,
//   },
//   audioPlayer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   audioButton: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 15,
//   },
//   audioText: {
//     color: "#fff",
//     fontSize: 16,
//   },
//   confidence: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   confidenceLabel: {
//     color: "#bbb",
//     fontSize: 14,
//     width: 100,
//   },
//   confidenceValue: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   confidenceBar: {
//     flex: 1,
//     height: 8,
//     backgroundColor: "#333",
//     borderRadius: 4,
//     overflow: "hidden",
//     marginHorizontal: 10,
//   },
//   confidenceFill: {
//     height: "100%",
//   },
//   confidencePercent: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "bold",
//     width: 45,
//     textAlign: "right",
//   },
//   detectionImage: {
//     width: "100%",
//     height: 200,
//     borderRadius: 8,
//     marginBottom: 15,
//     backgroundColor: "#333",
//   },
//   noImageContainer: {
//     width: "100%",
//     height: 150,
//     borderRadius: 8,
//     backgroundColor: "#333",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   noImageText: {
//     color: "#999",
//     marginTop: 10,
//   },
//   deviceInfoItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   deviceInfoLabel: {
//     color: "#bbb",
//     fontSize: 14,
//     width: 70,
//     marginLeft: 8,
//   },
//   deviceInfoValue: {
//     color: "#fff",
//     fontSize: 14,
//     flex: 1,
//   },
//   mapPlaceholder: {
//     width: "100%",
//     height: 150,
//     borderRadius: 8,
//     backgroundColor: "#333",
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 15,
//   },
//   mapPlaceholderText: {
//     color: "#999",
//     marginTop: 10,
//   },
//   logItem: {
//     flexDirection: "row",
//     marginBottom: 12,
//   },
//   logIconContainer: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 10,
//   },
//   logContent: {
//     flex: 1,
//   },
//   logAction: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   logTime: {
//     color: "#999",
//     fontSize: 12,
//     marginTop: 2,
//   },
//   logUser: {
//     color: "#bbb",
//     fontSize: 12,
//     marginTop: 2,
//     fontStyle: "italic",
//   },
//   actionButtons: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 20,
//   },
//   actionButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: 10,
//     padding: 15,
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
//   approveButton: {
//     backgroundColor: "#4CAF50",
//     flex: 0.48,
//   },
//   rejectButton: {
//     backgroundColor: "#F44336",
//     flex: 0.48,
//   },
//   acknowledgeButton: {
//     backgroundColor: "#9C27B0",
//     width: "100%",
//   },
//   actionButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//     marginLeft: 10,
//   },
//   statusContainer: {
//     alignItems: "center",
//     marginTop: 20,
//     backgroundColor: "rgba(255, 255, 255, 0.1)",
//     borderRadius: 10,
//     padding: 15,
//   },
//   statusText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginTop: 10,
//   },
//   resolvedByText: {
//     color: "#bbb",
//     fontSize: 14,
//     marginTop: 5,
//   },
//   processingOverlay: {
//     position: "absolute",
//     top: 0,
//     right: 0,
//     bottom: 0,
//     left: 0,
//     backgroundColor: "rgba(0,0,0,0.7)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   processingText: {
//     color: "#fff",
//     fontSize: 18,
//     marginTop: 10,
//   },
// });

// export default AlertDetailPage;