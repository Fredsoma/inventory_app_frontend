import { useGetDashboardMetricsQuery, useGetSalesQuery } from "@/state/api";
import { ShoppingBag } from "lucide-react";
import React from "react";
import Rating from "../(components)/Rating";
import Image from "next/image";

const CardPopularProducts = () => {
  const { data: dashboardMetrics, isLoading: metricsLoading } = useGetDashboardMetricsQuery();
  const { data: sales, isLoading: salesLoading } = useGetSalesQuery();

  {/*
  // Define an array of image URLs with unique tokens
  const imageUrls = [
    "https://firebasestorage.googleapis.com/v0/b/oprahv1.appspot.com/o/product1.png?alt=media&token=6a6866f9-23f9-4988-a2ae-746c8acd7e1b",
    "https://firebasestorage.googleapis.com/v0/b/oprahv1.appspot.com/o/product2.png?alt=media&token=5274638f-7c32-4878-acca-b656eb86ea32",
    "https://firebasestorage.googleapis.com/v0/b/oprahv1.appspot.com/o/product3.png?alt=media&token=f5e72b3b-3743-4d89-acc0-3ff182c69a60",
  ]; */ }

  // Check loading states
  if (metricsLoading || salesLoading) {
    return <div className="m-5">Loading...</div>;
  }

  // Early return if sales data is undefined or empty
  if (!sales || sales.length === 0) {
    return <div className="m-5">No sales data available.</div>;
  }

  // Create a map to aggregate sales data
  const productSalesMap = sales.reduce((acc, sale) => {
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
    const salesData = productSalesMap[product.productId] || { quantity: 0, totalAmount: 0 };
    return {
      ...product,
      ...salesData,
    };
  }).sort((a, b) => b.totalAmount - a.totalAmount); // Sort by total sales amount

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl pb-16">
      <h3 className="text-lg font-semibold px-7 pt-5 pb-2">
        Popular Products
      </h3>
      <hr />
      <div className="overflow-auto h-full">
        {popularProducts.length > 0 ? (
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
                    {product.name || 'Unnamed Product'}
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
                  Total Sales: {product.totalAmount.toFixed(2)} XAF Sold
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="m-5">No popular products available.</div>
        )}
      </div>
    </div>
  );
};

export default CardPopularProducts;
