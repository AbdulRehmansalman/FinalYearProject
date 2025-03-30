// import React, { useState, useEffect, useCallback } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
//   Modal,
//   StyleSheet,
//   Dimensions,
//   Switch,
// } from "react-native";
// import { useRouter } from "expo-router";
// import Animated, {
//   FadeIn,
//   useSharedValue,
//   useAnimatedStyle,
//   withSpring,
// } from "react-native-reanimated";
// import Icon from "react-native-vector-icons/Ionicons";
// import { LinearGradient } from "expo-linear-gradient";

// const { width } = Dimensions.get("window");

// const Settings = () => {
//   const [userData, setUserData] = useState({
//     phone: "+1234567890",
//     email: "admin@wildlife.com",
//   });
//   const [deviceData, setDeviceData] = useState({
//     location: { latitude: 40.7128, longitude: -74.006 },
//   });
//   const [securityMembers, setSecurityMembers] = useState([
//     { id: "sec1", phoneNumber: "+1987654321", email: "security1@wildlife.com" },
//     { id: "sec2", phoneNumber: "+1123456789", email: "security2@wildlife.com" },
//   ]);
//   const [receiveAlerts, setReceiveAlerts] = useState(false);
//   const [newSecurityPhone, setNewSecurityPhone] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalMessage, setModalMessage] = useState("");
//   const role = "admin"; // Hardcoded role for frontend demo
//   const router = useRouter();

//   const scale = useSharedValue(0);
//   const animatedModalStyles = useAnimatedStyle(() => ({
//     transform: [{ scale: scale.value }],
//   }));

//   useEffect(() => {
//     // Simulate loading with mock data
//     setTimeout(() => setLoading(false), 1000);
//   }, []);

//   const showModal = (message) => {
//     setModalMessage(message);
//     setModalVisible(true);
//     scale.value = withSpring(1);
//     setTimeout(() => {
//       scale.value = withSpring(0);
//       setModalVisible(false);
//     }, 2000);
//   };

//   const handleSaveUser = () => {
//     setLoading(true);
//     setTimeout(() => {
//       showModal("User settings saved successfully!");
//       setLoading(false);
//     }, 1000);
//   };

//   const handleToggleAlerts = (value) => {
//     setReceiveAlerts(value);
//     setTimeout(
//       () => showModal(`SMS Alerts ${value ? "Enabled" : "Disabled"}!`),
//       500
//     );
//   };

//   const handleAddSecurityPhone = () => {
//     if (!newSecurityPhone || !/^\+?\d{10,15}$/.test(newSecurityPhone)) {
//       Alert.alert(
//         "Invalid Phone",
//         "Please enter a valid phone number (e.g., +1234567890)."
//       );
//       return;
//     }
//     setLoading(true);
//     setTimeout(() => {
//       setSecurityMembers([
//         ...securityMembers,
//         {
//           id: `sec${securityMembers.length + 3}`,
//           phoneNumber: newSecurityPhone,
//           email: `security${securityMembers.length + 3}@wildlife.com`,
//         },
//       ]);
//       setNewSecurityPhone("");
//       showModal("Security member added successfully!");
//       setLoading(false);
//     }, 1000);
//   };

//   const handleRemoveSecurityMember = (memberId) => {
//     setLoading(true);
//     setTimeout(() => {
//       setSecurityMembers(
//         securityMembers.filter((member) => member.id !== memberId)
//       );
//       showModal("Security member removed successfully!");
//       setLoading(false);
//     }, 1000);
//   };

//   const handleLogout = () => {
//     setTimeout(() => router.replace("/(auth)/login"), 500);
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4CAF50" />
//       </SafeAreaView>
//     );
//   }

//   // Combine all content into FlatList to avoid nesting issues
//   const pageData = [
//     { type: "header", id: "header" },
//     { type: "userProfile", id: "userProfile" },
//     { type: "notifications", id: "notifications" },
//     { type: "securityMembers", id: "securityMembers" },
//     { type: "deviceInfo", id: "deviceInfo" },
//     { type: "logout", id: "logout" },
//   ];

