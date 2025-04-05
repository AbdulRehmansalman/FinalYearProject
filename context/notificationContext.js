// context/notificationContext.js
import React, { createContext, useContext, useEffect } from "react";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "../services/notificationService";
import { useAuth } from "./authContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Register for push notifications when the user logs in
      registerForPushNotificationsAsync(user.uid);
    }
  }, [user]);

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
