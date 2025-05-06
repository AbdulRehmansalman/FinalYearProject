// import React, { useState, useEffect, useCallback, useRef } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   Dimensions,
//   Switch,
//   Alert,
//   Platform,
//   StatusBar,
// } from "react-native";
// import { useRouter } from "expo-router";
// import Animated, {
//   FadeIn,
//   useSharedValue,
//   useAnimatedStyle,
//   withSpring,
//   withTiming,
//   Easing,
//   runOnJS,
// } from "react-native-reanimated";
// import Icon from "react-native-vector-icons/Ionicons";
// import { LinearGradient } from "expo-linear-gradient";
// import { Picker } from "@react-native-picker/picker";
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
//   getDocs,
//   limit,
//   startAfter,
// } from "firebase/firestore";
// import { signOut } from "firebase/auth";
// import { GeoPoint } from "firebase/firestore";

// const { width, height } = Dimensions.get("window");

// const SkeletonLoader = ({ width, height, style }) => {
//   const shimmer = useSharedValue(0);

//   const animatedStyle = useAnimatedStyle(() => ({
//     backgroundColor: `rgba(255, 255, 255, ${0.1 + shimmer.value * 0.1})`,
//   }));

//   useEffect(() => {
//     shimmer.value = withTiming(1, {
//       duration: 1000,
//       easing: Easing.inOut(Easing.ease),
//     });
//     const interval = setInterval(() => {
//       shimmer.value = withTiming(shimmer.value === 1 ? 0 : 1, {
//         duration: 1000,
//         easing: Easing.inOut(Easing.ease),
//       });
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [shimmer]);

//   return (
//     <Animated.View
//       style={[
//         {
//           width,
//           height,
//           backgroundColor: "#2d2d2d",
//           borderRadius: 8,
//         },
//         animatedStyle,
//         style,
//       ]}
//     />
//   );
// };

// const Settings = () => {
//   const [userData, setUserData] = useState({
//     username: "",
//     email: "",
//     phoneNumber: "",
//     role: "",
//     active: false,
//     password: "",
//   });
//   const [deviceData, setDeviceData] = useState({
//     deviceId: "",
//     location: null, // Changed to null to handle undefined cases better
//   });
//   const [securityMembers, setSecurityMembers] = useState([]);
//   const [lastVisible, setLastVisible] = useState(null);
//   const [hasMore, setHasMore] = useState(true);
//   const [newMember, setNewMember] = useState({
//     username: "",
//     email: "",
//     phoneNumber: "",
//     role: "security",
//     active: true,
//     password: "",
//   });
//   const [selectedMemberId, setSelectedMemberId] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [updateLocationVisible, setUpdateLocationVisible] = useState(false);
//   const [newLatitude, setNewLatitude] = useState("");
//   const [newLongitude, setNewLongitude] = useState("");
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const router = useRouter();

//   const headerScale = useSharedValue(1);
//   const backButtonScale = useSharedValue(1);
//   const updateLocationScale = useSharedValue(0);

//   const animatedHeaderStyles = useAnimatedStyle(() => ({
//     transform: [{ scale: headerScale.value }],
//   }));

//   const animatedBackButtonStyles = useAnimatedStyle(() => ({
//     transform: [{ scale: backButtonScale.value }],
//   }));

//   const animatedUpdateLocationStyles = useAnimatedStyle(() => ({
//     transform: [{ scale: updateLocationScale.value }],
//   }));

//   const showModal = (message) => {
//     Alert.alert("Message", message, [{ text: "OK" }]);
//   };

//   const showUpdateLocationPrompt = () => {
//     // Handle location as either an array or GeoPoint object
//     let latitude = 0;
//     let longitude = 0;

//     if (Array.isArray(deviceData.location)) {
//       latitude = deviceData.location[0] || 0;
//       longitude = deviceData.location[1] || 0;
//     } else if (deviceData.location && typeof deviceData.location === "object") {
//       latitude = deviceData.location.latitude || 0;
//       longitude = deviceData.location.longitude || 0;
//     }

//     setNewLatitude(latitude.toString());
//     setNewLongitude(longitude.toString());
//     setUpdateLocationVisible(true);
//     updateLocationScale.value = withSpring(1);
//   };

