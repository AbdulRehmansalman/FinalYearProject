// import React, { createContext, useContext, useState, useEffect } from "react";
// import { auth, db } from "../services/firebase"; // ✅ Import Firebase Web SDK
// import {
//   onAuthStateChanged,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut,
// } from "firebase/auth"; // ✅ Use Firebase Web SDK
// import { doc, getDoc, setDoc } from "firebase/firestore"; // ✅ Use Firestore Web SDK

// // ✅ Create Authentication Context
// const AuthContext = createContext({});

// // ✅ Authentication Provider
// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [role, setRole] = useState(null); // Track user role for navigation

//   // 🔄 Listen for auth state changes
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
//       if (firebaseUser) {
//         const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
//         const userData = userDoc.data();
//         setUser(firebaseUser);
//         setRole(userData?.role || null); // Set role from Firestore
//       } else {
//         setUser(null);
//         setRole(null);
//       }
//       setLoading(false);
//     });

//     return () => unsubscribe(); // Cleanup on unmount
//   }, []);

//   // 📝 Signup function
//   const signup = async (email, password, role, phoneNumber, username) => {
//     try {
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       const user = userCredential.user;

//       await setDoc(doc(db, "users", user.uid), {
//         username,
//         email,
//         role,
//         phoneNumber,
//         active: true,
//       });

//       setRole(role);
//       return user;
//     } catch (error) {
//       throw error;
//     }
//   };

//   // 🔑 Login function
//   const login = async (email, password) => {
//     try {
//       const userCredential = await signInWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       const user = userCredential.user;
//       const userDoc = await getDoc(doc(db, "users", user.uid));
//       setRole(userDoc.data()?.role || null);
//       return user;
//     } catch (error) {
//       console.error("Login error:", error);
//       throw error;
//     }
//   };

//   // 🚪 Logout function
//   const logout = async () => {
//     try {
//       // Clear all AsyncStorage data
//       // await AsyncStorage.clear();

//       // Sign out from Firebase
//       await signOut(auth);
//       setUser(null);
//       setRole(null);
//     } catch (error) {
//       console.error("Logout error:", error);
//       throw error;
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{ user, role, loading, signup, login, logout }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // 🔄 Custom hook to use authentication
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// import React, { createContext, useContext, useState, useEffect } from "react";
// import { auth, db } from "../services/firebase";
// import {
//   onAuthStateChanged,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut,
// } from "firebase/auth";
// import { doc, getDoc, setDoc } from "firebase/firestore";
// import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ Import AsyncStorage

// const AuthContext = createContext({});

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [role, setRole] = useState(null);

//   // 🔄 Check AsyncStorage and Firebase auth state on mount
//   useEffect(() => {
//     const initializeAuth = async () => {
//       try {
//         // Check AsyncStorage for cached user data
//         const storedUser = await AsyncStorage.getItem("user");
//         const storedRole = await AsyncStorage.getItem("role");
//         if (storedUser && storedRole) {
//           setUser(JSON.parse(storedUser));
//           setRole(storedRole);
//         }

//         // Listen to Firebase auth state
//         const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
//           if (firebaseUser) {
//             const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
//             const userData = userDoc.data();
//             setUser(firebaseUser);
//             setRole(userData?.role || null);

//             // Update AsyncStorage with latest data
//             await AsyncStorage.setItem("user", JSON.stringify(firebaseUser));
//             await AsyncStorage.setItem("role", userData?.role || "null");
//           } else {
//             setUser(null);
//             setRole(null);
//             await AsyncStorage.clear(); // Clear if no Firebase user
//           }
//           setLoading(false);
//         });

//         return () => unsubscribe();
//       } catch (error) {
//         console.error("Auth initialization error:", error);
//         setLoading(false);
//       }
//     };

//     initializeAuth();
//   }, []);

//   const signup = async (email, password, role, phoneNumber, username) => {
//     try {
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       const user = userCredential.user;

//       await setDoc(doc(db, "users", user.uid), {
//         username,
//         email,
//         role,
//         phoneNumber,
//         active: true,
//       });

//       setUser(user);
//       setRole(role);
//       return user;
//     } catch (error) {
//       console.error("Signup error:", error);
//       throw error;
//     }
//   };

//   const login = async (email, password) => {
//     try {
//       const userCredential = await signInWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       const user = userCredential.user;
//       const userDoc = await getDoc(doc(db, "users", user.uid));
//       const userRole = userDoc.data()?.role || null;

//       setUser(user);
//       setRole(userRole);

//       // Store in AsyncStorage
//       await AsyncStorage.setItem("user", JSON.stringify(user));
//       await AsyncStorage.setItem("role", userRole || "null");

//       return user;
//     } catch (error) {
//       console.error("Login error:", error);
//       throw error;
//     }
//   };

