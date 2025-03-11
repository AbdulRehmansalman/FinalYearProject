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

// import React, { useEffect, useMemo } from "react";
// import { Slot, useRouter, useSegments, usePathname } from "expo-router";
// import { AuthProvider, useAuth } from "../context/authContext";
// import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
// import { StatusBar } from "expo-status-bar";
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   StyleSheet,
//   Pressable,
//   Platform,
// } from "react-native";
// import Animated, {
//   FadeIn,
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring,
// } from "react-native-reanimated";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import { LinearGradient } from "expo-linear-gradient";

// // ✅ Define tab configuration based on user roles
// const tabs = [
//   {
//     name: "Dashboard",
//     path: "/(tabs)/DashboardPage",
//     icon: "dashboard",
//     role: "admin",
//   },
//   {
//     name: "Alerts",
//     path: "/(tabs)/AlertsPage",
//     icon: "notifications",
//     role: "both",
//   },
//   {
//     name: "Sensors",
//     path: "/(tabs)/SensorData",
//     icon: "sensors",
//     role: "admin",
//   },
//   {
//     name: "Settings",
//     path: "/(tabs)/Settings",
//     icon: "settings",
//     role: "both",
//   },
//   { name: "Logs", path: "/(tabs)/Logs", icon: "bar-chart", role: "admin" },
// ];

// const LayoutContent = () => {
//   const { user, role, loading } = useAuth();
//   const segments = useSegments();
//   const pathname = usePathname();
//   const router = useRouter();

//   const isAuthScreen = segments[0] === "(auth)";
//   const isDetailPage = pathname.includes("AlertDetailPage");
//   const showTabBar = user && !isAuthScreen && !isDetailPage;

//   // ✅ Ensure navigation happens only when role is set
//   useEffect(() => {
//     if (!loading) {
//       if (!user && !isAuthScreen) {
//         router.replace("/(auth)/SignIn");
//       } else if (user && role) {
//         router.replace(
//           role === "admin" ? "/(tabs)/DashboardPage" : "/(tabs)/AlertsPage"
//         );
//       }
//     }
//   }, [user, role, loading]);

//   // ✅ Optimize tab filtering logic
//   const userTabs = useMemo(() => {
//     if (!role) return [];
//     return tabs.filter((tab) => tab.role === "both" || tab.role === role);
//   }, [role]);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4CAF50" />
//         <Text style={styles.loadingText}>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaProvider>
//       <StatusBar style="light" />
//       <SafeAreaView style={styles.container} edges={["right", "left"]}>
//         <Slot />
//         {showTabBar && <TabBar tabs={userTabs} pathname={pathname} />}
//       </SafeAreaView>
//     </SafeAreaProvider>
//   );
// };

// const TabBar = ({ tabs, pathname }) => {
//   const router = useRouter();

//   return (
//     <Animated.View entering={FadeIn} style={styles.tabBarContainer}>
//       <LinearGradient colors={["#1a1a1a", "#121212"]} style={styles.tabBar}>
//         {tabs.map((tab) => {
//           const isActive = pathname.startsWith(tab.path);
//           const scale = useSharedValue(isActive ? 1.2 : 1);
//           scale.value = withSpring(isActive ? 1.2 : 1, {
//             damping: 10,
//             stiffness: 100,
//           });

//           const indicatorStyle = useAnimatedStyle(() => ({
//             transform: [{ scale: scale.value }],
//             backgroundColor: isActive ? "#4CAF50" : "transparent",
//           }));

//           return (
//             <Pressable
//               key={tab.name}
//               style={styles.tabButton}
//               onPress={() => router.push(tab.path)}
//               android_ripple={{
//                 color: "rgba(255, 255, 255, 0.2)",
//                 borderless: true,
//               }}
//             >
//               <View style={styles.tabContent}>
//                 <Icon
//                   name={tab.icon}
//                   size={28}
//                   color={isActive ? "#4CAF50" : "#BBB"}
//                 />
//                 <Text
//                   style={[
//                     styles.tabLabel,
//                     { color: isActive ? "#4CAF50" : "#BBB" },
//                   ]}
//                 >
//                   {tab.name}
//                 </Text>
//                 <Animated.View
//                   style={[styles.activeIndicator, indicatorStyle]}
//                 />
//               </View>
//             </Pressable>
//           );
//         })}
//       </LinearGradient>
//     </Animated.View>
//   );
// };

// const RootLayout: React.FC = () => (
//   <AuthProvider>
//     <LayoutContent />
//   </AuthProvider>
// );

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#121212",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#121212",
//   },
//   loadingText: {
//     color: "#fff",
//     marginTop: 12,
//     fontSize: 18,
//     fontWeight: "500",
//   },
//   tabBarContainer: {
//     zIndex: 10,
//   },
//   tabBar: {
//     flexDirection: "row",
//     paddingVertical: 10,
//     paddingBottom: Platform.OS === "ios" ? 20 : 10,
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     borderTopWidth: 1,
//     borderTopColor: "#2d2d2d",
//   },
//   tabButton: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 6,
//   },
//   tabContent: {
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   tabLabel: {
//     fontSize: 12,
//     marginTop: 4,
//     fontWeight: "600",
//     textTransform: "uppercase",
//   },
//   activeIndicator: {
//     position: "absolute",
//     width: 6,
//     height: 6,
//     backgroundColor: "#4CAF50",
//     borderRadius: 3,
//     bottom: -10,
//   },
// });

// export default RootLayout;
