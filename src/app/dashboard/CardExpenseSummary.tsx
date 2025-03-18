"use client"

import React from "react";
import { useGetExpensesQuery } from "@/state/api";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";

const colors = ["#00C49F", "#0088FE", "#FFBB28"];

const CardExpenseSummary = () => {
  const { t } = useTranslation();
  const { data: expenses, isLoading, isError } = useGetExpensesQuery();

  if (isLoading) {
    return <div className="m-5">{t("expenseSummary.loading")}</div>;
  }

  if (isError || !expenses) {
    return <div className="text-center text-red-500 py-4">{t("expenseSummary.error")}</div>;
  }

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const formattedTotalExpenses = totalExpenses.toFixed(2);

  // Summarize expenses by reason (or another field if preferred)
  const expenseSums = expenses.reduce<{ [key: string]: number }>((acc, expense) => {
    // If expense.reason is missing, use a default translated value
    const rawKey = expense.reason || "uncategory";
    // We leave rawKey as is and will translate later
    if (!acc[rawKey]) acc[rawKey] = 0;
    acc[rawKey] += expense.amount || 0;
    return acc;
  }, {});

  // Helper function to translate a category name
  const translateCategory = (name: string) => {
    // You can add more mappings as needed.
    if (name === "Shop Supplies") {
      return t("expenseSummary.shopSupplies");
    } else if (name === "Salaries") {
      return t("expenseSummary.salaries");
    }
    // For uncategorized or other values, you may want to provide a default translation
    if (name === "uncategory") {
      return t("expenseSummary.uncategory");
    }
    // Otherwise, return the original name if no translation is needed
    return name;
  };

  // Prepare data for the pie chart with translated names
  const expenseCategories = Object.entries(expenseSums).map(([name, value]) => ({
    name: translateCategory(name),
    value,
  }));

  // Calculate average expense
  const averageExpense = expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(2) : "0.00";

  // Extract specific category totals using the raw keys (they might need translation in the footer as well)
  const shopSuppliesTotal = expenseSums["Shop Supplies"] || 0;
  const salariesTotal = expenseSums["Salaries"] || 0;

  return (
    <div className="row-span-3 bg-white shadow-md rounded-2xl flex flex-col justify-between">
      {/* HEADER */}
      <div>
        <h2 className="text-lg font-semibold mb-2 px-7 pt-5">{t("expenseSummary.title")}</h2>
        <hr />
      </div>

      {/* BODY */}
      <div className="xl:flex justify-between pr-7">
        {/* CHART */}
        <div className="relative basis-3/5">
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={expenseCategories}
                innerRadius={50}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
              >
                {expenseCategories.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center basis-2/5">
            <span className="font-bold text-sm">{formattedTotalExpenses} XAF</span>
          </div>
        </div>

        {/* LABELS */}
        <ul className="flex flex-col justify-around items-center xl:items-start py-5 gap-3">
          {expenseCategories.map((entry, index) => (
            <li key={`legend-${index}`} className="flex items-center text-xs">
              <span
                className="mr-2 w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></span>
              {entry.name}
            </li>
          ))}
        </ul>
      </div>

      {/* FOOTER */}
      <div>
        <hr />
        <div className="mt-3 flex justify-between items-center px-7 mb-4 expense-summary">
          <div className="pt-2">
            <p className="text-sm">
              {t("expenseSummary.average")}: <span className="font-semibold">{averageExpense} XAF</span>
            </p>
          </div>
          {/* Display Totals for Specific Categories, translating here as well */}
          <div className="flex flex-col items-end">
            <p className="text-sm">
              {t("expenseSummary.shopSupplies")}: <span className="font-semibold">{shopSuppliesTotal.toFixed(2)} XAF</span>
            </p>
            <p className="text-sm">
              {t("expenseSummary.salaries")}: <span className="font-semibold">{salariesTotal.toFixed(2)} XAF</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardExpenseSummary;
