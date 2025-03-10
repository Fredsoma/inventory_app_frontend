"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetExpensesQuery } from "@/state/api"; 
import Header from "../(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Expense } from "@/state/api"; 
import Navbar from "../(components)/Navbar";

// Define columns for DataGrid
const columns: GridColDef<Expense>[] = [
  { field: "expenseDate", headerName: "Expense Date", width: 150 },
  { field: "reason", headerName: "Reason", width: 200 },
  { field: "details", headerName: "Details", width: 250 },
  { 
    field: "amount", 
    headerName: "Amount (XAF)", 
    width: 150, 
    renderCell: (params) => `${params.value} XAF`
  },
];

const ExpenseList = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check authentication on initial render
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login"); 
    } else {
      setIsAuthenticated(true); 
    }
  }, [router]);

  // Fetch expense data using the custom hook
  const { data: expenses, isError, isLoading } = useGetExpensesQuery();

 
  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  
  if (isLoading) {
    return <div className="py-4">Loading expenses...</div>;
  }

  
  if (isError || !expenses) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch expenses
      </div>
    );
  }

  return (
    <div className="flex flex-col">
    
      <Navbar /> 

      <Header name="Expenses" />
      <DataGrid
        rows={expenses}
        columns={columns}
        getRowId={(row) => row.expenseId} 
        checkboxSelection
        className="bg-white shadow rounded-lg border border-gray-200 mt-5 !text-gray-700"
      />
    </div>
  );
};

export default ExpenseList;
