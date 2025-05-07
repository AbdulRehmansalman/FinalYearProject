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
