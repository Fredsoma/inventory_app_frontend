"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetSalesQuery } from "@/state/api";
import Header from "../(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Sale } from "@/state/api";
import { useTranslation } from 'react-i18next';
import Navbar from "@/app/(components)/Navbar"; 

// Remove the top-level useTranslation hook call

const Sales = () => {
  // Call the hook inside the component
  const { t } = useTranslation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { data: sales, isError, isLoading } = useGetSalesQuery();

  // Define columns inside the component so that `t` is available
  const columns: GridColDef<Sale>[] = [
    { field: "saleId", headerName: t("salelist.saleid"), width: 150,
      headerClassName: "text-blue-700 dark:text-blue-300", // Blue color for header
     },
    { field: "paymentType", headerName: t("salelist.paymenttype"), width: 150,
      headerClassName: "text-blue-700 dark:text-blue-300", // Blue color for header
     },
    { field: "saleDate", headerName: t("salelist.saledate"), width: 150,
      headerClassName: "text-blue-700 dark:text-blue-300", // Blue color for header
     },
    { field: "saleTime", headerName: t("salelist.saletime"), width: 150,
      headerClassName: "text-blue-700 dark:text-blue-300", // Blue color for header
     },
    { field: "productName", headerName: t("salelist.productn"), width: 200,
      headerClassName: "text-blue-700 dark:text-blue-300", // Blue color for header
     },
    { field: "quantity", headerName: t("salelist.qty"), width: 150,
      headerClassName: "text-blue-700 dark:text-blue-300", // Blue color for header
     },
    { 
      field: "unitPrice", 
      headerName: t("salelist.unitprice"), 
      width: 150,
      headerClassName: "text-blue-700 dark:text-blue-300", // Blue color for header
      renderCell: (params) => `${params.value} XAF` 
    },
    { field: "discount", headerName: t("salelist.discount"), width: 150,
      headerClassName: "text-blue-700 dark:text-blue-300", // Blue color for header
      },
    { 
      field: "totalAmount", 
      headerName: t("salelist.totalamount"), 
      width: 150,
      headerClassName: "text-blue-700 dark:text-blue-300", // Blue color for header
      renderCell: (params) => `${params.value} XAF`
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return <div>{t("salelist.loading")}</div>;
  }

  if (isLoading) {
    return <div className="py-4">{t("salelist.loadsales")}</div>;
  }

  if (isError || !sales) {
    return <div className="text-center text-red-500 py-4">{t("salelist.failfetch")}</div>;
  }

  const formattedSales = sales.map((sale: Sale) => ({
    ...sale,
    unitPrice: sale.unitPrice ?? 0,  
    totalAmount: sale.totalAmount ?? 0, 
    productName: sale.productName,
  }));

  return (
    <div className="flex flex-col">
      <Navbar />
      <Header name={t("salelist.saleheader")} />
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
