"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGetProductsQuery } from "@/state/api";
// Removed unused deleteProduct import and hook
import Header from "../(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Trash2 } from "lucide-react";
import IconButton from "@mui/material/IconButton";
import Navbar from "@/app/(components)/Navbar";
import toast from "react-hot-toast";
import DeleteConfirmationDialog from "../(components)/ui/DeleteConfirmationDialog";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Removed activeToasts state since it's not used in rendering:
  // const [activeToasts, setActiveToasts] = useState<Record<string, boolean>>({});
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState("");
  const [inputId, setInputId] = useState("");
  const [openInactiveDialog, setOpenInactiveDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const { data: products, isError, isLoading } = useGetProductsQuery();
  const [productsList, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (products) {
      setProducts(products);
    }
  }, [products]);

  const openDeleteConfirmation = (productId: string) => {
    setProductIdToDelete(productId);
    setOpenDeleteModal(true);
  };

  const triggerLowStockToast = useCallback(
    (product: Product) => {
      toast.error(
        <>
          ⚠️ {t("inventory.lowstock")}: {product.name} - {t("inventory.only")} {product.stockQuantity} {t("inventory.left")}
          <button
            onClick={() => dismissToast(product.productId)}
            className="ml-2 text-blue-500 underline"
          >
            {t("inventory.dismiss")}
          </button>
        </>,
        {
          duration: Infinity,
          id: product.productId,
        }
      );

      // Instead of using state, update localStorage directly if needed.
      const storedToasts = JSON.parse(localStorage.getItem("activeToasts") || "{}");
      storedToasts[product.productId] = true;
      localStorage.setItem("activeToasts", JSON.stringify(storedToasts));
    },
    [t] // Added t as dependency
  );

  const dismissToast = (productId: string) => {
    toast.dismiss(productId);
    const storedToasts = JSON.parse(localStorage.getItem("activeToasts") || "{}");
    delete storedToasts[productId];
    localStorage.setItem("activeToasts", JSON.stringify(storedToasts));
  };

  useEffect(() => {
    if (products) {
      const storedActiveStates = JSON.parse(localStorage.getItem("activeStates") || "{}");
      const storedToasts = JSON.parse(localStorage.getItem("activeToasts") || "{}");

      const updatedProducts = products.map((product) => ({
        ...product,
        active: storedActiveStates[product.productId] ?? product.stockQuantity > 0,
      }));

      setProducts(updatedProducts);

      updatedProducts.forEach((product) => {
        if (product.stockQuantity < 5 && product.active && !storedToasts[product.productId]) {
          triggerLowStockToast(product);
        }
      });
    }
  }, [products, triggerLowStockToast]);

  const handleDelete = async () => {
    const productToDelete = productsList.find((product) => product.productId === productIdToDelete);

    if (!productToDelete) {
      toast.error(t("inventory.pnotfound"));
      return;
    }

    if (productToDelete.stockQuantity > 0) {
      toast.error(t("inventory.cantdeactivate"));
      return; // Stop the deletion process
    }

    const previousProducts = [...productsList];

    try {
      const updatedProducts = productsList.map((product) =>
        product.productId === productIdToDelete && product.stockQuantity === 0
          ? { ...product, active: false }
          : product
      );

      const updatedActiveStates = updatedProducts.reduce((acc, product) => {
        acc[product.productId] = product.active;
        return acc;
      }, {} as Record<string, boolean>);

      localStorage.setItem("activeStates", JSON.stringify(updatedActiveStates));
      setProducts(updatedProducts);
      toast.success(t("inventory.markinactive"));
    } catch {
      setProducts(previousProducts);
      toast.error(t("inventory.markfail"));
    } finally {
      setOpenDeleteModal(false);
    }
  };

  const handleToggleActive = (productId: string) => {
    const updatedProducts = productsList.map((product) => {
      if (product.productId === productId) {
        if (product.stockQuantity > 0) {
          toast.error(t("inventory.cantdeactivate"));
          return product; // Don't change anything if stock > 0
        }
        return { ...product, active: !product.active }; // Only toggle if stock === 0
      }
      return product;
    });

    // Save active states to localStorage
    const updatedActiveStates = updatedProducts.reduce((acc, product) => {
      acc[product.productId] = product.active;
      return acc;
    }, {} as Record<string, boolean>);

    localStorage.setItem("activeStates", JSON.stringify(updatedActiveStates));
    setProducts(updatedProducts); // Update the state
  };

  const openInactiveProductsDialog = () => {
    setOpenInactiveDialog(true);
  };

  const closeInactiveProductsDialog = () => {
    setOpenInactiveDialog(false);
  };

  const columns: GridColDef[] = [
    { field: "productId", headerName: "ID", width: 90, headerClassName: "text-blue-700 dark:text-blue-300" },
    {
      field: "name",
      headerName: t("inventory.productlabel"),
      width: 200,
      headerClassName: "text-blue-700 dark:text-blue-300",
    },
    {
      field: "price",
      headerName: t("inventory.price"),
      width: 110,
      valueGetter: (value, row) => `${row.price} XAF`,
      headerClassName: "text-blue-700 dark:text-blue-300",
    },
    {
      field: "rating",
      headerName: t("inventory.rating"),
      width: 110,
      headerClassName: "text-blue-700 dark:text-blue-300",
    },
    {
      field: "stockQuantity",
      headerName: t("inventory.stockqty"),
      width: 150,
      headerClassName: "text-blue-700 dark:text-blue-300",
    },
    {
      field: "actions",
      headerName: t("inventory.actions"),
      width: 250,
      headerClassName: "text-blue-700 dark:text-blue-300",
      renderCell: (params) => (
        <IconButton
          aria-label={t("inventory.delete")}
          onClick={() => openDeleteConfirmation(params.row.productId)}
          color="secondary"
        >
          <Trash2 size={20} />
        </IconButton>
      ),
    },
  ];

  if (!isAuthenticated) {
    return <div>{t("inventory.loading")}</div>;
  }

  if (isLoading) {
    return <div className="py-4">{t("inventory.loading")}</div>;
  }

  if (isError || !products) {
    return <div className="text-center text-red-500 py-4">{t("inventory.failfetchp")}</div>;
  }

  return (
    <div className="flex flex-col">
      <Navbar />
      <div className="flex justify-between items-center">
        <Header name={t("inventory.invent")} />
        <button onClick={openInactiveProductsDialog} className="px-4 py-2 bg-gray-500 text-white rounded-md">
          {t("inventory.viewinactif")}
        </button>
      </div>
      <DataGrid
        rows={productsList.filter((product) => product.active)}
        columns={columns}
        getRowId={(row) => row.productId}
        checkboxSelection
        className="bg-white shadow rounded-lg border border-gray-200 mt-5 !text-gray-700"
      />

      <Dialog open={openInactiveDialog} onClose={closeInactiveProductsDialog}>
        <DialogTitle>{t("inventory.inactifp")}</DialogTitle>
        <DialogContent sx={{ width: "500px", paddingBottom: "20px" }}>
          <div className="flex flex-col">
            {productsList.filter((product) => !product.active).map((product) => (
              <div key={product.productId} className="flex justify-between items-center border-b py-3">
                <div>
                  <div className="text-lg font-semibold">{product.name}</div>
                  <div>{product.productId}</div>
                  <div>{product.price} XAF</div>
                  <div>
                    {product.stockQuantity} {t("inventory.instock")}
                  </div>
                </div>
                <button onClick={() => handleToggleActive(product.productId)} className="px-4 py-2 bg-blue-500 text-white rounded-md">
                  {t("inventory.reactivate")}
                </button>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeInactiveProductsDialog} color="primary">
            {t("inventory.close")}
          </Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmationDialog
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        productIdToDelete={productIdToDelete}
        inputId={inputId}
        setInputId={setInputId}
        handleDelete={handleDelete}
      />
    </div>
  );
};

export default Inventory;