//   const hideUpdateLocationPrompt = () => {
//     updateLocationScale.value = withSpring(0);
//     setTimeout(() => {
//       setUpdateLocationVisible(false);
//     }, 300);
//   };

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (user) {
//         setCurrentUserId(user.uid);
//         fetchUserData(user.uid);
//       } else {
//         setCurrentUserId(null);
//         router.replace("/(auth)/SignIn");
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   const fetchUserData = async (uid) => {
//     try {
//       const userRef = doc(db, "users", uid);
//       const userSnap = await getDoc(userRef);
//       if (userSnap.exists()) {
//         const data = userSnap.data();
//         setUserData({
//           username: data.username || "",
//           email: data.email || "",
//           phoneNumber: data.phoneNumber || "",
//           role: data.role || "",
//           active: data.active || false,
//           password: "",
//         });
//       } else {
//         showModal("User data not found.");
//       }
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//       showModal("Failed to load user data: " + error.message);
//     }
//   };

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
//             location: deviceData.location || null, // Ensure location is null if undefined
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

//   const fetchSecurityMembers = async (isInitialFetch = true) => {
//     try {
//       let securityQuery = query(
//         collection(db, "users"),
//         where("role", "in", ["security", "admin"]),
//         limit(5)
//       );

//       if (!isInitialFetch && lastVisible) {
//         securityQuery = query(
//           collection(db, "users"),
//           where("role", "in", ["security", "admin"]),
//           startAfter(lastVisible),
//           limit(5)
//         );
//       }

//       const querySnapshot = await getDocs(securityQuery);
//       const members = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       if (isInitialFetch) {
//         setSecurityMembers(members);
//       } else {
//         setSecurityMembers((prev) => [...prev, ...members]);
//       }

//       if (querySnapshot.docs.length > 0) {
//         setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
//         setHasMore(querySnapshot.docs.length === 5);
//       } else {
//         setHasMore(false);
//       }
//     } catch (error) {
//       console.error("Error fetching security members:", error);
//       showModal("Failed to load security members: " + error.message);
//     }
//   };

//   useEffect(() => {
//     fetchSecurityMembers(true);
//   }, []);

//   useEffect(() => {
//     setTimeout(() => setLoading(false), 2000);
//   }, []);

//   const handleSaveUser = async () => {
//     if (!currentUserId) {
//       showModal("User not authenticated.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const userRef = doc(db, "users", currentUserId);
//       const updates = {
//         username: userData.username,
//         email: userData.email,
//         phoneNumber: userData.phoneNumber,
//         active: userData.active,
//       };
//       if (userData.password && userData.role === "admin") {
//         updates.password = userData.password;
//       }
//       await updateDoc(userRef, updates);
//       showModal("Profile updated successfully!");
//     } catch (error) {
//       console.error("Error updating user profile:", error);
//       showModal("Failed to update profile: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleUserActive = async (value) => {
//     setUserData((prev) => ({ ...prev, active: value }));
//     if (!currentUserId) {
//       showModal("User not authenticated.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const userRef = doc(db, "users", currentUserId);
//       await updateDoc(userRef, { active: value });
//       showModal(`User status ${value ? "Activated" : "Deactivated"}!`);
//     } catch (error) {
//       console.error("Error toggling user active status:", error);
//       showModal("Failed to toggle user status: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkEmailExists = async (email, excludeMemberId = null) => {
//     const usersQuery = query(
//       collection(db, "users"),
//       where("email", "==", email)
//     );
//     const querySnapshot = await getDocs(usersQuery);
//     if (excludeMemberId) {
//       return querySnapshot.docs.some((doc) => doc.id !== excludeMemberId);
//     }
//     return !querySnapshot.empty;
//   };

//   const handleAddSecurityMember = async () => {
//     if (
//       !newMember.username ||
//       !newMember.email ||
//       !newMember.phoneNumber ||
//       !newMember.password
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
//     if (newMember.password.length < 6) {
//       Alert.alert(
//         "Invalid Password",
//         "Password must be at least 6 characters long."
//       );
//       return;
//     }

//     setLoading(true);
//     try {
//       const emailExists = await checkEmailExists(newMember.email);
//       if (emailExists) {
//         showModal(
//           "This email is already in use. Please use a different email."
//         );
//         return;
//       }

//       const newMemberId = `sec${Date.now()}`;
//       const memberRef = doc(db, "users", newMemberId);
//       await setDoc(memberRef, {
//         username: newMember.username,
//         email: newMember.email,
//         phoneNumber: newMember.phoneNumber,
//         role: newMember.role,
//         active: newMember.active,
//         password: newMember.password,
//       });

//       resetForm();
//       fetchSecurityMembers(true);
//       showModal(
//         `${newMember.role} Member added successfully! Password: ${newMember.password}`
//       );
//     } catch (error) {
//       console.error("Error adding security member:", error);
//       showModal("Failed to add security member: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdateSecurityMember = async () => {
//     if (!newMember.username || !newMember.email || !newMember.phoneNumber) {
//       Alert.alert(
//         "Invalid Input",
//         "Please fill in all fields for the security member."
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
//       const emailExists = await checkEmailExists(
//         newMember.email,
//         selectedMemberId
//       );
//       if (emailExists) {
//         showModal(
//           "This email is already in use by another user. Please use a different email."
//         );
//         return;
//       }

//       const memberRef = doc(db, "users", selectedMemberId);
//       const updates = {
//         username: newMember.username,
//         email: newMember.email,
//         phoneNumber: newMember.phoneNumber,
//         role: newMember.role,
//         active: newMember.active,
//       };
//       if (newMember.password) {
//         updates.password = newMember.password;
//       }
//       await updateDoc(memberRef, updates);

//       resetForm();
//       fetchSecurityMembers(true);
//       showModal("Member updated successfully!");
//     } catch (error) {
//       console.error("Error updating security member:", error);
//       showModal("Failed to update security member: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setNewMember({
//       username: "",
//       email: "",
//       phoneNumber: "",
//       role: "security",
//       active: true,
//       password: "",
//     });
//     setSelectedMemberId(null);
//     setIsEditing(false);
//   };

//   const handleEditSecurityMember = (member) => {
//     setNewMember({
//       username: member.username,
//       email: member.email,
//       phoneNumber: member.phoneNumber,
//       role: member.role,
//       active: member.active,
//       password: member.password || "",
//     });
//     setSelectedMemberId(member.id);
//     setIsEditing(true);
//   };

//   const handleRemoveSecurityMember = async (memberId) => {
//     setLoading(true);
//     try {
//       const memberRef = doc(db, "users", memberId);
//       await deleteDoc(memberRef);
//       if (selectedMemberId === memberId) {
//         resetForm();
//       }
//       fetchSecurityMembers(true);
//       showModal("Security member removed successfully!");
//     } catch (error) {
//       console.error("Error removing security member:", error);
//       showModal("Failed to remove security member: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleMemberActive = async (memberId, value) => {
//     setSecurityMembers((prevMembers) =>
//       prevMembers.map((member) =>
//         member.id === memberId ? { ...member, active: value } : member
//       )
//     );
//     setLoading(true);
//     try {
//       const memberRef = doc(db, "users", memberId);
//       await updateDoc(memberRef, { active: value });
//       showModal(
//         `Security member status ${value ? "Activated" : "Deactivated"}!`
//       );
//     } catch (error) {
//       console.error("Error toggling security member active status:", error);
//       showModal("Failed to toggle security member status: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdateMemberRole = async (memberId, newRole) => {
//     if (userData.role !== "admin") {
//       showModal("Only admins can change roles.");
//       return;
//     }
//     setSecurityMembers((prevMembers) =>
//       prevMembers.map((member) =>
//         member.id === memberId ? { ...member, role: newRole } : member
//       )
//     );
//     setLoading(true);
//     try {
//       const memberRef = doc(db, "users", memberId);
//       await updateDoc(memberRef, { role: newRole });
//       showModal("Security member role updated successfully!");
//     } catch (error) {
//       console.error("Error updating security member role:", error);
//       showModal("Failed to update security member role: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdateDeviceLocation = async () => {
//     if (!deviceData.deviceId) {
//       showModal("No device selected.");
//       return;
//     }

//     const latitude = parseFloat(newLatitude);
//     const longitude = parseFloat(newLongitude);

//     if (isNaN(latitude) || isNaN(longitude)) {
//       showModal("Please enter valid latitude and longitude values.");
//       return;
//     }

//     if (
//       latitude < -90 ||
//       latitude > 90 ||
//       longitude < -180 ||
//       longitude > 180
//     ) {
//       showModal(
//         "Latitude must be between -90 and 90, and longitude must be between -180 and 180."
//       );
//       return;
//     }

//     setLoading(true);
//     try {
//       const deviceRef = doc(db, "devices", deviceData.deviceId);
//       const newLocation = new GeoPoint(latitude, longitude);
//       await updateDoc(deviceRef, { location: newLocation });
//       setDeviceData((prev) => ({
//         ...prev,
//         location: { latitude, longitude }, // Update local state as an object
//       }));
//       showModal("Device location updated successfully!");
//       hideUpdateLocationPrompt();
//     } catch (error) {
//       console.error("Error updating device location:", error);
//       showModal("Failed to update device location: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = async () => {
//     Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Yes",
//         onPress: async () => {
//           setLoading(true);
//           try {
//             await signOut(auth);
//             router.replace("/(auth)/login");
//           } catch (error) {
//             console.error("Error logging out:", error);
//             showModal("Failed to log out: " + error.message);
//           } finally {
//             setLoading(false);
//           }
//         },
//       },
//     ]);
//   };

//   const handleBackPress = () => {
//     router.push("/(tabs)/DashboardPage");
//   };

//   const pageData = [
//     { type: "header", id: "header" },
//     { type: "userProfile", id: "userProfile" },
//     { type: "securityMembers", id: "securityMembers" },
//     { type: "deviceInfo", id: "deviceInfo" },
//     { type: "logout", id: "logout" },
//   ];

//   const renderItem = ({ item }) => {
//     switch (item.type) {
//       case "header":
//         return (
//           <TouchableOpacity
//             activeOpacity={0.95}
//             onPress={() => {
//               headerScale.value = withSpring(0.98, {}, () => {
//                 headerScale.value = withSpring(1);
//               });
//             }}
//           >
//             <Animated.View style={[styles.header, animatedHeaderStyles]}>
//               <LinearGradient
//                 colors={["#4CAF50", "#2E7D32"]}
//                 style={styles.headerGradient}
//               >
//                 <TouchableOpacity
//                   onPress={handleBackPress}
//                   style={styles.backButton}
//                 >
//                   <Animated.View style={animatedBackButtonStyles}>
//                     <Icon name="arrow-back" size={28} color="#fff" />
//                   </Animated.View>
//                 </TouchableOpacity>
//                 <View style={styles.headerContent}>
//                   <Text style={styles.headerText}>Settings</Text>
//                 </View>
//               </LinearGradient>
//             </Animated.View>
//           </TouchableOpacity>
//         );
//       case "userProfile":
//         return loading ? (
//           <View style={styles.card}>
//             <SkeletonLoader
//               width={width - 60}
//               height={30}
//               style={{ marginBottom: 15 }}
//             />
//             <SkeletonLoader
//               width={width - 60}
//               height={50}
//               style={{ marginBottom: 15 }}
//             />
//             <SkeletonLoader
//               width={width - 60}
//               height={50}
//               style={{ marginBottom: 15 }}
//             />
//             <SkeletonLoader
//               width={width - 60}
//               height={50}
//               style={{ marginBottom: 15 }}
//             />
//             <SkeletonLoader
//               width={100}
//               height={20}
//               style={{ marginBottom: 15 }}
//             />
//             <SkeletonLoader width={150} height={40} />
//           </View>
//         ) : (
//           <Animated.View entering={FadeIn} style={styles.card}>
//             <Text style={styles.sectionTitle}>Your Profile</Text>
//             <TextInput
//               style={styles.input}
//               value={userData.username}
//               onChangeText={(text) =>
//                 setUserData({ ...userData, username: text })
//               }
//               placeholder="Username"
//               placeholderTextColor="#999"
//               autoCapitalize="none"
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
//               value={userData.phoneNumber}
//               onChangeText={(text) =>
//                 setUserData({ ...userData, phoneNumber: text })
//               }
//               placeholder="Phone Number (e.g., +1234567890)"
//               placeholderTextColor="#999"
//               keyboardType="phone-pad"
//             />
//             {userData.role === "admin" && (
//               <TextInput
//                 style={styles.input}
//                 value={userData.password}
//                 onChangeText={(text) =>
//                   setUserData({ ...userData, password: text })
//                 }
//                 placeholder="Password"
//                 placeholderTextColor="#999"
//                 secureTextEntry
//                 autoCapitalize="none"
//               />
//             )}
//             <View style={styles.infoRow}>
//               <Text style={styles.label}>Role: {userData.role}</Text>
//             </View>
//             <View style={styles.switchRow}>
//               <Text style={styles.label}>Active Status</Text>
//               <Switch
//                 value={userData.active}
//                 onValueChange={toggleUserActive}
//                 trackColor={{ false: "#767577", true: "#4CAF50" }}
//                 thumbColor={userData.active ? "#fff" : "#f4f3f4"}
//                 disabled={loading}
//               />
//             </View>

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
//       case "securityMembers":
//         return loading ? (
//           <View style={styles.card}>
//             <SkeletonLoader
//               width={width - 60}
//               height={30}
//               style={{ marginBottom: 15 }}
//             />
//             <SkeletonLoader
//               width={width - 60}
//               height={100}
//               style={{ marginBottom: 10 }}
//             />
//             <SkeletonLoader
//               width={width - 60}
//               height={100}
//               style={{ marginBottom: 10 }}
//             />
//             <SkeletonLoader
//               width={width - 60}
//               height={50}
//               style={{ marginBottom: 15 }}
//             />
//             <SkeletonLoader
//               width={width - 60}
//               height={50}
//               style={{ marginBottom: 15 }}
//             />
//             <SkeletonLoader
//               width={width - 60}
//               height={50}
//               style={{ marginBottom: 15 }}
//             />
//             <SkeletonLoader width={150} height={40} />
//           </View>
//         ) : (
//           <Animated.View entering={FadeIn} style={styles.card}>
//             <Text style={styles.sectionTitle}>Team Management</Text>
//             {securityMembers.length > 0 ? (
//               securityMembers.map((member) => (
//                 <View key={member.id} style={styles.memberItem}>
//                   <View style={styles.memberDetails}>
//                     <Text style={styles.label}>{member.username}</Text>
//                     <Text style={styles.subLabel}>Email: {member.email}</Text>
//                     <Text style={styles.subLabel}>
//                       Phone: {member.phoneNumber}
//                     </Text>
//                     <View style={styles.pickerRow}>
//                       <Text style={styles.subLabel}>Role:</Text>
//                       <Picker
//                         selectedValue={member.role}
//                         onValueChange={(value) =>
//                           handleUpdateMemberRole(member.id, value)
//                         }
//                         style={styles.picker}
//                         enabled={userData.role === "admin" && !loading}
//                       >
//                         <Picker.Item label="Security" value="security" />
//                         <Picker.Item label="Admin" value="admin" />
//                       </Picker>
//                     </View>
//                     <View style={styles.switchRow}>
//                       <Text style={styles.subLabel}>Active</Text>
//                       <Switch
//                         value={member.active}
//                         onValueChange={(value) =>
//                           toggleMemberActive(member.id, value)
//                         }
//                         trackColor={{ false: "#767577", true: "#4CAF50" }}
//                         thumbColor={member.active ? "#fff" : "#f4f3f4"}
//                         disabled={loading}
//                       />
//                     </View>
//                   </View>
//                   <View style={styles.memberActions}>
//                     <TouchableOpacity
//                       style={styles.editButton}
//                       onPress={() => handleEditSecurityMember(member)}
//                       disabled={loading}
//                     >
//                       <Icon name="pencil-outline" size={20} color="#fff" />
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       style={styles.removeButton}
//                       onPress={() => handleRemoveSecurityMember(member.id)}
//                       disabled={loading}
//                     >
//                       <Icon name="trash-outline" size={20} color="#fff" />
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               ))
//             ) : (
//               <Text style={styles.emptyText}>No security team members</Text>
//             )}
//             {hasMore && (
//               <TouchableOpacity
//                 style={styles.loadMoreButton}
//                 onPress={() => fetchSecurityMembers(false)}
//                 disabled={loading}
//               >
//                 <LinearGradient
//                   colors={["#4CAF50", "#388E3C"]}
//                   style={styles.buttonGradient}
//                 >
//                   <Icon
//                     name="arrow-down-circle-outline"
//                     size={20}
//                     color="#fff"
//                   />
//                   <Text style={styles.buttonText}>Load More</Text>
//                 </LinearGradient>
//               </TouchableOpacity>
//             )}
//             <Text style={styles.subSectionTitle}>
//               {isEditing ? "Update Member" : "Add New Member"}
//             </Text>
//             <TextInput
//               style={styles.input}
//               value={newMember.username}
//               onChangeText={(text) =>
//                 setNewMember({ ...newMember, username: text })
//               }
//               placeholder="Username"
//               placeholderTextColor="#999"
//               autoCapitalize="none"
//             />
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
//               value={newMember.phoneNumber}
//               onChangeText={(text) =>
//                 setNewMember({ ...newMember, phoneNumber: text })
//               }
//               placeholder="Phone (e.g, +1234567890)"
//               placeholderTextColor="#999"
//               keyboardType="phone-pad"
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
//             <View style={styles.pickerRow}>
//               <Text style={styles.label}>Role:</Text>
//               <Picker
//                 selectedValue={newMember.role}
//                 onValueChange={(value) =>
//                   setNewMember({ ...newMember, role: value })
//                 }
//                 style={styles.picker}
//                 enabled={!loading}
//               >
//                 <Picker.Item label="Security" value="security" />
//                 <Picker.Item label="Admin" value="admin" />
//               </Picker>
//             </View>
//             <View style={styles.switchRow}>
//               <Text style={styles.label}>Active Status</Text>
//               <Switch
//                 value={newMember.active}
//                 onValueChange={(value) =>
//                   setNewMember({ ...newMember, active: value })
//                 }
//                 trackColor={{ false: "#767577", true: "#4CAF50" }}
//                 thumbColor={newMember.active ? "#fff" : "#f4f3f4"}
//                 disabled={loading}
//               />
//             </View>
//             <TouchableOpacity
//               style={styles.actionButton}
//               onPress={
//                 isEditing ? handleUpdateSecurityMember : handleAddSecurityMember
//               }
//               disabled={loading}
//             >
//               <LinearGradient
//                 colors={["#388E3C", "#2E7D32"]}
//                 style={styles.buttonGradient}
//               >
//                 <Icon
//                   name={isEditing ? "save-outline" : "person-add-outline"}
//                   size={20}
//                   color="#fff"
//                 />
//                 <Text style={styles.buttonText}>
//                   {isEditing ? "Update Member" : "Add Member"}
//                 </Text>
//               </LinearGradient>
//             </TouchableOpacity>
//             {isEditing && (
//               <TouchableOpacity
//                 style={styles.cancelButton}
//                 onPress={resetForm}
//                 disabled={loading}
//               >
//                 <Text style={styles.cancelButtonText}>Cancel Update</Text>
//               </TouchableOpacity>
//             )}
//           </Animated.View>
//         );
//       case "deviceInfo":
//         return loading ? (
//           <View style={styles.card}>
//             <SkeletonLoader
//               width={width - 60}
//               height={30}
//               style={styles.skeletonMargin}
//             />
//             <SkeletonLoader
//               width={width - 60}
//               height={20}
//               style={styles.skeletonMargin}
//             />
//             <SkeletonLoader width={150} height={40} />
//           </View>
//         ) : (
//           <Animated.View entering={FadeIn} style={styles.card}>
//             <Text style={styles.sectionTitle}>Device Settings</Text>
//             <Text style={styles.label}>
//               {deviceData.deviceId || "No Device"} | Lat:{" "}
//               {Array.isArray(deviceData.location)
//                 ? (deviceData.location[0] || 0).toFixed(2)
//                 : (deviceData.location?.latitude ?? 0).toFixed(2)}
//               , Lon:{" "}
//               {Array.isArray(deviceData.location)
//                 ? (deviceData.location[1] || 0).toFixed(2)
//                 : (deviceData.location?.longitude ?? 0).toFixed(2)}
//             </Text>
//             <TouchableOpacity
//               style={styles.actionButton}
//               onPress={showUpdateLocationPrompt}
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
//             {updateLocationVisible && (
//               <Animated.View
//                 style={[
//                   styles.updateLocationPrompt,
//                   animatedUpdateLocationStyles,
//                 ]}
//               >
//                 <Text style={styles.modalTitle}>Update Device Location</Text>
//                 <Text style={styles.modalLabel}>Latitude:</Text>
//                 <TextInput
//                   style={styles.modalInput}
//                   value={newLatitude}
//                   onChangeText={setNewLatitude}
//                   placeholder="Enter latitude"
//                   placeholderTextColor="#999"
//                   keyboardType="numeric"
//                 />
//                 <Text style={styles.modalLabel}>Longitude:</Text>
//                 <TextInput
//                   style={styles.modalInput}
//                   value={newLongitude}
//                   onChangeText={setNewLongitude}
//                   placeholder="Enter longitude"
//                   placeholderTextColor="#999"
//                   keyboardType="numeric"
//                 />
//                 <View style={styles.modalButtonRow}>
//                   <TouchableOpacity
//                     style={styles.modalButton}
//                     onPress={hideUpdateLocationPrompt}
//                   >
//                     <LinearGradient
//                       colors={["#D32F2F", "#B71C1C"]}
//                       style={styles.buttonGradient}
//                     >
//                       <Text style={styles.buttonText}>Cancel</Text>
//                     </LinearGradient>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={styles.modalButton}
//                     onPress={handleUpdateDeviceLocation}
//                     disabled={loading}
//                   >
//                     <LinearGradient
//                       colors={["#4CAF50", "#388E3C"]}
//                       style={styles.buttonGradient}
//                     >
//                       <Text style={styles.buttonText}>Update</Text>
//                     </LinearGradient>
//                   </TouchableOpacity>
//                 </View>
//               </Animated.View>
//             )}
//           </Animated.View>
//         );
//       case "logout":
//         return loading ? (
//           <SkeletonLoader
//             width={width - 30}
//             height={50}
//             style={styles.logoutButton}
//           />
//         ) : (
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
//       <StatusBar backgroundColor="#000" barStyle="light-content" />
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
//     fontFamily: "Poppins-Regular", // Regular for loading text
//   },
//   header: {
//     padding: 20,
//     paddingTop: Platform.OS === "ios" ? 40 : 20,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 8,
//   },
//   headerGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 15,
//     borderRadius: 20,
//   },
//   backButton: {
//     marginRight: 10,
//     padding: 10,
//     backgroundColor: "rgba(255, 255, 255, 0.1)",
//     borderRadius: 40,
//   },
//   headerContent: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   headerText: {
//     color: "#fff",
//     fontSize: 28,
//     fontFamily: "Poppins-Bold", // Bold for header text
//     marginLeft: 10,
//   },
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
//     fontFamily: "Poppins-Bold", // Bold for section titles
//     marginBottom: 15,
//   },
//   subSectionTitle: {
//     color: "#fff",
//     fontSize: 18,
//     fontFamily: "Poppins-Bold", // Bold for subsection titles
//     marginTop: 15,
//     marginBottom: 10,
//   },
//   label: {
//     color: "#fff",
//     fontSize: 16,
//     marginBottom: 10,
//     fontFamily: "Poppins-Regular", // Regular for labels
//   },
//   subLabel: {
//     color: "#bbb",
//     fontSize: 14,
//     marginBottom: 5,
//     fontFamily: "Poppins-Regular", // Regular for sublabels
//   },
//   infoRow: {
//     marginBottom: 15,
//   },
//   input: {
//     borderColor: "#4CAF50",
//     borderWidth: 1,
//     borderRadius: 12,
//     color: "#fff",
//     padding: 12,
//     marginBottom: 15,
//     backgroundColor: "#2d2d2d",
//     fontSize: 16,
//     fontFamily: "Poppins-Regular", // Regular for input text
//   },
//   actionButton: {
//     borderRadius: 12,
//     overflow: "hidden",
//     marginTop: 10,
//   },
//   loadMoreButton: {
//     borderRadius: 12,
//     overflow: "hidden",
//     marginTop: 10,
//     marginBottom: 15,
//     alignSelf: "center",
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
//   pickerRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   picker: {
//     flex: 1,
//     color: "#fff",
//     backgroundColor: "#2d2d2d",
//     borderRadius: 12,
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
//   memberDetails: {
//     flex: 1,
//   },
//   memberActions: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   editButton: {
//     backgroundColor: "#4CAF50",
//     borderRadius: 10,
//     padding: 8,
//     marginRight: 10,
//   },
//   removeButton: {
//     backgroundColor: "#D32F2F",
//     borderRadius: 10,
//     padding: 8,
//   },
//   cancelButton: {
//     marginTop: 10,
//     alignItems: "center",
//   },
//   cancelButtonText: {
//     color: "#D32F2F",
//     fontSize: 16,
//     fontFamily: "Poppins-Regular", // Regular for cancel button text
//   },
//   logoutButton: {
//     borderRadius: 12,
//     marginVertical: 20,
//     marginHorizontal: 15,
//     overflow: "hidden",
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontFamily: "Poppins-Bold", // Bold for button text
//     marginLeft: 8,
//   },
//   emptyText: {
//     color: "#bbb",
//     fontSize: 16,
//     textAlign: "center",
//     marginVertical: 10,
//     fontFamily: "Poppins-Regular", // Regular for empty text
//   },
//   updateLocationPrompt: {
//     backgroundColor: "#1e1e1e",
//     borderRadius: 20,
//     padding: 20,
//     marginTop: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 8,
//   },
//   modalTitle: {
//     color: "#4CAF50",
//     fontSize: 22,
//     fontFamily: "Poppins-Bold", // Bold for modal title
//     marginBottom: 15,
//     textAlign: "center",
//   },
//   modalLabel: {
//     color: "#fff",
//     fontSize: 16,
//     marginBottom: 5,
//     fontFamily: "Poppins-Regular", // Regular for modal labels
//   },
//   modalInput: {
//     borderColor: "#4CAF50",
//     borderWidth: 1,
//     borderRadius: 12,
//     color: "#fff",
//     padding: 12,
//     marginBottom: 15,
//     backgroundColor: "#2d2d2d",
//     fontSize: 16,
//     fontFamily: "Poppins-Regular", // Regular for modal input text
//   },
//   modalButtonRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//   },
//   modalButton: {
//     flex: 1,
//     marginHorizontal: 5,
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   skeletonMargin: {
//     marginBottom: 15,
//   },
// });

// export default Settings;
// !THis Coe is Running Sms But the alert PAge is REaminedError

// import React, { useState, useEffect, useRef } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   Dimensions,
//   Switch,
//   Alert,
//   Platform,
//   StatusBar,
// } from "react-native";
// import { useRouter } from "expo-router";
// import Animated, {
//   FadeIn,
//   useSharedValue,
//   useAnimatedStyle,
//   withSpring,
//   withTiming,
//   Easing,
// } from "react-native-reanimated";
// import Icon from "react-native-vector-icons/Ionicons";
// import { LinearGradient } from "expo-linear-gradient";
// import { Picker } from "@react-native-picker/picker";
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
//   getDocs,
//   limit,
//   startAfter,
//   addDoc,
// } from "firebase/firestore";
// import {
//   signOut,
//   sendPasswordResetEmail,
//   updateEmail,
//   fetchSignInMethodsForEmail,
//   getAuth,
// } from "firebase/auth";
// import { GeoPoint } from "firebase/firestore";
// import { useAuth } from "../../context/authContext";

// const { width, height } = Dimensions.get("window");

// const SkeletonLoader = ({ width, height, style }) => {
//   const shimmer = useSharedValue(0);

//   const animatedStyle = useAnimatedStyle(() => ({
//     backgroundColor: `rgba(255, 255, 255, ${0.1 + shimmer.value * 0.1})`,
//   }));

//   useEffect(() => {
//     shimmer.value = withTiming(1, {
//       duration: 1000,
//       easing: Easing.inOut(Easing.ease),
//     });
//     const interval = setInterval(() => {
//       shimmer.value = withTiming(shimmer.value === 1 ? 0 : 1, {
//         duration: 1000,
//         easing: Easing.inOut(Easing.ease),
//       });
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [shimmer]);

