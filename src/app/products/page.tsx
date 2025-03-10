"use client";

import { useCreateProductMutation, useGetProductsQuery, useUpdateProductStockMutation } from "@/state/api";  // Import the correct mutation
import { PlusCircleIcon, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/(components)/Header";
import Rating from "@/app/(components)/Rating";
import CreateProductModal from "./CreateProductModal";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/app/(components)/Navbar";

type ProductFormData = {
  name: string;
  price: number;
  stockQuantity: number;
  rating: number;
  imageUrl: string;
};

const imageUrls = [
  "https://firebasestorage.googleapis.com/v0/b/oprahv1.appspot.com/o/product1.png?alt=media&token=6a6866f9-23f9-4988-a2ae-746c8acd7e1b",
  "https://firebasestorage.googleapis.com/v0/b/oprahv1.appspot.com/o/product2.png?alt=media&token=5274638f-7c32-4878-acca-b656eb86ea32",
  "https://firebasestorage.googleapis.com/v0/b/oprahv1.appspot.com/o/product3.png?alt=media&token=f5e72b3b-3743-4d89-acc0-3ff182c69a60",
];

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [newStock, setNewStock] = useState<number | null>(null);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false); // State to track stock update loading

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const { data: products, isLoading, isError, refetch  } = useGetProductsQuery(searchTerm, {
    pollingInterval: 1000, // Fetch new data every 5 seconds
  });
  const [createProduct] = useCreateProductMutation();
  const [updateProductStock] = useUpdateProductStockMutation(); // Use the updated stock mutation

  const handleCreateProduct = async (productData: ProductFormData) => {
    try {
      await createProduct(productData).unwrap();
      toast.success("Product created successfully!", { duration: 4000 });
    } catch {
      toast.error("Failed to create product. Try again!", { duration: 4000 });
    }
  };

  const handleUpdateStock = async (productId: string, newStock: number | null, currentStock: number) => {
    if (newStock === null || isNaN(newStock)) {
      toast.error("Please enter a valid stock quantity.");
      return;
    }
  
    if (newStock < 0) {
      toast.error("Stock quantity cannot be negative.");
      return;
    }
  
    if (newStock < currentStock) {
      toast.error("New stock quantity cannot be less than the current stock quantity.");
      return;
    }
  
    // Set the state to show loader
    setIsUpdatingStock(true);
  
    try {
      // Update stock in backend
      await updateProductStock({ productId, stockQuantity: newStock }).unwrap(); // Make sure this hits the backend and updates the stock in your DB
      
      // After updating, refetch the products to reflect changes
      await refetch(); // This is how you can refetch data with React Query if you're using it
  
      toast.success("Stock updated successfully!");
      setEditingProduct(null); // Close the input field after updating
      setNewStock(null); // Reset input field
    } catch {
      toast.error("Failed to update stock.");
    } finally {
      // Reset the loading state
      setIsUpdatingStock(false);
    }
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
    <div className="mx-auto pb-5 w-full">
      <Navbar />

      <Toaster position="top-center" toastOptions={{ duration: 5000 }} />

      {/* SEARCH BAR */}
      <div className="mb-6">
        <div className="flex items-center border-2 border-gray-200 rounded">
          <SearchIcon className="w-5 h-5 text-gray-500 m-2" />
          <input
            className="w-full py-2 px-4 rounded bg-white"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-6">
        <Header name="Products" />
        <button
          className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" /> Create Product
        </button>
      </div>

      {/* PRODUCTS LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-between">
        {products?.map((product) => (
          <div key={product.productId} className="border shadow rounded-md p-4 max-w-full w-full mx-auto">
            <div className="flex flex-col items-center">
              <Image
                src={product.imageUrl || imageUrls[0]}
                alt={product.name}
                width={150}
                height={150}
                className="mb-3 rounded-2xl w-36 h-36"
              />
              <h3 className="text-lg text-gray-900 font-semibold">{product.name}</h3>
              <p className="text-gray-800">{product.price.toFixed(2)} XAF</p>
              <div className="text-sm text-gray-600 mt-1">Stock: {product.stockQuantity}</div>

              {product.rating && (
                <div className="flex items-center mt-2">
                  <Rating rating={product.rating} />
                </div>
              )}

              {/* UPDATE STOCK BUTTON */}
              <button
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={() => setEditingProduct(product.productId)}
              >
                Update Stock
              </button>

              {/* STOCK UPDATE INPUT FIELD */}
              {editingProduct === product.productId && (
                <div className="mt-2 flex flex-col items-center">
                  <input
                    type="number"
                    value={newStock ?? ""}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      setNewStock(isNaN(value) ? null : value);
                    }}
                    min={product.stockQuantity}
                    className="border px-2 py-1 rounded w-20 text-center"
                    placeholder="New stock"
                  />

                  <button
                    className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    onClick={() => handleUpdateStock(product.productId, newStock, product.stockQuantity)}
                  >
                    {isUpdatingStock ? (
                      <div className="animate-spin h-5 w-5 border-t-2 border-blue-500 border-solid rounded-full"></div> // Spinner
                    ) : (
                      "Confirm Update"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <CreateProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreateProduct} />
    </div>
  );
};

export default Products;
