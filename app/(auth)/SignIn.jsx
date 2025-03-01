// import React, { useState } from "react";
// import {
//   SafeAreaView,
//   ScrollView,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import Animated, { SlideInRight } from "react-native-reanimated";
// import Icon from "react-native-vector-icons/Ionicons";

// const SignIn = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const navigation = useNavigation();

//   const handleLogin = async () => {
//     if (!email || !password) {
//       Alert.alert("Error", "Please enter both email and password");
//       return;
//     }

//     setLoading(true);
//     setTimeout(() => {
//       Alert.alert("Success", "Login successful (Mocked Login)");
//       setLoading(false);
//       navigation.navigate("HomePage"); // Navigate to home page after login
//     }, 2000);
//   };

//   const AnimatedView = Animated.createAnimatedComponent(View);

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
//       <ScrollView keyboardShouldPersistTaps="handled">
//         <AnimatedView
//           entering={SlideInRight}
//           style={{ flex: 1, justifyContent: "center", padding: 20 }}
//         >
//           <Image
//             source={{ uri: "https://example.com/paw-shield.png" }}
//             style={{
//               width: 100,
//               height: 100,
//               resizeMode: "contain",
//               alignSelf: "center",
//               marginBottom: 20,
//             }}
//           />
//           <Text style={styles.title}>Wildlife Prevention System - Login</Text>
//           <TextInput
//             placeholder="Enter email"
//             value={email}
//             onChangeText={setEmail}
//             style={styles.input}
//             placeholderTextColor="#999"
//             keyboardType="email-address"
//             autoCapitalize="none"
//           />
//           <View style={styles.passwordContainer}>
//             <TextInput
//               placeholder="Enter password"
//               value={password}
//               onChangeText={setPassword}
//               style={[styles.input, { flex: 1 }]}
//               placeholderTextColor="#999"
//               secureTextEntry={!showPassword}
//             />
//             <TouchableOpacity
//               onPress={() => setShowPassword(!showPassword)}
//               style={styles.eyeIcon}
//             >
//               <Icon
//                 name={showPassword ? "eye-off" : "eye"}
//                 size={24}
//                 color="white"
//               />
//             </TouchableOpacity>
//           </View>
//           <TouchableOpacity
//             style={[styles.button, loading && styles.disabledButton]}
//             onPress={handleLogin}
//             disabled={loading}
//           >
//             <Text style={styles.buttonText}>Login</Text>
//           </TouchableOpacity>
//           {loading && (
//             <ActivityIndicator color="white" style={{ marginTop: 20 }} />
//           )}
//         </AnimatedView>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = {
//   title: {
//     color: "white",
//     fontSize: 28,
//     fontWeight: "bold",
//     fontFamily: "Arial",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   input: {
//     borderColor: "white",
//     borderWidth: 1,
//     borderRadius: 5,
//     color: "white",
//     width: "90%",
//     height: 50,
//     padding: 10,
//     marginBottom: 15,
//     alignSelf: "center",
//   },
//   passwordContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     width: "90%",
//     alignSelf: "center",
//     marginBottom: 15,
//   },
//   eyeIcon: {
//     position: "absolute",
//     right: 10,
//   },
//   button: {
//     backgroundColor: "#4CAF50",
//     width: "90%",
//     height: 50,
//     borderRadius: 10,
//     justifyContent: "center",
//     alignItems: "center",
//     alignSelf: "center",
//     marginBottom: 15,
//   },
//   disabledButton: {
//     opacity: 0.5,
//   },
//   buttonText: {
//     color: "white",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
// };

// export default SignIn;

import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, { SlideInRight } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import { router } from "expo-router";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigation = useNavigation();

  //   const handleLogin = async () => {
  //     setLoading(true);
  //     setTimeout(() => {
  //       setLoading(false);
  //       navigation.navigate("HomePage"); // Navigate to home page after login
  //     }, 2000);
  //   };

  const handleLogin = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace("/DashboardPage"); // Navigate to Dashboard inside (tabs)
    }, 2000);
  };

  const AnimatedView = Animated.createAnimatedComponent(View);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <AnimatedView
          entering={SlideInRight}
          style={{ flex: 1, justifyContent: "center", padding: 20 }}
        >
          <Image
            source={{ uri: "https://example.com/paw-shield.png" }}
            style={{
              width: 100,
              height: 100,
              resizeMode: "contain",
              alignSelf: "center",
              marginBottom: 20,
            }}
          />
          <Text style={styles.title}>Wildlife Prevention System - Login</Text>
          <TextInput
            placeholder="Enter email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              style={[styles.input, { flex: 1 }]}
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Icon
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          {loading && (
            <ActivityIndicator color="white" style={{ marginTop: 20 }} />
          )}
        </AnimatedView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
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
    alignSelf: "center",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
    marginBottom: 15,
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
  },
  button: {
    backgroundColor: "#4CAF50",
    width: "90%",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
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
};

export default SignIn;