//   return (
//     <Animated.View
//       style={[
//         {
//           width,
//           height,
//           backgroundColor: "#2d2d2d",
//           borderRadius: 8,
//         },
//         animatedStyle,
//         style,
//       ]}
//     />
//   );
// };

// const Setting = () => {
//   const { signup, currentUser } = useAuth();
//   const [userData, setUserData] = useState({
//     username: "",
//     email: "",
//     phoneNumber: "",
//     role: "",
//     active: false,
//   });
//   const [deviceData, setDeviceData] = useState({
//     deviceId: "",
//     location: null,
//   });
//   const [securityMembers, setSecurityMembers] = useState([]);
//   const [lastVisible, setLastVisible] = useState(null);
//   const [hasMore, setHasMore] = useState(true);
//   const [newMember, setNewMember] = useState({
//     username: "",
//     email: "",
//     phoneNumber: "",
//     role: "security",
//     active: true,
//     password: "",
//   });
//   const [errors, setErrors] = useState({});
//   const [selectedMemberId, setSelectedMemberId] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [updateLocationVisible, setUpdateLocationVisible] = useState(false);
//   const [newLatitude, setNewLatitude] = useState("");
//   const [newLongitude, setNewLongitude] = useState("");
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const router = useRouter();
//   const flatListRef = useRef(null);
//   const teamManagementRef = useRef(null);

