// import React, {
//   useEffect,
//   useRef,
//   useMemo,
//   useCallback,
//   createContext,
//   useContext,
//   useState,
// } from "react";
// import { StatusBar } from "expo-status-bar";
// import * as Notifications from "expo-notifications";
// import { Slot, useRouter, usePathname, Platform } from "expo-router";
// import { useAuth } from "../../context/authContext";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   StyleSheet,
//   Pressable,
// } from "react-native";
// import Animated, { SlideInUp } from "react-native-reanimated";
// import Icon from "react-native-vector-icons/Ionicons";
// import { db } from "../../services/firebase";
// import {
//   collection,
//   query,
//   onSnapshot,
//   getDoc,
//   doc,
//   updateDoc,
//   arrayUnion,
//   getDocs,
//   where,
// } from "firebase/firestore";
// import { Timestamp } from "firebase/firestore";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // Sensor Status Context
// const SensorStatusContext = createContext();

// const SensorStatusProvider = ({ children }) => {
//   const [disconnectedCount, setDisconnectedCount] = useState(0);
//   return (
//     <SensorStatusContext.Provider
//       value={{ disconnectedCount, setDisconnectedCount }}
//     >
//       {children}
//     </SensorStatusContext.Provider>
//   );
// };

// const useSensorStatus = () => {
//   const context = useContext(SensorStatusContext);
//   if (context === undefined) {
//     throw new Error(
//       "useSensorStatus must be used within a SensorStatusProvider"
//     );
//   }
//   return context;
// };

// const tabs = [
//   {
//     name: "Home",
//     path: "/DashboardPage",
//     icon: "home-outline",
//     activeIcon: "home",
//     roles: ["admin"],
//   },
//   {
//     name: "Alerts",
//     path: "/AlertsPage",
//     icon: "notifications-outline",
//     activeIcon: "notifications",
//     roles: ["admin", "security"],
//   },
//   {
//     name: "Sensors",
//     path: "/SensorData",
//     icon: "hardware-chip-outline",
//     activeIcon: "hardware-chip",
//     roles: ["admin"],
//   },
//   {
//     name: "Settings",
//     path: "/Setting",
//     icon: "settings-outline",
//     activeIcon: "settings",
//     roles: ["admin"],
//   },
//   {
//     name: "Logs",
//     path: "/Logs",
//     icon: "document-text-outline",
//     activeIcon: "document-text",
//     roles: ["admin"],
//   },
// ];

// // Main content component to use context
// const MainContent = () => {
//   const { user, role, loading } = useAuth();
//   const pathname = usePathname();
//   const router = useRouter();
//   const isDetailPage = pathname?.includes("AlertDetailPage");
//   const notifiedAlertsRef = useRef(new Set()).current;
//   const deviceCache = useRef(new Map()).current;
//   const loginTimeRef = useRef(null);
//   const { setDisconnectedCount } = useSensorStatus(); // Moved inside provider scope

//   useEffect(() => {
//     if (user && role === "admin" && !loginTimeRef.current) {
//       loginTimeRef.current = new Date();
//       console.log("Admin logged in at:", loginTimeRef.current.toISOString());
//     }
//   }, [user, role]);

//   // Monitor sensor status globally
//   useEffect(() => {
//     if (!user || role !== "admin") return;

//     const monitorSensors = async () => {
//       try {
//         const storedDeviceId = await AsyncStorage.getItem("device_id");
//         if (!storedDeviceId) {
//           console.log(
//             "No device ID found in AsyncStorage for sensor monitoring"
//           );
//           setDisconnectedCount(0);
//           return;
//         }

//         const sensorsQuery = query(
//           collection(db, "sensors"),
//           where("deviceId", "==", storedDeviceId)
//         );

//         const unsubscribe = onSnapshot(
//           sensorsQuery,
//           (querySnapshot) => {
//             if (!querySnapshot.empty) {
//               const sensorDoc = querySnapshot.docs[0];
//               const data = sensorDoc.data();
//               const sensorReading = data.sensorReading || {};

