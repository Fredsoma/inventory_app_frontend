"use client"; 

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { FaBox } from "react-icons/fa"; 

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true); 
  const router = useRouter(); 
  useEffect(() => {
    // Check how many users are already registered on page load
    const checkUserCount = async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      try {
        // Use the correct endpoint here
        const response = await fetch("http://localhost:8000/users"); 
        if (!response.ok) {
          throw new Error("Failed to fetch users.");
        }
        const users = await response.json();

        // If 2 or more users are registered, close the registration
        if (users.length >= 2) {
          setIsRegistrationOpen(false); // Block registration if more than 2 users
        }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setError("Failed to fetch users, please try again.");
      }
    };

    checkUserCount();
  }, []);
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    
    if (!isRegistrationOpen) {
      setError("Registration is closed. Only 2 users are allowed.");
      return;
    }

  
    const response = await fetch("http://localhost:8000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      router.push("/login"); 
    } else {
      setError(data.error || "Something went wrong.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <div className="text-center mb-6">
          <FaBox className="text-4xl text-blue-600 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800">Register for Inventory Management</h2>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
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
            disabled={!isRegistrationOpen} 
          >
            Register
          </button>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:text-blue-700">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