//   const headerScale = useSharedValue(1);
//   const backButtonScale = useSharedValue(1);
//   const updateLocationScale = useSharedValue(0);

//   const animatedHeaderStyles = useAnimatedStyle(() => ({
//     transform: [{ scale: headerScale.value }],
//   }));

//   const animatedBackButtonStyles = useAnimatedStyle(() => ({
//     transform: [{ scale: backButtonScale.value }],
//   }));

//   const animatedUpdateLocationStyles = useAnimatedStyle(() => ({
//     transform: [{ scale: updateLocationScale.value }],
//   }));

//   const showModal = (message, title = "Message") => {
//     Alert.alert(title, message, [{ text: "OK" }]);
//   };

//   const showUpdateLocationPrompt = () => {
//     let latitude = 0;
//     let longitude = 0;

//     if (Array.isArray(deviceData.location)) {
//       latitude = deviceData.location[0] || 0;
//       longitude = deviceData.location[1] || 0;
//     } else if (deviceData.location && typeof deviceData.location === "object") {
//       latitude = deviceData.location.latitude || 0;
//       longitude = deviceData.location.longitude || 0;
//     }

//     setNewLatitude(latitude.toString());
//     setNewLongitude(longitude.toString());
//     setUpdateLocationVisible(true);
//     updateLocationScale.value = withSpring(1);
//   };

//   const hideUpdateLocationPrompt = () => {
//     updateLocationScale.value = withSpring(0);
//     setTimeout(() => {
//       setUpdateLocationVisible(false);
//     }, 300);
//   };

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (user) {
//         setCurrentUserId(user.uid);
//         fetchUserData(user.uid);
//       } else {
//         setCurrentUserId(null);
//         router.replace("/(auth)/SignIn");
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   const fetchUserData = async (uid) => {
//     try {
//       const userRef = doc(db, "users", uid);
//       const userSnap = await getDoc(userRef);
//       if (userSnap.exists()) {
//         const data = userSnap.data();
//         setUserData({
//           username: data.username || "",
//           email: data.email || "",
//           phoneNumber: data.phoneNumber || "",
//           role: data.role || "",
//           active: data.active || false,
//         });
//       } else {
//         showModal("User data not found.");
//       }
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//       showModal("Failed to load user data: " + error.message);
//     }
//   };

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
//             location: deviceData.location || null,
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

//   const fetchSecurityMembers = async (isInitialFetch = true) => {
//     try {
//       let securityQuery = query(
//         collection(db, "users"),
//         where("role", "in", ["security", "admin"]),
//         limit(5)
//       );

//       if (!isInitialFetch && lastVisible) {
//         securityQuery = query(
//           collection(db, "users"),
//           where("role", "in", ["security", "admin"]),
//           startAfter(lastVisible),
//           limit(5)
//         );
//       }

//       const querySnapshot = await getDocs(securityQuery);
//       const members = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       if (isInitialFetch) {
//         setSecurityMembers(members);
//       } else {
//         setSecurityMembers((prev) => [...prev, ...members]);
//       }

//       if (querySnapshot.docs.length > 0) {
//         setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
//         setHasMore(querySnapshot.docs.length === 5);
//       } else {
//         setHasMore(false);
//       }
//     } catch (error) {
//       console.error("Error fetching security members:", error);
//       showModal("Failed to load security members: " + error.message);
//     }
//   };

//   useEffect(() => {
//     fetchSecurityMembers(true);
//   }, []);

//   useEffect(() => {
//     setTimeout(() => setLoading(false), 2000);
//   }, []);

//   const toggleUserActive = async (value) => {
//     setUserData((prev) => ({ ...prev, active: value }));
//     if (!currentUserId) {
//       showModal("User not authenticated.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const userRef = doc(db, "users", currentUserId);
//       await updateDoc(userRef, { active: value });
//       showModal(`User status ${value ? "Activated" : "Deactivated"}!`);
//     } catch (error) {
//       console.error("Error toggling user active status:", error);
//       showModal("Failed to toggle user status: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkEmailExists = async (email, excludeMemberId = null) => {
//     const usersQuery = query(
//       collection(db, "users"),
//       where("email", "==", email)
//     );
//     const querySnapshot = await getDocs(usersQuery);
//     if (excludeMemberId) {
//       return querySnapshot.docs.some((doc) => doc.id !== excludeMemberId);
//     }
//     return !querySnapshot.empty;
//   };

//   const validateEmail = (email) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email.trim());
//   };

//   const validateNewMember = () => {
//     let newErrors = {};
//     if (!newMember.username.trim()) newErrors.username = "Username is required";
//     if (!validateEmail(newMember.email))
//       newErrors.email = "Enter a valid email (e.g., user@example.com)";
//     if (!newMember.phoneNumber.match(/^\+?\d{10,15}$/))
//       newErrors.phoneNumber = "Enter a valid phone number (e.g., +1234567890)";
//     if (!newMember.role) newErrors.role = "Role is required";
//     if (!isEditing && newMember.password.length < 6)
//       newErrors.password = "Password must be at least 6 characters";
//     if (isEditing && newMember.password && newMember.password.length < 6)
//       newErrors.password = "New password must be at least 6 characters";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const sendResetEmailWithRetry = async (email, retries = 3) => {
//     for (let i = 0; i < retries; i++) {
//       try {
//         await sendPasswordResetEmail(auth, email);
//         await addDoc(collection(db, "emailLogs"), {
//           email,
//           status: "success",
//           timestamp: new Date(),
//         });
//         return true;
//       } catch (error) {
//         await addDoc(collection(db, "emailLogs"), {
//           email,
//           status: "failure",
//           error: error.message,
//           timestamp: new Date(),
//         });
//         if (i === retries - 1) throw error;
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//       }
//     }
//   };

//   const handleAddSecurityMember = async () => {
//     if (!validateNewMember()) return;
//     setLoading(true);
//     try {
//       const emailExists = await checkEmailExists(newMember.email);
//       if (emailExists) {
//         setErrors({ form: "This email is already in use." });
//         return;
//       }

//       await signup(
//         newMember.email,
//         newMember.password,
//         newMember.role,
//         newMember.phoneNumber,
//         newMember.username
//       );

//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       if (validateEmail(newMember.email)) {
//         try {
//           await sendResetEmailWithRetry(newMember.email);
//           await addDoc(collection(db, "emailLogs"), {
//             email: newMember.email,
//             status: "sent",
//             timestamp: new Date(),
//           });
//           showModal(
//             `Member added successfully! A password reset email has been sent to ${newMember.email}. Please check the inbox (and spam/junk folder).`,
//             "Success"
//           );
//         } catch (error) {
//           console.error(
//             "Error sending password reset email to new member:",
//             error
//           );
//           let errorMessage = "Failed to send password reset email.";
//           if (error.code === "auth/user-not-found") {
//             errorMessage = "User not found. Please verify the email address.";
//           } else if (error.code === "auth/invalid-email") {
//             errorMessage = "Invalid email format. Please use a valid email.";
//           } else {
//             errorMessage += `: ${error.message}`;
//           }
//           setErrors({ form: errorMessage });
//           showModal(
//             "Member added, but failed to send password reset email. The user can request a reset manually via the sign-in screen.",
//             "Partial Success"
//           );
//         }
//       } else {
//         throw new Error("Invalid email detected before sending reset email.");
//       }

//       resetForm();
//       fetchSecurityMembers(true);
//       router.push("/(tabs)/Setting");
//     } catch (error) {
//       console.error("Error adding security member:", error);
//       let errorMessage = "Failed to add security member.";
//       if (error.code === "auth/email-already-in-use") {
//         errorMessage = "This email is already in use.";
//       } else if (error.code === "auth/weak-password") {
//         errorMessage = "Password is too weak.";
//       } else {
//         errorMessage += `: ${error.message}`;
//       }
//       setErrors({ form: errorMessage });
//       showModal(errorMessage, "Error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdateSecurityMember = async () => {
//     if (!validateNewMember()) return;
//     setLoading(true);
//     try {
//       const emailExists = await checkEmailExists(
//         newMember.email,
//         selectedMemberId
//       );
//       if (emailExists) {
//         setErrors({ form: "This email is already in use by another user." });
//         return;
//       }

//       const memberRef = doc(db, "users", selectedMemberId);
//       const memberDoc = await getDoc(memberRef);
//       if (!memberDoc.exists()) {
//         throw new Error("Member not found in Firestore.");
//       }
//       const originalData = memberDoc.data();
//       const originalEmail = originalData.email;

//       // Sync email with Authentication if it has changed
//       if (newMember.email !== originalEmail && currentUser) {
//         const authUser = auth.currentUser;
//         if (authUser && authUser.uid === selectedMemberId) {
//           try {
//             await updateEmail(authUser, newMember.email);
//           } catch (error) {
//             console.error("Error updating email in Authentication:", error);
//             showModal(
//               "Failed to update email in Authentication. Please re-authenticate or contact support."
//             );
//           }
//         }
//       }

//       const updates = {
//         username: newMember.username,
//         email: newMember.email,
//         phoneNumber: newMember.phoneNumber,
//         role: newMember.role,
//         active: newMember.active,
//       };
//       await updateDoc(memberRef, updates);

//       if (newMember.password && newMember.password.length >= 6) {
//         if (validateEmail(newMember.email)) {
//           // Try sending reset email with original email as fallback
//           let emailToUse = newMember.email;
//           const signInMethods = await fetchSignInMethodsForEmail(
//             auth,
//             emailToUse
//           );
//           if (signInMethods.length === 0 && originalEmail) {
//             // Fallback to original email if new email isn't found
//             const originalSignInMethods = await fetchSignInMethodsForEmail(
//               auth,
//               originalEmail
//             );
//             if (originalSignInMethods.length > 0) {
//               emailToUse = originalEmail;
//               showModal(
//                 `Using original email (${originalEmail}) for reset as new email (${newMember.email}) is not registered.`
//               );
//             } else {
//               // Attempt to re-add user if neither email works
//               await signup(
//                 newMember.email,
//                 newMember.password,
//                 newMember.role,
//                 newMember.phoneNumber,
//                 newMember.username
//               );
//               showModal(
//                 `User re-added with ${newMember.email}. A reset email has been sent.`
//               );
//             }
//           }

//           try {
//             await sendResetEmailWithRetry(emailToUse);
//             await addDoc(collection(db, "emailLogs"), {
//               email: emailToUse,
//               status: "sent",
//               timestamp: new Date(),
//             });
//             showModal(
//               `Member updated successfully! A password reset email has been sent to ${emailToUse}. Please check the inbox (and spam/junk folder).`,
//               "Success"
//             );
//           } catch (error) {
//             console.error("Error sending password reset email:", error);
//             let errorMessage = "Failed to send password reset email.";
//             if (error.code === "auth/user-not-found") {
//               errorMessage =
//                 "User not found. The email may not be registered in Authentication.";
//             } else if (error.code === "auth/invalid-email") {
//               errorMessage = "Invalid email format. Please use a valid email.";
//             } else {
//               errorMessage += `: ${error.message}`;
//             }
//             setErrors({ form: errorMessage });
//             showModal(
//               "Member updated, but failed to send password reset email. The user can request a reset manually via the sign-in screen.",
//               "Partial Success"
//             );
//           }
//         } else {
//           throw new Error("Invalid email detected before sending reset email.");
//         }
//       } else {
//         showModal("Member updated successfully!", "Success");
//       }

//       resetForm();
//       fetchSecurityMembers(true);
//       router.push("/(tabs)/Setting");
//     } catch (error) {
//       console.error("Error updating security member:", error);
//       setErrors({ form: "Failed to update security member: " + error.message });
//       showModal("Failed to update security member: " + error.message, "Error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setNewMember({
//       username: "",
//       email: "",
//       phoneNumber: "",
//       role: "security",
//       active: true,
//       password: "",
//     });
//     setSelectedMemberId(null);
//     setIsEditing(false);
//     setErrors({});
//   };

//   const handleEditSecurityMember = (member) => {
//     setNewMember({
//       username: member.username,
//       email: member.email,
//       phoneNumber: member.phoneNumber,
//       role: member.role,
//       active: member.active,
//       password: "",
//     });
//     setSelectedMemberId(member.id);
//     setIsEditing(true);
//     setTimeout(() => {
//       teamManagementRef.current?.measure(
//         (x, y, width, height, pageX, pageY) => {
//           flatListRef.current?.scrollToOffset({
//             offset: pageY + height - Dimensions.get("window").height + 100,
//             animated: true,
//           });
//         }
//       );
//     }, 100);
//   };

//   const handleRemoveSecurityMember = async (memberId) => {
//     setLoading(true);
//     try {
//       const memberRef = doc(db, "users", memberId);
//       await deleteDoc(memberRef);
//       if (selectedMemberId === memberId) {
//         resetForm();
//       }
//       fetchSecurityMembers(true);
//       showModal("Security member removed successfully!");
//     } catch (error) {
//       console.error("Error removing security member:", error);
//       showModal("Failed to remove security member: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleMemberActive = async (memberId, value) => {
//     setSecurityMembers((prevMembers) =>
//       prevMembers.map((member) =>
//         member.id === memberId ? { ...member, active: value } : member
//       )
//     );
//     setLoading(true);
//     try {
//       const memberRef = doc(db, "users", memberId);
//       await updateDoc(memberRef, { active: value });
//       showModal(
//         `Security member status ${value ? "Activated" : "Deactivated"}!`
//       );
//     } catch (error) {
//       console.error("Error toggling security member active status:", error);
//       showModal("Failed to toggle security member status: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdateLocation = async () => {
//     setLoading(true);
//     try {
//       const latitude = parseFloat(newLatitude);
//       const longitude = parseFloat(newLongitude);
//       if (isNaN(latitude) || isNaN(longitude)) {
//         showModal("Please enter valid latitude and longitude values.");
//         return;
//       }

//       const deviceRef = doc(db, "devices", deviceData.deviceId);
//       await updateDoc(deviceRef, {
//         location: new GeoPoint(latitude, longitude),
//       });

//       hideUpdateLocationPrompt();
//       showModal("Device location updated successfully!");
//     } catch (error) {
//       console.error("Error updating device location:", error);
//       showModal("Failed to update device location: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSignOut = async () => {
//     try {
//       await signOut(auth);
//       router.replace("/(auth)/SignIn");
//     } catch (error) {
//       console.error("Error signing out:", error);
//       showModal("Failed to sign out: " + error.message);
//     }
//   };

//   const renderSecurityMember = ({ item }) => (
//     <Animated.View entering={FadeIn} style={styles.memberCard}>
//       <View style={styles.memberInfo}>
//         <Text style={styles.memberName}>{item.username}</Text>
//         <Text style={styles.memberDetail}>{item.email}</Text>
//         <Text style={styles.memberDetail}>{item.phoneNumber}</Text>
//         <Text style={styles.memberDetail}>Role: {item.role}</Text>
//       </View>
//       <View style={styles.memberActions}>
//         <Switch
//           value={item.active}
//           onValueChange={(value) => toggleMemberActive(item.id, value)}
//           trackColor={{ false: "#767577", true: "#00cc00" }}
//           thumbColor={item.active ? "#00cc00" : "#f4f3f4"}
//         />
//         <TouchableOpacity
//           style={styles.actionButton}
//           onPress={() => handleEditSecurityMember(item)}
//         >
//           <Icon name="pencil" size={20} color="#fff" />
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.actionButton, { backgroundColor: "#ff4444" }]}
//           onPress={() => handleRemoveSecurityMember(item.id)}
//         >
//           <Icon name="trash" size={20} color="#fff" />
//         </TouchableOpacity>
//       </View>
//     </Animated.View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" />
//       <LinearGradient colors={["#1a1a2e", "#2d2d2d"]} style={styles.gradient}>
//         <Animated.View style={[styles.header, animatedHeaderStyles]}>
//           <TouchableOpacity
//             onPress={() => router.back()}
//             style={styles.backButton}
//           >
//             <Animated.View style={animatedBackButtonStyles}>
//               <Icon name="arrow-back" size={24} color="#fff" />
//             </Animated.View>
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Settings</Text>
//         </Animated.View>

