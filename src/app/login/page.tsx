"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaBox } from "react-icons/fa";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ImSpinner2 } from "react-icons/im";
import Image from "next/image";
import france from "../../assets/france.png";
import anglais from "../../assets/english.jpeg";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://inventory-management-app-v2.onrender.com";

// LanguageSwitcher Component
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "en";
    if (i18n.language !== savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => changeLanguage("en")}
        className={`relative p-1 w-10 h-10 rounded-full transition duration-300 transform hover:scale-110 ${
          i18n.language === "en" ? "ring-2 ring-blue-500" : "opacity-80"
        }`}
      >
        <Image src={anglais} alt="English" width={40} height={40} className="rounded-full" />
      </button>
      <button
        onClick={() => changeLanguage("fr")}
        className={`relative p-1 w-10 h-10 rounded-full transition duration-300 transform hover:scale-110 ${
          i18n.language === "fr" ? "ring-2 ring-blue-500" : "opacity-80"
        }`}
      >
        <Image src={france} alt="Français" width={40} height={40} className="rounded-full" />
      </button>
    </div>
  );
};

const LoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(""); // Reset error
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(""); // Reset error
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login Response:", data); // Debugging

      if (response.ok) {
        localStorage.setItem("authToken", data.token);
        toast.success(t("login.login_success"), { duration: 2000 });
        router.replace("/dashboard");
      } else {
        setError(data.error || t("login.invalidcred"));
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(t("login.networkerror"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-10 rounded-lg shadow-lg w-96">
        {/* Language Switcher */}
        <div className="flex justify-center mb-6">
          <LanguageSwitcher />
        </div>

        <div className="text-center mb-8">
          <FaBox className="text-5xl text-blue-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-800">{t("login.loginven")} MYSTOCK</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            required
            className="w-full p-4 border border-gray-300 text-gray-950 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder={t("login.pwd")}
            value={password}
            onChange={handlePasswordChange}
            required
            className="w-full p-4 border border-gray-300 text-gray-950 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg mt-4 flex items-center justify-center hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? <ImSpinner2 className="animate-spin text-white text-xl" /> : t("login.logintext")}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {t("login.dontaccount")}{" "}
            <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              {t("login.register")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
