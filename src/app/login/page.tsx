"use client"; 

import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { FaBox } from "react-icons/fa"; 
import toast, { Toaster } from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter(); 

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Save JWT token to localStorage
      localStorage.setItem("authToken", data.token);
      
      toast.success("Logged in successfully!", { duration: 2000 });
      router.replace("/dashboard");
    } else {
      setError(data.error || "Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
       <Toaster position="top-center" toastOptions={{ duration: 2000 }} /> 
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <div className="text-center mb-6">
          <FaBox className="text-4xl text-blue-600 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800">Login to Inventory Management</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          {error && <p className="text-red-500 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg mt-4 hover:bg-blue-700"
          >
            Login
          </button>
        </form>
        <div className="text-center mt-4">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          <p className="text-sm text-gray-600">
          Don&apos;t have an account?{" "}
            <a href="/register" className="text-blue-600 hover:text-blue-700">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
