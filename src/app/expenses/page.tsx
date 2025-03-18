"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetExpensesQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import Navbar from "../(components)/Navbar"; 
import { useTranslation } from "react-i18next";

type AggregatedDataItem = {
  name: string;
  color?: string;
  amount: number;
};

type AggregatedData = {
  [category: string]: AggregatedDataItem;
};

const Expenses = () => {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: expensesData, isLoading, isError } = useGetExpensesQuery();
  const expenses = useMemo(() => expensesData ?? [], [expensesData]);

  const aggregatedData: AggregatedDataItem[] = useMemo(() => {
    const filtered: AggregatedData = expenses
      .filter((expense) => {
        const dataDate = new Date(expense.expenseDate)
          .toISOString()
          .split("T")[0];
        const matchesDate =
          !startDate ||
          !endDate ||
          (dataDate >= startDate && dataDate <= endDate);
        const matchesCategory =
          selectedCategory === "All" || expense.reason === selectedCategory;
        return matchesCategory && matchesDate;
      })
      .reduce((acc: AggregatedData, expense) => {
        const amount = expense.amount || 0;
        const category = expense.reason || t("expenses.uncategory");
        if (!acc[category]) {
          acc[category] = { name: category, amount: 0 };
          acc[category].color = `#${Math.floor(Math.random() * 16777215).toString(
            16
          )}`;
        }
        acc[category].amount += amount;
        return acc;
      }, {});
    return Object.values(filtered);
  }, [expenses, selectedCategory, startDate, endDate, t]);

  const classNames = {
    label: "block text-sm font-medium text-gray-700",
    selectInput:
      "mt-1 block w-full pl-3 pr-10 py-2 text-base text-gray-950 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md",
  };

  if (!isAuthenticated) {
    return <div>{t("expenses.loading")}</div>;
  }

  if (isLoading) {
    return <div className="py-4">{t("expenses.loading")}</div>;
  }

  if (isError || !expensesData) {
    return (
      <div className="text-center text-red-500 py-4">
        {t("expenses.failfetch")}
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div className="mb-5">
        <Header name={t("expenses.expenses")} />
        <p className="text-sm text-gray-500">
          {t("expenses.visualrepresentation")}
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="w-full md:w-1/3 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            {t("expenses.filtercategory")}
          </h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="category" className={classNames.label}>
                {t("expenses.category")}
              </label>
              <select
                id="category"
                name="category"
                className={classNames.selectInput}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">{t("expenses.selectall")}</option>
                <option value="Shop Supplies">
                  {t("expenses.shopsupply")}
                </option>
                <option value="Salaries">{t("expenses.salary")}</option>
              </select>
            </div>

            <div>
              <label htmlFor="start-date" className={classNames.label}>
                {t("expenses.startdate")}
              </label>
              <input
                type="date"
                id="start-date"
                name="start-date"
                className={classNames.selectInput}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="end-date" className={classNames.label}>
                {t("expenses.enddate")}
              </label>
              <input
                type="date"
                id="end-date"
                name="end-date"
                className={classNames.selectInput}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex-grow bg-white shadow rounded-lg p-4 md:p-6">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={aggregatedData}
                cx="50%"
                cy="50%"
                label={({ payload }) => `${payload.amount} XAF`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="amount"
                onMouseEnter={(_, index) => setActiveIndex(index)}
              >
                {aggregatedData.map((entry: AggregatedDataItem, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === activeIndex ? "rgb(29, 78, 216)" : entry.color
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ payload }) => {
                  if (payload && payload.length) {
                    const { amount } = payload[0].payload;
                    return <div>{`${amount} XAF`}</div>;
                  }
                  return null;
                }}
              />
              <Legend
                formatter={(value) => {
                  if (value === "Shop Supplies") return t("expenses.shopsupply");
                  if (value === "Salaries") return t("expenses.salary");
                  return value;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