//         <FlatList
//           ref={flatListRef}
//           data={[{ key: "settings" }, ...securityMembers]}
//           renderItem={({ item, index }) => {
//             if (index === 0) {
//               return (
//                 <View style={styles.settingsContainer}>
//                   {loading ? (
//                     <>
//                       <SkeletonLoader
//                         width={width - 40}
//                         height={100}
//                         style={styles.skeleton}
//                       />
//                       <SkeletonLoader
//                         width={width - 40}
//                         height={100}
//                         style={styles.skeleton}
//                       />
//                     </>
//                   ) : (
//                     <>
//                       <View style={styles.section}>
//                         <Text style={styles.sectionTitle}>User Settings</Text>
//                         <View style={styles.card}>
//                           <Text style={styles.cardTitle}>
//                             {userData.username || "Loading..."}
//                           </Text>
//                           <Text style={styles.cardDetail}>
//                             Email: {userData.email}
//                           </Text>
//                           <Text style={styles.cardDetail}>
//                             Phone: {userData.phoneNumber}
//                           </Text>
//                           <Text style={styles.cardDetail}>
//                             Role: {userData.role}
//                           </Text>
//                           <View style={styles.switchContainer}>
//                             <Text style={styles.cardDetail}>Active:</Text>
//                             <Switch
//                               value={userData.active}
//                               onValueChange={toggleUserActive}
//                               trackColor={{ false: "#767577", true: "#00cc00" }}
//                               thumbColor={
//                                 userData.active ? "#00cc00" : "#f4f3f4"
//                               }
//                             />
//                           </View>
//                         </View>
//                       </View>

//                       <View style={styles.section}>
//                         <Text style={styles.sectionTitle}>Device Settings</Text>
//                         <View style={styles.card}>
//                           <Text style={styles.cardTitle}>
//                             Device ID: {deviceData.deviceId || "N/A"}
//                           </Text>
//                           <Text style={styles.cardDetail}>
//                             Location:{" "}
//                             {deviceData.location instanceof GeoPoint
//                               ? `Lat: ${deviceData.location.latitude}, Lon: ${deviceData.location.longitude}`
//                               : Array.isArray(deviceData.location)
//                               ? `Lat: ${deviceData.location[0]}, Lon: ${deviceData.location[1]}`
//                               : "N/A"}
//                           </Text>
//                           <TouchableOpacity
//                             style={styles.button}
//                             onPress={showUpdateLocationPrompt}
//                           >
//                             <Text style={styles.buttonText}>
//                               Update Location
//                             </Text>
//                           </TouchableOpacity>
//                         </View>
//                       </View>
//                     </>
//                   )}
//                 </View>
//               );
//             }
//             return renderSecurityMember({ item });
//           }}
//           keyExtractor={(item, index) => index.toString()}
//           ListHeaderComponent={
//             <View style={styles.teamManagement} ref={teamManagementRef}>
//               <Text style={styles.sectionTitle}>Team Management</Text>
//               <View style={styles.form}>
//                 <TextInput
//                   style={[styles.input, errors.username && styles.inputError]}
//                   placeholder="Username"
//                   placeholderTextColor="#ccc"
//                   value={newMember.username}
//                   onChangeText={(text) =>
//                     setNewMember({ ...newMember, username: text })
//                   }
//                 />
//                 {errors.username && (
//                   <Text style={styles.errorText}>{errors.username}</Text>
//                 )}

//                 <TextInput
//                   style={[styles.input, errors.email && styles.inputError]}
//                   placeholder="Email"
//                   placeholderTextColor="#ccc"
//                   value={newMember.email}
//                   onChangeText={(text) =>
//                     setNewMember({ ...newMember, email: text })
//                   }
//                   keyboardType="email-address"
//                 />
//                 {errors.email && (
//                   <Text style={styles.errorText}>{errors.email}</Text>
//                 )}

//                 <TextInput
//                   style={[
//                     styles.input,
//                     errors.phoneNumber && styles.inputError,
//                   ]}
//                   placeholder="Phone Number"
//                   placeholderTextColor="#ccc"
//                   value={newMember.phoneNumber}
//                   onChangeText={(text) =>
//                     setNewMember({ ...newMember, phoneNumber: text })
//                   }
//                   keyboardType="phone-pad"
//                 />
//                 {errors.phoneNumber && (
//                   <Text style={styles.errorText}>{errors.phoneNumber}</Text>
//                 )}

//                 <Picker
//                   selectedValue={newMember.role}
//                   onValueChange={(value) =>
//                     setNewMember({ ...newMember, role: value })
//                   }
//                   style={[styles.picker, errors.role && styles.inputError]}
//                 >
//                   <Picker.Item label="Select Role" value="" />
//                   <Picker.Item label="Security" value="security" />
//                   <Picker.Item label="Admin" value="admin" />
//                 </Picker>
//                 {errors.role && (
//                   <Text style={styles.errorText}>{errors.role}</Text>
//                 )}

//                 <TextInput
//                   style={[styles.input, errors.password && styles.inputError]}
//                   placeholder={
//                     isEditing ? "New Password (sends reset email)" : "Password"
//                   }
//                   placeholderTextColor="#ccc"
//                   value={newMember.password}
//                   onChangeText={(text) =>
//                     setNewMember({ ...newMember, password: text })
//                   }
//                   secureTextEntry
//                 />
//                 {errors.password && (
//                   <Text style={styles.errorText}>{errors.password}</Text>
//                 )}