//               const sensorsArray = Object.entries(sensorReading)
//                 .map(([key, value]) => {
//                   if (!value || typeof value !== "object") return null;
//                   const status =
//                     value.status === true || value.status === "true";
//                   return { connected: status };
//                 })
//                 .filter((sensor) => sensor !== null);

//               const disconnectedCount = sensorsArray.filter(
//                 (sensor) => !sensor.connected
//               ).length;
//               setDisconnectedCount(disconnectedCount);
//               console.log(
//                 `Updated disconnected sensor count: ${disconnectedCount}`
//               );
//             } else {
//               setDisconnectedCount(0);
//             }
//           },
//           (error) => {
//             console.error("Sensor monitoring error:", error);
//             setDisconnectedCount(0);
//           }
//         );

//         return () => unsubscribe();
//       } catch (error) {
//         console.error("Error setting up sensor monitoring:", error);
//         setDisconnectedCount(0);
//       }
//     };

//     monitorSensors();
//   }, [user, role, setDisconnectedCount]);

//   useEffect(() => {
//     const setupNotifications = async () => {
//       if (Platform.OS === "android") {
//         await Notifications.setNotificationChannelAsync("default", {
//           name: "default",
//           importance: Notifications.AndroidImportance.MAX,
//           vibrationPattern: [0, 250, 250, 250],
//           lightColor: "#FF231F7C",
//         });
//       }

//       const { status } = await Notifications.requestPermissionsAsync();
//       console.log("Notification permission status:", status);
//       if (status !== "granted") {
//         console.log("Notification permissions not granted");
//         alert(
//           "Please enable notifications in your device settings to receive alerts."
//         );
//         return;
//       }

//       Notifications.setNotificationHandler({
//         handleNotification: async () => ({
//           shouldShowAlert: true,
//           shouldPlaySound: true,
//           shouldSetBadge: true,
//         }),
//       });

//       await Notifications.setNotificationCategoryAsync("SECURITY_RESPONSE", [
//         {
//           identifier: "APPROVE",
//           buttonTitle: "Approve",
//           options: { isDestructive: false, isAuthenticationRequired: false },
//         },
//       ]);

//       const foregroundSubscription =
//         Notifications.addNotificationReceivedListener((notification) => {
//           const { alertId } = notification.request.content.data || {};
//           console.log(
//             "Foreground notification received, data:",
//             notification.request.content.data
//           );
//         });

//       const backgroundSubscription =
//         Notifications.addNotificationResponseReceivedListener(
//           async (response) => {
//             const { notification, actionIdentifier } = response;
//             const { alertId } = notification.request.content.data || {};
//             console.log(
//               "Notification response received, data:",
//               response.notification.request.content.data,
//               "actionIdentifier:",
//               actionIdentifier
//             );

//             if (alertId) {
//               if (
//                 actionIdentifier === "APPROVE" &&
//                 user &&
//                 role === "security"
//               ) {
//                 try {
//                   const alertRef = doc(db, "alerts", alertId);
//                   await updateDoc(alertRef, {
//                     securityRespond: arrayUnion(user.uid),
//                   });
//                   console.log(
//                     `Security user ${user.uid} approved alert ${alertId}`
//                   );

//                   const notificationQuery = query(
//                     collection(db, "notifications"),
//                     where("alertId", "==", alertId)
//                   );
//                   const notificationSnap = await getDocs(notificationQuery);
//                   notificationSnap.forEach(async (doc) => {
//                     await updateDoc(doc.ref, {
//                       responseAction: "approve",
//                       responseTimestamp: Timestamp.now(),
//                     });
//                   });
//                   console.log(
//                     `Updated notifications collection for alert ${alertId}`
//                   );
//                 } catch (error) {
//                   console.error("Error handling approve action:", error);
//                 }
//               } else if (
//                 actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
//               ) {
//                 try {
//                   router.push({
//                     pathname: "/(tabs)/AlertDetailPage",
//                     params: { alertId },
//                   });
//                 } catch (error) {
//                   console.error("Error navigating to AlertDetailPage:", error);
//                 }
//               }
//             } else {
//               console.log("No alertId found in notification data");
//             }
//           }
//         );

