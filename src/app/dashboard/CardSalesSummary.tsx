import { useGetSalesQuery } from "@/state/api";
import { TrendingUp, TrendingDown, X } from "lucide-react";
import React, { useState} from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../(components)/ui/Dialog";

const CardSalesSummary = () => {
  const { data: salesData,isError } = useGetSalesQuery();

  // Get current year and month
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = new Date().toLocaleString("en-US", { month: "long" });

  // State management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedWeek, setSelectedWeek] = useState("Week 1");
  const [selectedDay, setSelectedDay] = useState("Monday");

  const years = ["2022", "2023", "2024", "2025"];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Ensuring salesData is an array
  const sales = Array.isArray(salesData) ? salesData : [];
// Calculate number of weeks in the selected month and year
const getWeeksInMonth = (year: string, month: string) => {
  const date = new Date(`${year}-${months.indexOf(month) + 1}-01`);
  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  // Group days into weeks
  const weeks = [];
  let currentWeek = [];
  for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      
      // If the current week reaches 7 days or it's the last day of the month, push the current week to weeks
      if (currentWeek.length === 7 || day === daysInMonth) {
          weeks.push(currentWeek);
          currentWeek = [];
      }
  }

  // Ensure February is treated as having 5 weeks if the first day is not a Monday and there are leftover days
  if (month === "February" && weeks.length < 5) {
      // Add a 5th week if February only had 4 weeks
      weeks.push([daysInMonth]); // Add the final days of February as a separate week
  }

  return weeks;
};


  const calculateTotalYearSales = (year: string) => {
    // Filter sales data by year
    const salesByYear = sales.filter(
      (sale) => new Date(sale.saleDate).getFullYear().toString() === year
    );

    // Group sales by month
    const totalSalesByMonth = months.map((month) => {
      const monthlySales = salesByYear.filter(
        (sale) =>
          new Date(sale.saleDate).toLocaleString("en-US", { month: "long" }) ===
          month
      );
      return monthlySales.reduce((total, sale) => total + sale.totalAmount, 0);
    });

    // Sum up total sales for the entire year
    return totalSalesByMonth.reduce((total, monthlyTotal) => total + monthlyTotal, 0);
  };

  const totalYearSales = calculateTotalYearSales(selectedYear);

  const weeksInMonth = getWeeksInMonth(selectedYear, selectedMonth);
  const weekLabels = weeksInMonth.map((week, index) => `Week ${index + 1}`);

  // Filter sales by selected year and month
  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.saleDate);
    return (
      saleDate.getFullYear().toString() === selectedYear &&
      saleDate.toLocaleString("en-US", { month: "long" }) === selectedMonth
    );
  });

  // Function to get the date range for the selected week
 const getWeekDateRange = (weekIndex: number) => {
    const firstDayOfMonth = new Date(Number(selectedYear), months.indexOf(selectedMonth), 1);
    const lastDayOfMonth = new Date(Number(selectedYear), months.indexOf(selectedMonth) + 1, 0);

    let startOfWeek: Date;
    let endOfWeek: Date;

    // Get the weekday of the 1st of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDayOfMonth.getDay(); 

    // Adjust the first week's start to the Monday of that week
    // If the first day of the month is not a Monday, we adjust to the previous Monday
    const dayOffset = (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1);  // Adjust to previous Monday (0 = Sunday, 1 = Monday, ...)

    if (weekIndex === 1) {
        // The start of the first week should be the first Monday
        startOfWeek = new Date(firstDayOfMonth);
        startOfWeek.setDate(firstDayOfMonth.getDate() - dayOffset);
    } else {
        // For subsequent weeks, just add (weekIndex - 1) * 7 days to the previous week's start
        startOfWeek = new Date(firstDayOfMonth);
        startOfWeek.setDate(firstDayOfMonth.getDate() - dayOffset + (weekIndex - 1) * 7);
    }

    // End of the week is start + 6 days (Sunday)
    endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // Ensure we do not go beyond the month's last day
    // If the end date is in the next month, adjust it to the last day of the current month
    if (endOfWeek.getMonth() !== firstDayOfMonth.getMonth()) {
        // If it's in the next month, move it to the last day of the current month
        endOfWeek = new Date(lastDayOfMonth);
    }

    // Now, let's check if the start date is in the previous month and adjust if necessary
    if (startOfWeek.getMonth() !== firstDayOfMonth.getMonth()) {
        // If the start date is in the previous month, adjust it to the first day of the current month
        startOfWeek = new Date(firstDayOfMonth);
    }

    return { startDate: startOfWeek, endDate: endOfWeek };
};

