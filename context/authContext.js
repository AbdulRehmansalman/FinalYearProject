import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const storedRole = await AsyncStorage.getItem("role");
        if (storedUser && storedRole) {
          setUser(JSON.parse(storedUser));
          setRole(storedRole);
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          try {
            if (firebaseUser) {
              const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
              if (!userDoc.exists()) {
                await signOut(auth);
                await AsyncStorage.clear();
                setUser(null);
                setRole(null);
                setLoading(false);
                return;
              }

              const userData = userDoc.data();
              setUser(firebaseUser);
              setRole(userData?.role || null);

              await AsyncStorage.setItem("user", JSON.stringify(firebaseUser));
              await AsyncStorage.setItem("role", userData?.role || "null");
            } else {
              setUser(null);
              setRole(null);
              await AsyncStorage.clear();
            }
          } catch (error) {
            setUser(null);
            setRole(null);
            await AsyncStorage.clear();
          } finally {
            setLoading(false);
          }
        });

        return () => unsubscribe();
      } catch (error) {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

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

      setUser(user);
      setRole(role);

      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("role", role || "null");

      return user;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await signOut(auth);
        await AsyncStorage.clear();
        throw new Error("User document does not exist");
      }

      const userRole = userDoc.data()?.role || null;
      setUser(user);
      setRole(userRole);

      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("role", userRole || "null");

      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.clear();
      await signOut(auth);
      setUser(null);
      setRole(null);
    } catch (error) {
      throw error;
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