//                 <View style={styles.switchContainer}>
//                   <Text style={styles.cardDetail}>Active:</Text>
//                   <Switch
//                     value={newMember.active}
//                     onValueChange={(value) =>
//                       setNewMember({ ...newMember, active: value })
//                     }
//                     trackColor={{ false: "#767577", true: "#00cc00" }}
//                     thumbColor={newMember.active ? "#00cc00" : "#f4f3f4"}
//                   />
//                 </View>

//                 {errors.form && (
//                   <Text style={styles.errorText}>{errors.form}</Text>
//                 )}

//                 <TouchableOpacity
//                   style={styles.button}
//                   onPress={
//                     isEditing
//                       ? handleUpdateSecurityMember
//                       : handleAddSecurityMember
//                   }
//                   disabled={loading}
//                 >
//                   <Text style={styles.buttonText}>
//                     {isEditing ? "Update Member" : "Add Member"}
//                   </Text>
//                 </TouchableOpacity>

//                 {isEditing && (
//                   <TouchableOpacity
//                     style={[styles.button, { backgroundColor: "#ff4444" }]}
//                     onPress={resetForm}
//                   >
//                     <Text style={styles.buttonText}>Cancel</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             </View>
//           }
//           onEndReached={() => {
//             if (hasMore && !loading) {
//               fetchSecurityMembers(false);
//             }
//           }}
//           onEndReachedThreshold={0.5}
//           ListFooterComponent={
//             loading && securityMembers.length > 0 ? (
//               <SkeletonLoader
//                 width={width - 40}
//                 height={100}
//                 style={styles.skeleton}
//               />
//             ) : null
//           }
//         />

//         {updateLocationVisible && (
//           <Animated.View style={[styles.modal, animatedUpdateLocationStyles]}>
//             <View style={styles.modalContent}>
//               <Text style={styles.modalTitle}>Update Device Location</Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Latitude"
//                 placeholderTextColor="#ccc"
//                 value={newLatitude}
//                 onChangeText={setNewLatitude}
//                 keyboardType="numeric"
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Longitude"
//                 placeholderTextColor="#ccc"
//                 value={newLongitude}
//                 onChangeText={setNewLongitude}
//                 keyboardType="numeric"
//               />
//               <View style={styles.modalButtons}>
//                 <TouchableOpacity
//                   style={styles.button}
//                   onPress={handleUpdateLocation}
//                 >
//                   <Text style={styles.buttonText}>Save</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.button, { backgroundColor: "#ff4444" }]}
//                   onPress={hideUpdateLocationPrompt}
//                 >
//                   <Text style={styles.buttonText}>Cancel</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </Animated.View>
//         )}

//         <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
//           <Text style={styles.signOutText}>Sign Out</Text>
//         </TouchableOpacity>
//       </LinearGradient>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#1a1a2e",
//   },
//   gradient: {
//     flex: 1,
//     paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: "#2d2d2d",
//   },
//   backButton: {
//     marginRight: 10,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#fff",
//   },
//   settingsContainer: {
//     paddingHorizontal: 20,
//   },
//   section: {
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#fff",
//     marginBottom: 10,
//   },
//   card: {
//     backgroundColor: "#2d2d2d",
//     borderRadius: 8,
//     padding: 15,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#fff",
//     marginBottom: 5,
//   },
//   cardDetail: {
//     fontSize: 14,
//     color: "#ccc",
//     marginBottom: 5,
//   },
//   switchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   button: {
//     backgroundColor: "#00cc00",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   teamManagement: {
//     paddingHorizontal: 20,
//     marginBottom: 20,
//   },
//   form: {
//     backgroundColor: "#2d2d2d",
//     borderRadius: 8,
//     padding: 15,
//   },
//   input: {
//     backgroundColor: "#3a3a3a",
//     color: "#fff",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//     fontSize: 16,
//   },
//   inputError: {
//     borderColor: "#ff4444",
//     borderWidth: 1,
//   },
//   picker: {
//     backgroundColor: "#3a3a3a",
//     color: "#fff",
//     marginBottom: 10,
//   },
//   errorText: {
//     color: "#ff4444",
//     fontSize: 12,
//     marginBottom: 10,
//   },
//   memberCard: {
//     flexDirection: "row",
//     backgroundColor: "#2d2d2d",
//     borderRadius: 8,
//     padding: 15,
//     marginHorizontal: 20,
//     marginBottom: 10,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
//   memberInfo: {
//     flex: 1,
//   },
//   memberName: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#fff",
//     marginBottom: 5,
//   },
//   memberDetail: {
//     fontSize: 14,
//     color: "#ccc",
//     marginBottom: 3,
//   },
//   memberActions: {
//     justifyContent: "center",
//     alignItems: "flex-end",
//   },
//   actionButton: {
//     backgroundColor: "#00cc00",
//     padding: 8,
//     borderRadius: 8,
//     marginBottom: 8,
//     width: 40,
//     alignItems: "center",
//   },
//   modal: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     backgroundColor: "#2d2d2d",
//     borderRadius: 8,
//     padding: 20,
//     width: width - 40,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#fff",
//     marginBottom: 15,
//   },
//   modalButtons: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   signOutButton: {
//     backgroundColor: "#ff4444",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     margin: 20,
//   },
//   signOutText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   skeleton: {
//     marginBottom: 10,
//   },
// });

// export default Setting;

// all THings Working Except SIng IN

// import React, { useState, useEffect, useRef } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   Switch,
//   Alert,
//   ActivityIndicator,
//   Platform,
//   StatusBar,
//   Dimensions,
// } from "react-native";
// import { useRouter } from "expo-router";
// import Animated, { FadeIn } from "react-native-reanimated";
// import Icon from "react-native-vector-icons/Ionicons";
// import { LinearGradient } from "expo-linear-gradient";
// import { Picker } from "@react-native-picker/picker";
// import { auth, db } from "../../services/firebase";
// import {
//   doc,
//   getDoc,
//   updateDoc,
//   collection,
//   query,
//   where,
//   getDocs,
//   addDoc,
//   deleteDoc,
// } from "firebase/firestore";
// import {
//   sendPasswordResetEmail,
//   createUserWithEmailAndPassword,
// } from "firebase/auth";
// import { GeoPoint } from "firebase/firestore";
// import { useAuth } from "../../context/authContext";

// const { width } = Dimensions.get("window");

// const Setting = () => {
//   const { user, role, signup } = useAuth();
//   const router = useRouter();
//   const [userData, setUserData] = useState({
//     username: "",
//     email: "",
//     phoneNumber: "",
//     role: "",
//     active: false,
//   });
//   const [deviceData, setDeviceData] = useState({
//     deviceId: "",
//     location: null,
//   });
//   const [securityMembers, setSecurityMembers] = useState([]);
//   const [newMember, setNewMember] = useState({
//     username: "",
//     email: "",
//     phoneNumber: "",
//     role: "security",
//     active: true,
//     password: "",
//   });
//   const [errors, setErrors] = useState({});
//   const [selectedMemberId, setSelectedMemberId] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [updateLocationVisible, setUpdateLocationVisible] = useState(false);
//   const [newLatitude, setNewLatitude] = useState("");
//   const [newLongitude, setNewLongitude] = useState("");
//   const flatListRef = useRef(null);

//   // Fetch initial data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch user data
//         if (user?.uid) {
//           const userRef = doc(db, "users", user.uid);
//           const userSnap = await getDoc(userRef);
//           if (userSnap.exists()) {
//             setUserData(userSnap.data());
//           }
//         }

//         // Fetch device data
//         const devicesQuery = query(collection(db, "devices"));
//         const devicesSnapshot = await getDocs(devicesQuery);
//         if (!devicesSnapshot.empty) {
//           const deviceDoc = devicesSnapshot.docs[0];
//           setDeviceData({
//             deviceId: deviceDoc.id,
//             location: deviceDoc.data().location || null,
//           });
//         }

//         // Fetch security members
//         fetchSecurityMembers();
//       } catch (error) {
//         Alert.alert("Error", "Failed to load data: " + error.message);
//       }
//     };

//     fetchData();
//   }, [user]);

//   const fetchSecurityMembers = async () => {
//     try {
//       const securityQuery = query(
//         collection(db, "users"),
//         where("role", "in", ["security", "admin"])
//       );
//       const querySnapshot = await getDocs(securityQuery);
//       setSecurityMembers(
//         querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
//       );
//     } catch (error) {
//       Alert.alert("Error", "Failed to load security members: " + error.message);
//     }
//   };

//   const validateMember = () => {
//     const newErrors = {};
//     if (!newMember.username.trim()) newErrors.username = "Username is required";
//     if (!/^\S+@\S+\.\S+$/.test(newMember.email))
//       newErrors.email = "Enter a valid email";
//     if (!/^\+?\d{10,15}$/.test(newMember.phoneNumber))
//       newErrors.phoneNumber = "Enter a valid phone number";
//     if (!newMember.role) newErrors.role = "Role is required";
//     if (!isEditing && newMember.password.length < 6)
//       newErrors.password = "Password must be at least 6 characters";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleAddMember = async () => {
//     if (!validateMember()) return;
//     setLoading(true);

//     try {
//       // Check if email exists
//       const emailQuery = query(
//         collection(db, "users"),
//         where("email", "==", newMember.email)
//       );
//       const emailSnapshot = await getDocs(emailQuery);
//       if (!emailSnapshot.empty) {
//         throw new Error("Email already in use");
//       }

//       // Create auth user
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         newMember.email,
//         newMember.password
//       );

//       // Add user to Firestore
//       await addDoc(collection(db, "users"), {
//         username: newMember.username,
//         email: newMember.email,
//         phoneNumber: newMember.phoneNumber,
//         role: newMember.role,
//         active: newMember.active,
//         uid: userCredential.user.uid,
//       });

//       // Send password reset email
//       await sendPasswordResetEmail(auth, newMember.email);

//       // Reset form and refresh list
//       resetForm();
//       fetchSecurityMembers();
//       Alert.alert(
//         "Success",
//         "Member added successfully. Password reset email sent."
//       );
//     } catch (error) {
//       Alert.alert("Error", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdateMember = async () => {
//     if (!validateMember() || !selectedMemberId) return;
//     setLoading(true);

//     try {
//       const memberRef = doc(db, "users", selectedMemberId);
//       await updateDoc(memberRef, {
//         username: newMember.username,
//         email: newMember.email,
//         phoneNumber: newMember.phoneNumber,
//         role: newMember.role,
//         active: newMember.active,
//       });

//       if (newMember.password) {
//         await sendPasswordResetEmail(auth, newMember.email);
//       }

//       resetForm();
//       fetchSecurityMembers();
//       Alert.alert("Success", "Member updated successfully");
//     } catch (error) {
//       Alert.alert("Error", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEditMember = (member) => {
//     setNewMember({
//       username: member.username,
//       email: member.email,
//       phoneNumber: member.phoneNumber,
//       role: member.role,
//       active: member.active,
//       password: "",
//     });
//     setSelectedMemberId(member.id);
//     setIsEditing(true);
//   };

