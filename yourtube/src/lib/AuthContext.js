import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useState } from "react";
import { createContext } from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";
import { useEffect, useContext } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userdata) => {
    setUser(userdata);
    localStorage.setItem("user", JSON.stringify(userdata));
  };

  const otpLogin = (userdata) => {
    login(userdata);
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  // ─── Update plan after payment (called from VideoPlayer / VideoInfo) ──────────
  const setUserPlan = (plan) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, plan };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  // Legacy helper — kept for PremiumModal compatibility (gold = premium)
  const setUserPremium = (isPremium) => setUserPlan(isPremium ? "gold" : "free");

  const handlegooglesignin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseuser = result.user;
      const payload = {
        email: firebaseuser.email,
        name: firebaseuser.displayName,
        image: firebaseuser.photoURL || "https://github.com/shadcn.png",
      };
      const response = await axiosInstance.post("/user/login", payload);
      login(response.data.result);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // 1. Try to load user from localStorage if OTP login
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) { }
    }

    // 2. Legacy Firebase hook
    const unsubcribe = onAuthStateChanged(auth, async (firebaseuser) => {
      if (firebaseuser && !storedUser) {
        try {
          const payload = {
            email: firebaseuser.email,
            name: firebaseuser.displayName,
            image: firebaseuser.photoURL || "https://github.com/shadcn.png",
          };
          const response = await axiosInstance.post("/user/login", payload);
          login(response.data.result);
        } catch (error) {
          console.error(error);
          logout();
        }
      }
    });
    return () => unsubcribe();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, login, logout, handlegooglesignin, setUserPlan, setUserPremium, otpLogin }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
