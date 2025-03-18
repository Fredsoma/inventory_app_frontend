"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setIsDarkMode } from "@/state";
import { GlobalRootState } from "../store";
import Navbar from "@/app/(components)/Navbar";
import { useGetUsersQuery } from "@/state/api";
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";

type UserSetting = {
  id: string; // Added identifier
  label: string;
  value: string | boolean;
  type: "text" | "toggle";
};

const Settings = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const isDarkMode = useSelector((state: GlobalRootState) => state.global.isDarkMode);
  const [userSettings, setUserSettings] = useState<UserSetting[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const { data: users, isLoading } = useGetUsersQuery();

  // Removed unused username and email states

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
      const decodedToken = jwtDecode<{ userId: string }>(token);
      setUserId(decodedToken.userId);
    }
  }, [router]);

  useEffect(() => {
    if (users && users.length > 0 && userId) {
      const user = users.find((user) => user.userId === userId);
      if (user) {
        setUserSettings([
          { id: "username", label: t("settings.username"), value: user.username, type: "text" },
          { id: "email", label: "Email", value: user.email, type: "text" },
          { id: "darkmode", label: t("settings.darmode"), value: isDarkMode, type: "toggle" },
        ]);
      }
    }
  }, [users, userId, isDarkMode, t]);

  if (!isAuthenticated || isLoading) {
    return <div>{t("settings.loading")}</div>;
  }

  const handleToggleChange = (index: number) => {
    const isDarkModeSetting = userSettings[index].id === "darkmode";
    if (isDarkModeSetting) {
      const newDarkModeValue = !isDarkMode;
      dispatch(setIsDarkMode(newDarkModeValue));
    }
    setUserSettings((prevSettings) =>
      prevSettings.map((setting, i) =>
        i === index ? { ...setting, value: !setting.value } : setting
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
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                {t("settings.seting")}
              </th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                {t("settings.val")}
              </th>
            </tr>
          </thead>
          <tbody>
            {userSettings.map((setting, index) => (
              <tr className="hover:bg-blue-50" key={setting.id}>
                <td className="py-2 px-4">{setting.label}</td>
                <td className="py-2 px-4">
                  {setting.type === "toggle" ? (
                    <label className="inline-flex relative items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={setting.id === "darkmode" ? isDarkMode : Boolean(setting.value)}
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