//       return () => {
//         if (foregroundSubscription)
//           Notifications.removeNotificationSubscription(foregroundSubscription);
//         if (backgroundSubscription)
//           Notifications.removeNotificationSubscription(backgroundSubscription);
//       };
//     };

//     setupNotifications();
//   }, [router, user, role]);

//   useEffect(() => {
//     if (!loading && !user && !pathname.startsWith("/(auth)")) {
//       router.replace("/(auth)/SignIn");
//     }
//   }, [user, loading, pathname, router]);

//   useEffect(() => {
//     if (!loading && user && pathname === "/(tabs)") {
//       router.replace(role === "admin" ? "/DashboardPage" : "/AlertsPage");
//     }
//   }, [user, role, loading, pathname, router]);

//   const resolveDeviceName = async (deviceId) => {
//     let resolvedDeviceId = "Unknown";
//     if (deviceId) {
//       const fieldId = typeof deviceId === "string" ? deviceId : deviceId.id;
//       if (deviceCache.has(fieldId)) {
//         resolvedDeviceId = deviceCache.get(fieldId);
//       } else {
//         try {
//           const docRef =
//             typeof deviceId === "object" && "path" in deviceId
//               ? deviceId
//               : doc(db, "devices", deviceId);
//           const docSnap = await getDoc(docRef);
//           resolvedDeviceId = docSnap.exists()
//             ? docSnap.data().name || docSnap.id
//             : docRef.id;
//           deviceCache.set(fieldId, resolvedDeviceId);
//         } catch (error) {
//           console.error("Error resolving device reference:", error);
//         }
//       }
//     }
//     return resolvedDeviceId;
//   };

//   const formatDate = (timestamp) => {
//     return timestamp?.toDate().toLocaleString() || "N/A";
//   };

//   useEffect(() => {
//     if (!user || role !== "admin") {
//       console.log(
//         "Skipping notification listener: Not an admin or not logged in"
//       );
//       return;
//     }

//     if (!loginTimeRef.current) {
//       console.log("Login time not set yet, waiting...");
//       return;
//     }

//     console.log("Setting up real-time notification listener for admin");

//     const alertsQuery = query(collection(db, "alerts"));

//     const unsubscribe = onSnapshot(
//       alertsQuery,
//       async (querySnapshot) => {
//         console.log(
//           "onSnapshot triggered, changes:",
//           querySnapshot.docChanges().length
//         );
//         if (querySnapshot.docChanges().length === 0) {
//           console.log("No changes detected in onSnapshot");
//           return;
//         }

//         for (const change of querySnapshot.docChanges()) {
//           console.log(
//             `Processing change: type=${change.type}, docId=${change.doc.id}`
//           );

//           if (change.type !== "added") {
//             console.log(
//               `Skipping change type: ${change.type} for docId=${change.doc.id}`
//             );
//             continue;
//           }

//           const newAlert = change.doc.data();
//           const alertId = change.doc.id;
//           console.log("New alert detected:", {
//             alertId,
//             alertData: {
//               occur_at: newAlert.occur_at?.toDate().toISOString(),
//               deviceId: newAlert.deviceId,
//               status: newAlert.status,
//             },
//           });

//           if (notifiedAlertsRef.has(alertId)) {
//             console.log(`Alert ${alertId} already notified`);
//             continue;
//           }

//           const alertTime = newAlert.occur_at?.toDate();
//           if (!alertTime) {
//             console.log(`Alert ${alertId} has no valid occur_at timestamp`);
//             continue;
//           }

//           if (alertTime <= loginTimeRef.current) {
//             console.log(
//               `Alert ${alertId} occurred before login at ${loginTimeRef.current.toISOString()}, skipping`
//             );
//             continue;
//           }

//           const currentTime = new Date();
//           const timeDiff = currentTime - alertTime;
//           const timeWindow = 5 * 1000;

//           console.log(
//             `Alert ${alertId} - Current Time: ${currentTime.toISOString()}`
//           );
//           console.log(
//             `Alert ${alertId} - Alert Time: ${alertTime.toISOString()}`
//           );
//           console.log(`Alert ${alertId} - Time Difference: ${timeDiff} ms`);

