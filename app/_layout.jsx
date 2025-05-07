import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Slot, useNavigationContainerRef } from "expo-router";
import { AuthProvider } from "../context/authContext";
import { NotificationProvider } from "../context/notificationContext";
import { SoundProvider } from "../context/SoundContext";
import Toast from "react-native-toast-message";
import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import { SENTRY_DSN } from "@env";

// Initialize Sentry for production builds
if (Constants.executionEnvironment !== "expoGo") {
  if (!SENTRY_DSN) {
    console.warn("SENTRY_DSN is missing. Sentry will not be initialized.");
  } else {
    Sentry.init({
      dsn: SENTRY_DSN,
      sendDefaultPii: true,
      enabled: process.env.NODE_ENV === "production",
      debug: process.env.NODE_ENV !== "production",
    });
  }
}

function RootLayout() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 3000);

    let listener;
    if (navigationRef) {
      listener = navigationRef.addListener("state", () => {
        const currentRoute = navigationRef.getCurrentRoute();
        if (
          currentRoute &&
          Constants.executionEnvironment !== "expoGo" &&
          SENTRY_DSN
        ) {
          Sentry.setTag("screen", currentRoute.name);
          Sentry.addBreadcrumb({
            category: "navigation",
            message: `Navigated to ${currentRoute.name}`,
            level: "info",
          });
        }
      });
    }

    return () => {
      clearTimeout(timer);
      if (listener) listener();
    };
  }, [navigationRef]);

  const handleTap = () => {
    setTapCount((prev) => prev + 1);
    if (tapCount + 1 >= 3 && process.env.NODE_ENV !== "production") {
      setShowDebug(true);
    }
  };

  if (isSplashVisible) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.logoContainer} onPress={handleTap}>
          <Image
            source={require("../assets/logos/logo.png")}
            style={styles.logo}
            defaultSource={require("../assets/logos/icon.png")}
            resizeMode="contain"
          />
        </TouchableOpacity>
        {showDebug && process.env.NODE_ENV !== "production" && (
          <TouchableOpacity
            onPress={() => {
              try {
                const testError = new Error("Test Sentry error");
                if (Constants.executionEnvironment !== "expoGo" && SENTRY_DSN) {
                  Sentry.captureException(testError);
                }
                Toast.show({
                  type: "info",
                  text1: "Test Error",
                  text2: SENTRY_DSN
                    ? "Sentry test error triggered"
                    : "Sentry test error triggered (disabled)",
                  position: "top",
                  visibilityTime: 4000,
                });
              } catch (error) {
                console.warn("Test button error:", error);
                if (Constants.executionEnvironment !== "expoGo" && SENTRY_DSN) {
                  Sentry.captureException(error);
                }
              }
            }}
            style={styles.testButton}
          >
            <Text style={styles.testButtonText}>Test Sentry</Text>
          </TouchableOpacity>
        )}
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
  testButton: {
    padding: 10,
    backgroundColor: "#007AFF",
    margin: 10,
    borderRadius: 5,
  },
  testButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});
