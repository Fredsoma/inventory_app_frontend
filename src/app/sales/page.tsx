"use client";

import { useCreateSaleMutation} from "@/state/api";
import React, { useState, useEffect } from "react";
import { useGetProductsQuery } from "@/state/api";
import { v4 } from "uuid";
import { useRouter } from "next/navigation";
import Navbar from "../(components)/Navbar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
import toast, { Toaster } from "react-hot-toast"; 

interface Sale {
  saleId: string;
  paymentType: string;
  saleDate: string;
  saleTime: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  phoneNumber?: string; // Optional phone number for Momo/OM payments
}

const Sales: React.FC = () => {
  const [sale, setSale] = useState<Partial<Sale>>({
    saleId: v4(),
    paymentType: "",
    saleDate: "",
    saleTime: "",
    productName: "",
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    total: 0,
  });

  const [phoneNumber, setPhoneNumber] = useState<string>(""); // New state for phone number
  const [loading, setLoading] = useState<boolean>(false); // Loading state for the loader

  // Function to generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
  
    // Set document title and basic details
    doc.setFontSize(18);
    doc.text("Sales Receipt", 14, 20);
  
    doc.setFontSize(12);
    doc.text(`Sale ID: ${sale.saleId}`, 14, 30);
    doc.text(`Payment Type: ${sale.paymentType}`, 14, 40);
    doc.text(`Sale Date: ${sale.saleDate}`, 14, 50);
    doc.text(`Sale Time: ${sale.saleTime}`, 14, 60);

    // Add phone number to the PDF if payment type is Momo or OM
    if (sale.paymentType === "Momo" || sale.paymentType === "OM") {
      doc.text(`Phone Number: ${phoneNumber}`, 14, 70);
    }
  
    // Define the table's headers and data
    const tableHeaders = [["Product Name", "Quantity", "Unit Price (XAF)", "Discount (%)", "Total (XAF)"]];
    const tableData = [
      [
        sale.productName || "N/A",
        sale.quantity || 0,
        sale.unitPrice ? sale.unitPrice.toFixed(2) : "0.00",
        sale.discount ? sale.discount.toFixed(2) : "0.00",
        finalTotal.toFixed(2),
      ],
    ];
  
    // Add table to the PDF
    autoTable(doc, {
      startY: 70, // Start below the sale details
      head: tableHeaders,
      body: tableData,
    });
  
    // Get the current Y position of the PDF after the table
    const currentY = doc.internal.pageSize.height - 20; // Safe bottom margin
    const totalAmountY = currentY + 10; // Total amount is 10 units below the bottom of the page
  
    // Add total amount text below the table
    doc.text(`Total Amount: ${finalTotal.toFixed(2)} XAF`, 14, totalAmountY);
  
    // Save the PDF
    doc.save("sales_receipt.pdf");

    toast.success("Sales receipt PDF created successfully!",  { duration: 5000 }); 
  };
  
  const [createSale] = useCreateSaleMutation();
  const { data: products, isError, isLoading, refetch } = useGetProductsQuery(); // Get refetch method
  const [finalTotal, setFinalTotal] = useState<number>(0);
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedSale = {
      ...sale,
      [name]: name === "quantity" || name === "unitPrice" || name === "discount" ? parseFloat(value) : value,
    };

    // Set the unit price based on selected product
    if (name === "productName") {
      const selectedProduct = products?.find(product => product.name === value);
      updatedSale.unitPrice = selectedProduct ? selectedProduct.price : 0; // Set unit price from selected product
      updatedSale.quantity = 1; // Reset quantity if product changes
    }

    setSale(updatedSale);

    // Calculate and set the total
    const subtotal = (updatedSale.quantity || 0) * (updatedSale.unitPrice || 0);
    const discountAmount = (subtotal * (updatedSale.discount || 0)) / 100;
    const total = subtotal - discountAmount;
    setFinalTotal(total);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!sale.paymentType || !sale.saleDate || !sale.saleTime || !sale.productName || !sale.quantity || !sale.unitPrice) {
      toast.error("All fields are required!", { duration: 3000 }); 
      return;
    }

    const saleDetails = {
      paymentType: sale.paymentType,
      saleDate: sale.saleDate,
      saleTime: sale.saleTime,
      productName: sale.productName,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      discount: sale.discount || 0,
      totalAmount: finalTotal,
      phoneNumber: (sale.paymentType === "Momo" || sale.paymentType === "OM") ? phoneNumber : undefined,
    };

    // Set loading state to true when the save operation starts
    setLoading(true);

    try {
      // Call createSale mutation
      const result = await createSale(saleDetails).unwrap();
      console.log("Sale created:", result);

      // Trigger a refetch for the inventory data to ensure it reflects updated stock
      await refetch();

      // Reset the sale state to its initial values
      setSale({
        saleId: v4(),
        paymentType: "",
        saleDate: "",
        saleTime: "",
        productName: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        total: 0,
      });
      setFinalTotal(0);
      setPhoneNumber(""); // Reset phone number after sale

      // Now that the sale is successfully saved, generate the PDF
      generatePDF();

      toast.success("Sale recorded successfully!", { duration: 5000 }); 
    } catch  {
      toast.error("Failed to save the sale.");
    } finally {
      // Set loading state to false after the sale has been saved
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div className="py-4">Loading products...</div>;
  }

  if (isError || !products) {
    return <div className="text-center text-red-500 py-4">Failed to load products</div>;
  }

  return (
    <div>
      <Navbar />
      <Toaster position="top-center" toastOptions={{ duration: 5000 }} /> 
      <div className="max-w-4xl mx-auto mt-10 p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-gray-700 text-center mb-8">New Sale Entry</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block mb-1 text-gray-600">Payment Type</label>
              <select
                name="paymentType"
                value={sale.paymentType}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded focus:border-blue-400"
                required
              >
                <option value="">Select Payment Type</option>
                <option value="Cash">Cash</option>
                <option value="Momo">Momo</option>
                <option value="OM">OM</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-gray-600">Sale Date</label>
              <input
                type="date"
                name="saleDate"
                value={sale.saleDate || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded focus:border-blue-400"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">Sale Time</label>
              <input
                type="time"
                name="saleTime"
                value={sale.saleTime || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded focus:border-blue-400"
                required
              />
            </div>
          </div>

          {/* Show phone number input if payment type is Momo or OM */}
          {(sale.paymentType === "Momo" || sale.paymentType === "OM") && (
            <div className="mt-6">
              <label className="block mb-1 text-gray-600">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded focus:border-blue-400"
                required
              />
            </div>
          )}

          {/* Product Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block mb-1 text-gray-600">Product Name</label>
              <select
                name="productName"
                value={sale.productName || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded focus:border-blue-400"
                required
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product.productId} value={product.name}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-gray-600">Quantity</label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={sale.quantity || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded focus:border-blue-400"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">Unit Price (XAF)</label>
              <input
                type="number"
                name="unitPrice"
                min="0"
                value={sale.unitPrice || ""}
                readOnly // Make it read-only since it’s populated automatically
                className="w-full border border-gray-300 p-2 rounded focus:border-blue-400"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">Discount (%)</label>
              <input
                type="number"
                name="discount"
                min="0"
                max="100"
                value={sale.discount || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded focus:border-blue-400"
              />
            </div>
          </div>

          {/* Total and Submit */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-lg font-semibold text-gray-700">
              Total Bill: <span className="text-blue-600">{finalTotal.toFixed(2)} XAF</span>
            </p>
            <button
              type="submit"
              className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
              disabled={loading} // Disable button while loading
            >
              {loading ? "Saving..." : "Save Sale"}
            </button>
          </div>
        </form>

        {/* Loader */}
        {loading && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
            <div className="animate-spin border-4 border-t-4 border-blue-500 rounded-full w-16 h-16"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;