//           if (timeDiff >= 0 && timeDiff <= timeWindow) {
//             console.log(
//               `Alert ${alertId} meets time criteria: timeDiff = ${timeDiff}`
//             );

//             const deviceId = newAlert.deviceId;
//             const resolvedDeviceId = await resolveDeviceName(deviceId);
//             console.log(
//               `Resolved device ID for alert ${alertId}: ${resolvedDeviceId}`
//             );

//             notifiedAlertsRef.add(alertId);
//             console.log(`Marked alert ${alertId} as notified`);

//             await Notifications.scheduleNotificationAsync({
//               content: {
//                 title: "New Alert Detected",
//                 body: `A new alert from device ${resolvedDeviceId} at ${formatDate(
//                   newAlert.occur_at
//                 )}`,
//                 data: { alertId },
//               },
//               trigger: null,
//             });
//             console.log(`Notification scheduled for alert ${alertId}`);
//           } else {
//             console.log(
//               `Alert ${alertId} does not meet time criteria: timeDiff = ${timeDiff}`
//             );
//           }
//         }
//       },
//       (error) => {
//         console.error("Global real-time listener error:", error);
//       }
//     );

//     return () => {
//       console.log("Cleaning up notification listener");
//       unsubscribe();
//     };
//   }, [user, role]);

//   const userTabs = useMemo(() => {
//     return role && user ? tabs.filter((tab) => tab.roles.includes(role)) : [];
//   }, [role, user]);

//   if (loading || !user) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4CAF50" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <View style={styles.mainContainer}>
//       <SafeAreaView style={styles.container} edges={["right", "left", "top"]}>
//         <StatusBar style="dark" />
//         <View style={styles.contentContainer}>
//           <Slot />
//         </View>
//       </SafeAreaView>
//       {!isDetailPage && <TabBar tabs={userTabs} currentPath={pathname || ""} />}
//     </View>
//   );
// };

// const TabsLayout = () => {
//   return (
//     <SensorStatusProvider>
//       <MainContent />
//     </SensorStatusProvider>
//   );
// };

// const TabBar = ({ tabs, currentPath }) => {
//   const router = useRouter();
//   const { disconnectedCount } = useSensorStatus();

//   const activeTab = useMemo(() => {
//     return tabs.find((tab) => currentPath.startsWith(tab.path))?.path || "";
//   }, [tabs, currentPath]);

//   const handleTabPress = useCallback(
//     (tabPath) => {
//       if (activeTab !== tabPath) {
//         router.replace(tabPath);
//       }
//     },
//     [activeTab, router]
//   );

//   const TabIconWithBadge = ({ name, isActive, tabName }) => (
//     <View style={styles.tabIconContainer}>
//       <Icon
//         name={
//           isActive
//             ? tabs.find((t) => t.name === tabName).activeIcon
//             : tabs.find((t) => t.name === tabName).icon
//         }
//         size={24}
//         color={isActive ? "#4CAF50" : "#B0BEC5"}
//       />
//       {tabName === "Sensors" && disconnectedCount > 0 && (
//         <View style={styles.badge}>
//           <Text style={styles.badgeText}>{disconnectedCount}</Text>
//         </View>
//       )}
//     </View>
//   );

//   return (
//     <SafeAreaView edges={["bottom"]} style={styles.tabBarSafeArea}>
//       <Animated.View
//         entering={SlideInUp.duration(200)}
//         style={styles.tabBarContainer}
//       >
//         <View style={styles.tabBar}>
//           {tabs.map((tab) => {
//             const isActive = activeTab === tab.path;