//   const handleRemoveMember = async (memberId) => {
//     setLoading(true);
//     try {
//       await deleteDoc(doc(db, "users", memberId));
//       if (selectedMemberId === memberId) {
//         resetForm();
//       }
//       fetchSecurityMembers();
//       Alert.alert("Success", "Member removed successfully");
//     } catch (error) {
//       Alert.alert("Error", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleMemberActive = async (memberId, value) => {
//     setLoading(true);
//     try {
//       await updateDoc(doc(db, "users", memberId), { active: value });
//       fetchSecurityMembers();
//     } catch (error) {
//       Alert.alert("Error", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleUserActive = async (value) => {
//     setLoading(true);
//     try {
//       await updateDoc(doc(db, "users", user.uid), { active: value });
//       setUserData({ ...userData, active: value });
//       Alert.alert("Success", `User ${value ? "activated" : "deactivated"}`);
//     } catch (error) {
//       Alert.alert("Error", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdateLocation = async () => {
//     if (!newLatitude || !newLongitude) {
//       Alert.alert("Error", "Please enter both latitude and longitude");
//       return;
//     }
//     setLoading(true);
//     try {
//       await updateDoc(doc(db, "devices", deviceData.deviceId), {
//         location: new GeoPoint(
//           parseFloat(newLatitude),
//           parseFloat(newLongitude)
//         ),
//       });
//       setDeviceData({
//         ...deviceData,
//         location: [parseFloat(newLatitude), parseFloat(newLongitude)],
//       });
//       setUpdateLocationVisible(false);
//       Alert.alert("Success", "Device location updated");
//     } catch (error) {
//       Alert.alert("Error", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setNewMember({
//       username: "",
//       email: "",
//       phoneNumber: "",
//       role: "security",
//       active: true,
//       password: "",
//     });
//     setSelectedMemberId(null);
//     setIsEditing(false);
//     setErrors({});
//   };

//   const renderMember = ({ item }) => (
//     <Animated.View entering={FadeIn} style={styles.memberCard}>
//       <View style={styles.memberInfo}>
//         <Text style={styles.memberName}>{item.username}</Text>
//         <Text style={styles.memberDetail}>{item.email}</Text>
//         <Text style={styles.memberDetail}>{item.phoneNumber}</Text>
//         <Text style={styles.memberDetail}>Role: {item.role}</Text>
//       </View>
//       <View style={styles.memberActions}>
//         <Switch
//           value={item.active}
//           onValueChange={(value) => toggleMemberActive(item.id, value)}
//           trackColor={{ false: "#767577", true: "#000000" }}
//           thumbColor={item.active ? "#fff" : "#f4f3f4"}
//         />
//         <TouchableOpacity
//           style={styles.actionButton}
//           onPress={() => handleEditMember(item)}
//         >
//           <Icon name="pencil" size={20} color="#fff" />
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.actionButton, { backgroundColor: "#ff4444" }]}
//           onPress={() => handleRemoveMember(item.id)}
//         >
//           <Icon name="trash" size={20} color="#fff" />
//         </TouchableOpacity>
//       </View>
//     </Animated.View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" />
//       <LinearGradient colors={["#1a1a2e", "#2d2d2d"]} style={styles.gradient}>
//         <View style={styles.header}>
//           <TouchableOpacity
//             onPress={() => router.back()}
//             style={styles.backButton}
//           >
//             <Icon name="arrow-back" size={28} color="#fff" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Settings</Text>
//         </View>

//         <FlatList
//           ref={flatListRef}
//           data={securityMembers}
//           renderItem={renderMember}
//           keyExtractor={(item) => item.id}
//           ListHeaderComponent={
//             <View style={styles.formContainer}>
//               <Text style={styles.sectionTitle}>User Settings</Text>
//               <View style={styles.card}>
//                 <Text style={styles.cardTitle}>{userData.username}</Text>
//                 <Text style={styles.cardDetail}>Email: {userData.email}</Text>
//                 <Text style={styles.cardDetail}>
//                   Phone: {userData.phoneNumber}
//                 </Text>
//                 <Text style={styles.cardDetail}>Role: {userData.role}</Text>
//                 <View style={styles.switchContainer}>
//                   <Text style={styles.cardDetail}>Active:</Text>
//                   <Switch
//                     value={userData.active}
//                     onValueChange={toggleUserActive}
//                     trackColor={{ false: "#767577", true: "#000000" }}
//                     thumbColor={userData.active ? "#fff" : "#f4f3f4"}
//                   />
//                 </View>
//               </View>

//               <Text style={styles.sectionTitle}>Device Settings</Text>
//               <View style={styles.card}>
//                 <Text style={styles.cardTitle}>
//                   Device ID: {deviceData.deviceId}
//                 </Text>
//                 <Text style={styles.cardDetail}>
//                   Location:{" "}
//                   {Array.isArray(deviceData.location)
//                     ? `Lat: ${deviceData.location[0]}, Lon: ${deviceData.location[1]}`
//                     : "N/A"}
//                 </Text>
//                 <TouchableOpacity
//                   style={styles.button}
//                   onPress={() => setUpdateLocationVisible(true)}
//                 >
//                   <Text style={styles.buttonText}>Update Location</Text>
//                 </TouchableOpacity>
//               </View>

//               <Text style={styles.sectionTitle}>Team Management</Text>
//               <View style={styles.form}>
//                 <TextInput
//                   style={[styles.input, errors.username && styles.inputError]}
//                   placeholder="Username"
//                   placeholderTextColor="#ccc"
//                   value={newMember.username}
//                   onChangeText={(text) =>
//                     setNewMember({ ...newMember, username: text })
//                   }
//                 />
//                 {errors.username && (
//                   <Text style={styles.errorText}>{errors.username}</Text>
//                 )}

//                 <TextInput
//                   style={[styles.input, errors.email && styles.inputError]}
//                   placeholder="Email"
//                   placeholderTextColor="#ccc"
//                   value={newMember.email}
//                   onChangeText={(text) =>
//                     setNewMember({ ...newMember, email: text })
//                   }
//                   keyboardType="email-address"
//                 />
//                 {errors.email && (
//                   <Text style={styles.errorText}>{errors.email}</Text>
//                 )}

//                 <TextInput
//                   style={[
//                     styles.input,
//                     errors.phoneNumber && styles.inputError,
//                   ]}
//                   placeholder="Phone Number"
//                   placeholderTextColor="#ccc"
//                   value={newMember.phoneNumber}
//                   onChangeText={(text) =>
//                     setNewMember({ ...newMember, phoneNumber: text })
//                   }
//                   keyboardType="phone-pad"
//                 />
//                 {errors.phoneNumber && (
//                   <Text style={styles.errorText}>{errors.phoneNumber}</Text>
//                 )}

//                 <Picker
//                   selectedValue={newMember.role}
//                   onValueChange={(value) =>
//                     setNewMember({ ...newMember, role: value })
//                   }
//                   style={[styles.picker, errors.role && styles.inputError]}
//                 >
//                   <Picker.Item label="Security" value="security" />
//                   <Picker.Item label="Admin" value="admin" />
//                 </Picker>
//                 {errors.role && (
//                   <Text style={styles.errorText}>{errors.role}</Text>
//                 )}

//                 <TextInput
//                   style={[styles.input, errors.password && styles.inputError]}
//                   placeholder={
//                     isEditing ? "New Password (optional)" : "Password"
//                   }
//                   placeholderTextColor="#ccc"
//                   value={newMember.password}
//                   onChangeText={(text) =>
//                     setNewMember({ ...newMember, password: text })
//                   }
//                   secureTextEntry
//                 />
//                 {errors.password && (
//                   <Text style={styles.errorText}>{errors.password}</Text>
//                 )}

//                 <View style={styles.switchContainer}>
//                   <Text style={styles.cardDetail}>Active:</Text>
//                   <Switch
//                     value={newMember.active}
//                     onValueChange={(value) =>
//                       setNewMember({ ...newMember, active: value })
//                     }
//                     trackColor={{ false: "#767577", true: "#000000" }}
//                     thumbColor={newMember.active ? "#fff" : "#f4f3f4"}
//                   />
//                 </View>

//                 {errors.form && (
//                   <Text style={styles.errorText}>{errors.form}</Text>
//                 )}

//                 <TouchableOpacity
//                   style={styles.button}
//                   onPress={isEditing ? handleUpdateMember : handleAddMember}
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <ActivityIndicator color="#fff" />
//                   ) : (
//                     <Text style={styles.buttonText}>
//                       {isEditing ? "Update Member" : "Add Member"}
//                     </Text>
//                   )}
//                 </TouchableOpacity>

//                 {isEditing && (
//                   <TouchableOpacity
//                     style={[styles.button, { backgroundColor: "#ff4444" }]}
//                     onPress={resetForm}
//                   >
//                     <Text style={styles.buttonText}>Cancel</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             </View>
//           }
//         />

//         {updateLocationVisible && (
//           <View style={styles.modal}>
//             <View style={styles.modalContent}>
//               <Text style={styles.modalTitle}>Update Device Location</Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Latitude"
//                 placeholderTextColor="#ccc"
//                 value={newLatitude}
//                 onChangeText={setNewLatitude}
//                 keyboardType="numeric"
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Longitude"
//                 placeholderTextColor="#ccc"
//                 value={newLongitude}
//                 onChangeText={setNewLongitude}
//                 keyboardType="numeric"
//               />
//               <View style={styles.modalButtons}>
//                 <TouchableOpacity
//                   style={styles.button}
//                   onPress={handleUpdateLocation}
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <ActivityIndicator color="#fff" />
//                   ) : (
//                     <Text style={styles.buttonText}>Save</Text>
//                   )}
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.button, { backgroundColor: "#ff4444" }]}
//                   onPress={() => setUpdateLocationVisible(false)}
//                 >
//                   <Text style={styles.buttonText}>Cancel</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         )}
//       </LinearGradient>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#000",
//   },
//   gradient: {
//     flex: 1,
//     paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: "#121212",
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 8,
//   },
//   backButton: {
//     marginRight: 15,
//   },
//   headerTitle: {
//     color: "#fff",
//     fontSize: 28,
//     fontWeight: "700",
//   },
//   formContainer: {
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//   },
//   sectionTitle: {
//     color: "#4CAF50",
//     fontSize: 20,
//     fontWeight: "700",
//     marginBottom: 15,
//     textTransform: "uppercase",
//   },
//   card: {
//     backgroundColor: "#1e1e1e",
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#fff",
//     marginBottom: 5,
//   },
//   cardDetail: {
//     fontSize: 14,
//     color: "#bbb",
//     marginBottom: 5,
//   },
//   switchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   button: {
//     backgroundColor: "#000000",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   form: {
//     backgroundColor: "#2a2a2a",
//     borderRadius: 8,
//     padding: 15,
//   },
//   input: {
//     backgroundColor: "#3a3a3a",
//     color: "#fff",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//     fontSize: 16,
//   },
//   inputError: {
//     borderColor: "#ff4444",
//     borderWidth: 1,
//   },
//   picker: {
//     backgroundColor: "#3a3a3a",
//     color: "#fff",
//     marginBottom: 10,
//   },
//   errorText: {
//     color: "#ff4444",
//     fontSize: 12,
//     marginBottom: 10,
//   },
//   memberCard: {
//     flexDirection: "row",
//     backgroundColor: "#2d2d2d",
//     borderRadius: 8,
//     padding: 15,
//     marginHorizontal: 20,
//     marginBottom: 10,
//   },
//   memberInfo: {
//     flex: 1,
//   },
//   memberName: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#fff",
//     marginBottom: 5,
//   },
//   memberDetail: {
//     fontSize: 14,
//     color: "#ccc",
//     marginBottom: 3,
//   },
//   memberActions: {
//     justifyContent: "center",
//     alignItems: "flex-end",
//   },
//   actionButton: {
//     backgroundColor: "#000000",
//     padding: 8,
//     borderRadius: 8,
//     marginBottom: 8,
//     width: 40,
//     alignItems: "center",
//   },
//   modal: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     backgroundColor: "#2d2d2d",
//     borderRadius: 8,
//     padding: 20,
//     width: "80%",
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#fff",
//     marginBottom: 15,
//   },
//   modalButtons: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
// });