//   const logout = async () => {
//     try {
//       // Clear AsyncStorage
//       await AsyncStorage.clear();
//       console.log("AsyncStorage cleared successfully");

//       // Sign out from Firebase
//       await signOut(auth);
//       console.log("Firebase sign-out successful");

//       // Reset state
//       setUser(null);
//       setRole(null);
//     } catch (error) {
//       console.error("Logout error:", error);
//       throw error;
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{ user, role, loading, signup, login, logout }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

//! updated
// AuthContext.js
// import React, { createContext, useContext, useState, useEffect } from "react";
// import { auth, db } from "../services/firebase";
// import {
//   onAuthStateChanged,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut,
// } from "firebase/auth";
// import { doc, getDoc, setDoc } from "firebase/firestore";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { registerForPushNotificationsAsync } from "../services/notificationService";

// const AuthContext = createContext({});

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [role, setRole] = useState(null);

//   useEffect(() => {
//     const initializeAuth = async () => {
//       try {
//         const storedUser = await AsyncStorage.getItem("user");
//         const storedRole = await AsyncStorage.getItem("role");
//         if (storedUser && storedRole) {
//           setUser(JSON.parse(storedUser));
//           setRole(storedRole);
//         }

//         const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
//           if (firebaseUser) {
//             const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
//             const userData = userDoc.data();
//             setUser(firebaseUser);
//             setRole(userData?.role || null);

//             // Register for push notifications
//             await registerForPushNotificationsAsync(firebaseUser.uid);

//             await AsyncStorage.setItem("user", JSON.stringify(firebaseUser));
//             await AsyncStorage.setItem("role", userData?.role || "null");
//           } else {
//             setUser(null);
//             setRole(null);
//             await AsyncStorage.clear();
//           }
//           setLoading(false);
//         });

//         return () => unsubscribe();
//       } catch (error) {
//         console.error("Auth initialization error:", error);
//         setLoading(false);
//       }
//     };

//     initializeAuth();
//   }, []);

//   const signup = async (email, password, role, phoneNumber, username) => {
//     try {
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       const user = userCredential.user;

//       await setDoc(doc(db, "users", user.uid), {
//         username,
//         email,
//         role,
//         phoneNumber,
//         active: true,
//       });

//       // Register for push notifications after signup
//       await registerForPushNotificationsAsync(user.uid);

//       setUser(user);
//       setRole(role);
//       return user;
//     } catch (error) {
//       console.error("Signup error:", error);
//       throw error;
//     }
//   };

//   const login = async (email, password) => {
//     try {
//       const userCredential = await signInWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       const user = userCredential.user;
//       const userDoc = await getDoc(doc(db, "users", user.uid));
//       const userRole = userDoc.data()?.role || null;

//       setUser(user);
//       setRole(userRole);

//       // Register for push notifications after login
//       await registerForPushNotificationsAsync(user.uid);

//       await AsyncStorage.setItem("user", JSON.stringify(user));
//       await AsyncStorage.setItem("role", userRole || "null");

//       return user;
//     } catch (error) {
//       console.error("Login error:", error);
//       throw error;
//     }
//   };

//   const logout = async () => {
//     try {
//       await AsyncStorage.clear();
//       console.log("AsyncStorage cleared successfully");
//       await signOut(auth);
//       console.log("Firebase sign-out successful");
//       setUser(null);
//       setRole(null);
//     } catch (error) {
//       console.error("Logout error:", error);
//       throw error;
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{ user, role, loading, signup, login, logout }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// ! latest one OPtimized
// context/authContext.js
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
        // Check AsyncStorage for cached user data
        const storedUser = await AsyncStorage.getItem("user");
        const storedRole = await AsyncStorage.getItem("role");
        if (storedUser && storedRole) {
          setUser(JSON.parse(storedUser));
          setRole(storedRole);
        }

        // Listen to Firebase auth state
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          try {
            if (firebaseUser) {
              const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
              if (!userDoc.exists()) {
                console.warn("User document does not exist, signing out...");
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

              // Update AsyncStorage with latest data
              await AsyncStorage.setItem("user", JSON.stringify(firebaseUser));
              await AsyncStorage.setItem("role", userData?.role || "null");
            } else {
              setUser(null);
              setRole(null);
              await AsyncStorage.clear();
              console.log("No Firebase user, AsyncStorage cleared");
            }
          } catch (error) {
            console.error("Error in onAuthStateChanged:", error);
          } finally {
            setLoading(false);
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Auth initialization error:", error);
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

      // Update AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("role", role || "null");

      return user;
    } catch (error) {
      console.error("Signup error:", error);
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

      // Update AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("role", userRole || "null");

      return user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.clear();
      console.log("AsyncStorage cleared successfully");
      await signOut(auth);
      console.log("Firebase sign-out successful");
      setUser(null);
      setRole(null);
    } catch (error) {
      console.error("Logout error:", error);
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
