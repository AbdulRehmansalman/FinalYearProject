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
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/authContext";
import Toast from "react-native-toast-message"; // Import Toast

const SignIn = () => {
  const { login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.email.match(/\S+@\S+\.\S+/))
      newErrors.email = "Enter a valid email";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      await login(formData.email, formData.password);

      // Fetch Role & Redirect After Login
      let role;
      try {
        role = await AsyncStorage.getItem("role");
      } catch (storageError) {
        // Handle AsyncStorage error gracefully
        Toast.show({
          type: "error",
          text1: "Sign In Failed",
          text2: "Unable to retrieve user role. Please try again.",
          position: "top",
          visibilityTime: 4000,
        });
        return;
      }

      // Define valid roles and fallback navigation
      const validRoles = ["admin", "security"];
      const redirectPath = validRoles.includes(role)
        ? role === "admin"
          ? "/(tabs)/DashboardPage"
          : "/(tabs)/AlertsPage"
        : "/(tabs)/AlertsPage"; // Fallback to AlertsPage if role is invalid

      router.replace(redirectPath);
    } catch (error) {
      // Show toast with specific messages for common Firebase errors
      let errorMessage = "An error occurred during sign in. Please try again.";
      if (error.code === "auth/invalid-credential") {
        errorMessage =
          "Invalid email or password. Please check your credentials.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later.";
      }

      Toast.show({
        type: "error",
        text1: "Sign In Failed",
        text2: errorMessage,
        position: "top",
        visibilityTime: 4000,
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
                <Text style={styles.headerText}>Sign In</Text>
                <Text style={styles.subHeaderText}>
                  Welcome Back to Wildlife Monitoring
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

            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleSignIn}
              disabled={loading}
            >
              <LinearGradient
                colors={["#4CAF50", "#388E3C"]}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(auth)/SignUp")}>
              <Text style={styles.signUpLink}>
                Don’t have an account?{" "}
                <Text style={styles.signUpText}>Sign Up</Text>
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
  eyeIcon: { padding: 10 },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    marginBottom: 15,
    textAlign: "center",
  },
  signInButton: {
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
  signUpLink: {
    color: "#bbb",
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
  signUpText: {
    color: "#4CAF50",
    fontFamily: "Poppins-Bold",
  },
});

export default SignIn;
