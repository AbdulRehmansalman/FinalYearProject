import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../services/firebase"; // ✅ Import Firebase Web SDK
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth"; // ✅ Use Firebase Web SDK
import { doc, getDoc, setDoc } from "firebase/firestore"; // ✅ Use Firestore Web SDK

// ✅ Create Authentication Context
const AuthContext = createContext({});

// ✅ Authentication Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null); // Track user role for navigation

  // 🔄 Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const userData = userDoc.data();
        setUser(firebaseUser);
        setRole(userData?.role || null); // Set role from Firestore
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // 📝 Signup function
  const signup = async (email, password, role, phoneNumber, username) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        role,
        phoneNumber,
        active: true,
      });

      setRole(role);
      return user;
    } catch (error) {
      throw error;
    }
  };

  // 🔑 Login function
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      setRole(userDoc.data()?.role || null);
      return user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // 🚪 Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
      navigation.replace("(auth)/SignIn");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, role, loading, signup, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 🔄 Custom hook to use authentication
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
