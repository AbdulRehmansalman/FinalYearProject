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
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId || "wildlife-c6d3e";

    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

    if (userId && token) {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { pushToken: token });
    }

    return token;
  } catch (error) {
    return null;
  }
}

export async function sendPushNotification(to, title, body, data = {}) {
  if (!to) {
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
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  } catch (error) {
    // Silently handle error
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
    return tokens;
  } catch (error) {
    return [];
  }
}
