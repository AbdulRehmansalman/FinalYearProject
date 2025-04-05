import React from "react";
import { StatusBar } from "expo-status-bar";
import { LogBox } from "react-native";
import { Slot } from "expo-router";
import { AuthProvider } from "../context/authContext";
import { NotificationProvider } from "../context/notificationContext";

// Ignore specific warnings that might be distracting
LogBox.ignoreLogs([
  "Possible Unhandled Promise Rejection",
  "Setting a timer",
  "AsyncStorage has been extracted from react-native core",
]);

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <AuthProvider>
        <NotificationProvider>
          <Slot />
        </NotificationProvider>
      </AuthProvider>
    </>
  );
}
