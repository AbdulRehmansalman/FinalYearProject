// SignUpPage.js
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
// import { useAuth } from "../contexts/AuthContext";
import Animated, { FadeIn } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleInput, setRoleInput] = useState("security");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // const { signup, user } = useAuth();
  const navigation = useNavigation();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;
  const validatePhone = (phone) => /^\+\d{10,15}$/.test(phone);

  const handleSignUp = async () => {
    if (user && user.role !== "admin") {
      Alert.alert("Access Denied", "Only admins can sign up new users");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 6 characters long"
      );
      return;
    }

    if (!validatePhone(phoneNumber)) {
      Alert.alert(
        "Invalid Phone Number",
        "Please enter a valid phone number starting with +"
      );
      return;
    }

    setLoading(true);

    try {
      await signup(email, password, roleInput, phoneNumber);
      Alert.alert("Success", "Account created successfully!");
      navigation.navigate("SignIn");
    } catch (error) {
      Alert.alert("Signup Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeIn} style={styles.content}>
          <Image
            source={require("../../assets/images/react-logo.png")}
            style={styles.logo}
          />

          <Text style={styles.title}>Sign Up</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Enter password (6+ chars)"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={roleInput}
              onValueChange={(itemValue) => setRoleInput(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Admin" value="admin" />
              <Picker.Item label="Security" value="security" />
            </Picker>
          </View>
          <TextInput
            style={styles.input}
            placeholder="+1234567890"
            placeholderTextColor="#999"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={styles.loginText}>Have an account? Login</Text>
          </TouchableOpacity>
          {loading && <ActivityIndicator color="white" style={styles.loader} />}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: "Arial",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 5,
    color: "white",
    width: "90%",
    height: 50,
    padding: 10,
    marginBottom: 15,
  },
  passwordContainer: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
  },
  pickerContainer: {
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 5,
    width: "90%",
    marginBottom: 15,
    overflow: "hidden",
  },
  picker: {
    color: "white",
    backgroundColor: "#4CAF50",
  },
  button: {
    backgroundColor: "#4CAF50",
    width: "90%",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginText: {
    color: "white",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  loader: {
    marginTop: 20,
  },
});

export default SignUp;

// SignUpPage.js
// import { useState } from "react";
// import {
//   SafeAreaView,
//   ScrollView,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   StyleSheet,
//   Keyboard,
//   TouchableWithoutFeedback,
// } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import { useAuth } from "../context/AuthContext";
// import { useRouter } from "expo-router";
// import Icon from "react-native-vector-icons/Ionicons";
// import { auth, db } from "../FirebaseConfig"; // ✅ Corrected import for auth & db
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { doc, setDoc } from "firebase/firestore";

// const SignUp = () => {
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("security");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//   const validatePassword = (password) => password.length >= 6;
//   const validatePhone = (phone) => /^\+?\d{10,15}$/.test(phone);

//   const handleSignUp = async () => {
//     Keyboard.dismiss();

//     if (!validateEmail(email)) {
//       Alert.alert("Invalid Email", "Please enter a valid email address");
//       return;
//     }
//     if (!validatePassword(password)) {
//       Alert.alert(
//         "Invalid Password",
//         "Password must be at least 6 characters long"
//       );
//       return;
//     }
//     if (!validatePhone(phoneNumber)) {
//       Alert.alert(
//         "Invalid Phone Number",
//         "Enter a valid phone number starting with + if needed"
//       );
//       return;
//     }

//     setLoading(true);
//     try {
//       // 🔥 Firebase Authentication - Create User
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       const user = userCredential.user;

//       // 🔥 Firestore - Save User Info
//       await setDoc(doc(db, "users", user.uid), {
//         email,
//         role,
//         phoneNumber,
//         active: true,
//       });

//       Alert.alert("Success", "Account created successfully!");
//       router.replace("/login");
//     } catch (error) {
//       console.error("Signup Error:", error);
//       Alert.alert("Signup Failed", error.message || "Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//       <SafeAreaView style={styles.container}>
//         <ScrollView
//           keyboardShouldPersistTaps="handled"
//           contentContainerStyle={styles.content}
//         >
//           <Text style={styles.title}>Sign Up</Text>

//           <TextInput
//             style={styles.input}
//             placeholder="Enter email"
//             placeholderTextColor="#999"
//             value={email}
//             onChangeText={setEmail}
//             keyboardType="email-address"
//             autoCapitalize="none"
//           />

//           <View style={styles.passwordContainer}>
//             <TextInput
//               style={[styles.input, styles.passwordInput]}
//               placeholder="Enter password (6+ chars)"
//               placeholderTextColor="#999"
//               value={password}
//               onChangeText={setPassword}
//               secureTextEntry={!showPassword}
//             />
//             <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//               <Icon
//                 name={showPassword ? "eye-off" : "eye"}
//                 size={24}
//                 color="white"
//               />
//             </TouchableOpacity>
//           </View>

//           <View style={styles.pickerContainer}>
//             <Picker
//               selectedValue={role}
//               onValueChange={setRole}
//               style={styles.picker}
//             >
//               <Picker.Item label="Admin" value="admin" />
//               <Picker.Item label="Security" value="security" />
//             </Picker>
//           </View>

//           <TextInput
//             style={styles.input}
//             placeholder="Enter phone number"
//             placeholderTextColor="#999"
//             value={phoneNumber}
//             onChangeText={setPhoneNumber}
//             keyboardType="phone-pad"
//           />

//           <TouchableOpacity
//             style={[styles.button, loading && styles.disabledButton]}
//             onPress={handleSignUp}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator color="white" />
//             ) : (
//               <Text style={styles.buttonText}>Sign Up</Text>
//             )}
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => router.replace("/login")}>
//             <Text style={styles.loginText}>Already have an account? Login</Text>
//           </TouchableOpacity>
//         </ScrollView>
//       </SafeAreaView>
//     </TouchableWithoutFeedback>
//   );
// };

// // ✅ Styling
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#000" },
//   content: {
//     flexGrow: 1,
//     justifyContent: "center",
//     padding: 20,
//     alignItems: "center",
//   },
//   title: { color: "white", fontSize: 28, fontWeight: "bold", marginBottom: 20 },
//   input: {
//     borderColor: "white",
//     borderWidth: 1,
//     borderRadius: 5,
//     color: "white",
//     width: "90%",
//     height: 50,
//     padding: 10,
//     marginBottom: 15,
//   },
//   passwordContainer: {
//     width: "90%",
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   passwordInput: { flex: 1 },
//   pickerContainer: {
//     borderColor: "white",
//     borderWidth: 1,
//     borderRadius: 5,
//     width: "90%",
//     marginBottom: 15,
//     overflow: "hidden",
//   },
//   picker: { color: "white", backgroundColor: "#4CAF50" },
//   button: {
//     backgroundColor: "#4CAF50",
//     width: "90%",
//     height: 50,
//     borderRadius: 10,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   disabledButton: { opacity: 0.5 },
//   buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
//   loginText: { color: "white", fontSize: 16, textDecorationLine: "underline" },
// });

// export default SignUp;
