import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { View, Text } from "react-native";

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#1A1A1A",
          borderTopWidth: 0,
          height: 60,
        },
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "#B0B0B0",
      }}
    >
      <Tabs.Screen name="Dashboard" options={tabOptions("home", "Dashboard")} />
      <Tabs.Screen
        name="Alerts"
        options={tabOptions("notifications", "Alerts")}
      />
      <Tabs.Screen
        name="SensorData"
        options={tabOptions("pulse", "Sensor Info")}
      />
      <Tabs.Screen name="Logs" options={tabOptions("document-text", "Logs")} />
      <Tabs.Screen
        name="Settings"
        options={tabOptions("settings", "Settings")}
      />
    </Tabs>
  );
};

const tabOptions = (icon: keyof typeof Ionicons.glyphMap, title: string) => ({
  title,
  tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
    <Animatable.View
      animation={focused ? "pulse" : undefined}
      duration={500}
      easing="ease-in-out"
    >
      <Ionicons name={icon} size={26} color={color} />
    </Animatable.View>
  ),
  headerShown: false,
});

export default TabLayout;

// import React from "react";
// import { Tabs } from "expo-router";
// import { Text } from "react-native";
// import * as Animatable from "react-native-animatable";
// import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// const TabLayout = () => {
//   return (
//     <Tabs
//       screenOptions={{
//         tabBarStyle: {
//           backgroundColor: "#1A1A1A",
//           borderTopWidth: 0,
//           height: 65,
//           paddingBottom: 10,
//         },
//         tabBarActiveTintColor: "#4CAF50",
//         tabBarInactiveTintColor: "#fff",
//       }}
//     >
//       <Tabs.Screen
//         name="DashboardPage"
//         options={tabOptions("home-outline", "Dashboard", "DashboardPage")}
//       />
//       <Tabs.Screen
//         name="Alerts"
//         options={tabOptions("bell-outline", "Alerts", "AlertsPage")}
//       />
//       <Tabs.Screen
//         name="Sensor Info"
//         options={tabOptions("chip", "Sensor Data", "SensorData")}
//       />
//       <Tabs.Screen
//         name="Logs"
//         options={tabOptions("file-document-outline", "Logs", "Logs")}
//       />
//       <Tabs.Screen
//         name="Settings"
//         options={tabOptions("cog-outline", "Settings", "Settings")}
//       />
//     </Tabs>
//   );
// };

// const tabOptions = (icon: string, title: string, route: string) => ({
//   title,
//   tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
//     <Animatable.View
//       animation={focused ? "pulse" : "fadeIn"}
//       duration={500}
//       easing="ease-in-out"
//     >
//       <MaterialCommunityIcons name={icon} size={22} color={color} />
//     </Animatable.View>
//   ),
//   headerShown: false,
// });

// export default TabLayout;
