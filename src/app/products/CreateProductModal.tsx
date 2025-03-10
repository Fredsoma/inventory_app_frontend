import React, { ChangeEvent, FormEvent, useState } from "react";
import { v4 } from "uuid";
import Header from "@/app/(components)/Header";
import { UPLOAD_IPFS_IMAGE } from "@/context";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useCreateProductMutation } from "@/state/api"; 
type ProductFormData = {
  name: string;
  price: number;
  stockQuantity: number;
  rating: number;
  imageUrl: string; 
};

type CreateProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: ProductFormData) => void;
};

const CreateProductModal = ({ isOpen, onClose, onCreate }: CreateProductModalProps) => {
  const [formData, setFormData] = useState({
    productId: v4(),
    name: "",
    price: 0,
    stockQuantity: 0,
    rating: 0,
    imageUrl: "", 
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false); 

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "price" || name === "stockQuantity" || name === "rating"
          ? parseFloat(value)
          : value,
    });
  };

  // Handle image file change
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setImageFile(file);
    }
  };

  // Handle form submission
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    let uploadedImageUrl: string = "";

    // Check if an image file is selected and upload it
    if (imageFile) {
      uploadedImageUrl = (await UPLOAD_IPFS_IMAGE(imageFile)) ?? "";
    }

    // Create a new form data object with the uploaded image URL
    const newFormData = {
      ...formData,
      imageUrl: uploadedImageUrl, 
    };

    
    onCreate(newFormData);

    
    onClose();
  } catch (error) {
    console.error("Image upload failed", error);
  } finally {
    setIsLoading(false);
  }
};



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <Header name="Create New Product" />
        <form onSubmit={handleSubmit} className="mt-5">
          {/* PRODUCT NAME */}
          <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            value={formData.name}
            className="block w-full mb-2 p-2 border-gray-500 border-2 rounded-md"
            required
          />

          {/* PRICE */}
          <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            type="number"
            name="price"
            placeholder="Price"
            onChange={handleChange}
            value={formData.price}
            className="block w-full mb-2 p-2 border-gray-500 border-2 rounded-md"
            required
          />

          {/* STOCK QUANTITY */}
          <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700">
            Stock Quantity
          </label>
          <input
            type="number"
            name="stockQuantity"
            placeholder="Stock Quantity"
            onChange={handleChange}
            value={formData.stockQuantity}
            className="block w-full mb-2 p-2 border-gray-500 border-2 rounded-md"
            required
          />

          {/* RATING */}
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
            Rating
          </label>
          <input
            type="number"
            name="rating"
            placeholder="Rating"
            onChange={handleChange}
            value={formData.rating}
            className="block w-full mb-2 p-2 border-gray-500 border-2 rounded-md"
            required
          />

          {/* IMAGE UPLOAD */}
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full mb-2 p-2 border-gray-500 border-2 rounded-md"
          />

          {/* LOADER */}
          {isLoading && (
            <div className="flex justify-center mb-4">
              <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-t-4 border-blue-600 rounded-full" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {/* CREATE ACTIONS */}
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            disabled={isLoading} 
          >
            Create
          </button>
          <button
            onClick={onClose}
            type="button"
            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;
