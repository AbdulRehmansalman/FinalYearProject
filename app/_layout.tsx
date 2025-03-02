import React from "react";
import { Stack, Slot } from "expo-router";
import { AuthProvider } from "../context/authContext";

const RootLayout = () => {
  return (
    <AuthProvider>
      {/* <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack> */}
      <Slot />
    </AuthProvider>
  );
};

export default RootLayout;