//   const renderItem = ({ item }) => {
//     switch (item.type) {
//       case "header":
//         return (
//           <LinearGradient colors={["#4CAF50", "#388E3C"]} style={styles.header}>
//             <Text style={styles.headerText}>Settings</Text>
//             <TouchableOpacity
//               onPress={() => router.replace("/(tabs)/dashboard")}
//             >
//               <Icon name="arrow-back" size={24} color="#fff" />
//             </TouchableOpacity>
//           </LinearGradient>
//         );
//       case "userProfile":
//         return (
//           <Animated.View entering={FadeIn} style={styles.card}>
//             <Text style={styles.sectionTitle}>User Profile</Text>
//             <Text style={styles.label}>Role: {role}</Text>
//             <Text style={styles.label}>Email: {userData.email}</Text>
//             <TextInput
//               style={styles.input}
//               value={userData.phone}
//               onChangeText={(text) => setUserData({ ...userData, phone: text })}
//               placeholder="Phone Number (e.g., +1234567890)"
//               placeholderTextColor="#999"
//               keyboardType="phone-pad"
//             />
//             <TouchableOpacity
//               style={styles.saveButton}
//               onPress={handleSaveUser}
//             >
//               <Icon name="save-outline" size={20} color="#fff" />
//               <Text style={styles.buttonText}>Save Changes</Text>
//             </TouchableOpacity>
//           </Animated.View>
//         );
//       case "notifications":
//         return (
//           <Animated.View entering={FadeIn} style={styles.card}>
//             <Text style={styles.sectionTitle}>Notification Settings</Text>
//             <View style={styles.switchRow}>
//               <Text style={styles.label}>Receive SMS Alerts</Text>
//               <Switch
//                 value={receiveAlerts}
//                 onValueChange={handleToggleAlerts}
//                 trackColor={{ false: "#767577", true: "#4CAF50" }}
//                 thumbColor={receiveAlerts ? "#fff" : "#f4f3f4"}
//               />
//             </View>
//           </Animated.View>
//         );
//       case "securityMembers":
//         return (
//           <Animated.View entering={FadeIn} style={styles.card}>
//             <Text style={styles.sectionTitle}>Manage Security Team</Text>
//             {securityMembers.length > 0 ? (
//               securityMembers.map((member) => (
//                 <View key={member.id} style={styles.memberItem}>
//                   <View>
//                     <Text style={styles.label}>
//                       Phone: {member.phoneNumber}
//                     </Text>
//                     <Text style={styles.subLabel}>Email: {member.email}</Text>
//                   </View>
//                   <TouchableOpacity
//                     style={styles.removeButton}
//                     onPress={() => handleRemoveSecurityMember(member.id)}
//                   >
//                     <Icon name="trash-outline" size={20} color="#fff" />
//                   </TouchableOpacity>
//                 </View>
//               ))
//             ) : (
//               <Text style={styles.emptyText}>
//                 No security team members found
//               </Text>
//             )}
//             <View style={styles.addMemberContainer}>
//               <TextInput
//                 style={[styles.input, styles.addInput]}
//                 value={newSecurityPhone}
//                 onChangeText={setNewSecurityPhone}
//                 placeholder="Add Security Phone (e.g., +1234567890)"
//                 placeholderTextColor="#999"
//                 keyboardType="phone-pad"
//               />
//               <TouchableOpacity
//                 style={styles.addButton}
//                 onPress={handleAddSecurityPhone}
//               >
//                 <Icon name="add-outline" size={20} color="#fff" />
//                 <Text style={styles.buttonText}>Add</Text>
//               </TouchableOpacity>
//             </View>
//           </Animated.View>
//         );
//       case "deviceInfo":
//         return (
//           <Animated.View entering={FadeIn} style={styles.card}>
//             <Text style={styles.sectionTitle}>Device Information</Text>
//             <Text style={styles.label}>
//               Device: Pi Unit 001 | Location: Lat{" "}
//               {deviceData.location.latitude.toFixed(2)}, Lon{" "}
//               {deviceData.location.longitude.toFixed(2)}
//             </Text>
//             <TouchableOpacity
//               style={styles.editButton}
//               onPress={() => router.push("/(tabs)/settings/device-location")}
//             >
//               <Icon name="location-outline" size={20} color="#fff" />
//               <Text style={styles.buttonText}>Edit Location</Text>
//             </TouchableOpacity>
//           </Animated.View>
//         );
//       case "logout":
//         return (
//           <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//             <Icon name="log-out-outline" size={20} color="#fff" />
//             <Text style={styles.buttonText}>Logout</Text>
//           </TouchableOpacity>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <FlatList
//         data={pageData}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 20 }}
//       />
//       <Modal
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <Animated.View style={[styles.modalContent, animatedModalStyles]}>
//             <Text style={styles.modalText}>{modalMessage}</Text>
//           </Animated.View>
//         </View>
//       </Modal>
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
//   header: {
//     padding: 20,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderBottomWidth: 1,
//     borderBottomColor: "#2d2d2d",
//   },
//   headerText: { color: "#fff", fontSize: 28, fontWeight: "700" },
//   card: {
//     backgroundColor: "#1e1e1e",
//     borderRadius: 20,
//     padding: 20,
//     marginVertical: 10,
//     marginHorizontal: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 8,
//   },
//   sectionTitle: {
//     color: "#4CAF50",
//     fontSize: 20,
//     fontWeight: "700",
//     marginBottom: 15,
//   },
//   label: { color: "#fff", fontSize: 16, marginBottom: 10 },
//   subLabel: { color: "#bbb", fontSize: 14, marginBottom: 10 },
//   input: {
//     borderColor: "#4CAF50",
//     borderWidth: 1,
//     borderRadius: 12,
//     color: "#fff",
//     padding: 12,
//     marginBottom: 15,
//     backgroundColor: "#2d2d2d",
//     fontSize: 16,
//   },
//   saveButton: {
//     backgroundColor: "#4CAF50",
//     borderRadius: 12,
//     padding: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 5,
//   },
//   switchRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   memberItem: {
//     backgroundColor: "#2d2d2d",
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 10,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   addMemberContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 15,
//   },
//   addInput: { flex: 1, marginRight: 10 },
//   addButton: {
//     backgroundColor: "#388E3C",
//     borderRadius: 12,
//     padding: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 5,
//   },
//   removeButton: {
//     backgroundColor: "#D32F2F",
//     borderRadius: 10,
//     padding: 8,
//     alignItems: "center",
//   },
//   editButton: {
//     backgroundColor: "#4CAF50",
//     borderRadius: 12,
//     padding: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 5,
//   },
//   logoutButton: {
//     backgroundColor: "#D32F2F",
//     borderRadius: 12,
//     padding: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginVertical: 20,
//     marginHorizontal: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 5,
//   },
//   buttonText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8 },
//   emptyText: {
//     color: "#bbb",
//     fontSize: 16,
//     textAlign: "center",
//     marginVertical: 10,
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.6)",
//   },
//   modalContent: {
//     backgroundColor: "#4CAF50",
//     borderRadius: 20,
//     padding: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 8,
//   },
//   modalText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "600",
//     textAlign: "center",
//   },
// });

