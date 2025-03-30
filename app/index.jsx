import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import { Link } from "expo-router";

const { width, height } = Dimensions.get("window");

const Index = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Image
        // source={{ uri: "https://example.com/beautiful-wildlife-image.jpg" }}
        style={styles.backgroundImage}
      />
      <View style={styles.overlay}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/react-logo.png")}
            style={styles.logo}
          />
        </View>
        <Text style={styles.appName}>Wildlife Prevention System</Text>
        <Link href="/(auth)/SignUp" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Welcome to Our App</Text>
          </TouchableOpacity>
        </Link>
      </View>
      <StatusBar barStyle="dark-content" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundImage: {
    width: width,
    height: height,
    position: "absolute",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 50,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginHorizontal: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 50,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Index;

// // index.jsx
// import React from "react";
// import { View } from "react-native";
// import BirdAnimation from "../components/BirdAnimation"; // Adjust path

// export default function Index() {
//   return (
//     <View style={{ flex: 1 }}>
//       <BirdAnimation /> {/* Line 103 or similar */}
//     </View>
//   );
// }
