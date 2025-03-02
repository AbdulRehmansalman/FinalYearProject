// import { initializeApp } from "firebase/app";
// import {
//   getAuth,
//   initializeAuth,
//   getReactNativePersistence,
// } from "firebase/auth";
// import { getFirestore, collection } from "firebase/firestore";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyD91v_zER4R_O3l4d20gCCIfC-0GjiVv1E",
//   authDomain: "wildlife-c6d3e.firebaseapp.com",
//   projectId: "wildlife-c6d3e",
//   storageBucket: "wildlife-c6d3e.firebasestorage.app",
//   messagingSenderId: "719831533079",
//   appId: "1:719831533079:web:d376af5067b4d45d8d7e52",
// };

// // Initialize Firebase app
// const app = initializeApp(firebaseConfig);

// // Check if Auth is already initialized; if not, initialize it
// let auth;
// try {
//   auth = getAuth(app); // Try to get existing Auth instance
// } catch (error) {
//   if (error.code === "auth/no-auth-instance") {
//     // If no Auth instance exists, initialize it
//     auth = initializeAuth(app, {
//       persistence: getReactNativePersistence(AsyncStorage),
//     });
//   } else {
//     console.error("Auth initialization error:", error);
//     throw error; // Re-throw unexpected errors
//   }
// }

// // Initialize Firestore
// const db = getFirestore(app);

// // Collection Reference
// export const userCollection = collection(db, "users");

// // Export auth and db
// export { auth, db };
import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD91v_zER4R_O3l4d20gCCIfC-0GjiVv1E",
  authDomain: "wildlife-c6d3e.firebaseapp.com",
  projectId: "wildlife-c6d3e",
  storageBucket: "wildlife-c6d3e.appspot.com", // 🔥 Fixed incorrect storage URL
  messagingSenderId: "719831533079",
  appId: "1:719831533079:web:d376af5067b4d45d8d7e52",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Enable Auth Persistence in Expo (AsyncStorage)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// ✅ Initialize Firestore
const db = getFirestore(app);

// ✅ Collection Reference
export const userCollection = collection(db, "users");

// ✅ Export Firebase services
export { app, auth, db };

// onAuthStateChanged → listens for authentication state changes.
// doc → references a document in Firestore.
// getDoc → retrieves user data from Firestore.
// setDoc → saves user data in Firestore.