// export default Settings;
// !working
// import React, { useState, useEffect, useCallback } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
//   Modal,
//   StyleSheet,
//   Dimensions,
//   Switch,
//   Alert,
// } from "react-native";
// import { useRouter } from "expo-router";
// import Animated, {
//   FadeIn,
//   useSharedValue,
//   useAnimatedStyle,
//   withSpring,
// } from "react-native-reanimated";
// import Icon from "react-native-vector-icons/Ionicons";
// import { LinearGradient } from "expo-linear-gradient";
// import { auth, db } from "../../services/firebase";
// import {
//   doc,
//   getDoc,
//   updateDoc,
//   collection,
//   query,
//   where,
//   onSnapshot,
//   setDoc,
//   deleteDoc,
// } from "firebase/firestore";
// import { signOut } from "firebase/auth";
// import { GeoPoint } from "firebase/firestore";

// const { width } = Dimensions.get("window");

// const Settings = () => {
//   const [userData, setUserData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     role: "",
//     receiveAlerts: false,
//   });
//   const [deviceData, setDeviceData] = useState({
//     deviceId: "",
//     location: { latitude: 0, longitude: 0 },
//   });
//   const [securityMembers, setSecurityMembers] = useState([]);
//   const [newMember, setNewMember] = useState({
//     email: "",
//     password: "",
//     phoneNumber: "",
//     role: "security",
//   });
//   const [loading, setLoading] = useState(true);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalMessage, setModalMessage] = useState("");
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const router = useRouter();

//   const scale = useSharedValue(0);
//   const animatedModalStyles = useAnimatedStyle(() => ({
//     transform: [{ scale: scale.value }],
//   }));

//   // Show modal with a message
//   const showModal = (message) => {
//     setModalMessage(message);
//     setModalVisible(true);
//     scale.value = withSpring(1);
//     setTimeout(() => {
//       scale.value = withSpring(0);
//       setModalVisible(false);
//     }, 2000);
//   };

//   // Fetch current user and their data
//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (user) {
//         setCurrentUserId(user.uid);
//         fetchUserData(user.uid);
//       } else {
//         setCurrentUserId(null);
//         router.replace("/(auth)/login");
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   // Fetch user data from Firestore
//   const fetchUserData = async (uid) => {
//     try {
//       const userRef = doc(db, "users", uid);
//       const userSnap = await getDoc(userRef);
//       if (userSnap.exists()) {
//         const data = userSnap.data();
//         setUserData({
//           name: data.name || "",
//           email: data.email || "",
//           phone: data.phone || "",
//           role: data.role || "",
//           receiveAlerts: data.receiveAlerts || false,
//         });
//       } else {
//         showModal("User data not found.");
//       }
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//       showModal("Failed to load user data: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch the first device
//   useEffect(() => {
//     const devicesQuery = query(collection(db, "devices"));
//     const unsubscribe = onSnapshot(
//       devicesQuery,
//       (querySnapshot) => {
//         if (!querySnapshot.empty) {
//           const deviceDoc = querySnapshot.docs[0];
//           const deviceData = deviceDoc.data();
//           setDeviceData({
//             deviceId: deviceDoc.id,
//             location: deviceData.location
//               ? {
//                   latitude: deviceData.location.latitude,
//                   longitude: deviceData.location.longitude,
//                 }
//               : { latitude: 0, longitude: 0 },
//           });
//         } else {
//           showModal("No devices found.");
//         }
//       },
//       (error) => {
//         console.error("Error fetching devices:", error);
//         showModal("Failed to load devices: " + error.message);
//       }
//     );

//     return () => unsubscribe();
//   }, []);

//   // Fetch security members (users with role "security")
//   useEffect(() => {
//     const securityQuery = query(
//       collection(db, "users"),
//       where("role", "==", "security")
//     );
//     const unsubscribe = onSnapshot(
//       securityQuery,
//       (querySnapshot) => {
//         const members = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setSecurityMembers(members);
//       },
//       (error) => {
//         console.error("Error fetching security members:", error);
//         showModal("Failed to load security members: " + error.message);
//       }
//     );

//     return () => unsubscribe();
//   }, []);

