import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD91v_zER4R_O3l4d20gCCIfC-0GjiVv1E",
  authDomain: "wildlife-c6d3e.firebaseapp.com",
  projectId: "wildlife-c6d3e",
  storageBucket: "wildlife-c6d3e.appspot.com",
  messagingSenderId: "719831533079",
  appId: "1:719831533079:web:d376af5067b4d45d8d7e52", // Web appId; consider adding Android appId if available
};

// Initialize Firebase with error handling
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  throw error;
}

// Initialize Auth with AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  throw error;
}

// Initialize Firestore
let db;
try {
  db = getFirestore(app);
} catch (error) {
  throw error;
}

// Collection Reference
export const userCollection = collection(db, "users");

// Export Firebase services
export { app, auth, db };
