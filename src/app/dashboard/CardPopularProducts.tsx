import { useGetDashboardMetricsQuery, useGetSalesQuery } from "@/state/api";
import { ShoppingBag } from "lucide-react";
import React from "react";
import Rating from "../(components)/Rating";
import Image from "next/image";
import { useTranslation } from "react-i18next";

const CardPopularProducts = () => {
  const { t } = useTranslation();
  const { data: dashboardMetrics, isLoading: metricsLoading } = useGetDashboardMetricsQuery();
  const { data: sales, isLoading: salesLoading } = useGetSalesQuery();

  const isLoading = metricsLoading || salesLoading;

  const productSalesMap = sales?.reduce((acc, sale) => {
    const { productId, quantity = 0, totalAmount = 0 } = sale;
    if (!acc[productId]) acc[productId] = { quantity: 0, totalAmount: 0 };
    acc[productId].quantity += quantity;
    acc[productId].totalAmount += totalAmount;
    return acc;
  }, {} as Record<string, { quantity: number; totalAmount: number }>);

  const popularProducts = (dashboardMetrics?.popularProducts || []).map(product => {
    const salesData = productSalesMap ? productSalesMap[product.productId] || { quantity: 0, totalAmount: 0 } : { quantity: 0, totalAmount: 0 };
    return {
      ...product,
      ...salesData,
    };
  }).sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));

  return (
    // Fixed height so we always show header + 4 items before scroll.
    // h-[384px] ≈ header (64px) + 4 * item height (80px)
    <div className="bg-white shadow-md rounded-2xl flex flex-col h-[384px]">
      <div className="px-7 pt-5 pb-2">
        <h3 className="text-lg font-semibold">{t("popularProducts.title")}</h3>
      </div>

      <hr />

      {/* Scrollable list area fills remaining space */}
      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="m-5 text-center text-gray-500">{t("popularProducts.loading")}</div>
        ) : (!sales || sales.length === 0) ? (
          <div className="m-5 text-center text-gray-500">{t("popularProducts.noSalesData")}</div>
        ) : popularProducts.length > 0 ? (
          popularProducts.map((product) => (
            // each row has fixed height => consistent 4 rows shown
            <div
              key={product.productId}
              className="flex items-center justify-between gap-3 px-5 h-20 border-b"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={product.imageUrl || "/placeholder.png"}
                  alt={product.name || t("popularProducts.unnamedProduct")}
                  width={56}
                  height={56}
                  className="rounded-lg w-14 h-14 object-cover"
                />

                <div className="flex flex-col justify-between gap-1">
                  <div className="font-bold text-gray-700 truncate max-w-[140px]">
                    {product.name || t("popularProducts.unnamedProduct")}
                  </div>
                  <div className="flex text-sm items-center">
                    <span className="font-bold text-blue-500 text-xs">
                      {product.price ?? 0} XAF
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
                <span className="ml-2 font-bold text-green-600 text-right">
                  {t("popularProducts.totalSales")}: {(product.totalAmount || 0).toFixed(2)} XAF • {t("popularProducts.soldtitle")}
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
