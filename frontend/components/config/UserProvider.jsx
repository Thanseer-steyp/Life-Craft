"use client";
import { createContext, useState, useEffect } from "react";
import axiosInstance from "@/components/config/AxiosInstance";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  const fetchUser = async () => {
    try {
      const res = await axiosInstance.get("api/v1/user/profile-setup/");
      if (res.data.profile_exists) {
        setUserData(res.data.data);
      } else {
        setUserData(res.data.user);
      }
    } catch (err) {
      console.error("Fetch user error:", err);
    }
  };

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (access) fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ userData, setUserData, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};
