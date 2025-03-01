import { initializeApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import { getFirestore } from "@react-native-firebase/firestore";

// ✅ Firebase configuration for Expo
const firebaseConfig = {
  apiKey: "AIzaSyD91v_zER4R_O3l4d20gCCIfC-0GjiVv1E",
  authDomain: "wildlife-c6d3e.firebaseapp.com",
  projectId: "wildlife-c6d3e",
  storageBucket: "wildlife-c6d3e.appspot.com",
  messagingSenderId: "719831533079",
  appId: "1:719831533079:web:d376af5067b4d45d8d7e52",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
