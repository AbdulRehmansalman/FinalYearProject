import React from "react";
import { Tabs } from "expo-router";
import { Text } from "react-native";

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: "#1A1A1A", borderTopWidth: 0 },
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "#fff",
      }}
    >
      <Tabs.Screen
        name="DashboardPage"
        options={tabOptions("🏠", "DashboardPage")}
      />
      <Tabs.Screen name="Alerts" options={tabOptions("🔔", "AlertsPage")} />
      <Tabs.Screen
        name="AlertsDetails"
        options={tabOptions("🔔", "SensorData")}
      />
      {/* <Tabs.Screen
        name="AlertsDetail"
        options={tabOptions("🔔", "AlertsDetail")}
      /> */}
      {/* <Tabs.Screen name="logs" options={tabOptions("📜", "Logs")} />
      <Tabs.Screen name="settings" options={tabOptions("⚙️", "Settings")} /> */}
    </Tabs>
  );
};

const tabOptions = (icon: string, title: string) => ({
  title,
  tabBarIcon: ({ color }: { color: string }) => (
    <Text style={{ color, fontSize: 18 }}>{icon}</Text>
  ),
  headerShown: false,
});

export default TabLayout;
