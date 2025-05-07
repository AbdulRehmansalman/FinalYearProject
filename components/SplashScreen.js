import React, { useEffect, useRef, useState } from "react";
import { View, Image, StyleSheet, Animated } from "react-native";

// Replace with your app's main screen component
import MainApp from "./MainApp";

const SplashScreen = () => {
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity: 0
  const scaleAnim = useRef(new Animated.Value(0.5)).current; // Initial scale: 0.5

  useEffect(() => {
    // Define the animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, // Fade in to full opacity
        duration: 2000, // 2 seconds
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1, // Scale to full size
        duration: 2000, // 2 seconds
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animation completed, wait briefly then transition
      setTimeout(() => {
        setIsAnimationComplete(true);
      }, 500); // Optional: brief pause before transitioning
    });
  }, [fadeAnim, scaleAnim]);

  // If animation is complete, render the main app
  if (isAnimationComplete) {
    return <MainApp />;
  }

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/logos/logo.png")} // Replace with your logo path
        style={[
          styles.logo,
          {
            opacity: fadeAnim, // Bind opacity to animated value
            transform: [{ scale: scaleAnim }], // Bind scale to animated value
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // Adjust background color as needed
  },
  logo: {
    width: 200, // Adjust size as needed
    height: 200,
    resizeMode: "contain",
  },
});

export default SplashScreen;
