import React, {
  useEffect,
  useRef,
  useMemo,
  useCallback,
  createContext,
  useContext,
  useState,
  Component,
} from "react";
import * as Notifications from "expo-notifications";
import { Slot, useRouter, usePathname } from "expo-router";
import { useAuth } from "../../context/authContext";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import Animated, {
  SlideInUp,
  withTiming,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
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

// Remove console logs in production
if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {}

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Something went wrong. Please restart the app.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// Sensor Status Context
const SensorStatusContext = createContext();

const SensorStatusProvider = ({ children }) => {
  const [disconnectedCount, setDisconnectedCount] = useState(0);
  const [debouncedDisconnectedCount, setDebouncedDisconnectedCount] =
    useState(0);

  // Debounce disconnectedCount updates to reduce re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDisconnectedCount(disconnectedCount);
    }, 500);
    return () => clearTimeout(timer);
  }, [disconnectedCount]);

  return (
    <SensorStatusContext.Provider
      value={{
        disconnectedCount: debouncedDisconnectedCount,
        setDisconnectedCount,
      }}
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
  const unsubscribeRef = useRef(null);

  // Set login time for admins only
  useEffect(() => {
    if (user && role === "admin" && !loginTimeRef.current) {
      loginTimeRef.current = new Date();
    }
  }, [user, role]);

  // Monitor sensor status globally with debounced updates
  useEffect(() => {
    if (!user || role !== "admin") return;

    const monitorSensors = async () => {
      try {
        const storedDeviceId = await AsyncStorage.getItem("device_id");
        if (!storedDeviceId) {
          setDisconnectedCount(0);
          return;
        }

        const sensorsQuery = query(
          collection(db, "sensors"),
          where("deviceId", "==", storedDeviceId)
        );

        let lastUpdate = 0;
        const DEBOUNCE_MS = 1000; // Debounce Firestore updates to 1 second

        const unsubscribe = onSnapshot(
          sensorsQuery,
          (querySnapshot) => {
            const now = Date.now();
            if (now - lastUpdate < DEBOUNCE_MS) return;
            lastUpdate = now;

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
            } else {
              setDisconnectedCount(0);
            }
          },
          (error) => {
            setDisconnectedCount(0);
          }
        );

        unsubscribeRef.current = unsubscribe;
        return unsubscribe;
      } catch (error) {
        setDisconnectedCount(0);
      }
    };

    monitorSensors();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user, role, setDisconnectedCount]);

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Ensure we're in a React Native minded environment
        if (!Platform || !Platform.OS) {
          return;
        }

        // Set up notification channel for Android
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
          });
        }

        // Request notification permissions
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          alert(
            "Please enable notifications in your device settings to receive alerts."
          );
          return;
        }

        // Set notification handler
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });

        // Set up listeners for foreground and background notifications
        const foregroundSubscription =
          Notifications.addNotificationReceivedListener((notification) => {});

        const backgroundSubscription =
          Notifications.addNotificationResponseReceivedListener(
            async (response) => {
              const { notification, actionIdentifier } = response;
              const { alertId } = notification.request.content.data || {};

              if (
                alertId &&
                actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
              ) {
                try {
                  router.push({
                    pathname: "/(tabs)/AlertDetailPage",
                    params: { alertId },
                  });
                } catch (error) {}
              }
            }
          );

        return () => {
          if (foregroundSubscription)
            Notifications.removeNotificationSubscription(
              foregroundSubscription
            );
          if (backgroundSubscription)
            Notifications.removeNotificationSubscription(
              backgroundSubscription
            );
        };
      } catch (error) {}
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
      const fieldId = typeof deviceId === "string" ? deviceId : deviceId?.id;
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
        } catch (error) {}
      }
    }
    return resolvedDeviceId;
  };

  const formatDate = (timestamp) => {
    return timestamp?.toDate().toLocaleString() || "N/A";
  };

  // Notification listener for admins with debounced updates
  useEffect(() => {
    if (!user || role !== "admin") {
      return;
    }

    if (!loginTimeRef.current) {
      return;
    }

    const alertsQuery = query(collection(db, "alerts"));

    let lastUpdate = 0;
    const DEBOUNCE_MS = 1000; // Debounce Firestore updates to 1 second

    const unsubscribe = onSnapshot(
      alertsQuery,
      async (querySnapshot) => {
        const now = Date.now();
        if (now - lastUpdate < DEBOUNCE_MS) return;
        lastUpdate = now;

        if (querySnapshot.docChanges().length === 0) {
          return;
        }

        for (const change of querySnapshot.docChanges()) {
          if (change.type !== "added") {
            continue;
          }

          const newAlert = change.doc.data();
          const alertId = change.doc.id;

          if (notifiedAlertsRef.has(alertId)) {
            continue;
          }

          const alertTime = newAlert.occur_at?.toDate();
          if (!alertTime) {
            continue;
          }

          const currentTime = new Date();
          const timeDiff = currentTime - alertTime;
          const timeWindow = 5 * 1000;

          if (timeDiff >= 0 && timeDiff <= timeWindow) {
            const deviceId = newAlert.deviceId;
            const resolvedDeviceId = await resolveDeviceName(deviceId);

            notifiedAlertsRef.add(alertId);

            try {
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
            } catch (error) {}
          }
        }
      },
      (error) => {}
    );

    return () => {
      unsubscribe();
    };
  }, [user, role]);

  // Notification listener for security users with debounced updates
  useEffect(() => {
    if (!user || role !== "security") {
      return;
    }

    const alertsQuery = query(collection(db, "alerts"));

    let lastUpdate = 0;
    const DEBOUNCE_MS = 1000; // Debounce Firestore updates to 1 second

    const unsubscribe = onSnapshot(
      alertsQuery,
      async (querySnapshot) => {
        const now = Date.now();
        if (now - lastUpdate < DEBOUNCE_MS) return;
        lastUpdate = now;

        if (querySnapshot.docChanges().length === 0) {
          return;
        }

        for (const change of querySnapshot.docChanges()) {
          if (change.type !== "modified") {
            continue;
          }

          const updatedAlert = change.doc.data();
          const alertId = change.doc.id;

          if (notifiedAlertsRef.has(alertId)) {
            continue;
          }

          const alertTime = updatedAlert.occur_at?.toDate();
          if (!alertTime) {
            continue;
          }

          if (updatedAlert.status !== "approved") {
            continue;
          }

          const currentTime = new Date();
          const timeDiff = currentTime - alertTime;
          const timeWindow = 5 * 1000;

          if (timeDiff >= 0 && timeDiff <= timeWindow) {
            const deviceId = updatedAlert.deviceId;
            const resolvedDeviceId = await resolveDeviceName(deviceId);

            notifiedAlertsRef.add(alertId);

            try {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: "Alert Approved",
                  body: `An approved alert from device ${resolvedDeviceId} at ${formatDate(
                    updatedAlert.occur_at
                  )}`,
                  data: { alertId },
                },
                trigger: null,
              });
            } catch (error) {}
          }
        }
      },
      (error) => {}
    );

    return () => {
      unsubscribe();
    };
  }, [user, role]);

  const userTabs = useMemo(() => {
    const filteredTabs =
      role && user ? tabs.filter((tab) => tab.roles.includes(role)) : [];
    return filteredTabs;
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
    <ErrorBoundary>
      <SensorStatusProvider>
        <MainContent />
      </SensorStatusProvider>
    </ErrorBoundary>
  );
};

