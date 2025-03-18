"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetExpensesQuery } from "@/state/api"; 
import Header from "../(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Expense } from "@/state/api"; 
import Navbar from "../(components)/Navbar";
import { useTranslation } from 'react-i18next';

const ExpenseList = () => {
  // Call the hook inside the component
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { data: expenses, isError, isLoading } = useGetExpensesQuery();

  // Define columns inside the component to use t() for headers
  const columns: GridColDef<Expense>[] = [
    { field: "expenseDate", headerName: t("expenselist.expensedate"), width: 150,
      headerClassName: "text-blue-700 dark:text-blue-300", // Blue color for header
     },
    { field: "reason", headerName: t("expenselist.expensereason"), width: 200,
      headerClassName: "text-blue-700 dark:text-blue-300", // Blue color for header
     },
    { field: "details", headerName: t("expenselist.expensedetails"), width: 250,
      headerClassName: "text-blue-700 dark:text-blue-300", // Blue color for header
     },
    { 
      field: "amount", 
      headerName: t("expenselist.amount"), 
      width: 150,
      headerClassName: "text-blue-700 dark:text-blue-300", // Blue color for header 
      renderCell: (params) => `${params.value} XAF`
    },
  ];

  // Check authentication on initial render
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login"); 
    } else {
      setIsAuthenticated(true); 
    }
  }, [router]);

  if (!isAuthenticated) {
    return <div>{t("expenselist.loading")}</div>;
  }

  if (isLoading) {
    return <div className="py-4">{t("expenselist.loadexpense")}</div>;
  }

  if (isError || !expenses) {
    return (
      <div className="text-center text-red-500 py-4">
        {t("expenselist.failfetch")}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Navbar />
      <Header name={t("expenselist.expenses")} />
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
