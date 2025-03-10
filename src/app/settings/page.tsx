"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setIsDarkMode } from "@/state";
import { GlobalRootState } from "../store";
import Navbar from "@/app/(components)/Navbar";
import { useGetUsersQuery } from "@/state/api"; 
import { jwtDecode } from "jwt-decode";


type UserSetting = {
  label: string;
  value: string | boolean;
  type: "text" | "toggle";
};

const Settings = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const isDarkMode = useSelector((state: GlobalRootState) => state.global.isDarkMode);
  const [userSettings, setUserSettings] = useState<UserSetting[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string>("");

  const { data: users, isLoading } = useGetUsersQuery(); // Fetch users data

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [username, setUsername] = useState<string>("");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [email, setEmail] = useState<string>("");
  

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);

      // Decode the token and get userId
      const decodedToken = jwtDecode<{ userId: string }>(token);
      setUserId(decodedToken.userId); // Store userId for later use
    }
  }, [router]);

  useEffect(() => {
    if (users && users.length > 0 && userId) {
      // Use the dynamic userId to find the correct user
      const user = users.find((user) => user.userId === userId);
      if (user) {
        setUsername(user.username);
        setEmail(user.email); 
        setUserSettings([
          { label: "Username", value: user.username, type: "text" },
          { label: "Email", value: user.email, type: "text" },
          { label: "Dark Mode", value: isDarkMode, type: "toggle" },
        ]);
      }
    }
  }, [users, userId, isDarkMode]);

  if (!isAuthenticated || isLoading) {
    return <div>Loading...</div>;
  }

  // Handle toggle change for dark mode
  const handleToggleChange = (index: number) => {
    const isToggleSetting = userSettings[index].label === "Dark Mode";
  
    // Only toggle the dark mode if the current setting is for dark mode
    if (isToggleSetting) {
      const newDarkModeValue = !isDarkMode; // Get the opposite of the current state
      dispatch(setIsDarkMode(newDarkModeValue)); // Directly dispatch the new value to Redux
    }
  
    // Update the local state to reflect the change immediately
    setUserSettings((prevSettings) => 
      prevSettings.map((setting, i) => 
        i === index 
          ? { ...setting, value: !setting.value } // Toggle the value at the specific index
          : setting
      )
    );
  };
  

  return (
    <div className="w-full">
    
      <Navbar />

      <div className="overflow-x-auto mt-5 shadow-md">
        <table className="min-w-full bg-white rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Setting</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Value</th>
            </tr>
          </thead>
          <tbody>
            {userSettings.map((setting, index) => (
              <tr className="hover:bg-blue-50" key={setting.label}>
                <td className="py-2 px-4">{setting.label}</td>
                <td className="py-2 px-4">
                  {setting.type === "toggle" ? (
                    <label className="inline-flex relative items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={setting.label === "Dark Mode" ? isDarkMode : setting.value as boolean}
                        onChange={() => handleToggleChange(index)}
                      />
                      <div
                        className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-blue-400 peer-focus:ring-4 
                        transition peer-checked:after:translate-x-full peer-checked:after:border-white 
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                        after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                        peer-checked:bg-blue-600"
                      ></div>
                    </label>
                  ) : (
                    <input
                      type="text"
                      className="px-4 py-2 border rounded-lg text-gray-500 focus:outline-none focus:border-blue-500"
                      value={setting.value as string}
                      onChange={(e) => {
                        const settingsCopy = [...userSettings];
                        settingsCopy[index].value = e.target.value;
                        setUserSettings(settingsCopy);
                      }}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Settings;
