import React, { createContext, useContext, useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { db } from "../services/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "./authContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync(user.uid);
    }
  }, [user]);

  async function registerForPushNotificationsAsync(userId) {
    if (!Device.isDevice) {
      return;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return;
    }

    try {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId || "wildlife-c6d3e";

      const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
        .data;

      if (userId && token) {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { pushToken: token });
      }
    } catch (error) {
      // Silently handle error
    }
  }

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
