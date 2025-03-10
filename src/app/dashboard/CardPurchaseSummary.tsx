"use client";

import { useGetExpensesQuery } from "@/state/api"; 
// import { TrendingDown, TrendingUp } from "lucide-react";
import numeral from "numeral";
import React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CardPurchaseSummary = () => {
  const { data: expenses, isLoading, isError } = useGetExpensesQuery(); // Fetch expense data

  if (isLoading) {
    return <div className="m-5">Loading...</div>;
  }

  if (isError || !expenses) {
    return <div className="text-center text-red-500 py-4">Failed to fetch expenses</div>;
  }

 
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const expenseData = expenses.map(expense => ({
    date: expense.expenseDate, 
    totalExpenses: expense.amount 
  }));

  // const lastDataPoint = expenseData[expenseData.length - 1] || null; 

  return (
    <div className="flex flex-col justify-between row-span-2 xl:row-span-3 col-span-1 md:col-span-2 xl:col-span-1 bg-white shadow-md rounded-2xl">
      <div>
        <h2 className="text-lg font-semibold mb-2 px-7 pt-5">Expense Summary</h2>
        <hr />
      </div>

      <div>
        <div className="mb-4 mt-7 px-7">
          <p className="text-xs text-gray-400">Total Expenses</p>
          <div className="flex items-center">
            <p className="text-2xl font-bold">
              {numeral(totalExpenses).format("0.00a")} XAF
            </p>
          </div>
        </div>

        {/* CHART */}
        <ResponsiveContainer width="100%" height={200} className="p-2 chart-container">
          <AreaChart
            data={expenseData}
            margin={{ top: 0, right: 0, left: -50, bottom: 45 }}
          >
            <XAxis dataKey="date" tick={false} axisLine={false} />
            <YAxis tickLine={false} tick={false} axisLine={false} />
            <Tooltip
              formatter={(value: number) => [
                `${value.toLocaleString("en")} XAF`,
              ]}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
              }}
            />
            <Area
              type="linear"
              dataKey="totalExpenses" 
              stroke="#8884d8"
              fill="#8884d8"
              dot={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CardPurchaseSummary;