//             return (
//               <Pressable
//                 key={tab.name}
//                 onPress={() => handleTabPress(tab.path)}
//                 style={styles.tabButton}
//                 delayPressIn={0}
//               >
//                 <TabIconWithBadge
//                   name={tab.name}
//                   isActive={isActive}
//                   tabName={tab.name}
//                 />
//                 <Text
//                   style={[
//                     styles.tabLabel,
//                     { color: isActive ? "#4CAF50" : "#B0BEC5" },
//                   ]}
//                 >
//                   {tab.name}
//                 </Text>
//               </Pressable>
//             );
//           })}
//         </View>
//       </Animated.View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   mainContainer: { flex: 1, backgroundColor: "#121212" },
//   container: { flex: 1, backgroundColor: "#121212" },
//   contentContainer: { flex: 1, paddingBottom: 70 },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: "#000",
//     justifyContent: "center",
//   },
//   tabBarSafeArea: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: "#1E1E1E",
//   },
//   tabBarContainer: {
//     backgroundColor: "#1E1E1E",
//     borderTopWidth: 1,
//     borderTopColor: "#333333",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   tabBar: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     paddingTop: 12,
//     paddingBottom: 12,
//   },
//   tabButton: {
//     alignItems: "center",
//     justifyContent: "center",
//     flex: 1,
//     paddingVertical: 6,
//   },
//   tabLabel: {
//     fontSize: 12,
//     marginTop: 4,
//     fontWeight: "600",
//     textAlign: "center",
//   },
//   tabIconContainer: {
//     position: "relative",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   badge: {
//     position: "absolute",
//     top: -5,
//     right: -5,
//     backgroundColor: "#D32F2F",
//     borderRadius: 10,
//     minWidth: 20,
//     height: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 4,
//   },
//   badgeText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "bold",
//   },
// });

// export default TabsLayout;

