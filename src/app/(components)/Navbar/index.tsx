"use client"; // Ensure this component is treated as a client-side component

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { Menu, Moon, Sun, Settings, LogOut, User } from "lucide-react"; 
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetUsersQuery } from "@/state/api"; 
import toast, { Toaster } from "react-hot-toast";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string>(""); // State to hold the username
  const router = useRouter();

  const { data: users} = useGetUsersQuery(); // Fetch user data using the API hook

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token); // Set the state based on token presence

    // Handle the authentication state change
    const handleStorageChange = () => {
      const token = localStorage.getItem("authToken");
      setIsAuthenticated(!!token);
    };

    window.addEventListener("storage", handleStorageChange);

    // Clean up the event listener
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("authToken");
      const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null; // Decode the user ID from the JWT token

      // Fetch the user and update username based on the userId stored in token
      if (userId && users) {
        const user = users.find((user) => user.userId === userId);
        if (user) {
          setUsername(user.username);
        }
      }
    } else {
      setUsername(""); // Clear the username when the user logs out
    }
  }, [isAuthenticated, users]);

  if (isAuthenticated === null) return null; 

  if (!isAuthenticated) return null;

  // Handle logout functionality
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    toast.success("Logged out successfully!", { duration: 2000 });
    router.replace("/login");  
  };

  return (
    <div className="flex justify-between items-center w-full mb-7">
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} /> 
      {/* LEFT SIDE */}
      <div className="flex justify-between items-center gap-5">
        <button
          className="px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
          onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Logout Button styled like search bar */}
        <div className="relative">
          <button
            onClick={handleLogout}
            className="pl-10 pr-4 py-2 w-50 md:w-60 border-2 border-gray-300 bg-white rounded-lg focus:outline-none focus:border-red-500 hover:bg-red-100"
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LogOut className="text-gray-500" size={20} />
            </div>
            <span className="pl-10 text-gray-500">Logout</span>
          </button>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex justify-between items-center gap-5">
        <div className="hidden md:flex justify-between items-center gap-5">
          <button onClick={() => dispatch(setIsDarkMode(!isDarkMode))}>
            {isDarkMode ? (
              <Sun className="cursor-pointer text-gray-500" size={24} />
            ) : (
              <Moon className="cursor-pointer text-gray-500" size={24} />
            )}
          </button>

          <hr className="w-0 h-7 border border-solid border-l border-gray-300 mx-3" />
          <div className="flex items-center gap-3 cursor-pointer">
            {/* Replace Image with User profile icon */}
            <User className="text-gray-500" size={25} />
            {/* Displaying the fetched username */}
            <span className="font-semibold">{username || "Loading..."}</span>
          </div>
        </div>

        <Link href="/settings">
          <Settings className="cursor-pointer text-gray-500" size={24} />
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
