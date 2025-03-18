import React, { ChangeEvent, FormEvent, useState } from "react";
import { v4 } from "uuid";
import Header from "@/app/(components)/Header";
import { UPLOAD_IPFS_IMAGE } from "@/context";
import { useTranslation } from "react-i18next";

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

const CreateProductModal = ({
  isOpen,
  onClose,
  onCreate,
}: CreateProductModalProps) => {
  const { t } = useTranslation();
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
      console.error(t("createproductmodal.uploadfail"), error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <Header
          name={t("createproductmodal.createnewp")}
          className="text-gray-900 dark:text-white"
        />
        <form onSubmit={handleSubmit} className="mt-5">
          {/* PRODUCT NAME */}
          <label
            htmlFor="productName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("createproductmodal.productlabel")}
          </label>
          <input
            type="text"
            name="name"
            placeholder={t("createproductmodal.name")}
            onChange={handleChange}
            value={formData.name}
            className="block w-full mb-2 p-2 border-gray-500 border-2 rounded-md bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* PRICE */}
          <label
            htmlFor="productPrice"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("createproductmodal.price")}
          </label>
          <input
            type="number"
            name="price"
            placeholder={t("createproductmodal.Price")}
            onChange={handleChange}
            value={formData.price}
            className="block w-full mb-2 p-2 border-gray-500 border-2 rounded-md bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* STOCK QUANTITY */}
          <label
            htmlFor="stockQuantity"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("createproductmodal.stockqty")}
          </label>
          <input
            type="number"
            name="stockQuantity"
            placeholder={t("createproductmodal.stockqty")}
            onChange={handleChange}
            value={formData.stockQuantity}
            className="block w-full mb-2 p-2 border-gray-500 border-2 rounded-md bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* RATING */}
          <label
            htmlFor="rating"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("createproductmodal.rating")}
          </label>
          <input
            type="number"
            name="rating"
            placeholder={t("createproductmodal.rating")}
            onChange={handleChange}
            value={formData.rating}
            className="block w-full mb-2 p-2 border-gray-500 border-2 rounded-md bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* IMAGE UPLOAD */}
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t("createproductmodal.productimage")}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full mb-2 p-2 border-gray-500 border-2 rounded-md bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* LOADER */}
          {isLoading && (
            <div className="flex justify-center mb-4">
              <div
                className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-t-4 border-blue-600 rounded-full"
                role="status"
              >
                <span className="text-gray-950">
                  {t("createproductmodal.loading")}
                </span>
              </div>
            </div>
          )}

          {/* CREATE ACTIONS */}
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            disabled={isLoading}
          >
            {t("createproductmodal.create")}
          </button>
          <button
            onClick={onClose}
            type="button"
            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
          >
            {t("createproductmodal.cancel")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;