const TabBar = React.memo(({ tabs, currentPath }) => {
  const router = useRouter();
  const { disconnectedCount } = useSensorStatus();
  const lastPressRef = useRef(new Map());
  const navigationQueueRef = useRef([]);
  const isNavigatingRef = useRef(false);
  const DEBOUNCE_DELAY = 400;

  const activeTab = useMemo(() => {
    return tabs.find((tab) => currentPath.startsWith(tab.path))?.path || "";
  }, [tabs, currentPath]);

  const processNavigationQueue = useCallback(async () => {
    if (isNavigatingRef.current || navigationQueueRef.current.length === 0)
      return;

    isNavigatingRef.current = true;
    const tabPath = navigationQueueRef.current.shift();

    try {
      if (activeTab !== tabPath) {
        await router.replace(tabPath);
      }
    } catch (error) {
    } finally {
      isNavigatingRef.current = false;
      processNavigationQueue();
    }
  }, [activeTab, router]);

  const handleTabPress = useCallback(
    (tabPath) => {
      const now = Date.now();
      const lastPressTime = lastPressRef.current.get(tabPath) || 0;

      if (now - lastPressTime < DEBOUNCE_DELAY) {
        return;
      }

      lastPressRef.current.set(tabPath, now);
      navigationQueueRef.current.push(tabPath);
      processNavigationQueue();
    },
    [processNavigationQueue]
  );

  const TabIconWithBadge = React.memo(({ name, isActive, tabName }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const onPressIn = () => {
      scale.value = withTiming(0.95, { duration: 50 });
    };

    const onPressOut = () => {
      scale.value = withTiming(1, { duration: 50 });
    };

    return (
      <Animated.View style={[styles.tabIconContainer, animatedStyle]}>
        <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
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
        </Pressable>
      </Animated.View>
    );
  });

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
});

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#121212" },
  container: { flex: 1, backgroundColor: "#121212" },
  contentContainer: { flex: 1, paddingBottom: 70 },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    padding: 20,
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
    fontFamily: "Poppins-Regular",
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
    fontFamily: "Poppins-Bold",
  },
});

export default TabsLayout;
