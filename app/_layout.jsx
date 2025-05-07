import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Image, StyleSheet } from "react-native";
import { Slot } from "expo-router";
import { AuthProvider } from "../context/authContext";
import { NotificationProvider } from "../context/notificationContext";
import { SoundProvider } from "../context/SoundContext";
import Toast from "react-native-toast-message";

function RootLayout() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (isSplashVisible) {
    return (
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/logos/logo.jpg")}
            style={styles.logo}
            defaultSource={require("../assets/logos/logo.jpg")}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }

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

export default RootLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 320,
    height: 320,
  },
});
