import React from "react";
import { Stack } from "expo-router";
// import { AuthProvider } from "./context/AuthContext";

const RootLayout = () => {
  return (
    // <AuthProvider>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      {/* <Stack.Screen name="(tabs)" /> */}
    </Stack>
    // </AuthProvider>
  );
};

export default RootLayout;