// export default Setting;
import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
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
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { GeoPoint } from "firebase/firestore";
import { useAuth } from "../../context/authContext";

const { width } = Dimensions.get("window");

const Setting = () => {
  const { user, role, signup } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    role: "",
    active: false,
  });
  const [deviceData, setDeviceData] = useState({
    deviceId: "",
    location: null,
  });
  const [securityMembers, setSecurityMembers] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateLocationVisible, setUpdateLocationVisible] = useState(false);
  const [newLatitude, setNewLatitude] = useState("");
  const [newLongitude, setNewLongitude] = useState("");
  const flatListRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        if (user?.uid) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          }
        }

        // Fetch device data
        const devicesQuery = query(collection(db, "devices"));
        const devicesSnapshot = await getDocs(devicesQuery);
        if (!devicesSnapshot.empty) {
          const deviceDoc = devicesSnapshot.docs[0];
          setDeviceData({
            deviceId: deviceDoc.id,
            location: deviceDoc.data().location || null,
          });
        }

        // Fetch security members
        fetchSecurityMembers();
      } catch (error) {
        Alert.alert("Error", "Failed to load data: " + error.message);
      }
    };

    fetchData();
  }, [user]);

  const fetchSecurityMembers = async () => {
    try {
      const securityQuery = query(
        collection(db, "users"),
        where("role", "in", ["security", "admin"])
      );
      const querySnapshot = await getDocs(securityQuery);
      setSecurityMembers(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      Alert.alert("Error", "Failed to load security members: " + error.message);
    }
  };

  const validateMember = () => {
    const newErrors = {};
    if (!selectedMemberId) {
      newErrors.form = "Please select a member to edit";
      return false;
    }
    if (
      !/^\S+@\S+\.\S+$/.test(
        securityMembers.find((m) => m.id === selectedMemberId)?.email || ""
      )
    )
      newErrors.email = "Enter a valid email";
    if (
      !/^\+?\d{10,15}$/.test(
        securityMembers.find((m) => m.id === selectedMemberId)?.phoneNumber ||
          ""
      )
    )
      newErrors.phoneNumber = "Enter a valid phone number";
    if (!securityMembers.find((m) => m.id === selectedMemberId)?.role)
      newErrors.role = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateMember = async () => {
    if (!validateMember() || !selectedMemberId) return;
    setLoading(true);

    try {
      const memberRef = doc(db, "users", selectedMemberId);
      const memberData = securityMembers.find((m) => m.id === selectedMemberId);
      await updateDoc(memberRef, {
        username: memberData.username,
        email: memberData.email,
        phoneNumber: memberData.phoneNumber,
        role: memberData.role,
        active: memberData.active,
      });

      if (memberData.password) {
        await sendPasswordResetEmail(auth, memberData.email);
      }

      resetForm();
      fetchSecurityMembers();
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      Alert.alert("Success", "Member updated successfully");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMember = (member) => {
    setSelectedMemberId(member.id);
    setIsEditing(true);
  };

  const handleRemoveMember = async (memberId) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "users", memberId));
      if (selectedMemberId === memberId) {
        resetForm();
      }
      fetchSecurityMembers();
      Alert.alert("Success", "Member removed successfully");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMemberActive = async (memberId, value) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", memberId), { active: value });
      fetchSecurityMembers();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserActive = async (value) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { active: value });
      setUserData({ ...userData, active: value });
      Alert.alert("Success", `User ${value ? "activated" : "deactivated"}`);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocation = async () => {
    if (!newLatitude || !newLongitude) {
      Alert.alert("Error", "Please enter both latitude and longitude");
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, "devices", deviceData.deviceId), {
        location: new GeoPoint(
          parseFloat(newLatitude),
          parseFloat(newLongitude)
        ),
      });
      setDeviceData({
        ...deviceData,
        location: [parseFloat(newLatitude), parseFloat(newLongitude)],
      });
      setUpdateLocationVisible(false);
      Alert.alert("Success", "Device location updated");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedMemberId(null);
    setIsEditing(false);
    setErrors({});
  };

  const renderMember = ({ item }) => (
    <Animated.View entering={FadeIn} style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.username}</Text>
        <Text style={styles.memberDetail}>{item.email}</Text>
        <Text style={styles.memberDetail}>{item.phoneNumber}</Text>
        <Text style={styles.memberDetail}>Role: {item.role}</Text>
      </View>
      <View style={styles.memberActions}>
        <Switch
          value={item.active}
          onValueChange={(value) => toggleMemberActive(item.id, value)}
          trackColor={{ false: "#767577", true: "#000000" }}
          thumbColor={item.active ? "#fff" : "#f4f3f4"}
        />
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditMember(item)}
        >
          <Icon name="pencil" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#ff4444" }]}
          onPress={() => handleRemoveMember(item.id)}
        >
          <Icon name="trash" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#1a1a2e", "#2d2d2d"]} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/DashboardPage")}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={securityMembers}
          renderItem={renderMember}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>User Settings</Text>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{userData.username}</Text>
                <Text style={styles.cardDetail}>Email: {userData.email}</Text>
                <Text style={styles.cardDetail}>
                  Phone: {userData.phoneNumber}
                </Text>
                <Text style={styles.cardDetail}>Role: {userData.role}</Text>
                <View style={styles.switchContainer}>
                  <Text style={styles.cardDetail}>Active:</Text>
                  <Switch
                    value={userData.active}
                    onValueChange={toggleUserActive}
                    trackColor={{ false: "#767577", true: "#000000" }}
                    thumbColor={userData.active ? "#fff" : "#f4f3f4"}
                  />
                </View>
              </View>

              <Text style={styles.sectionTitle}>Device Settings</Text>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  Device ID: {deviceData.deviceId}
                </Text>
                <Text style={styles.cardDetail}>
                  Location:{" "}
                  {Array.isArray(deviceData.location)
                    ? `Lat: ${deviceData.location[0]}, Lon: ${deviceData.location[1]}`
                    : "N/A"}
                </Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setUpdateLocationVisible(true)}
                >
                  <Text style={styles.buttonText}>Update Location</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>Team Management</Text>
              <View style={styles.form}>
                {isEditing && (
                  <View>
                    <Text style={styles.cardDetail}>
                      Editing Member:{" "}
                      {securityMembers.find((m) => m.id === selectedMemberId)
                        ?.username || "Unknown"}
                    </Text>
                    <TextInput
                      style={[styles.input, errors.email && styles.inputError]}
                      placeholder="Email"
                      placeholderTextColor="#ccc"
                      value={
                        securityMembers.find((m) => m.id === selectedMemberId)
                          ?.email || ""
                      }
                      onChangeText={(text) => {
                        const updatedMembers = securityMembers.map((m) =>
                          m.id === selectedMemberId ? { ...m, email: text } : m
                        );
                        setSecurityMembers(updatedMembers);
                      }}
                      keyboardType="email-address"
                    />
                    {errors.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}

                    <TextInput
                      style={[
                        styles.input,
                        errors.phoneNumber && styles.inputError,
                      ]}
                      placeholder="Phone Number"
                      placeholderTextColor="#ccc"
                      value={
                        securityMembers.find((m) => m.id === selectedMemberId)
                          ?.phoneNumber || ""
                      }
                      onChangeText={(text) => {
                        const updatedMembers = securityMembers.map((m) =>
                          m.id === selectedMemberId
                            ? { ...m, phoneNumber: text }
                            : m
                        );
                        setSecurityMembers(updatedMembers);
                      }}
                      keyboardType="phone-pad"
                    />
                    {errors.phoneNumber && (
                      <Text style={styles.errorText}>{errors.phoneNumber}</Text>
                    )}

                    <Picker
                      selectedValue={
                        securityMembers.find((m) => m.id === selectedMemberId)
                          ?.role || "security"
                      }
                      onValueChange={(value) => {
                        const updatedMembers = securityMembers.map((m) =>
                          m.id === selectedMemberId ? { ...m, role: value } : m
                        );
                        setSecurityMembers(updatedMembers);
                      }}
                      style={[styles.picker, errors.role && styles.inputError]}
                    >
                      <Picker.Item label="Security" value="security" />
                      <Picker.Item label="Admin" value="admin" />
                    </Picker>
                    {errors.role && (
                      <Text style={styles.errorText}>{errors.role}</Text>
                    )}

                    <TextInput
                      style={[
                        styles.input,
                        errors.password && styles.inputError,
                      ]}
                      placeholder="New Password (optional)"
                      placeholderTextColor="#ccc"
                      value={
                        securityMembers.find((m) => m.id === selectedMemberId)
                          ?.password || ""
                      }
                      onChangeText={(text) => {
                        const updatedMembers = securityMembers.map((m) =>
                          m.id === selectedMemberId
                            ? { ...m, password: text }
                            : m
                        );
                        setSecurityMembers(updatedMembers);
                      }}
                      secureTextEntry
                    />
                    {errors.form && (
                      <Text style={styles.errorText}>{errors.form}</Text>
                    )}

                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleUpdateMember}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>Update Member</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: "#ff4444" }]}
                      onPress={resetForm}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          }
        />

        {updateLocationVisible && (
          <View style={styles.modal}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update Device Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Latitude"
                placeholderTextColor="#ccc"
                value={newLatitude}
                onChangeText={setNewLatitude}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Longitude"
                placeholderTextColor="#ccc"
                value={newLongitude}
                onChangeText={setNewLongitude}
                keyboardType="numeric"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleUpdateLocation}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Save</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#ff4444" }]}
                  onPress={() => setUpdateLocationVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#121212",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    color: "#4CAF50",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  cardDetail: {
    fontSize: 14,
    color: "#bbb",
    marginBottom: 5,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#000000",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  form: {
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    padding: 15,
  },
  input: {
    backgroundColor: "#3a3a3a",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#ff4444",
    borderWidth: 1,
  },
  picker: {
    backgroundColor: "#3a3a3a",
    color: "#fff",
    marginBottom: 10,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginBottom: 10,
  },
  memberCard: {
    flexDirection: "row",
    backgroundColor: "#2d2d2d",
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  memberDetail: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 3,
  },
  memberActions: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  actionButton: {
    backgroundColor: "#000000",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    width: 40,
    alignItems: "center",
  },
  modal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#2d2d2d",
    borderRadius: 8,
    padding: 20,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default Setting;
