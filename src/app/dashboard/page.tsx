"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, Tag} from "lucide-react";
import { useGetSalesQuery, useGetExpensesQuery } from "@/state/api"; 
import CardExpenseSummary from "./CardExpenseSummary";
import CardPopularProducts from "./CardPopularProducts";
import CardPurchaseSummary from "./CardPurchaseSummary";
import CardSalesSummary from "./CardSalesSummary";
import StatCard from "./StatCard";
import Navbar from "@/app/(components)/Navbar"; 
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State to track authentication
  // const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const router = useRouter(); 

  // Fetch all sales and expenses initially (always fetch, no conditional logic here)
  const { data: expenses = [], isLoading: loadingExpenses, isError: errorExpenses } = useGetExpensesQuery();
  const { data: sales = [], isLoading: loadingSales, isError: errorSales } = useGetSalesQuery();
  

  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
     
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]); 

  
  if (loadingExpenses || loadingSales) {
    return <div> {t("dashboard.loading")}</div>;
  }

  if (errorExpenses || errorSales) {
    return <div className="text-red-500">{t("dashboard.fetchError")}</div>;
  }

  // Calculate date range directly based on fetched data 
  let calculatedStartDate = "";
  let calculatedEndDate = "";

  if (sales.length > 0 || expenses.length > 0) {
    const allDates = [
      ...sales.map(sale => new Date(sale.saleDate).getTime()),
      ...expenses.map(expense => new Date(expense.expenseDate).getTime()),
    ];

    // Calculate the earliest and latest dates
    const startDate = new Date(Math.min(...allDates)).toISOString().split('T')[0];
    const endDate = new Date(Math.max(...allDates)).toISOString().split('T')[0];

    // Update the state with the new date range
    calculatedStartDate = startDate;
    calculatedEndDate = endDate;
  }

  // Filter sales and expenses based on the computed date range
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.saleDate);
    return saleDate >= new Date(calculatedStartDate) && saleDate <= new Date(calculatedEndDate);
  });

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.expenseDate);
    return expenseDate >= new Date(calculatedStartDate) && expenseDate <= new Date(calculatedEndDate);
  });

  // Calculate total expenses
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const formattedTotalExpenses = totalExpenses.toFixed(2);
  
  // Calculate total sales and total discounts
  const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const formattedTotalSales = totalSales.toFixed(2);

  // Calculate total discounts from sales
  const totalDiscounts = filteredSales.reduce((sum, sale) => sum + (sale.discount || 0), 0);
  const formattedTotalDiscounts = totalDiscounts.toFixed(2);

  // Calculate percentage changes and ensure they are numbers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const expenseChangePercentage = totalExpenses > 0 ? 
    parseFloat(((totalExpenses / (totalExpenses + 10)) * 100 - 100).toFixed(0)) : 0; 

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const salesChangePercentage = totalSales > 0 ? 
    parseFloat(((totalSales / (totalSales + 100)) * 100 - 100).toFixed(0)) : 0; 
  
  
  if (!isAuthenticated) {
    return <p> {t("dashboard.loading")}</p>; 
  }

  return (
    <div>
      
      <Navbar /> 

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xl:overflow-auto gap-10 pb-4 custom-grid-rows">
        <CardPopularProducts />
        <CardSalesSummary />
        <CardPurchaseSummary />
        <CardExpenseSummary />
        
        <StatCard
          title={t("dashboard.expenses")}
          primaryIcon={<Package className="text-blue-600 w-6 h-6" />}
          dateRange={`${calculatedStartDate} - ${calculatedEndDate}`} 
          details={[{
            title: t("dashboard.totalExpenses"),
            amount: `${formattedTotalExpenses} XAF`,
          },
           {
            title: ".",
            amount: ".",
          }]}
        />
      
        <StatCard
          title={t("dashboard.salesAndDiscountTitle")}
          primaryIcon={<Tag className="text-blue-600 w-6 h-6" />}
          dateRange={`${calculatedStartDate} - ${calculatedEndDate}`}
          details={[{
            title:  t("dashboard.totalSales"),
            amount: `${formattedTotalSales} XAF`,
          }, {
            title: t("dashboard.totalDiscounts"),
            amount: `${formattedTotalDiscounts}`,
          }]}
        />

      </div>
    </div>
  );
};

export default Dashboard;
