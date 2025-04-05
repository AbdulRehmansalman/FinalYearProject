import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  runOnJS, // Import runOnJS
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

const { width, height } = Dimensions.get("window");

const SkeletonLoader = ({ width, height, style }) => {
  const shimmer = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(255, 255, 255, ${0.1 + shimmer.value * 0.1})`,
  }));

  useEffect(() => {
    shimmer.value = withTiming(1, {
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
    });
    const interval = setInterval(() => {
      shimmer.value = withTiming(shimmer.value === 1 ? 0 : 1, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [shimmer]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: "#2d2d2d",
          borderRadius: 8,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

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
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updateLocationVisible, setUpdateLocationVisible] = useState(false);
  const [newLatitude, setNewLatitude] = useState("");
  const [newLongitude, setNewLongitude] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const router = useRouter();

  const headerScale = useSharedValue(1);
  const backButtonScale = useSharedValue(1);
  const updateLocationScale = useSharedValue(0);

  const animatedHeaderStyles = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  const animatedBackButtonStyles = useAnimatedStyle(() => ({
    transform: [{ scale: backButtonScale.value }],
  }));

  const animatedUpdateLocationStyles = useAnimatedStyle(() => ({
    transform: [{ scale: updateLocationScale.value }],
  }));

  // Show message using Alert
  const showModal = (message) => {
    r;
    Alert.alert("Message", message, [{ text: "OK" }]);
  };

  // Show update location prompt
  const showUpdateLocationPrompt = () => {
    setNewLatitude(deviceData.location.latitude.toString());
    setNewLongitude(deviceData.location.longitude.toString());
    setUpdateLocationVisible(true);
    updateLocationScale.value = withSpring(1);
  };

  // Hide update location prompt
  const hideUpdateLocationPrompt = () => {
    updateLocationScale.value = withSpring(0);
    setTimeout(() => {
      setUpdateLocationVisible(false);
    }, 300);
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
    setTimeout(() => setLoading(false), 2000);
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
  const checkEmailExists = async (email, excludeMemberId = null) => {
    const usersQuery = query(
      collection(db, "users"),
      where("email", "==", email)
    );
    const querySnapshot = await getDocs(usersQuery);
    if (excludeMemberId) {
      return querySnapshot.docs.some((doc) => doc.id !== excludeMemberId);
    }
    return !querySnapshot.empty;
  };

  // Add a new security member
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
      const emailExists = await checkEmailExists(newMember.email);
      if (emailExists) {
        showModal(
          "This email is already in use. Please use a different email."
        );
        return;
      }

      const newMemberId = `sec${Date.now()}`;
      const memberRef = doc(db, "users", newMemberId);
      await setDoc(memberRef, {
        username: newMember.username,
        email: newMember.email,
        phoneNumber: newMember.phoneNumber,
        role: newMember.role,
        active: newMember.active,
      });

      resetForm();
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

  // Update an existing security member
  const handleUpdateSecurityMember = async () => {
    if (!newMember.username || !newMember.email || !newMember.phoneNumber) {
      Alert.alert(
        "Invalid Input",
        "Please fill in all fields for the security member."
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
    try {
      const emailExists = await checkEmailExists(
        newMember.email,
        selectedMemberId
      );
      if (emailExists) {
        showModal(
          "This email is already in use by another user. Please use a different email."
        );
        return;
      }

      const memberRef = doc(db, "users", selectedMemberId);
      await updateDoc(memberRef, {
        username: newMember.username,
        email: newMember.email,
        phoneNumber: newMember.phoneNumber,
        role: newMember.role,
        active: newMember.active,
      });

      resetForm();
      showModal("Security member updated successfully!");
    } catch (error) {
      console.error("Error updating security member:", error);
      showModal("Failed to update security member: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset the form after adding/updating
  const resetForm = () => {
    setNewMember({
      username: "",
      email: "",
      phoneNumber: "",
      role: "security",
      active: true,
      password: "",
    });
    setSelectedMemberId(null);
    setIsEditing(false);
  };

  // Populate form with selected member's data for editing
  const handleEditSecurityMember = (member) => {
    setNewMember({
      username: member.username,
      email: member.email,
      phoneNumber: member.phoneNumber,
      role: member.role,
      active: member.active,
      password: "",
    });
    setSelectedMemberId(member.id);
    setIsEditing(true);
  };

  // Remove a security member
  const handleRemoveSecurityMember = async (memberId) => {
    setLoading(true);
    try {
      const memberRef = doc(db, "users", memberId);
      await deleteDoc(memberRef);
      if (selectedMemberId === memberId) {
        resetForm();
      }
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

    const latitude = parseFloat(newLatitude);
    const longitude = parseFloat(newLongitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      showModal("Please enter valid latitude and longitude values.");
      return;
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      showModal(
        "Latitude must be between -90 and 90, and longitude must be between -180 and 180."
      );
      return;
    }

    setLoading(true);
    try {
      const deviceRef = doc(db, "devices", deviceData.deviceId);
      const newLocation = new GeoPoint(latitude, longitude);
      await updateDoc(deviceRef, { location: newLocation });
      setDeviceData((prev) => ({
        ...prev,
        location: {
          latitude,
          longitude,
        },
      }));
      showModal("Device location updated successfully!");
      hideUpdateLocationPrompt();
    } catch (error) {
      console.error("Error updating device location:", error);
      showModal("Failed to update device location: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout with confirmation
  const handleLogout = async () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
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
        },
      },
    ]);
  };

  // Handle back button press without confirmation
  const handleBackPress = () => {
    router.push("/(tabs)/DashboardPage");
  };

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
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => {
              headerScale.value = withSpring(0.98, {}, () => {
                headerScale.value = withSpring(1);
              });
            }}
          >
            <Animated.View style={[styles.header, animatedHeaderStyles]}>
              <LinearGradient
                colors={["#4CAF50", "#2E7D32"]}
                style={styles.headerGradient}
              >
                <TouchableOpacity
                  onPress={handleBackPress}
                  style={styles.backButton}
                >
                  <Animated.View style={animatedBackButtonStyles}>
                    <Icon name="arrow-back" size={28} color="#fff" />
                  </Animated.View>
                </TouchableOpacity>
                <View style={styles.headerContent}>
                  <Text style={styles.headerText}>Settings </Text>
                </View>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        );
      case "userProfile":
        return loading ? (
          <View style={styles.card}>
            <SkeletonLoader
              width={width - 60}
              height={30}
              style={{ marginBottom: 15 }}
            />
            <SkeletonLoader
              width={width - 60}
              height={50}
              style={{ marginBottom: 15 }}
            />
            <SkeletonLoader
              width={width - 60}
              height={50}
              style={{ marginBottom: 15 }}
            />
            <SkeletonLoader
              width={width - 60}
              height={50}
              style={{ marginBottom: 15 }}
            />
            <SkeletonLoader
              width={100}
              height={20}
              style={{ marginBottom: 15 }}
            />
            <SkeletonLoader width={150} height={40} />
          </View>
        ) : (
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
        return loading ? (
          <View style={styles.card}>
            <SkeletonLoader
              width={width - 60}
              height={30}
              style={{ marginBottom: 15 }}
            />
            <SkeletonLoader
              width={width - 60}
              height={100}
              style={{ marginBottom: 10 }}
            />
            <SkeletonLoader
              width={width - 60}
              height={100}
              style={{ marginBottom: 10 }}
            />
            <SkeletonLoader
              width={width - 60}
              height={50}
              style={{ marginBottom: 15 }}
            />
            <SkeletonLoader
              width={width - 60}
              height={50}
              style={{ marginBottom: 15 }}
            />
            <SkeletonLoader
              width={width - 60}
              height={50}
              style={{ marginBottom: 15 }}
            />
            <SkeletonLoader width={150} height={40} />
          </View>
        ) : (
          <Animated.View entering={FadeIn} style={styles.card}>
            <Text style={styles.sectionTitle}>Security Team Management</Text>
            {securityMembers.length > 0 ? (
              securityMembers.map((member) => (
                <View key={member.id} style={styles.memberItem}>
                  <View style={styles.memberDetails}>
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
                  <View style={styles.memberActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditSecurityMember(member)}
                      disabled={loading}
                    >
                      <Icon name="pencil-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveSecurityMember(member.id)}
                      disabled={loading}
                    >
                      <Icon name="trash-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No security team members</Text>
            )}
            <Text style={styles.subSectionTitle}>
              {isEditing ? "Update Member" : "Add New Member"}
            </Text>
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
              placeholder="Phone (e.g, +1234567890)"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
            {!isEditing && (
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
            )}
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
              onPress={
                isEditing ? handleUpdateSecurityMember : handleAddSecurityMember
              }
              disabled={loading}
            >
              <LinearGradient
                colors={["#388E3C", "#2E7D32"]}
                style={styles.buttonGradient}
              >
                <Icon
                  name={isEditing ? "save-outline" : "person-add-outline"}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.buttonText}>
                  {isEditing ? "Update Member" : "Add Member"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            {isEditing && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={resetForm}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel Update</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        );
      case "deviceInfo":
        return loading ? (
          <View style={styles.card}>
            <SkeletonLoader
              width={width - 60}
              height={30}
              style={{ marginBottom: 15 }}
            />
            <SkeletonLoader
              width={width - 60}
              height={20}
              style={{ marginBottom: 15 }}
            />
            <SkeletonLoader width={150} height={40} />
          </View>
        ) : (
          <Animated.View entering={FadeIn} style={styles.card}>
            <Text style={styles.sectionTitle}>Device Settings</Text>
            <Text style={styles.label}>
              {deviceData.deviceId || "No Device"} | Lat:{" "}
              {deviceData.location.latitude.toFixed(2)}, Lon:{" "}
              {deviceData.location.longitude.toFixed(2)}
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={showUpdateLocationPrompt}
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
            {updateLocationVisible && (
              <Animated.View
                style={[
                  styles.updateLocationPrompt,
                  animatedUpdateLocationStyles,
                ]}
              >
                <Text style={styles.modalTitle}>Update Device Location</Text>
                <Text style={styles.modalLabel}>Latitude:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newLatitude}
                  onChangeText={setNewLatitude}
                  placeholder="Enter latitude"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
                <Text style={styles.modalLabel}>Longitude:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newLongitude}
                  onChangeText={setNewLongitude}
                  placeholder="Enter longitude"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={hideUpdateLocationPrompt}
                  >
                    <LinearGradient
                      colors={["#D32F2F", "#B71C1C"]}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={handleUpdateDeviceLocation}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={["#4CAF50", "#388E3C"]}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>Update</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </Animated.View>
        );
      case "logout":
        return loading ? (
          <SkeletonLoader
            width={width - 30}
            height={50}
            style={styles.logoutButton}
          />
        ) : (
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
    paddingTop: Platform.OS === "ios" ? 40 : 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  headerGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 20,
  },
  backButton: {
    marginRight: 10,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 40,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginLeft: 10,
  },
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
    marginTop: 10,
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
  memberDetails: {
    flex: 1,
  },
  memberActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    padding: 8,
    marginRight: 10,
  },
  removeButton: {
    backgroundColor: "#D32F2F",
    borderRadius: 10,
    padding: 8,
  },
  cancelButton: {
    marginTop: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#D32F2F",
    fontSize: 16,
    fontWeight: "600",
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
  updateLocationPrompt: {
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    color: "#4CAF50",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
  },
  modalLabel: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 5,
  },
  modalInput: {
    borderColor: "#4CAF50",
    borderWidth: 1,
    borderRadius: 12,
    color: "#fff",
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#2d2d2d",
    fontSize: 16,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: "hidden",
  },
});

export default Settings;
