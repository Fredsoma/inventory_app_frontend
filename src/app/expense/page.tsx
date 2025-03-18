"use client";

import React, { useState, useEffect } from "react";
import { useCreateExpenseMutation, useGetExpensesQuery } from "@/state/api";
import { useRouter } from "next/navigation"; 
import Navbar from "../(components)/Navbar";
import toast, { Toaster } from "react-hot-toast"; 
import { useTranslation } from 'react-i18next';

interface Expense {
  expenseDate: string;
  reason: string;
  details?: string;
  amount: number;
}

const Expense: React.FC = () => {
  const { t } = useTranslation();
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
      toast.error(t("expense.allfieldsrequired"), { duration: 4000 });
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
      console.log(t("expense.expensecreated"), result);

      // If expenses exist, update the state with the new expense 
      if (expenses) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const updatedExpenses = [...expenses, result]; 
        refetch(); // Refetch the list to make sure it's in sync with the server
      }

      toast.success(t("expense.expensesaved"), { duration: 4000 });

      // Reset form after successful submission
      setExpense({
        expenseDate: "",
        reason: "",
        details: "",
        amount: 0,
      });

    } catch (error) {
      console.error(t("expense.expensefail"), error);
      toast.error(t("expense.expensefail"), { duration: 4000 });
    } finally {
      setIsSaving(false); // Stop loading indicator
    }
  };

  // Display loading/error state
  if (!isAuthenticated) {
    return <p className="text-center text-gray-500">{t("expense.checkauth")}</p>;
  }

  if (isLoading) {
    return <div className="py-4">{t("expense.loadexpense")}</div>;
  }

  if (isError || !expenses) {
    return <div className="text-center text-red-500 py-4">{t("expense.failfetch")}</div>;
  }

  return (
    <div>
      <Toaster position="top-center" toastOptions={{ duration: 5000 }} /> 
      <Navbar />
      
      <div className="max-w-4xl mx-auto mt-10 p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-gray-700 text-center mb-8">{t("expense.newexpenseentry")}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 text-gray-600">{t("expense.expensedate")}</label>
            <input
              type="date"
              name="expenseDate"
              value={expense.expenseDate || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 text-gray-950 rounded focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600">{t("expense.expensereason")}</label>
            <select
              name="reason"
              value={expense.reason || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 text-gray-950 rounded focus:border-blue-400"
              required
            >
              <option value="">{t("expense.selectreason")}</option>
              <option value="Shop Supplies">{t("expense.shopsupply")}</option>
              <option value="Salaries">{t("expense.salary")}</option>
            </select>
          </div>

          {expense.reason === "Shop Supplies" && (
            <>
              <div>
                <label className="block mb-1 text-gray-600">{t("expense.purchasedetails")}</label>
                <textarea
                  name="details"
                  value={expense.details || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 text-gray-950 rounded focus:border-blue-400"
                  placeholder={t("expense.describe")}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-gray-600">{t("expense.amountshopsupply")} (XAF)</label>
                <input
                  type="number"
                  name="amount"
                  min="0"
                  value={expense.amount || ""}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 text-gray-950 rounded focus:border-blue-400"
                  required
                />
              </div>
            </>
          )}

          {expense.reason === "Salaries" && (
            <div>
              <label className="block mb-1 text-gray-600">{t("expense.amountsalary")} (XAF)</label>
              <input
                type="number"
                name="amount"
                min="0"
                value={expense.amount || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 text-gray-950 rounded focus:border-blue-400"
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
                <span>{t("expense.savingstate")}</span> // Show text when saving
              ) : (
                <span>{t("expense.savingexpense")}</span> // Normal text
              )}
            </button>
          </div>
        </form>

        {isSaving && (
          <div className="text-center mt-4">
            <span className="text-blue-500">{t("expense.savingpleasewait")}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expense;
