// import React, { useState, useEffect } from "react";
// import {
//   SafeAreaView,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
// } from "react-native";
// import { useRouter } from "expo-router";
// import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
// import Icon from "react-native-vector-icons/Ionicons";
// import { LinearGradient } from "expo-linear-gradient";
// import { useAuth } from "../../context/authContext"; // Adjust path as needed

// const SignIn = () => {
//   const { login, user, role } = useAuth();
//   const router = useRouter();

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const handleChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     setErrors((prev) => ({ ...prev, [field]: "" })); // Clear error on change
//   };

//   const validateForm = () => {
//     let newErrors = {};
//     if (!formData.email.match(/\S+@\S+\.\S+/))
//       newErrors.email = "Enter a valid email";
//     if (!formData.password.trim()) newErrors.password = "Password is required";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSignIn = async () => {
//     if (!validateForm()) return;
//     setLoading(true);

//     try {
//       await login(formData.email, formData.password);
//       // Redirection will be handled by useEffect below
//     } catch (error) {
//       console.error("SignIn - Login error:", error);
//       setErrors({ form: error.message || "Sign in failed. Please try again." });
//       setLoading(false);
//     }
//   };

//   // Redirect based on user and role after login
//   useEffect(() => {
//     if (!user || !role || loading) return; // Wait for user, role, and loading to complete

//     console.log("SignIn - After login:", { userId: user?.uid, role });
//     const redirectPath =
//       role === "admin" ? "/(tabs)/DashboardPage" : "/(tabs)/AlertsPage";
//     console.log(`SignIn - Redirecting to ${redirectPath}`);
//     router.push(redirectPath);
//   }, [user, role, loading, router]);

//   return (
//     <SafeAreaView style={styles.container}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={{ flex: 1 }}
//       >
//         <ScrollView contentContainerStyle={styles.scrollContent}>
//           <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.header}>
//             <Animated.View
//               entering={FadeInUp.duration(800)}
//               style={styles.headerContent}
//             >
//               <View style={styles.headerTextContainer}>
//                 <Text style={styles.headerText}>Sign In</Text>
//                 <Text style={styles.subHeaderText}>
//                   Welcome Back to Wildlife Monitoring
//                 </Text>
//               </View>
//             </Animated.View>
//           </LinearGradient>

//           <Animated.View
//             entering={FadeIn.duration(1000)}
//             style={styles.formContainer}
//           >
//             <View style={styles.inputWrapper}>
//               <Icon
//                 name="mail-outline"
//                 size={24}
//                 color="#4CAF50"
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Email"
//                 placeholderTextColor="#999"
//                 value={formData.email}
//                 onChangeText={(value) => handleChange("email", value)}
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//               />
//             </View>
//             {errors.email && (
//               <Text style={styles.errorText}>{errors.email}</Text>
//             )}

//             <View style={styles.inputWrapper}>
//               <Icon
//                 name="lock-closed-outline"
//                 size={24}
//                 color="#4CAF50"
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Password"
//                 placeholderTextColor="#999"
//                 value={formData.password}
//                 onChangeText={(value) => handleChange("password", value)}
//                 secureTextEntry={!showPassword}
//               />
//               <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//                 <Icon
//                   name={showPassword ? "eye-outline" : "eye-off-outline"}
//                   size={24}
//                   color="#4CAF50"
//                   style={styles.eyeIcon}
//                 />
//               </TouchableOpacity>
//             </View>
//             {errors.password && (
//               <Text style={styles.errorText}>{errors.password}</Text>
//             )}

//             {errors.form && <Text style={styles.errorText}>{errors.form}</Text>}

//             <TouchableOpacity
//               style={styles.signInButton}
//               onPress={handleSignIn}
//               disabled={loading}
//             >
//               <LinearGradient
//                 colors={["#4CAF50", "#388E3C"]}
//                 style={styles.buttonGradient}
//               >
//                 {loading ? (
//                   <ActivityIndicator size="small" color="#fff" />
//                 ) : (
//                   <Text style={styles.buttonText}>Sign In</Text>
//                 )}
//               </LinearGradient>
//             </TouchableOpacity>

//             <TouchableOpacity onPress={() => router.push("/(auth)/SignUp")}>
//               <Text style={styles.signUpLink}>
//                 Don’t have an account?{" "}
//                 <Text style={styles.signUpText}>Sign Up</Text>
//               </Text>
//             </TouchableOpacity>
//           </Animated.View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#121212" },
//   scrollContent: { flexGrow: 1, justifyContent: "center" },
//   header: {
//     padding: 40,
//     alignItems: "center",
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//   },
//   headerContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   headerTextContainer: { alignItems: "center" },
//   headerText: { color: "#fff", fontSize: 32, fontWeight: "bold" },
//   subHeaderText: { color: "#ddd", fontSize: 16, marginTop: 5 },
//   formContainer: {
//     padding: 20,
//     marginTop: -20,
//     backgroundColor: "#1e1e1e",
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     flex: 1,
//   },
//   inputWrapper: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#333333", // Grey background for fields
//     borderRadius: 12,
//     marginBottom: 15,
//     paddingHorizontal: 10,
//   },
//   inputIcon: { marginRight: 10 },
//   input: {
//     flex: 1,
//     color: "#fff",
//     fontSize: 16,
//     paddingVertical: 12,
//   },
//   eyeIcon: { padding: 10 },
//   errorText: {
//     color: "#D32F2F",
//     fontSize: 14,
//     marginBottom: 15,
//     textAlign: "center",
//   },
//   signInButton: {
//     borderRadius: 12,
//     overflow: "hidden",
//     marginBottom: 20,
//   },
//   buttonGradient: {
//     padding: 15,
//     alignItems: "center",
//   },
//   buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
//   signUpLink: { color: "#bbb", fontSize: 16, textAlign: "center" },
//   signUpText: { color: "#4CAF50", fontWeight: "bold" },
// });

// export default SignIn;

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
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ Import AsyncStorage
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/authContext";

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
      await login(formData.email, formData.password); // ✅ AuthContext handles login

      // 🔽 Fetch Role & Redirect After Login
      const role = await AsyncStorage.getItem("role");

      console.log("Logged-in Role:", role);
      const redirectPath =
        role === "admin" ? "/(tabs)/DashboardPage" : "/(tabs)/AlertsPage";
      router.replace(redirectPath);
    } catch (error) {
      setErrors({ form: error.message || "Sign in failed. Please try again." });
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
            {errors.form && <Text style={styles.errorText}>{errors.form}</Text>}

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
  headerText: { color: "#fff", fontSize: 32, fontWeight: "bold" },
  subHeaderText: { color: "#ddd", fontSize: 16, marginTop: 5 },
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
    paddingVertical: 12,
  },
  eyeIcon: { padding: 10 },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
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
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  signUpLink: { color: "#bbb", fontSize: 16, textAlign: "center" },
  signUpText: { color: "#4CAF50", fontWeight: "bold" },
});

export default SignIn;
