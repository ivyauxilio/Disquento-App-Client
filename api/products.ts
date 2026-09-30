// import api from "./axios";

// export const productAPI = {
//   // List products with filters
//   list: async (params?: {
//     page?: number;
//     per_page?: number;
//     category?: string;
//     search?: string;
//     featured?: boolean;
//     sort?: "price_asc" | "price_desc" | "name_asc" | "newest";
//   }) => {
//     const res = await api.get("/products", { params });
//     return res.data;
//   },

//   // Get single product
//   show: async (id: string | number) => {
//     const res = await api.get(`/products/${id}`);
//     return res.data;
//   },

//   // Get all categories
//   categories: async () => {
//     const res = await api.get("/products/categories");
//     return res.data;
//   },
//   featured: async (limit = 8) => {
//     const res = await api.get("/products/featured", { params: { limit } });
//     return res.data;
//   },

//   search: async (q: string, limit = 10) => {
//     const res = await api.get("/products/search", { params: { q, limit } });
//     return res.data;
//   },
// };
import api from "./axios";

export type ProductListParams = {
  page?: number;
  per_page?: number;
  category?: string;
  search?: string;
  featured?: boolean;
  sort?:
    | "price_asc"
    | "price_desc"
    | "name_asc"
    | "name_desc"
    | "newest"
    | "popular";
};

export const productAPI = {
  // List products
  list: async (params?: ProductListParams) => {
    const res = await api.get("/products", {
      params: {
        ...params,
        // Don't send empty filters
        category:
          params?.category && params.category !== "all"
            ? params.category
            : undefined,
        search: params?.search || undefined,
      },
    });

    return res.data;
  },

  // Get single product
  show: async (id: string | number) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  // Get categories
  categories: async () => {
    const res = await api.get("/products/categories");
    return res.data;
  },

  // Get featured products
  featured: async (limit = 8) => {
    const res = await api.get("/products/featured", {
      params: { limit },
    });

    return res.data;
  },

  // Search products
  search: async (q: string, limit = 10) => {
    const res = await api.get("/products/search", {
      params: { q, limit },
    });

    return res.data;
  },
};
