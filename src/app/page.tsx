"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation"; 

export default function Home() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");

      if (token) {
       
        redirect("/dashboard");
      } else {
        
        redirect("/login");
      }
    }
  }, []);

  return <p>Redirecting...</p>;
}
