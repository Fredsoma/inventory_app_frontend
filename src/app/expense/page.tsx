"use client";

import React, { useState, useEffect } from "react";
import { useCreateExpenseMutation, useGetExpensesQuery } from "@/state/api";
import { useRouter } from "next/navigation"; 
import Navbar from "../(components)/Navbar";
import toast, { Toaster } from "react-hot-toast"; 

interface Expense {
  expenseDate: string;
  reason: string;
  details?: string;
  amount: number;
}

const Expense: React.FC = () => {
  const [expense, setExpense] = useState<Partial<Expense>>({
    expenseDate: "",
    reason: "",
    details: "",
    amount: 0,
  });

  const [isSaving, setIsSaving] = useState<boolean>(false); // State to track saving status
  const [createExpense] = useCreateExpenseMutation();
  const { data: expenses, refetch, isLoading, isError } = useGetExpensesQuery();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check for authentication token
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExpense((prevExpense) => ({
      ...prevExpense,
      [name]: name === "amount" ? parseFloat(value) : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!expense.expenseDate || !expense.reason || !expense.amount || (expense.reason === "Shop Supplies" && !expense.details)) {
      toast.error("All fields are required!", { duration: 4000 });
      return;
    }

    const expenseDetails = {
      expenseDate: expense.expenseDate,
      reason: expense.reason,
      details: expense.details || "",
      amount: expense.amount,
    };

    try {
      setIsSaving(true); // Start loading indicator

      // Create new expense
      const result = await createExpense(expenseDetails).unwrap();
      console.log("Expense created:", result);

      // If expenses exist, update the state with the new expense 
      if (expenses) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const updatedExpenses = [...expenses, result]; 
        refetch(); // Refetch the list to make sure it's in sync with the server
      }

      toast.success("Expense saved successfully!", { duration: 4000 });

      // Reset form after successful submission
      setExpense({
        expenseDate: "",
        reason: "",
        details: "",
        amount: 0,
      });

    } catch (error) {
      console.error("Failed to save the expense:", error);
      toast.error("Failed to save expense", { duration: 4000 });
    } finally {
      setIsSaving(false); // Stop loading indicator
    }
  };

  // Display loading/error state
  if (!isAuthenticated) {
    return <p className="text-center text-gray-500">Checking authentication...</p>;
  }

  if (isLoading) {
    return <div className="py-4">Loading expenses...</div>;
  }

  if (isError || !expenses) {
    return <div className="text-center text-red-500 py-4">Failed to fetch expenses</div>;
  }

  return (
    <div>
      <Toaster position="top-center" toastOptions={{ duration: 5000 }} /> 
      <Navbar />
      
      <div className="max-w-4xl mx-auto mt-10 p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-gray-700 text-center mb-8">New Expense Entry</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 text-gray-600">Expense Date</label>
            <input
              type="date"
              name="expenseDate"
              value={expense.expenseDate || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600">Reason for Expense</label>
            <select
              name="reason"
              value={expense.reason || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded focus:border-blue-400"
              required
            >
              <option value="">Select Reason</option>
              <option value="Shop Supplies">Shop Supplies</option>
              <option value="Salaries">Salaries</option>
            </select>
          </div>

          {expense.reason === "Shop Supplies" && (
            <>
              <div>
                <label className="block mb-1 text-gray-600">Details of Items Purchased</label>
                <textarea
                  name="details"
                  value={expense.details || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded focus:border-blue-400"
                  placeholder="Describe what was bought for the shop"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600">Amount for Shop Supplies (XAF)</label>
                <input
                  type="number"
                  name="amount"
                  min="0"
                  value={expense.amount || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded focus:border-blue-400"
                  required
                />
              </div>
            </>
          )}

          {expense.reason === "Salaries" && (
            <div>
              <label className="block mb-1 text-gray-600">Amount Paid for Salaries (XAF)</label>
              <input
                type="number"
                name="amount"
                min="0"
                value={expense.amount || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded focus:border-blue-400"
                required
              />
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <button 
              type="submit" 
              className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
              disabled={isSaving} // Disable button when saving
            >
              {isSaving ? (
                <span>Saving...</span> // Show text when saving
              ) : (
                <span>Save Expense</span> // Normal text
              )}
            </button>
          </div>
        </form>

        {isSaving && (
          <div className="text-center mt-4">
            <span className="text-blue-500">Saving expense... Please wait.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expense;
