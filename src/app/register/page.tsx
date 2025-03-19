"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaBox } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { ImSpinner2 } from "react-icons/im";

const RegisterPage = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const response = await fetch(  `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("authToken", data.token);
        router.push("/login");
      } else {
        setError(data.error || t("register.errorwrong"));
      }
    } catch {
      setError(t("register.networkerror"));
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-10 rounded-lg shadow-lg w-96">
        <div className="text-center mb-8">
          <FaBox className="text-5xl text-blue-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-800">
            {t("register.registerinven")} MYSTOCK
          </h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <input
            type="text"
            placeholder={t("register.registerusername")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-black text-black dark:text-white"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-black text-black dark:text-white"
          />
          <input
            type="password"
            placeholder={t("register.pwd")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-black text-black dark:text-white"
          />

          {error && <p className="text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg mt-5 flex items-center justify-center hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? (
              <ImSpinner2 className="animate-spin text-white text-xl" />
            ) : (
              t("register.registeringsta")
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {t("register.accountalready")}{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              {t("register.login")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
