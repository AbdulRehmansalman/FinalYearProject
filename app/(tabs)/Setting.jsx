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

import React, { useState, useEffect } from "react";
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

const { width } = Dimensions.get("window");

const Settings = () => {
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "admin@wildlife.com",
    password: "********",
    phone: "+1234567890",
  });
  const [deviceData, setDeviceData] = useState({
    deviceId: "Pi Unit 001",
    location: { latitude: 40.7128, longitude: -74.006 },
  });
  const [securityMembers, setSecurityMembers] = useState([
    {
      id: "sec1",
      name: "Alice Smith",
      email: "alice@wildlife.com",
      password: "pass123",
      phoneNumber: "+1987654321",
      role: "security",
    },
    {
      id: "sec2",
      name: "Bob Johnson",
      email: "bob@wildlife.com",
      password: "pass456",
      phoneNumber: "+1123456789",
      role: "security",
    },
  ]);
  const [receiveAlerts, setReceiveAlerts] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "security",
  });
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const role = "admin"; // Hardcoded role for frontend demo
  const router = useRouter();

  const scale = useSharedValue(0);
  const animatedModalStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000); // Simulated loading
  }, []);

  const showModal = (message) => {
    setModalMessage(message);
    setModalVisible(true);
    scale.value = withSpring(1);
    setTimeout(() => {
      scale.value = withSpring(0);
      setModalVisible(false);
    }, 2000);
  };

  const handleSaveUser = () => {
    setLoading(true);
    setTimeout(() => {
      showModal("Profile updated successfully!");
      setLoading(false);
    }, 1000);
  };

  const toggleAlerts = (value) => {
    setReceiveAlerts(value);
    setTimeout(
      () => showModal(`SMS Alerts ${value ? "Enabled" : "Disabled"}!`),
      500
    );
  };

  const handleAddSecurityMember = () => {
    if (
      !newMember.name ||
      !newMember.email ||
      !newMember.password ||
      !newMember.phoneNumber
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
    setLoading(true);
    setTimeout(() => {
      setSecurityMembers([
        ...securityMembers,
        { id: `sec${securityMembers.length + 3}`, ...newMember },
      ]);
      setNewMember({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        role: "security",
      });
      showModal("Security member added successfully!");
      setLoading(false);
    }, 1000);
  };

  const handleRemoveSecurityMember = (memberId) => {
    setLoading(true);
    setTimeout(() => {
      setSecurityMembers(
        securityMembers.filter((member) => member.id !== memberId)
      );
      showModal("Security member removed successfully!");
      setLoading(false);
    }, 1000);
  };

  const handleUpdateDeviceLocation = () => {
    setLoading(true);
    setTimeout(() => {
      // Simulate location update (could prompt for new coords in a real app)
      setDeviceData({
        ...deviceData,
        location: {
          latitude: deviceData.location.latitude + 0.01,
          longitude: deviceData.location.longitude + 0.01,
        },
      });
      showModal("Device location updated successfully!");
      setLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setTimeout(() => router.replace("/(auth)/login"), 500);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  const pageData = [
    { type: "header", id: "header" },
    { type: "userProfile", id: "userProfile" },
    { type: "notifications", id: "notifications" },
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
              value={userData.name}
              onChangeText={(text) => setUserData({ ...userData, name: text })}
              placeholder="Name"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              value={userData.email}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              value={userData.password}
              onChangeText={(text) =>
                setUserData({ ...userData, password: text })
              }
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              value={userData.phone}
              onChangeText={(text) => setUserData({ ...userData, phone: text })}
              placeholder="Phone Number (e.g., +1234567890)"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSaveUser}
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
      // as the user clicks on the notification button, the user will be able to Conway notifications if Inactive
      case "notifications":
        return (
          <Animated.View entering={FadeIn} style={styles.card}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Receive SMS Alerts</Text>
              <Switch
                value={receiveAlerts}
                onValueChange={toggleAlerts}
                trackColor={{ false: "#767577", true: "#4CAF50" }}
                thumbColor={receiveAlerts ? "#fff" : "#f4f3f4"}
              />
            </View>
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
                    <Text style={styles.label}>{member.name}</Text>
                    <Text style={styles.subLabel}>Email: {member.email}</Text>
                    <Text style={styles.subLabel}>
                      Phone: {member.phoneNumber}
                    </Text>
                    <Text style={styles.subLabel}>Role: {member.role}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveSecurityMember(member.id)}
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
              value={newMember.name}
              onChangeText={(text) =>
                setNewMember({ ...newMember, name: text })
              }
              placeholder="Name"
              placeholderTextColor="#999"
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
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAddSecurityMember}
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
              {deviceData.deviceId} | Lat:{" "}
              {deviceData.location.latitude.toFixed(2)}, Lon:{" "}
              {deviceData.location.longitude.toFixed(2)}
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleUpdateDeviceLocation}
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
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
    backgroundColor: "#121212",
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
