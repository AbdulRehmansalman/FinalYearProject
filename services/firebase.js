import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase configuration (should be moved to environment variables)
const firebaseConfig = {
  apiKey:
    process.env.FIREBASE_API_KEY || "AIzaSyD91v_zER4R_O3l4d20gCCIfC-0GjiVv1E",
  authDomain:
    process.env.FIREBASE_AUTH_DOMAIN || "wildlife-c6d3e.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "wildlife-c6d3e",
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET || "wildlife-c6d3e.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "719831533079",
  appId:
    process.env.FIREBASE_APP_ID || "1:719831533079:web:d376af5067b4d45d8d7e52",
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
