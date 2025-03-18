import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {jwtDecode} from 'jwt-decode';


export interface Sale {
  saleId: string;
  paymentType: string;
  saleDate: string;  
  saleTime: string;  
  productId: string;
  productName: string;  
  quantity: number;
  unitPrice: number;
  discount?: number;
  totalAmount: number;
}


export interface NewSale {
  paymentType: string;
  saleDate: string;  
  saleTime: string;  
  productName: string; 
  quantity: number;
  unitPrice: number;
  discount?: number;  
}

export interface Expense {
  expenseId: string;
  expenseDate: string;
  reason: string;
  details?: string; 
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewExpense {
  expenseDate: string;
  reason: string;
  details?: string; 
  amount: number;
}


export interface Product {
  productId: string;
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  imageUrl: string; 
  active: boolean;  
}

export interface NewProduct {
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  imageUrl: string; 
}

export interface SalesSummary {
  salesSummaryId: string;
  totalValue: number;
  changePercentage?: number;
  date: string;
}

export interface PurchaseSummary {
  purchaseSummaryId: string;
  totalPurchased: number;
  changePercentage?: number;
  date: string;
}

export interface ExpenseSummary {
  expenseSummarId: string;
  totalExpenses: number;
  date: string;
}

export interface ExpenseByCategorySummary {
  expenseByCategorySummaryId: string;
  category: string;
  amount: string;
  date: string;
}

export interface DashboardMetrics {
  popularProducts: Product[];
  salesSummary: SalesSummary[];
  purchaseSummary: PurchaseSummary[];
  expenseSummary: ExpenseSummary[];
  expenseByCategorySummary: ExpenseByCategorySummary[];
}

export interface User {
  userId: string;
  username: string;
  email: string;
}

// Define a type for the decoded JWT token payload.
interface DecodedToken {
  userId: string;
  exp?: number;
}


const getUserIdFromAuth = () => {
  const token = localStorage.getItem('authToken');
  
  if (token) {
    try {
      const decodedToken = jwtDecode<DecodedToken>(token); // Decode the JWT token using the library

      // Check if the token has an 'exp' field and if it's expired
      const currentTime = Date.now() / 1000; // Current time in seconds
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        console.error('Token expired');
        return null; // Token is expired
      }

      return decodedToken.userId || null; // Return userId from decoded token, or null if it's not present
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  return null; // Return null if token is not found
};

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers) => {
      
      const token = localStorage.getItem('authToken');
      
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
     
      return headers;
    },
    credentials: "include", // Ensure cookies (if applicable)
    fetchFn: async (...args) => {
      const response = await fetch(...args);
      if (response.status === 401) {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      }
      return response;
    },
  }),
  reducerPath: "api",
  tagTypes: [
    "DashboardMetrics", 
    "Products", 
    "Users", 
    "Expenses", 
    "Sales", 
    "Expense"
  ],
  endpoints: (build) => ({
    // Dashboard endpoints
    getDashboardMetrics: build.query<DashboardMetrics, void>({
      query: () => {
        return { url: `/dashboard` };
      },
      providesTags: ["DashboardMetrics"],
    }),

    // Product endpoints
    getProducts: build.query<Product[], string | void>({
      query: (search= '') => {
        const userId = getUserIdFromAuth();
        return {
          url: "/products",
          params: { userId, search },  // Pass searchTerm as a query parameter
        };
      },
      providesTags: ["Products"],
    }),
    
    createProduct: build.mutation<Product, NewProduct>({
      query: (newProduct) => {
        const userId = getUserIdFromAuth();
        return { url: "/products", method: "POST", body: { ...newProduct, userId } };
      },
      invalidatesTags: ["Products"],
    }),
    updateProduct: build.mutation<Product, Partial<Product>>({
      query: (product) => {
        const userId = getUserIdFromAuth();
        return { url: `/products/${product.productId}`, method: "PUT", body: { ...product, userId } };
      },
      invalidatesTags: ["Products"],
    }),
    updateProductStock: build.mutation<Product, { productId: string, stockQuantity: number }>({
      query: ({ productId, stockQuantity }) => {
        const userId = getUserIdFromAuth();
        return { url: `/products/${productId}/stock`, method: "PUT", body: { stockQuantity, userId } };
      },
      invalidatesTags: ["Products"],
    }),
    deleteProduct: build.mutation<{ success: boolean; productId: string }, string>({
      query: (productId) => {
        const userId = getUserIdFromAuth();
        return { url: `/products/${productId}`, method: "DELETE", body: { userId } };
      },
      invalidatesTags: ["Products"],
    }),

    // Sales endpoints
    getSales: build.query<Sale[], void>({
      query: () => {
        const userId = getUserIdFromAuth();
        return { url: "/sales", params: { userId } };
      },
      providesTags: ["Sales"],
    }),
    createSale: build.mutation<Sale, NewSale>({
      query: (newSale) => {
        const userId = getUserIdFromAuth();
        return { url: "/sales", method: "POST", body: { ...newSale, userId } };
      },
      invalidatesTags: ["Sales"],
    }),

    // Expense endpoints
    getExpenses: build.query<Expense[], void>({
      query: () => {
        const userId = getUserIdFromAuth();
        return { url: "/expense", params: { userId } };
      },
      providesTags: ["Expense"],
    }),
    createExpense: build.mutation<Expense, NewExpense>({
      query: (newExpense) => {
        const userId = getUserIdFromAuth();
        return { url: "/expense", method: "POST", body: { ...newExpense, userId } };
      },
      invalidatesTags: ["Expense"],
    }),
    getExpensesByCategory: build.query<ExpenseByCategorySummary[], void>({
      query: () => {
        const userId = getUserIdFromAuth();
        return { url: "/expenses", params: { userId } };
      },
      providesTags: ["Expenses"],
    }),

    // User endpoints
    getUsers: build.query<User[], void>({
      query: () => {
        const userId = getUserIdFromAuth();
        return { url: "/users", params: { userId } };
      },
      providesTags: ["Users"],
    }),
  }),
});


export const {
  useGetDashboardMetricsQuery,
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductStockMutation,
  useDeleteProductMutation,
  useGetSalesQuery,
  useCreateSaleMutation,
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useGetUsersQuery,
  useGetExpensesByCategoryQuery,
} = api;