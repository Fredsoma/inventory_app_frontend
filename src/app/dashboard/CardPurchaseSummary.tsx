import { useGetExpensesQuery } from "@/state/api"; 
import numeral from "numeral";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CardPurchaseSummary = () => {
  const { t } = useTranslation();
  const { data: expenses, isLoading, isError } = useGetExpensesQuery(); 

  if (isLoading) {
    return (
      <div className="m-5 flex justify-center items-center">
        <div className="animate-spin h-6 w-6 border-t-2 border-blue-500 border-solid rounded-full"></div>
      </div>
    );
  }

  if (isError || !expenses) {
    return (
      <div className="text-center text-red-500 py-4">
         {t("purchaseSummary.fetchError")}
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  const expenseData = expenses
    .map(expense => ({
      date: new Date(expense.expenseDate).toISOString().split("T")[0], 
      totalExpenses: expense.amount || 0,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="flex flex-col justify-between row-span-2 xl:row-span-3 col-span-1 md:col-span-2 xl:col-span-1 bg-white shadow-md rounded-2xl">
      <div>
        <h2 className="text-lg font-semibold mb-2 px-7 pt-5">{t("purchaseSummary.title")}</h2>
        <hr />
      </div>

      <div>
        <div className="mb-4 mt-7 px-7">
          <p className="text-xs text-gray-400">{t("purchaseSummary.totalExpenses")}</p>
          <div className="flex items-center">
            <p className="text-2xl font-bold">
              {numeral(totalExpenses).format("0.00a")} XAF
            </p>
          </div>
        </div>

        {/* CHART OR NO EXPENSE MESSAGE */}
        <div className="p-2 flex justify-center items-center h-[200px]">
          {expenses.length === 0 ? (
            <p className="text-gray-500 text-sm">{t("purchaseSummary.noExpenses")}</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={expenseData} margin={{ top: 10, right: 20, left: -30, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={false} axisLine={false} />
                <YAxis tickLine={false} tick={false} axisLine={false} />
                <Tooltip
                  formatter={(value: number) => [`${value.toLocaleString("en")} XAF`]}
                  labelFormatter={(label: string) => {
                    const formattedDate = new Date(label).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });
                  
                    return (
                      <span className="font-bold text-blue-500">
                        {formattedDate}
                      </span>
                    );
                  }}
                  
                />
                <Area
                  type="monotone"
                  dataKey="totalExpenses" 
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                  dot={{ stroke: "#8884d8", strokeWidth: 2, r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardPurchaseSummary;
