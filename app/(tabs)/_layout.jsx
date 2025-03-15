// import React from "react";
// import { Tabs } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import * as Animatable from "react-native-animatable";
// import { View, Text } from "react-native";

// const TabLayout = () => {
//   return (
//     <Tabs
//       screenOptions={{
//         tabBarStyle: {
//           backgroundColor: "#1A1A1A",
//           borderTopWidth: 0,
//           height: 60,
//         },
//         tabBarActiveTintColor: "#4CAF50",
//         tabBarInactiveTintColor: "#B0B0B0",
//       }}
//     >
//       <Tabs.Screen name="Dashboard" options={tabOptions("home", "Dashboard")} />
//       <Tabs.Screen
//         name="Alerts"
//         options={tabOptions("notifications", "Alerts")}
//       />
//       <Tabs.Screen
//         name="SensorData"
//         options={tabOptions("pulse", "Sensor Info")}
//       />
//       <Tabs.Screen name="Logs" options={tabOptions("document-text", "Logs")} />
//       <Tabs.Screen
//         name="Settings"
//         options={tabOptions("settings", "Settings")}
//       />
//     </Tabs>
//   );
// };

// const tabOptions = (icon: keyof typeof Ionicons.glyphMap, title: string) => ({
//   title,
//   tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
//     <Animatable.View
//       animation={focused ? "pulse" : undefined}
//       duration={500}
//       easing="ease-in-out"
//     >
//       <Ionicons name={icon} size={26} color={color} />
//     </Animatable.View>
//   ),
//   headerShown: false,
// });

// export default TabLayout;

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Slot, useRouter, usePathname } from "expo-router";
import { useAuth } from "../../context/authContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from "react-native";
import Animated, { SlideInUp } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";

const tabs = [
  {
    name: "Home",
    path: "/DashboardPage",
    icon: "home-outline",
    activeIcon: "home",
    roles: ["admin"],
  },
  {
    name: "Alerts",
    path: "/AlertsPage",
    icon: "notifications-outline",
    activeIcon: "notifications",
    roles: ["admin", "security"],
  },
  {
    name: "Sensors",
    path: "/SensorData",
    icon: "hardware-chip-outline",
    activeIcon: "hardware-chip",
    roles: ["admin"],
  },
  {
    name: "Settings",
    path: "/Setting",
    icon: "settings-outline",
    activeIcon: "settings",
    roles: ["admin"],
  },
  {
    name: "Logs",
    path: "/Logs",
    icon: "document-text-outline",
    activeIcon: "document-text",
    roles: ["admin"],
  },
];

const TabsLayout = () => {
  const { user, role, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isDetailPage = pathname?.includes("AlertDetailPage");

  // Memoized user tabs to avoid unnecessary state updates
  const userTabs = useMemo(() => {
    return role && user ? tabs.filter((tab) => tab.roles.includes(role)) : [];
  }, [role, user]);

  // Redirect user after authentication is checked
  useEffect(() => {
    if (!loading && user && pathname === "/(tabs)") {
      router.replace(role === "admin" ? "/DashboardPage" : "/AlertsPage");
    }
  }, [user, role, loading, pathname, router]);

  if (loading || !user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
        <StatusBar style="light" />
        <View style={styles.contentContainer}>
          <Slot />
        </View>
      </SafeAreaView>
      {!isDetailPage && <TabBar tabs={userTabs} currentPath={pathname || ""} />}
    </View>
  );
};

const TabBar = ({ tabs, currentPath }) => {
  const router = useRouter();

  // Memoized active tab for performance optimization
  const activeTab = useMemo(() => {
    return tabs.find((tab) => currentPath.startsWith(tab.path))?.path || "";
  }, [tabs, currentPath]);

  // Optimized tab press function to prevent unnecessary re-renders
  const handleTabPress = useCallback(
    (tabPath) => {
      if (activeTab !== tabPath) {
        router.replace(tabPath); // Faster than `push`
      }
    },
    [activeTab, router]
  );

  return (
    <SafeAreaView edges={["bottom"]} style={styles.tabBarSafeArea}>
      <Animated.View
        entering={SlideInUp.duration(200)}
        style={styles.tabBarContainer}
      >
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.path;

            return (
              <Pressable
                key={tab.name}
                onPress={() => handleTabPress(tab.path)}
                style={styles.tabButton}
                delayPressIn={0} // Removes press delay
              >
                <Icon
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={24}
                  color={isActive ? "#4CAF50" : "#B0BEC5"}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isActive ? "#4CAF50" : "#B0BEC5" },
                  ]}
                >
                  {tab.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#121212" },
  container: { flex: 1, backgroundColor: "#121212" },
  contentContainer: { flex: 1, paddingBottom: 70 },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  tabBarSafeArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1E1E1E",
  },
  tabBarContainer: {
    backgroundColor: "#1E1E1E",
    borderTopWidth: 1,
    borderTopColor: "#333333",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    paddingBottom: 12,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default TabsLayout;
