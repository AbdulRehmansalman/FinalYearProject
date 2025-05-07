import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Image, StyleSheet } from "react-native";
import { Slot } from "expo-router";
import { AuthProvider } from "../context/authContext";
import { NotificationProvider } from "../context/notificationContext";
import { SoundProvider } from "../context/SoundContext";
import Toast from "react-native-toast-message"; // Import Toast

export default function RootLayout() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    // Force splash screen to stay for 5 seconds
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 5000);

    return () => {
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
          onError={() => {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Failed to load splash screen image.",
              position: "top",
              visibilityTime: 4000,
            });
          }}
        />
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
            <Toast />
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
    backgroundColor: "#000",
  },
  logo: {
    width: 350,
    height: 350,
    resizeMode: "contain",
  },
});
