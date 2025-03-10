"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetSalesQuery } from "@/state/api";
import Header from "../(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Sale } from "@/state/api";


import Navbar from "@/app/(components)/Navbar"; 

const columns: GridColDef<Sale>[] = [
  { field: "saleId", headerName: "Sale ID", width: 150 },
  { field: "paymentType", headerName: "Payment Type", width: 150 },
  { field: "saleDate", headerName: "Sale Date", width: 150 },
  { field: "saleTime", headerName: "Sale Time", width: 150 },
  { field: "productName", headerName: "Product Name", width: 200 },
  { field: "quantity", headerName: "Quantity", width: 150 },
  { 
    field: "unitPrice", 
    headerName: "Unit Price", 
    width: 150,
    renderCell: (params) => `${params.value} XAF` 
  },
  { field: "discount", headerName: "Discount", width: 150 },
  { 
    field: "totalAmount", 
    headerName: "Total Amount", 
    width: 150,
    renderCell: (params) => `${params.value} XAF`
  },
];

const Sales = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { data: sales, isError, isLoading } = useGetSalesQuery();


  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  if (isLoading) {
    return <div className="py-4">Loading sales...</div>;
  }

  if (isError || !sales) {
    return <div className="text-center text-red-500 py-4">Failed to fetch sales</div>;
  }

  // Keep numerical values for proper sorting/filtering in DataGrid
  const formattedSales = sales.map((sale: Sale) => ({
    ...sale,
    unitPrice: sale.unitPrice ?? 0,  
    totalAmount: sale.totalAmount ?? 0, 
    productName: sale.productName,
  }));

  return (
    <div className="flex flex-col">
      
      <Navbar />
      
      <Header name="Sales" />
      <DataGrid
        rows={formattedSales}
        columns={columns}
        getRowId={(row) => row.saleId}
        checkboxSelection
        className="bg-white shadow rounded-lg border border-gray-200 mt-5 !text-gray-700"
      />
    </div>
  );
};

export default Sales;