//   // Update user profile
//   const handleSaveUser = async () => {
//     if (!currentUserId) {
//       showModal("User not authenticated.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const userRef = doc(db, "users", currentUserId);
//       await updateDoc(userRef, {
//         name: userData.name,
//         email: userData.email,
//         phone: userData.phone,
//         receiveAlerts: userData.receiveAlerts,
//       });
//       showModal("Profile updated successfully!");
//     } catch (error) {
//       console.error("Error updating user profile:", error);
//       showModal("Failed to update profile: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Toggle SMS alerts
//   const toggleAlerts = async (value) => {
//     setUserData((prev) => ({ ...prev, receiveAlerts: value }));
//     if (!currentUserId) {
//       showModal("User not authenticated.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const userRef = doc(db, "users", currentUserId);
//       await updateDoc(userRef, { receiveAlerts: value });
//       showModal(`SMS Alerts ${value ? "Enabled" : "Disabled"}!`);
//     } catch (error) {
//       console.error("Error toggling alerts:", error);
//       showModal("Failed to toggle alerts: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Add a new security member
//   const handleAddSecurityMember = async () => {
//     if (
//       !newMember.name ||
//       !newMember.email ||
//       !newMember.password ||
//       !newMember.phoneNumber
//     ) {
//       Alert.alert(
//         "Invalid Input",
//         "Please fill in all fields for the new security member."
//       );
//       return;
//     }
//     if (!/^\+?\d{10,15}$/.test(newMember.phoneNumber)) {
//       Alert.alert(
//         "Invalid Phone",
//         "Please enter a valid phone number (e.g., +1234567890)."
//       );
//       return;
//     }
//     setLoading(true);
//     try {
//       const newMemberId = `sec${Date.now()}`; // Temporary ID for demo
//       const memberRef = doc(db, "users", newMemberId);
//       await setDoc(memberRef, {
//         name: newMember.name,
//         email: newMember.email,
//         password: newMember.password, // In a real app, hash this password
//         phone: newMember.phoneNumber,
//         role: "security",
//         receiveAlerts: false,
//       });
//       setNewMember({
//         name: "",
//         email: "",
//         password: "",
//         phoneNumber: "",
//         role: "security",
//       });
//       showModal("Security member added successfully!");
//     } catch (error) {
//       console.error("Error adding security member:", error);
//       showModal("Failed to add security member: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Remove a security member
//   const handleRemoveSecurityMember = async (memberId) => {
//     setLoading(true);
//     try {
//       const memberRef = doc(db, "users", memberId);
//       await deleteDoc(memberRef);
//       showModal("Security member removed successfully!");
//     } catch (error) {
//       console.error("Error removing security member:", error);
//       showModal("Failed to remove security member: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update device location
//   const handleUpdateDeviceLocation = async () => {
//     if (!deviceData.deviceId) {
//       showModal("No device selected.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const deviceRef = doc(db, "devices", deviceData.deviceId);
//       const newLocation = new GeoPoint(
//         deviceData.location.latitude + 0.01,
//         deviceData.location.longitude + 0.01
//       );
//       await updateDoc(deviceRef, { location: newLocation });
//       setDeviceData((prev) => ({
//         ...prev,
//         location: {
//           latitude: prev.location.latitude + 0.01,
//           longitude: prev.location.longitude + 0.01,
//         },
//       }));
//       showModal("Device location updated successfully!");
//     } catch (error) {
//       console.error("Error updating device location:", error);
//       showModal("Failed to update device location: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Logout
//   const handleLogout = async () => {
//     setLoading(true);
//     try {
//       await signOut(auth);
//       router.replace("/(auth)/login");
//     } catch (error) {
//       console.error("Error logging out:", error);
//       showModal("Failed to log out: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4CAF50" />
//         <Text style={styles.loadingText}>Loading...</Text>
//       </SafeAreaView>
//     );
//   }

//   const pageData = [
//     { type: "header", id: "header" },
//     { type: "userProfile", id: "userProfile" },
//     { type: "notifications", id: "notifications" },
//     { type: "securityMembers", id: "securityMembers" },
//     { type: "deviceInfo", id: "deviceInfo" },
//     { type: "logout", id: "logout" },
//   ];

//   const renderItem = ({ item }) => {
//     switch (item.type) {
//       case "header":
//         return (
//           <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.header}>
//             <Text style={styles.headerText}>Settings Dashboard</Text>
//             <TouchableOpacity
//               onPress={() => router.replace("/(tabs)/dashboard")}
//             >
//               <Icon name="arrow-back" size={28} color="#fff" />
//             </TouchableOpacity>
//           </LinearGradient>
//         );
//       case "userProfile":
//         return (
//           <Animated.View entering={FadeIn} style={styles.card}>
//             <Text style={styles.sectionTitle}>Your Profile</Text>
//             <TextInput
//               style={styles.input}
//               value={userData.name}
//               onChangeText={(text) => setUserData({ ...userData, name: text })}
//               placeholder="Name"
//               placeholderTextColor="#999"
//               autoCapitalize="words"
//             />
//             <TextInput
//               style={styles.input}
//               value={userData.email}
//               onChangeText={(text) => setUserData({ ...userData, email: text })}
//               placeholder="Email"
//               placeholderTextColor="#999"
//               keyboardType="email-address"
//               autoCapitalize="none"
//             />
//             <TextInput
//               style={styles.input}
//               value={userData.phone}
//               onChangeText={(text) => setUserData({ ...userData, phone: text })}
//               placeholder="Phone Number (e.g., +1234567890)"
//               placeholderTextColor="#999"
//               keyboardType="phone-pad"
//             />
//             <TouchableOpacity
//               style={styles.actionButton}
//               onPress={handleSaveUser}
//               disabled={loading}
//             >
//               <LinearGradient
//                 colors={["#4CAF50", "#388E3C"]}
//                 style={styles.buttonGradient}
//               >
//                 <Icon name="save-outline" size={20} color="#fff" />
//                 <Text style={styles.buttonText}>Update Profile</Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </Animated.View>
//         );
//       case "notifications":
//         return (
//           <Animated.View entering={FadeIn} style={styles.card}>
//             <Text style={styles.sectionTitle}>Notifications</Text>
//             <View style={styles.switchRow}>
//               <Text style={styles.label}>Receive SMS Alerts</Text>
//               <Switch
//                 value={userData.receiveAlerts}
//                 onValueChange={toggleAlerts}
//                 trackColor={{ false: "#767577", true: "#4CAF50" }}
//                 thumbColor={userData.receiveAlerts ? "#fff" : "#f4f3f4"}
//                 disabled={loading}
//               />
//             </View>
//           </Animated.View>
//         );
//       case "securityMembers":
//         return (
//           <Animated.View entering={FadeIn} style={styles.card}>
//             <Text style={styles.sectionTitle}>Security Team Management</Text>
//             {securityMembers.length > 0 ? (
//               securityMembers.map((member) => (
//                 <View key={member.id} style={styles.memberItem}>
//                   <View>
//                     <Text style={styles.label}>{member.name}</Text>
//                     <Text style={styles.subLabel}>Email: {member.email}</Text>
//                     <Text style={styles.subLabel}>Phone: {member.phone}</Text>
//                     <Text style={styles.subLabel}>Role: {member.role}</Text>
//                   </View>
//                   <TouchableOpacity
//                     style={styles.removeButton}
//                     onPress={() => handleRemoveSecurityMember(member.id)}
//                     disabled={loading}
//                   >
//                     <Icon name="trash-outline" size={20} color="#fff" />
//                   </TouchableOpacity>
//                 </View>
//               ))
//             ) : (
//               <Text style={styles.emptyText}>No security team members</Text>
//             )}
//             <Text style={styles.subSectionTitle}>Add New Member</Text>