// Get start and end dates for the selected week
const { startDate, endDate } = getWeekDateRange(parseInt(selectedWeek.split(" ")[1]));

// Normalize saleDate for comparison (optional)
const normalizeDate = (date: Date): Date => {
    date.setHours(0, 0, 0, 0); // Set to midnight
    return date;
};

// Filter sales data based on selected week
const salesByWeek = sales.filter((sale) => {
  const saleDate = new Date(sale.saleDate);
  return normalizeDate(saleDate) >= normalizeDate(startDate) && normalizeDate(saleDate) <= normalizeDate(endDate);
});




console.log("Final salesByWeek data:", salesByWeek);


  // Initialize sales data by day
  const salesByDay = weekDays.map((day) => ({
    day,
    date: "",
    totalAmount: 0,
    bestProduct: "N/A",
    bestProductAmount: 0,
    productSales: {} as Record<string, number>,
  }));

  console.log("Filtered sales for this week:", salesByWeek);

  // Aggregate sales data and ensure all days are included (even if no sales for that day)
  salesByWeek.forEach((sale) => {
    const saleDate = new Date(sale.saleDate);
    const dayName = saleDate.toLocaleDateString("en-US", { weekday: "long" });
    const formattedDate = saleDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const dayData = salesByDay.find((d) => d.day === dayName);
    if (dayData) {
      dayData.date = formattedDate;
      dayData.totalAmount += sale.totalAmount || 0;
      if (sale.productName) {
        dayData.productSales[sale.productName] =
          (dayData.productSales[sale.productName] || 0) + sale.totalAmount;
      }
    }
  });

  // Calculate total sales for the week
  const totalWeekSales = salesByDay.reduce(
    (total, day) => total + day.totalAmount,
    0
  );

  // Find most productive sales day
  const mostProductiveDay = salesByDay.reduce(
    (best, day) => (day.totalAmount > best.totalAmount ? day : best),
    { day: "N/A", totalAmount: 0 }
  );

  // Calculate total sales for the entire month (across all weeks)
  const totalMonthSales = filteredSales.reduce(
    (total, sale) => total + sale.totalAmount,
    0
  );

  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const findBestSellingProduct = (dayData: any) => {
    const productSales = dayData.productSales;
    let bestProduct = "N/A";
    let bestProductAmount = 0;

    // Find the product with the highest total sales
    for (const [product, amount] of Object.entries(productSales)) {
      const numericAmount = amount as number;
      if (numericAmount > bestProductAmount) {
        bestProduct = product;
        bestProductAmount = numericAmount;
      }
    }

    return { bestProduct, bestProductAmount };
  };
  

  const selectedDayData = salesByDay.find((d) => d.day === selectedDay) || {
    totalAmount: 0,
    bestProduct: "N/A",
    bestProductAmount: 0,
  };

  const { bestProduct, bestProductAmount } =
    findBestSellingProduct(selectedDayData);

  // Calculate sales difference
  let salesDifference = 0;
  let salesTrend = "No Data";
  const selectedDayIndex = weekDays.indexOf(selectedDay);
  const previousDayData =
    selectedDayIndex > 0 ? salesByDay[selectedDayIndex - 1] : null;

  if (previousDayData) {
    salesDifference = selectedDayData.totalAmount - previousDayData.totalAmount;
    salesTrend =
      salesDifference > 0
        ? "Increase"
        : salesDifference < 0
        ? "Decrease"
        : "No Change";
  }
  

  if (isError) return <div className="m-5">Failed to fetch data</div>;

  return (
    <>
     <div
  className="bg-white shadow-md rounded-2xl p-6 h-80 cursor-pointer hover:shadow-2xl hover:scale-105  transition-all"
  onClick={() => setIsModalOpen(true)}
>
  <h2 className="text-lg font-semibold text-gray-700">Sales Summary</h2> <br />
  <p className="text-2xl font-extrabold text-blue-600 hover:text-blue-800 transition-all">
   <h3 className="font-semibold">Total Sales for the year {selectedYear}</h3> <br />
   <p className="text-lg">{totalYearSales.toFixed(2)} XAF</p>
  </p>
  <p className="text-lg text-gray-500 mt-3">
    🧹 Clean up your inventory and get access to your detailed sales summary for the year, month and day. 📊
  </p>
</div>




      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle>
              Detailed Sales Insights for {selectedMonth} {selectedYear}
            </DialogTitle>
            <button
              className="absolute top-2 right-2"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </DialogHeader>

          <div className="flex gap-4 mb-4">
            <div className="mb-4">
            <label className="text-gray-500 text-sm mr-2">Select Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              aria-label="Select Year"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            </div>
          
            <div className="mb-4">
            <label className="text-gray-500 text-sm mr-2">Select Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Select Month"
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            </div>
            
            <div className="mb-4">
              <label className="text-gray-500 text-sm mr-2">Select Week:</label>
              <select
                className="shadow-sm border border-gray-300 bg-white p-2 rounded"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
              >
                {weekLabels.map((weekLabel) => (
                  <option key={weekLabel} value={weekLabel}>
                    {weekLabel}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="text-gray-500 text-sm mr-2">Select Day:</label>
              <select
                className="shadow-sm border border-gray-300 bg-white p-2 rounded"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
              >
                {weekDays.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-5">
            <div className="p-4 bg-gray-100 rounded-lg mb-4">
              <h3 className="font-semibold">Total Sales for {selectedYear}</h3>
              <p className="text-lg">{totalYearSales.toFixed(2)} XAF</p>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg mb-4">
              <h3 className="font-semibold">Total Sales for {selectedMonth}</h3>
              <p className="text-lg">{totalMonthSales.toFixed(2)} XAF</p>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg mb-4">
              <h3 className="font-semibold">Total Sales for {selectedWeek}</h3>
              <p className="text-lg">{totalWeekSales.toFixed(2)} XAF</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={salesByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}k XAF`}
              />
              <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: number, name: string, props: any) => {
                  const activePayload = props.payload[0]; // Get the first item from payload
                  const dayData = salesByDay.find(
                    (day) => day.day === activePayload?.day
                  );

                  return [
                    `${value.toLocaleString("en")} XAF`, // Sales amount formatted
                    dayData ? dayData.date : "", // Full date if available
                  ];
                }}
                labelFormatter={(label: string) => {
                  const dayData = salesByDay.find((day) => day.day === label);
                  return dayData ? dayData.date : label; // Show the full date as label
                }}
              />
              <Bar
                dataKey="totalAmount"
                fill="#3182ce"
                barSize={20}
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold">Sales Change</h3>
              <p
                className={`text-lg ${
                  salesDifference >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {salesDifference >= 0 ? (
                  <TrendingUp className="inline-block w-5 h-5" />
                ) : (
                  <TrendingDown className="inline-block w-5 h-5" />
                )}
                {Math.abs(salesDifference).toFixed(2)} XAF
              </p>
              <p className="text-sm text-gray-500">{salesTrend}</p>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold">Total Amount Sold</h3>
              <p className="text-lg">
                {selectedDayData.totalAmount.toFixed(2) || "0.00"} XAF
              </p>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold">Best-Selling Product</h3>
              <p className="text-lg">{bestProduct}</p>
              <p className="text-sm text-gray-500">
                Sales: {bestProductAmount.toFixed(2)} XAF
              </p>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold">Most Productive Day</h3>
              <p className="text-lg">{mostProductiveDay.day}</p>
              <p className="text-sm text-gray-500">
                Sales: {mostProductiveDay.totalAmount.toFixed(2)} XAF
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CardSalesSummary;
