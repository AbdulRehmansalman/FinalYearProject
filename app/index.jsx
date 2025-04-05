import React, { useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
} from "react-native";
import { Link } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const titleAnim = useRef(new Animated.Value(-20)).current;
  const buttonAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Icon animations
  const leafAnim = useRef(new Animated.Value(20)).current;
  const shieldAnim = useRef(new Animated.Value(-20)).current;
  const eyeAnim = useRef(new Animated.Value(0)).current;
  const eyeOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(titleAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 0,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(leafAnim, {
        toValue: 0,
        duration: 800,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.timing(shieldAnim, {
        toValue: 0,
        duration: 800,
        delay: 800,
        useNativeDriver: true,
      }),
      Animated.timing(eyeOpacityAnim, {
        toValue: 0.7,
        duration: 800,
        delay: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(eyeAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Title */}
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: fadeAnim,
            transform: [{ translateY: titleAnim }],
          },
        ]}
      >
        Wildlife Protection System
      </Animated.Text>

      {/* Main Image Container */}
      <View style={styles.imageContainer}>
        {/* Pulse animation around image */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulseAnim }],
              opacity: 0.3,
            },
          ]}
        />

        {/* Main image with animation */}
        <Animated.View
          style={[
            styles.imageWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={require("../assets/images/giphy.gif")}
            style={styles.image}
          />

          {/* Overlay gradient */}
          <View style={styles.imageOverlay} />

          {/* Animated icons */}
          <Animated.View
            style={[
              styles.leafIcon,
              {
                opacity: fadeAnim,
                transform: [{ translateX: leafAnim }],
              },
            ]}
          >
            <Ionicons name="leaf" size={28} color="#4CAF50" />
          </Animated.View>

          <Animated.View
            style={[
              styles.shieldIcon,
              {
                opacity: fadeAnim,
                transform: [{ translateX: shieldAnim }],
              },
            ]}
          >
            <Ionicons name="shield" size={28} color="#4CAF50" />
          </Animated.View>

          <Animated.View
            style={[
              styles.eyeIcon,
              {
                opacity: eyeOpacityAnim,
                transform: [{ scale: eyeAnim }],
              },
            ]}
          >
            <Ionicons name="eye" size={40} color="#4CAF50" />
          </Animated.View>
        </Animated.View>
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
            transform: [{ translateY: buttonAnim }],
          },
        ]}
      >
        <Text style={styles.appName}>Protecting Nature with AI</Text>
        <Text style={styles.description}>
          Join our mission to safeguard wildlife using cutting-edge technology
          and artificial intelligence.
        </Text>

        <View style={styles.buttonContainer}>
          <Link href="/(auth)/SignUp" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Get Started</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
            </TouchableOpacity>
          </Link>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1F0A",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  imageContainer: {
    position: "relative",
    width: width * 0.7,
    aspectRatio: 1,
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  leafIcon: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  shieldIcon: {
    position: "absolute",
    bottom: 15,
    left: 15,
  },
  eyeIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -20,
  },
  overlay: {
    alignItems: "center",
    marginTop: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#CCCCCC",
    textAlign: "center",
    marginBottom: 20,
    maxWidth: width * 0.8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 15,
    marginTop: 10,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  secondaryButton: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonIcon: {
    marginLeft: 8,
  },
});

export default HomeScreen;