//             <TextInput
//               style={styles.input}
//               value={newMember.email}
//               onChangeText={(text) =>
//                 setNewMember({ ...newMember, email: text })
//               }
//               placeholder="Email"
//               placeholderTextColor="#999"
//               keyboardType="email-address"
//               autoCapitalize="none"
//             />
//             <TextInput
//               style={styles.input}
//               value={newMember.password}
//               onChangeText={(text) =>
//                 setNewMember({ ...newMember, password: text })
//               }
//               placeholder="Password"
//               placeholderTextColor="#999"
//               secureTextEntry
//               autoCapitalize="none"
//             />
//             <TextInput
//               style={styles.input}
//               value={newMember.phoneNumber}
//               onChangeText={(text) =>
//                 setNewMember({ ...newMember, phoneNumber: text })
//               }
//               placeholder="Phone (e.g., +1234567890)"
//               placeholderTextColor="#999"
//               keyboardType="phone-pad"
//             />
//             <TouchableOpacity
//               style={styles.actionButton}
//               onPress={handleAddSecurityMember}
//               disabled={loading}
//             >
//               <LinearGradient
//                 colors={["#388E3C", "#2E7D32"]}
//                 style={styles.buttonGradient}
//               >
//                 <Icon name="person-add-outline" size={20} color="#fff" />
//                 <Text style={styles.buttonText}>Add Member</Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </Animated.View>
//         );
//       case "deviceInfo":
//         return (
//           <Animated.View entering={FadeIn} style={styles.card}>
//             <Text style={styles.sectionTitle}>Device Settings</Text>
//             <Text style={styles.label}>
//               {deviceData.deviceId || "No Device"} | Lat:{" "}
//               {deviceData.location.latitude.toFixed(2)}, Lon:{" "}
//               {deviceData.location.longitude.toFixed(2)}
//             </Text>
//             <TouchableOpacity
//               style={styles.actionButton}
//               onPress={handleUpdateDeviceLocation}
//               disabled={loading || !deviceData.deviceId}
//             >
//               <LinearGradient
//                 colors={["#4CAF50", "#388E3C"]}
//                 style={styles.buttonGradient}
//               >
//                 <Icon name="location-outline" size={20} color="#fff" />
//                 <Text style={styles.buttonText}>Update Location</Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </Animated.View>
//         );
//       case "logout":
//         return (
//           <TouchableOpacity
//             style={styles.logoutButton}
//             onPress={handleLogout}
//             disabled={loading}
//           >
//             <LinearGradient
//               colors={["#D32F2F", "#B71C1C"]}
//               style={styles.buttonGradient}
//             >
//               <Icon name="log-out-outline" size={20} color="#fff" />
//               <Text style={styles.buttonText}>Logout</Text>
//             </LinearGradient>
//           </TouchableOpacity>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <FlatList
//         data={pageData}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 30 }}
//       />
//       <Modal
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//         animationType="none"
//       >
//         <View style={styles.modalOverlay}>
//           <Animated.View style={[styles.modalContent, animatedModalStyles]}>
//             <Text style={styles.modalText}>{modalMessage}</Text>
//           </Animated.View>
//         </View>
//       </Modal>
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
//     fontSize: 16,
//     marginTop: 10,
//   },
//   header: {
//     padding: 20,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderBottomWidth: 1,
//     borderBottomColor: "#2d2d2d",
//   },
//   headerText: { color: "#fff", fontSize: 28, fontWeight: "700" },
//   card: {
//     backgroundColor: "#1e1e1e",
//     borderRadius: 20,
//     padding: 20,
//     marginVertical: 10,
//     marginHorizontal: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 8,
//   },
//   sectionTitle: {
//     color: "#4CAF50",
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 15,
//   },
//   subSectionTitle: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "600",
//     marginTop: 15,
//     marginBottom: 10,
//   },
//   label: { color: "#fff", fontSize: 16, marginBottom: 10 },
//   subLabel: { color: "#bbb", fontSize: 14, marginBottom: 5 },
//   input: {
//     borderColor: "#4CAF50",
//     borderWidth: 1,
//     borderRadius: 12,
//     color: "#fff",
//     padding: 12,
//     marginBottom: 15,
//     backgroundColor: "#2d2d2d",
//     fontSize: 16,
//   },
//   actionButton: {
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   buttonGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 12,
//   },
//   switchRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   memberItem: {
//     backgroundColor: "#2d2d2d",
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 10,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   removeButton: {
//     backgroundColor: "#D32F2F",
//     borderRadius: 10,
//     padding: 8,
//   },
//   logoutButton: {
//     borderRadius: 12,
//     marginVertical: 20,
//     marginHorizontal: 15,
//     overflow: "hidden",
//   },
//   buttonText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8 },
//   emptyText: {
//     color: "#bbb",
//     fontSize: 16,
//     textAlign: "center",
//     marginVertical: 10,
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.7)",
//   },
//   modalContent: {
//     backgroundColor: "#4CAF50",
//     borderRadius: 20,
//     padding: 25,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 8,
//   },
//   modalText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "600",
//     textAlign: "center",
//   },
// });

