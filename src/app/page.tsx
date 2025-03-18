"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Define a function to check token expiration
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  try {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = decodedToken.exp * 1000;
    return Date.now() > expirationTime; // Check if current time is past token expiration
  } catch (error) {
    console.error("Invalid token format:", error);
    return true; // If decoding fails, treat the token as expired
  }
};

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token && !isTokenExpired(token)) {
      // Redirect to dashboard if token exists and is valid
      router.replace("/dashboard");
    } else {
      // Redirect to login page if no token is found or token is expired
      router.replace("/login");
    }
  }, [router]); // Adding router as a dependency to avoid any potential issues with stale closures

  return <p>Redirecting...</p>;
}
