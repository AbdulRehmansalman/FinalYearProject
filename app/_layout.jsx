import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { LogBox, View, Image, StyleSheet, Text } from "react-native";
import { Slot } from "expo-router";
import { AuthProvider } from "../context/authContext";
import { NotificationProvider } from "../context/notificationContext";
import { SoundProvider } from "../context/SoundContext";

// Ignore specific warnings that might be distracting
LogBox.ignoreLogs([
  "Possible Unhandled Promise Rejection",
  "Setting a timer",
  "AsyncStorage has been extracted from react-native core",
]);

export default function RootLayout() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [imageError, setImageError] = useState(null);

  useEffect(() => {
    console.log("Splash screen mounted");

    // Force splash screen to stay for 5 seconds
    const timer = setTimeout(() => {
      console.log("Splash screen timeout complete");
      setIsSplashVisible(false);
    }, 5000);

    return () => {
      console.log("Splash screen unmounted");
      clearTimeout(timer);
    };
  }, []);

  // Render splash screen
  if (isSplashVisible) {
    return (
      <View style={styles.container}>
        <Image
          source={require("../assets/logos/logo.png")} // Verify this path
          style={styles.logo}
          onLoad={() => console.log("Local image loaded successfully")}
          onError={(error) => {
            console.log("Local image load error:", error.nativeEvent.error);
            setImageError(error.nativeEvent.error);
          }}
        />
        {/* Fallback remote image */}
        {imageError && (
          <>
            <Text style={styles.errorText}>
              Error loading logo: {imageError}
            </Text>
            <Image
              source={{ uri: "https://via.placeholder.com/250x250.png" }}
              style={styles.logo}
              onLoad={() => console.log("Remote image loaded successfully")}
              onError={(error) =>
                console.log("Remote image load error:", error.nativeEvent.error)
              }
            />
          </>
        )}
      </View>
    );
  }

  // Render main app
  return (
    <>
      <StatusBar style="light" />
      <AuthProvider>
        <SoundProvider>
          <NotificationProvider>
            <Slot />
          </NotificationProvider>
        </SoundProvider>
      </AuthProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000", // Red background for high contrast
  },
  logo: {
    width: 350,
    height: 350,
    resizeMode: "contain",
  },
  debugText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: "#fff",
    marginVertical: 10,
  },
});
