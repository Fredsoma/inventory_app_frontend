"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGetProductsQuery, useDeleteProductMutation } from "@/state/api";
import Header from "../(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Trash2 } from "lucide-react";
import IconButton from "@mui/material/IconButton";
import Navbar from "@/app/(components)/Navbar";
import toast from "react-hot-toast";

// Define Product type with the 'active' field
type Product = {
  productId: string;
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  active: boolean;
};

const Inventory = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const router = useRouter();
  const [activeToasts, setActiveToasts] = useState<Record<string, boolean>>({});

  // UseEffect for authentication check
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const { data: products, isError, isLoading } = useGetProductsQuery();
  const [deleteProduct] = useDeleteProductMutation();
  const [productsList, setProducts] = useState<Product[]>([]);

  // Memoize the triggerLowStockToast function using useCallback
  const triggerLowStockToast = useCallback(
    (product: Product) => {
       toast.error(
        <>
          ⚠️ Low stock: {product.name} - Only {product.stockQuantity} left!
          <button
            onClick={() => dismissToast(product.productId)}
            className="ml-2 text-blue-500 underline"
          >
            Dismiss
          </button>
        </>,
        {
          duration: Infinity,
          id: product.productId,
        }
      );

      setActiveToasts((prev) => {
        const updatedToasts = { ...prev, [product.productId]: true };
        localStorage.setItem("activeToasts", JSON.stringify(updatedToasts)); // Persist alerts
        return updatedToasts;
      });
    },
    [] // Empty dependency array, the function doesn't depend on any props or state
  );

  // Function to dismiss individual toast
  const dismissToast = (productId: string) => {
    toast.dismiss(productId);
    setActiveToasts((prev) => {
      const updatedToasts = { ...prev };
      delete updatedToasts[productId]; // Remove from active toasts
      localStorage.setItem("activeToasts", JSON.stringify(updatedToasts));
      return updatedToasts;
    });
  };

  useEffect(() => {
    if (products) {
      const storedActiveStates = JSON.parse(localStorage.getItem("activeStates") || "{}");
      const storedToasts = JSON.parse(localStorage.getItem("activeToasts") || "{}");

      // Set the initial active state of products
      const updatedProducts = products.map((product) => ({
        ...product,
        active: storedActiveStates[product.productId] ?? product.stockQuantity > 0,
      }));

      setProducts(updatedProducts);
      setActiveToasts(storedToasts);

      // Trigger Low Stock Alerts for active products only
      updatedProducts.forEach((product) => {
        if (product.stockQuantity < 5 && product.active && !storedToasts[product.productId]) {
          triggerLowStockToast(product);
        }
      });
    }
  }, [products, triggerLowStockToast]); // Add triggerLowStockToast to the dependency array

  const handleDelete = async (productId: string) => {
    const previousProducts = [...productsList];
    try {
      setProducts(productsList.filter((product) => product.productId !== productId));
      await deleteProduct(productId).unwrap();
      toast.success("Product deleted successfully!");
    } catch {
      setProducts(previousProducts);
      toast.error("Failed to delete product.");
    }
  };

  const handleToggleActive = (productId: string) => {
    const updatedProducts = productsList.map((product) =>
      product.productId === productId
        ? { ...product, active: !product.active }
        : product
    );

    // Update localStorage to persist active state changes
    const updatedActiveStates = updatedProducts.reduce((acc, product) => {
      acc[product.productId] = product.active;
      return acc;
    }, {} as Record<string, boolean>);

    localStorage.setItem("activeStates", JSON.stringify(updatedActiveStates));

    // If the product is active and has low stock, trigger a toast alert
    const updatedProduct = updatedProducts.find((product) => product.productId === productId);
    if (updatedProduct && updatedProduct.active && updatedProduct.stockQuantity < 5) {
      if (!activeToasts[updatedProduct.productId]) {
        triggerLowStockToast(updatedProduct);
      }
    }

    setProducts(updatedProducts);
  };

  const columns: GridColDef[] = [
    { field: "productId", headerName: "ID", width: 90 },
    { field: "name", headerName: "Product Name", width: 200 },
    {
      field: "price",
      headerName: "Price",
      width: 110,
      valueGetter: (value, row) => `${row.price} XAF`,
    },
    { field: "rating", headerName: "Rating", width: 110 },
    { field: "stockQuantity", headerName: "Stock Quantity", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 250,
      renderCell: (params) => (
        <>
          <IconButton
            aria-label="delete"
            onClick={() => handleDelete(params.row.productId)}
            color="secondary"
          >
            <Trash2 size={20} />
          </IconButton>
          {params.row.stockQuantity === 0 && (
            <button
              onClick={() => handleToggleActive(params.row.productId)}
              className={`ml-2 px-4 py-2 rounded ${params.row.active ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
            >
              {params.row.active ? "Active" : "Inactive"}
            </button>
          )}
        </>
      ),
    },
  ];

  const handleToggleShowInactive = () => {
    setShowInactive((prev) => !prev);
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !products) {
    return <div className="text-center text-red-500 py-4">Failed to fetch products</div>;
  }

  return (
    <div className="flex flex-col">
      <Navbar />
      <Header name="Inventory" />
      <button
        onClick={handleToggleShowInactive}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {showInactive ? "Hide Inactive Products" : "Show Inactive Products"}
      </button>
      <DataGrid
        rows={productsList.filter((product) => product.active || showInactive)}
        columns={columns}
        getRowId={(row) => row.productId}
        checkboxSelection
        className="bg-white shadow rounded-lg border border-gray-200 mt-5 !text-gray-700"
      />
    </div>
  );
};

export default Inventory;
