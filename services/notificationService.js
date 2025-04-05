// services/notificationService.js
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { db } from "./firebase";
import {
  doc,
  updateDoc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(userId) {
  let token;

  if (!Device.isDevice) {
    console.log(
      "Running on emulator/simulator: Push notifications not fully supported."
    );
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token: Permission not granted.");
    return null;
  }

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId || "wildlife-c6d3e";
    console.log("Attempting to get Expo Push Token with projectId:", projectId);

    // Get Expo Push Token with FCM integration
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log("Expo Push Token:", token);

    if (userId && token) {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { pushToken: token });
      console.log("Push token stored in Firestore for user:", userId);
    }

    return token;
  } catch (error) {
    console.error("Error getting Expo Push Token:", error.message);
    return null;
  }
}

export async function sendPushNotification(to, title, body, data = {}) {
  if (!to) {
    console.log("No push token provided, skipping notification.");
    return;
  }

  const message = {
    to,
    sound: "default",
    title,
    body,
    data,
    priority: "high",
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
    const result = await response.json();
    console.log("Push notification sent:", result);
  } catch (error) {
    console.error("Error sending push notification:", error.message);
  }
}

export async function getSecurityPushTokens() {
  try {
    const q = query(collection(db, "users"), where("role", "==", "security"));
    const querySnapshot = await getDocs(q);
    const tokens = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.pushToken) {
        tokens.push(userData.pushToken);
      }
    });
    console.log("Security push tokens retrieved:", tokens);
    return tokens;
  } catch (error) {
    console.error("Error fetching security push tokens:", error.message);
    return [];
  }
}