// export default Settings;

import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Dimensions,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import { auth, db } from "../../services/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { GeoPoint } from "firebase/firestore";

const { width } = Dimensions.get("window");

const Settings = () => {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    role: "",
    active: false,
  });
  const [deviceData, setDeviceData] = useState({
    deviceId: "",
    location: { latitude: 0, longitude: 0 },
  });
  const [securityMembers, setSecurityMembers] = useState([]);
  const [newMember, setNewMember] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    role: "security",
    active: true,
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const router = useRouter();

  const scale = useSharedValue(0);
  const animatedModalStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Show modal with a message
  const showModal = (message) => {
    setModalMessage(message);
    setModalVisible(true);
    scale.value = withSpring(1);
    setTimeout(() => {
      scale.value = withSpring(0);
      setModalVisible(false);
    }, 2000);
  };

  // Fetch current user and their data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
        fetchUserData(user.uid);
      } else {
        setCurrentUserId(null);
        router.replace("/(auth)/SignIn");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch user data from Firestore
  const fetchUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData({
          username: data.username || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          role: data.role || "",
          active: data.active || false,
        });
      } else {
        showModal("User data not found.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      showModal("Failed to load user data: " + error.message);
    }
  };

  // Fetch the first device
  useEffect(() => {
    const devicesQuery = query(collection(db, "devices"));
    const unsubscribe = onSnapshot(
      devicesQuery,
      (querySnapshot) => {
        if (!querySnapshot.empty) {
          const deviceDoc = querySnapshot.docs[0];
          const deviceData = deviceDoc.data();
          setDeviceData({
            deviceId: deviceDoc.id,
            location: deviceData.location
              ? {
                  latitude: deviceData.location.latitude,
                  longitude: deviceData.location.longitude,
                }
              : { latitude: 0, longitude: 0 },
          });
        } else {
          showModal("No devices found.");
        }
      },
      (error) => {
        console.error("Error fetching devices:", error);
        showModal("Failed to load devices: " + error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch security members (users with role "security")
  useEffect(() => {
    const securityQuery = query(
      collection(db, "users"),
      where("role", "==", "security")
    );
    const unsubscribe = onSnapshot(
      securityQuery,
      (querySnapshot) => {
        const members = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSecurityMembers(members);
      },
      (error) => {
        console.error("Error fetching security members:", error);
        showModal("Failed to load security members: " + error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  // Finish loading after initial data fetch
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Update user profile
  const handleSaveUser = async () => {
    if (!currentUserId) {
      showModal("User not authenticated.");
      return;
    }
    setLoading(true);
    try {
      const userRef = doc(db, "users", currentUserId);
      await updateDoc(userRef, {
        username: userData.username,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        active: userData.active,
      });
      showModal("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating user profile:", error);
      showModal("Failed to update profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle user active status
  const toggleUserActive = async (value) => {
    setUserData((prev) => ({ ...prev, active: value }));
    if (!currentUserId) {
      showModal("User not authenticated.");
      return;
    }
    setLoading(true);
    try {
      const userRef = doc(db, "users", currentUserId);
      await updateDoc(userRef, { active: value });
      showModal(`User status ${value ? "Activated" : "Deactivated"}!`);
    } catch (error) {
      console.error("Error toggling user active status:", error);
      showModal("Failed to toggle user status: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if email already exists in Firestore
  const checkEmailExists = async (email) => {
    const usersQuery = query(
      collection(db, "users"),
      where("email", "==", email)
    );
    const querySnapshot = await getDocs(usersQuery);
    return !querySnapshot.empty;
  };

  // Add a new security member directly in Firestore
  const handleAddSecurityMember = async () => {
    if (
      !newMember.username ||
      !newMember.email ||
      !newMember.phoneNumber ||
      !newMember.password
    ) {
      Alert.alert(
        "Invalid Input",
        "Please fill in all fields for the new security member."
      );
      return;
    }
    if (!/^\+?\d{10,15}$/.test(newMember.phoneNumber)) {
      Alert.alert(
        "Invalid Phone",
        "Please enter a valid phone number (e.g., +1234567890)."
      );
      return;
    }
    if (newMember.password.length < 6) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 6 characters long."
      );
      return;
    }

    setLoading(true);
    try {
      // Check if the email already exists in Firestore
      const emailExists = await checkEmailExists(newMember.email);
      if (emailExists) {
        showModal(
          "This email is already in use. Please use a different email."
        );
        return;
      }

      // Generate a unique ID for the new member
      const newMemberId = `sec${Date.now()}`; // Temporary ID for demo

      // Store user metadata in Firestore (excluding password for security)
      const memberRef = doc(db, "users", newMemberId);
      await setDoc(memberRef, {
        username: newMember.username,
        email: newMember.email,
        phoneNumber: newMember.phoneNumber,
        role: newMember.role,
        active: newMember.active,
      });

      // Reset the form
      setNewMember({
        username: "",
        email: "",
        phoneNumber: "",
        role: "security",
        active: true,
        password: "",
      });

      // Display success message with the password (for demo purposes)
      showModal(
        `Security member added successfully! Password: ${newMember.password}`
      );
    } catch (error) {
      console.error("Error adding security member:", error);
      showModal("Failed to add security member: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Remove a security member
  const handleRemoveSecurityMember = async (memberId) => {
    setLoading(true);
    try {
      const memberRef = doc(db, "users", memberId);
      await deleteDoc(memberRef);
      showModal("Security member removed successfully!");
    } catch (error) {
      console.error("Error removing security member:", error);
      showModal("Failed to remove security member: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle security member active status
  const toggleMemberActive = async (memberId, value) => {
    setSecurityMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === memberId ? { ...member, active: value } : member
      )
    );
    setLoading(true);
    try {
      const memberRef = doc(db, "users", memberId);
      await updateDoc(memberRef, { active: value });
      showModal(
        `Security member status ${value ? "Activated" : "Deactivated"}!`
      );
    } catch (error) {
      console.error("Error toggling security member active status:", error);
      showModal("Failed to toggle security member status: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update security member role
  const handleUpdateMemberRole = async (memberId, newRole) => {
    if (userData.role !== "admin") {
      showModal("Only admins can change roles.");
      return;
    }
    setSecurityMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
    setLoading(true);
    try {
      const memberRef = doc(db, "users", memberId);
      await updateDoc(memberRef, { role: newRole });
      showModal("Security member role updated successfully!");
    } catch (error) {
      console.error("Error updating security member role:", error);
      showModal("Failed to update security member role: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update device location
  const handleUpdateDeviceLocation = async () => {
    if (!deviceData.deviceId) {
      showModal("No device selected.");
      return;
    }
    setLoading(true);
    try {
      const deviceRef = doc(db, "devices", deviceData.deviceId);
      const newLocation = new GeoPoint(
        deviceData.location.latitude + 0.01,
        deviceData.location.longitude + 0.01
      );
      await updateDoc(deviceRef, { location: newLocation });
      setDeviceData((prev) => ({
        ...prev,
        location: {
          latitude: prev.location.latitude + 0.01,
          longitude: prev.location.longitude + 0.01,
        },
      }));
      showModal("Device location updated successfully!");
    } catch (error) {
      console.error("Error updating device location:", error);
      showModal("Failed to update device location: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error logging out:", error);
      showModal("Failed to log out: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const pageData = [
    { type: "header", id: "header" },
    { type: "userProfile", id: "userProfile" },
    { type: "securityMembers", id: "securityMembers" },
    { type: "deviceInfo", id: "deviceInfo" },
    { type: "logout", id: "logout" },
  ];

  const renderItem = ({ item }) => {
    switch (item.type) {
      case "header":
        return (
          <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.header}>
            <Text style={styles.headerText}>Settings Dashboard</Text>
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/dashboard")}
            >
              <Icon name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
        );
      case "userProfile":
        return (
          <Animated.View entering={FadeIn} style={styles.card}>
            <Text style={styles.sectionTitle}>Your Profile</Text>
            <TextInput
              style={styles.input}
              value={userData.username}
              onChangeText={(text) =>
                setUserData({ ...userData, username: text })
              }
              placeholder="Username"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              value={userData.email}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              value={userData.phoneNumber}
              onChangeText={(text) =>
                setUserData({ ...userData, phoneNumber: text })
              }
              placeholder="Phone Number (e.g., +1234567890)"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
            <View style={styles.infoRow}>
              <Text style={styles.label}>Role: {userData.role}</Text>
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Active Status</Text>
              <Switch
                value={userData.active}
                onValueChange={toggleUserActive}
                trackColor={{ false: "#767577", true: "#4CAF50" }}
                thumbColor={userData.active ? "#fff" : "#f4f3f4"}
                disabled={loading}
              />
            </View>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSaveUser}
              disabled={loading}
            >
              <LinearGradient
                colors={["#4CAF50", "#388E3C"]}
                style={styles.buttonGradient}
              >
                <Icon name="save-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Update Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        );
      case "securityMembers":
        return (
          <Animated.View entering={FadeIn} style={styles.card}>
            <Text style={styles.sectionTitle}>Security Team Management</Text>
            {securityMembers.length > 0 ? (
              securityMembers.map((member) => (
                <View key={member.id} style={styles.memberItem}>
                  <View>
                    <Text style={styles.label}>{member.username}</Text>
                    <Text style={styles.subLabel}>Email: {member.email}</Text>
                    <Text style={styles.subLabel}>
                      Phone: {member.phoneNumber}
                    </Text>
                    <View style={styles.pickerRow}>
                      <Text style={styles.subLabel}>Role:</Text>
                      <Picker
                        selectedValue={member.role}
                        onValueChange={(value) =>
                          handleUpdateMemberRole(member.id, value)
                        }
                        style={styles.picker}
                        enabled={userData.role === "admin" && !loading}
                      >
                        <Picker.Item label="Security" value="security" />
                        <Picker.Item label="Admin" value="admin" />
                      </Picker>
                    </View>
                    <View style={styles.switchRow}>
                      <Text style={styles.subLabel}>Active</Text>
                      <Switch
                        value={member.active}
                        onValueChange={(value) =>
                          toggleMemberActive(member.id, value)
                        }
                        trackColor={{ false: "#767577", true: "#4CAF50" }}
                        thumbColor={member.active ? "#fff" : "#f4f3f4"}
                        disabled={loading}
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveSecurityMember(member.id)}
                    disabled={loading}
                  >
                    <Icon name="trash-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No security team members</Text>
            )}
            <Text style={styles.subSectionTitle}>Add New Member</Text>
            <TextInput
              style={styles.input}
              value={newMember.username}
              onChangeText={(text) =>
                setNewMember({ ...newMember, username: text })
              }
              placeholder="Username"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              value={newMember.email}
              onChangeText={(text) =>
                setNewMember({ ...newMember, email: text })
              }
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              value={newMember.phoneNumber}
              onChangeText={(text) =>
                setNewMember({ ...newMember, phoneNumber: text })
              }
              placeholder="Phone (e.g., +1234567890)"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              value={newMember.password}
              onChangeText={(text) =>
                setNewMember({ ...newMember, password: text })
              }
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry
              autoCapitalize="none"
            />
            <View style={styles.pickerRow}>
              <Text style={styles.label}>Role:</Text>
              <Picker
                selectedValue={newMember.role}
                onValueChange={(value) =>
                  setNewMember({ ...newMember, role: value })
                }
                style={styles.picker}
                enabled={!loading}
              >
                <Picker.Item label="Security" value="security" />
                <Picker.Item label="Admin" value="admin" />
              </Picker>
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Active Status</Text>
              <Switch
                value={newMember.active}
                onValueChange={(value) =>
                  setNewMember({ ...newMember, active: value })
                }
                trackColor={{ false: "#767577", true: "#4CAF50" }}
                thumbColor={newMember.active ? "#fff" : "#f4f3f4"}
                disabled={loading}
              />
            </View>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAddSecurityMember}
              disabled={loading}
            >
              <LinearGradient
                colors={["#388E3C", "#2E7D32"]}
                style={styles.buttonGradient}
              >
                <Icon name="person-add-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Add Member</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        );
      case "deviceInfo":
        return (
          <Animated.View entering={FadeIn} style={styles.card}>
            <Text style={styles.sectionTitle}>Device Settings</Text>
            <Text style={styles.label}>
              {deviceData.deviceId || "No Device"} | Lat:{" "}
              {deviceData.location.latitude.toFixed(2)}, Lon:{" "}
              {deviceData.location.longitude.toFixed(2)}
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleUpdateDeviceLocation}
              disabled={loading || !deviceData.deviceId}
            >
              <LinearGradient
                colors={["#4CAF50", "#388E3C"]}
                style={styles.buttonGradient}
              >
                <Icon name="location-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Update Location</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        );
      case "logout":
        return (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={loading}
          >
            <LinearGradient
              colors={["#D32F2F", "#B71C1C"]}
              style={styles.buttonGradient}
            >
              <Icon name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={pageData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        animationType="none"
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, animatedModalStyles]}>
            <Text style={styles.modalText}>{modalMessage}</Text>
          </Animated.View>
        </View>
      </Modal>
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
    fontSize: 16,
    marginTop: 10,
  },
  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#2d2d2d",
  },
  headerText: { color: "#fff", fontSize: 28, fontWeight: "700" },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  sectionTitle: {
    color: "#4CAF50",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },
  subSectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 10,
  },
  label: { color: "#fff", fontSize: 16, marginBottom: 10 },
  subLabel: { color: "#bbb", fontSize: 14, marginBottom: 5 },
  infoRow: {
    marginBottom: 15,
  },
  input: {
    borderColor: "#4CAF50",
    borderWidth: 1,
    borderRadius: 12,
    color: "#fff",
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#2d2d2d",
    fontSize: 16,
  },
  actionButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  picker: {
    flex: 1,
    color: "#fff",
    backgroundColor: "#2d2d2d",
    borderRadius: 12,
  },
  memberItem: {
    backgroundColor: "#2d2d2d",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  removeButton: {
    backgroundColor: "#D32F2F",
    borderRadius: 10,
    padding: 8,
  },
  logoutButton: {
    borderRadius: 12,
    marginVertical: 20,
    marginHorizontal: 15,
    overflow: "hidden",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8 },
  emptyText: {
    color: "#bbb",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  modalText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default Settings;
