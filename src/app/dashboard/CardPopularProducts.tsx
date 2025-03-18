import { useGetDashboardMetricsQuery, useGetSalesQuery } from "@/state/api";
import { ShoppingBag } from "lucide-react";
import React from "react";
import Rating from "../(components)/Rating";
import Image from "next/image";
import { useTranslation } from "react-i18next";

const CardPopularProducts = () => {
  const { t } = useTranslation(); 
  const { data: dashboardMetrics, isLoading: metricsLoading, error: metricsError } = useGetDashboardMetricsQuery();
  const { data: sales, isLoading: salesLoading } = useGetSalesQuery();
  console.log("Dashboard Metrics Data:", dashboardMetrics);
  console.log("Dashboard Metrics Error:", metricsError);

  // Check loading states
  const isLoading = metricsLoading || salesLoading;

  // Create a map to aggregate sales data
  const productSalesMap = sales?.reduce((acc, sale) => {
    const { productId, quantity, totalAmount } = sale;

    if (!acc[productId]) {
      acc[productId] = { quantity: 0, totalAmount: 0 };
    }
    acc[productId].quantity += quantity; // Aggregate quantities sold
    acc[productId].totalAmount += totalAmount; // Aggregate total amounts

    return acc;
  }, {} as Record<string, { quantity: number; totalAmount: number }>);

  // Create an array of popular products based on sales
  const popularProducts = (dashboardMetrics?.popularProducts || []).map(product => {
    const salesData = productSalesMap ? productSalesMap[product.productId] || { quantity: 0, totalAmount: 0 } : { quantity: 0, totalAmount: 0 };
    return {
      ...product,
      ...salesData,
    };
  }).sort((a, b) => b.totalAmount - a.totalAmount); // Sort by total sales amount

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl pb-16">
      <h3 className="text-lg font-semibold px-7 pt-5 pb-2">
      {t("popularProducts.title")}
      </h3>
      <hr />
      <div className="overflow-auto h-full">
        {/* Show Loading state inside the container */}
        {isLoading ? (
          <div className="m-5 text-center text-gray-500">{t("popularProducts.loading")}</div>
        ) : (!sales || sales.length === 0) ? (
          <div className="m-5 text-center text-gray-500">{t("popularProducts.noSalesData")}</div>
        ) : popularProducts.length > 0 ? (
          popularProducts.map((product) => (
            <div
              key={product.productId}
              className="flex items-center justify-between gap-3 px-5 py-7 border-b"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={product.imageUrl} // Random image for demo purposes
                  alt={product.name}
                  width={48}
                  height={48}
                  className="rounded-lg w-14 h-14"
                />

                <div className="flex flex-col justify-between gap-1">
                  <div className="font-bold text-gray-700">
                    {product.name || t("popularProducts.unnamedProduct")}
                  </div>
                  <div className="flex text-sm items-center">
                    <span className="font-bold text-blue-500 text-xs">
                      {product.price} XAF
                    </span>
                    <span className="mx-2">|</span>
                    <Rating rating={product.rating || 0} />
                  </div>
                </div>
              </div>

              <div className="text-xs flex items-center">
                <button className="p-2 rounded-full bg-blue-100 text-blue-600 mr-2">
                  <ShoppingBag className="w-4 h-4" />
                </button>
                <span className="ml-2 font-bold text-green-600">
                {t("popularProducts.totalSales")}: {product.totalAmount.toFixed(2)} XAF  {t("popularProducts.soldtitle")}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="m-5 text-center text-gray-500">{t("popularProducts.noProducts")}</div>
        )}
      </div>
    </div>
  );
};

export default CardPopularProducts;
