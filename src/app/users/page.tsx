"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetUsersQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Navbar from "@/app/(components)/Navbar";
import { useTranslation } from 'react-i18next';

const Users = () => {
  // Call the hook inside the component body
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Define columns inside the component so that t() is available
  const columns: GridColDef[] = [
    { field: "userId", headerName: "ID", width: 90,
      headerClassName: "text-blue-700 dark:text-blue-300", // Blue color for header
     },
    { field: "username", headerName: t("users.name"), width: 200,
      headerClassName: "text-blue-700 dark:text-blue-300", // Blue color for header
     },
    { field: "email", headerName: "Email", width: 200,
      headerClassName: "text-blue-700 dark:text-blue-300", // Blue color for header
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

  const { data: users, isError, isLoading } = useGetUsersQuery();

  if (!isAuthenticated) {
    return <div>{t("users.loading")}</div>;
  }

  if (isLoading) {
    return <div className="py-4">{t("users.loading")}</div>;
  }

  if (isError || !users) {
    return (
      <div className="text-center text-red-500 py-4">{t("users.userfail")}</div>
    );
  }

  return (
    <div className="flex flex-col">
      <Navbar />
      <Header name={t("users.loginusers")} />
      <DataGrid
        rows={users}
        columns={columns}
        getRowId={(row) => row.userId}
        checkboxSelection
        className="bg-white shadow rounded-lg border border-gray-200 mt-5 !text-gray-700"
      />
    </div>
  );
};

export default Users;