import React, {
  useEffect,
  useRef,
  useMemo,
  useCallback,
  createContext,
  useContext,
  useState,
} from "react";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { Slot, useRouter, usePathname, Platform } from "expo-router";
import { useAuth } from "../../context/authContext";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from "react-native";
import Animated, { SlideInUp } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import { db } from "../../services/firebase";
import {
  collection,
  query,
  onSnapshot,
  getDoc,
  doc,
  where,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Sensor Status Context
const SensorStatusContext = createContext();

const SensorStatusProvider = ({ children }) => {
  const [disconnectedCount, setDisconnectedCount] = useState(0);
  return (
    <SensorStatusContext.Provider
      value={{ disconnectedCount, setDisconnectedCount }}
    >
      {children}
    </SensorStatusContext.Provider>
  );
};

const useSensorStatus = () => {
  const context = useContext(SensorStatusContext);
  if (context === undefined) {
    throw new Error(
      "useSensorStatus must be used within a SensorStatusProvider"
    );
  }
  return context;
};

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

// Main content component to use context
const MainContent = () => {
  const { user, role, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isDetailPage = pathname?.includes("AlertDetailPage");
  const notifiedAlertsRef = useRef(new Set()).current;
  const deviceCache = useRef(new Map()).current;
  const loginTimeRef = useRef(null);
  const { setDisconnectedCount } = useSensorStatus();

  useEffect(() => {
    if (user && !loginTimeRef.current) {
      loginTimeRef.current = new Date();
      console.log(`${role} logged in at:`, loginTimeRef.current.toISOString());
    }
  }, [user, role]);

  // Monitor sensor status globally
  useEffect(() => {
    if (!user || role !== "admin") return;

    const monitorSensors = async () => {
      try {
        const storedDeviceId = await AsyncStorage.getItem("device_id");
        if (!storedDeviceId) {
          console.log(
            "No device ID found in AsyncStorage for sensor monitoring"
          );
          setDisconnectedCount(0);
          return;
        }

        const sensorsQuery = query(
          collection(db, "sensors"),
          where("deviceId", "==", storedDeviceId)
        );

        const unsubscribe = onSnapshot(
          sensorsQuery,
          (querySnapshot) => {
            if (!querySnapshot.empty) {
              const sensorDoc = querySnapshot.docs[0];
              const data = sensorDoc.data();
              const sensorReading = data.sensorReading || {};

              const sensorsArray = Object.entries(sensorReading)
                .map(([key, value]) => {
                  if (!value || typeof value !== "object") return null;
                  const status =
                    value.status === true || value.status === "true";
                  return { connected: status };
                })
                .filter((sensor) => sensor !== null);

              const disconnectedCount = sensorsArray.filter(
                (sensor) => !sensor.connected
              ).length;
              setDisconnectedCount(disconnectedCount);
              console.log(
                `Updated disconnected sensor count: ${disconnectedCount}`
              );
            } else {
              setDisconnectedCount(0);
            }
          },
          (error) => {
            console.error("Sensor monitoring error:", error);
            setDisconnectedCount(0);
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.error("Error setting up sensor monitoring:", error);
        setDisconnectedCount(0);
      }
    };

    monitorSensors();
  }, [user, role, setDisconnectedCount]);

  useEffect(() => {
    const setupNotifications = async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      const { status } = await Notifications.requestPermissionsAsync();
      console.log("Notification permission status:", status);
      if (status !== "granted") {
        console.log("Notification permissions not granted");
        alert(
          "Please enable notifications in your device settings to receive alerts."
        );
        return;
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      const foregroundSubscription =
        Notifications.addNotificationReceivedListener((notification) => {
          const { alertId } = notification.request.content.data || {};
          console.log(
            "Foreground notification received, data:",
            notification.request.content.data
          );
        });

      const backgroundSubscription =
        Notifications.addNotificationResponseReceivedListener(
          async (response) => {
            const { notification, actionIdentifier } = response;
            const { alertId } = notification.request.content.data || {};
            console.log(
              "Notification response received, data:",
              response.notification.request.content.data,
              "actionIdentifier:",
              actionIdentifier
            );

            if (alertId) {
              if (
                actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
              ) {
                try {
                  router.push({
                    pathname: "/(tabs)/AlertDetailPage",
                    params: { alertId },
                  });
                } catch (error) {
                  console.error("Error navigating to AlertDetailPage:", error);
                }
              }
            } else {
              console.log("No alertId found in notification data");
            }
          }
        );

      return () => {
        if (foregroundSubscription)
          Notifications.removeNotificationSubscription(foregroundSubscription);
        if (backgroundSubscription)
          Notifications.removeNotificationSubscription(backgroundSubscription);
      };
    };

    setupNotifications();
  }, [router, user, role]);

  useEffect(() => {
    if (!loading && !user && !pathname.startsWith("/(auth)")) {
      router.replace("/(auth)/SignIn");
    }
  }, [user, loading, pathname, router]);

  useEffect(() => {
    if (!loading && user && pathname === "/(tabs)") {
      router.replace(role === "admin" ? "/DashboardPage" : "/AlertsPage");
    }
  }, [user, role, loading, pathname, router]);

  const resolveDeviceName = async (deviceId) => {
    let resolvedDeviceId = "Unknown";
    if (deviceId) {
      const fieldId = typeof deviceId === "string" ? deviceId : deviceId.id;
      if (deviceCache.has(fieldId)) {
        resolvedDeviceId = deviceCache.get(fieldId);
      } else {
        try {
          const docRef =
            typeof deviceId === "object" && "path" in deviceId
              ? deviceId
              : doc(db, "devices", deviceId);
          const docSnap = await getDoc(docRef);
          resolvedDeviceId = docSnap.exists()
            ? docSnap.data().name || docSnap.id
            : docRef.id;
          deviceCache.set(fieldId, resolvedDeviceId);
        } catch (error) {
          console.error("Error resolving device reference:", error);
        }
      }
    }
    return resolvedDeviceId;
  };

  const formatDate = (timestamp) => {
    return timestamp?.toDate().toLocaleString() || "N/A";
  };

  // Notification listener for admins
  useEffect(() => {
    if (!user || role !== "admin") {
      console.log(
        "Skipping admin notification listener: Not an admin or not logged in"
      );
      return;
    }

    if (!loginTimeRef.current) {
      console.log("Login time not set yet, waiting...");
      return;
    }

    console.log("Setting up real-time notification listener for admin");

    const alertsQuery = query(collection(db, "alerts"));

    const unsubscribe = onSnapshot(
      alertsQuery,
      async (querySnapshot) => {
        console.log(
          "onSnapshot triggered for admin, changes:",
          querySnapshot.docChanges().length
        );
        if (querySnapshot.docChanges().length === 0) {
          console.log("No changes detected in onSnapshot for admin");
          return;
        }

        for (const change of querySnapshot.docChanges()) {
          console.log(
            `Processing change for admin: type=${change.type}, docId=${change.doc.id}`
          );

          if (change.type !== "added") {
            console.log(
              `Skipping change type for admin: ${change.type} for docId=${change.doc.id}`
            );
            continue;
          }

          const newAlert = change.doc.data();
          const alertId = change.doc.id;
          console.log("New alert detected for admin:", {
            alertId,
            alertData: {
              occur_at: newAlert.occur_at?.toDate().toISOString(),
              deviceId: newAlert.deviceId,
              status: newAlert.status,
            },
          });

          if (notifiedAlertsRef.has(alertId)) {
            console.log(`Alert ${alertId} already notified for admin`);
            continue;
          }

          const alertTime = newAlert.occur_at?.toDate();
          if (!alertTime) {
            console.log(
              `Alert ${alertId} has no valid occur_at timestamp for admin`
            );
            continue;
          }

          const currentTime = new Date();
          const timeDiff = currentTime - alertTime;
          const timeWindow = 5 * 1000;

          console.log(
            `Alert ${alertId} - Current Time (admin): ${currentTime.toISOString()}`
          );
          console.log(
            `Alert ${alertId} - Alert Time (admin): ${alertTime.toISOString()}`
          );
          console.log(
            `Alert ${alertId} - Time Difference (admin): ${timeDiff} ms`
          );

          if (timeDiff >= 0 && timeDiff <= timeWindow) {
            console.log(
              `Alert ${alertId} meets time criteria for admin: timeDiff = ${timeDiff}`
            );

            const deviceId = newAlert.deviceId;
            const resolvedDeviceId = await resolveDeviceName(deviceId);
            console.log(
              `Resolved device ID for alert ${alertId} (admin): ${resolvedDeviceId}`
            );

            notifiedAlertsRef.add(alertId);
            console.log(`Marked alert ${alertId} as notified for admin`);

            await Notifications.scheduleNotificationAsync({
              content: {
                title: "New Alert Detected",
                body: `A new alert from device ${resolvedDeviceId} at ${formatDate(
                  newAlert.occur_at
                )}`,
                data: { alertId },
              },
              trigger: null,
            });
            console.log(
              `Notification scheduled for admin for alert ${alertId}`
            );
          } else {
            console.log(
              `Alert ${alertId} does not meet time criteria for admin: timeDiff = ${timeDiff}`
            );
          }
        }
      },
      (error) => {
        console.error("Admin real-time listener error:", error);
      }
    );

    return () => {
      console.log("Cleaning up admin notification listener");
      unsubscribe();
    };
  }, [user, role]);

  // Notification listener for security users
  useEffect(() => {
    if (!user || role !== "security") {
      console.log(
        "Skipping security notification listener: Not a security user or not logged in"
      );
      return;
    }

    console.log("Setting up real-time notification listener for security user");

    const alertsQuery = query(collection(db, "alerts"));

    const unsubscribe = onSnapshot(
      alertsQuery,
      async (querySnapshot) => {
        console.log(
          "onSnapshot triggered for security user, changes:",
          querySnapshot.docChanges().length
        );
        if (querySnapshot.docChanges().length === 0) {
          console.log("No changes detected in onSnapshot for security user");
          return;
        }

        for (const change of querySnapshot.docChanges()) {
          console.log(
            `Processing change for security user: type=${change.type}, docId=${change.doc.id}`
          );

          if (change.type !== "modified") {
            console.log(
              `Skipping change type for security user: ${change.type} for docId=${change.doc.id}`
            );
            continue;
          }

          const updatedAlert = change.doc.data();
          const alertId = change.doc.id;
          console.log("Alert updated for security user:", {
            alertId,
            alertData: {
              occur_at: updatedAlert.occur_at?.toDate().toISOString(),
              deviceId: updatedAlert.deviceId,
              status: updatedAlert.status,
            },
          });

          if (notifiedAlertsRef.has(alertId)) {
            console.log(`Alert ${alertId} already notified for security user`);
            continue;
          }

          const alertTime = updatedAlert.occur_at?.toDate();
          if (!alertTime) {
            console.log(
              `Alert ${alertId} has no valid occur_at timestamp for security user`
            );
            continue;
          }

          // Only notify security if the alert is approved by admin
          if (updatedAlert.status !== "approved") {
            console.log(
              `Alert ${alertId} is not approved (status: ${updatedAlert.status}), skipping for security user`
            );
            continue;
          }

          const currentTime = new Date();
          const timeDiff = currentTime - alertTime;
          const timeWindow = 5 * 1000;

          console.log(
            `Alert ${alertId} - Current Time (security): ${currentTime.toISOString()}`
          );
          console.log(
            `Alert ${alertId} - Alert Time (security): ${alertTime.toISOString()}`
          );
          console.log(
            `Alert ${alertId} - Time Difference (security): ${timeDiff} ms`
          );

          if (timeDiff >= 0 && timeDiff <= timeWindow) {
            console.log(
              `Alert ${alertId} meets time criteria for security user: timeDiff = ${timeDiff}`
            );

            const deviceId = updatedAlert.deviceId;
            const resolvedDeviceId = await resolveDeviceName(deviceId);
            console.log(
              `Resolved device ID for alert ${alertId} (security): ${resolvedDeviceId}`
            );

            notifiedAlertsRef.add(alertId);
            console.log(
              `Marked alert ${alertId} as notified for security user`
            );

            const notificationContent = {
              title: "Alert Approved",
              body: `An approved alert from device ${resolvedDeviceId} at ${formatDate(
                updatedAlert.occur_at
              )}`,
              data: { alertId },
            };

            console.log(
              "Scheduling notification for security user with content:",
              notificationContent
            );

            await Notifications.scheduleNotificationAsync({
              content: notificationContent,
              trigger: null,
            });
            console.log(
              `Notification scheduled for security user for alert ${alertId}`
            );
          } else {
            console.log(
              `Alert ${alertId} does not meet time criteria for security user: timeDiff = ${timeDiff}`
            );
          }
        }
      },
      (error) => {
        console.error("Security real-time listener error:", error);
      }
    );

    return () => {
      console.log("Cleaning up security notification listener");
      unsubscribe();
    };
  }, [user, role]);

  const userTabs = useMemo(() => {
    return role && user ? tabs.filter((tab) => tab.roles.includes(role)) : [];
  }, [role, user]);

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
        <StatusBar style="dark" />
        <View style={styles.contentContainer}>
          <Slot />
        </View>
      </SafeAreaView>
      {!isDetailPage && <TabBar tabs={userTabs} currentPath={pathname || ""} />}
    </View>
  );
};

const TabsLayout = () => {
  return (
    <SensorStatusProvider>
      <MainContent />
    </SensorStatusProvider>
  );
};

const TabBar = ({ tabs, currentPath }) => {
  const router = useRouter();
  const { disconnectedCount } = useSensorStatus();

  const activeTab = useMemo(() => {
    return tabs.find((tab) => currentPath.startsWith(tab.path))?.path || "";
  }, [tabs, currentPath]);

  const handleTabPress = useCallback(
    (tabPath) => {
      if (activeTab !== tabPath) {
        router.replace(tabPath);
      }
    },
    [activeTab, router]
  );

  const TabIconWithBadge = ({ name, isActive, tabName }) => (
    <View style={styles.tabIconContainer}>
      <Icon
        name={
          isActive
            ? tabs.find((t) => t.name === tabName).activeIcon
            : tabs.find((t) => t.name === tabName).icon
        }
        size={24}
        color={isActive ? "#4CAF50" : "#B0BEC5"}
      />
      {tabName === "Sensors" && disconnectedCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{disconnectedCount}</Text>
        </View>
      )}
    </View>
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
                delayPressIn={0}
              >
                <TabIconWithBadge
                  name={tab.name}
                  isActive={isActive}
                  tabName={tab.name}
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
  tabIconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#D32F2F",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default TabsLayout;
