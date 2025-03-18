"use client";

import { useCreateSaleMutation} from "@/state/api";
import React, { useState, useEffect } from "react";
import { useGetProductsQuery } from "@/state/api";
import { v4 } from "uuid";
import { useRouter } from "next/navigation";
import Navbar from "../(components)/Navbar";
import jsPDF from "jspdf";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from 'react-i18next'; 


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
    const { t } = useTranslation();
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
    
    // Header - Company Name & Logo (if applicable)
    doc.setFont("Helvetica");
    doc.setFontSize(22);
    doc.text("MYSTOCK", 20, 20); // Replace with actual company name or logo if desired
  
    // Line separator
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25); // Horizontal line to separate header
    
    // Title - Sales Receipt
    doc.setFontSize(18);
    doc.text(t("sales.salerecip"), 20, 40);
  
    // Sale ID and Details
    doc.setFontSize(12);
    doc.text(`${t("sales.saleid")} ${sale.saleId}`, 20, 55);
    doc.text(`${t("sales.paymenttype")} ${sale.paymentType}`, 20, 65);
    doc.text(`${t("sales.saledate")} ${sale.saleDate}`, 20, 75);
    doc.text(`${t("sales.saletime")} ${sale.saleTime}`, 120, 75);
  
    // Add phone number for Momo/OM payments
    if (sale.paymentType === "Momo" || sale.paymentType === "OM") {
      doc.text(`${t("sales.phonenumber")} ${phoneNumber}`, 20, 85);
    }
  
    // Line separator
    doc.setLineWidth(0.3);
    doc.line(20, 90, 190, 90); // Horizontal line before the table
  
    // Table - Product Details (Manually Draw the Table)
    const startY = 95;
    
  
    // Draw Table Header
    doc.setFontSize(10);
    doc.setFont("Helvetica", "bold");
    doc.text(t("sales.productn"), 20, startY);
    doc.text(t("sales.qty"), 80, startY);
    doc.text(t("sales.unitprice"), 120, startY);
    doc.text(t("sales.discount"), 160, startY);
    doc.text(t("sales.total"), 190, startY);
  
    // Draw Header Divider
    doc.setLineWidth(0.5);
    doc.line(20, startY + 2, 190, startY + 2); // Line under the header
  
    // Draw the Product Rows
    doc.setFont("Helvetica", "normal");
    const rowHeight = 10;
    const rowY = startY + 12; // Position of first row
  
    doc.text(sale.productName || "N/A", 20, rowY);
    doc.text(String(sale.quantity || 0), 80, rowY);
    doc.text(sale.unitPrice ? sale.unitPrice.toFixed(2) : "0.00", 120, rowY);
    doc.text(sale.discount ? sale.discount.toFixed(2) : "0.00", 160, rowY);
    doc.text(finalTotal.toFixed(2), 190, rowY);
  
    // Draw a line after the product details
    doc.setLineWidth(0.3);
    doc.line(20, rowY + rowHeight, 190, rowY + rowHeight);
  
    // Total Amount section
    doc.setFontSize(14);
    const totalY = rowY + rowHeight + 10;
    doc.text(`${t("sales.totalamount")} ${finalTotal.toFixed(2)} XAF`, 20, totalY);
  
    // Line separator after Total Amount
    doc.setLineWidth(0.5);
    doc.line(20, totalY + 5, 190, totalY + 5);
  
    // Footer - Address and Contact Information (optional)
    doc.setFontSize(10);
    doc.text(t("sales.thanks"), 20, totalY + 15); // Customer message
    doc.text(t("sales.comaddress"), 20, totalY + 25); // Replace with actual address and contact
  
    // Save the PDF
    doc.save("sales_receipt.pdf");
  
    toast.success(t("sales.successrecip"), { duration: 5000 });
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
      toast.error(t("sales.fieldreq"), { duration: 3000 }); 
      return;
    }
  
    // Append the phone number to paymentType if Momo or OM
    let updatedPaymentType = sale.paymentType;
    if (sale.paymentType === "Momo" || sale.paymentType === "OM") {
      updatedPaymentType = `${sale.paymentType} (${phoneNumber})`;
    }
  
    const saleDetails = {
      paymentType: updatedPaymentType, // Save payment type with the phone number
      saleDate: sale.saleDate,
      saleTime: sale.saleTime,
      productName: sale.productName,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      discount: sale.discount || 0,
      totalAmount: finalTotal,
      phoneNumber: (sale.paymentType === "Momo" || sale.paymentType === "OM") ? phoneNumber : "", // Optional field for phone number
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
  
      toast.success(t("sales.successrecord"), { duration: 5000 }); 
    } catch  {
      toast.error(t("sales.failsave"));
    } finally {
      // Set loading state to false after the sale has been saved
      setLoading(false);
    }
  };
  

  if (isLoading) {
    return <div className="py-4">{t("sales.loadprods")}</div>;
  }

  if (isError || !products) {
    return <div className="text-center text-red-500 py-4">{t("sales.loadfail")}</div>;
  }

  return (
    <div>
      <Navbar />
      <Toaster position="top-center" toastOptions={{ duration: 5000 }} /> 
      <div className="max-w-4xl mx-auto mt-10 p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-gray-700 text-center mb-8">{t("sales.salentr")}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block mb-1 text-gray-600">{t("sales.paymenttyped")}</label>
              <select
                name="paymentType"
                value={sale.paymentType}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 text-gray-950 rounded focus:border-blue-400"
                required
              >
                <option value="">{t("sales.selectpaymenttype")}</option>
                <option value="Cash">Cash</option>
                <option value="Momo">Momo</option>
                <option value="OM">OM</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-gray-600">{t("sales.saledated")}</label>
              <input
                type="date"
                name="saleDate"
                value={sale.saleDate || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 text-gray-950 rounded focus:border-blue-400"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">{t("sales.saletimed")}</label>
              <input
                type="time"
                name="saleTime"
                value={sale.saleTime || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 text-gray-950 rounded focus:border-blue-400"
                required
              />
            </div>
          </div>

          {/* Show phone number input if payment type is Momo or OM */}
          {(sale.paymentType === "Momo" || sale.paymentType === "OM") && (
            <div className="mt-6">
              <label className="block mb-1 text-gray-600">{t("sales.phonenumbered")}</label>
              <input
                type="text"
                name="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full border border-gray-300 p-2 text-gray-950 rounded focus:border-blue-400"
                required
              />
            </div>
          )}

          {/* Product Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block mb-1 text-gray-600">{t("sales.productn")}</label>
              <select
                name="productName"
                value={sale.productName || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 text-gray-950 rounded focus:border-blue-400"
                required
              >
                <option value="">{t("sales.selectprod")}</option>
                {products.map((product) => (
                  <option key={product.productId} value={product.name}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-gray-600">{t("sales.qty")}</label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={sale.quantity || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 text-gray-950 rounded focus:border-blue-400"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">{t("sales.unitpriced")} (XAF)</label>
              <input
                type="number"
                name="unitPrice"
                min="0"
                value={sale.unitPrice || ""}
                readOnly // Make it read-only since it’s populated automatically
                className="w-full border border-gray-300 p-2 text-gray-950 rounded focus:border-blue-400"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-600">{t("sales.discount")}</label>
              <input
                type="number"
                name="discount"
                min="0"
                max="100"
                value={sale.discount || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 text-gray-950 rounded focus:border-blue-400"
              />
            </div>
          </div>

          {/* Total and Submit */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-lg font-semibold text-gray-700">
            {t("sales.totalbill")}: <span className="text-blue-600">{finalTotal.toFixed(2)} XAF</span>
            </p>
            <button
  type="submit"
  className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center"
  disabled={loading} // Disable button while loading
>
  {loading ? (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
      ></path>
    </svg>
  ) : (
    t("sales.savestate")
  )}
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
