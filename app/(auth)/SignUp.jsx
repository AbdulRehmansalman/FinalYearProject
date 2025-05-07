import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../../context/authContext";
import Toast from "react-native-toast-message";

const SignUp = () => {
  const { signup } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.match(/\S+@\S+\.\S+/))
      newErrors.email = "Enter a valid email";
    if (!formData.phoneNumber.match(/^\+?\d{10,11}$/))
      newErrors.phoneNumber = "Enter a valid phone number (e.g., +1234567890)";
    if (!formData.role.trim()) newErrors.role = "Role is required";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      await signup(
        formData.email,
        formData.password,
        formData.role,
        formData.phoneNumber,
        formData.username
      );
      router.push("/(auth)/SignIn");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Sign Up Failed",
        text2: "An error occurred during sign up. Please try again.",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.header}>
            <Animated.View
              entering={FadeInUp.duration(800)}
              style={styles.headerContent}
            >
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerText}>Sign Up</Text>
                <Text style={styles.subHeaderText}>
                  Join the Wildlife Monitoring Team
                </Text>
              </View>
            </Animated.View>
          </LinearGradient>

          <Animated.View
            entering={FadeIn.duration(1000)}
            style={styles.formContainer}
          >
            <View style={styles.inputWrapper}>
              <Icon
                name="person-outline"
                size={24}
                color="#4CAF50"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#999"
                value={formData.username}
                onChangeText={(value) => handleChange("username", value)}
              />
            </View>
            {errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
            )}

            <View style={styles.inputWrapper}>
              <Icon
                name="mail-outline"
                size={24}
                color="#4CAF50"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={formData.email}
                onChangeText={(value) => handleChange("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <View style={styles.inputWrapper}>
              <Icon
                name="call-outline"
                size={24}
                color="#4CAF50"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number (e.g., +1234567890)"
                placeholderTextColor="#999"
                value={formData.phoneNumber}
                onChangeText={(value) => handleChange("phoneNumber", value)}
                keyboardType="phone-pad"
              />
            </View>
            {errors.phoneNumber && (
              <Text style={styles.errorText}>{errors.phoneNumber}</Text>
            )}

            <View style={styles.inputWrapper}>
              <Icon
                name="shield-outline"
                size={24}
                color="#4CAF50"
                style={styles.inputIcon}
              />
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.role}
                  onValueChange={(value) => handleChange("role", value)}
                  style={styles.picker}
                  mode="dropdown"
                  dropdownIconColor="#4CAF50"
                >
                  <Picker.Item label="Select Role" value="" color="#999" />
                  <Picker.Item label="Admin" value="admin" color="grey" />
                  <Picker.Item label="Security" value="security" color="grey" />
                </Picker>
              </View>
            </View>
            {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}

            <View style={styles.inputWrapper}>
              <Icon
                name="lock-closed-outline"
                size={24}
                color="#4CAF50"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={formData.password}
                onChangeText={(value) => handleChange("password", value)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={24}
                  color="#4CAF50"
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <View style={styles.inputWrapper}>
              <Icon
                name="lock-closed-outline"
                size={24}
                color="#4CAF50"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                value={formData.confirmPassword}
                onChangeText={(value) => handleChange("confirmPassword", value)}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={24}
                  color="#4CAF50"
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

            {errors.form && <Text style={styles.errorText}>{errors.form}</Text>}

            <TouchableOpacity
              style={styles.signUpButton}
              onPress={handleSignUp}
              disabled={loading}
            >
              <LinearGradient
                colors={["#4CAF50", "#388E3C"]}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(auth)/SignIn")}>
              <Text style={styles.signInLink}>
                Already have an account?{" "}
                <Text style={styles.signInText}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  header: {
    padding: 40,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: { alignItems: "center" },
  headerText: {
    color: "#fff",
    fontSize: 32,
    fontFamily: "Poppins-Bold",
  },
  subHeaderText: {
    color: "#ddd",
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    marginTop: 5,
  },
  formContainer: {
    padding: 20,
    marginTop: -20,
    backgroundColor: "#1e1e1e",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333333",
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    paddingVertical: 12,
  },
  pickerContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: {
    color: "#fff",
    backgroundColor: "#333333",
    height: 50,
    fontFamily: "Poppins-Regular",
  },
  eyeIcon: { padding: 10 },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    marginBottom: 15,
    textAlign: "center",
  },
  signUpButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  buttonGradient: {
    padding: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins-Bold",
  },
  signInLink: {
    color: "#bbb",
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
  signInText: {
    color: "#4CAF50",
    fontFamily: "Poppins-Bold",
  },
});

export default SignUp;
