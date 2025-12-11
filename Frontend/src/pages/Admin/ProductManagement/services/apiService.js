import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
};

// ===== PRODUCT SERVICE =====
export const productService = {
  // Get all products with pagination
  getAllProducts: async (page = 1, limit = 100, search = '') => {
    const res = await axios.get(
      `${API_BASE_URL}/products`,
      getAuthHeaders()
    );
    // Backend returns array directly, wrap it for consistency
    return {
      products: res.data,
      totalPages: 1,
      totalProducts: res.data.length,
    };
  },

  // Get single product
  getProduct: async (id) => {
    const res = await axios.get(
      `${API_BASE_URL}/products/${id}`,
      getAuthHeaders()
    );
    return res.data;
  },

  // Add product
  addProduct: async (productData) => {
    const res = await axios.post(
      `${API_BASE_URL}/products/add`,
      productData,
      getAuthHeaders()
    );
    return res.data;
  },

  // Update product
  updateProduct: async (id, productData) => {
    const res = await axios.put(
      `${API_BASE_URL}/products/${id}`,
      productData,
      getAuthHeaders()
    );
    return res.data;
  },

  // Delete product
  deleteProduct: async (id) => {
    const res = await axios.delete(
      `${API_BASE_URL}/products/${id}`,
      getAuthHeaders()
    );
    return res.data;
  },

  // Bulk delete products
  bulkDeleteProducts: async (productIds) => {
    const res = await axios.post(
      `${API_BASE_URL}/products/bulk-delete`,
      { productIds },
      getAuthHeaders()
    );
    return res.data;
  },

  // Search products
  searchProducts: async (query) => {
    if (!query || query.trim().length === 0) {
      const res = await axios.get(
        `${API_BASE_URL}/products`,
        getAuthHeaders()
      );
      return res.data;
    }
    const res = await axios.get(
      `${API_BASE_URL}/products/search?q=${query}`,
      getAuthHeaders()
    );
    return res.data.products || res.data;
  },
};

// ===== BANNER SERVICE =====
export const bannerService = {
  getAllBanners: async () => {
    const res = await axios.get(
      `${API_BASE_URL}/banners/admin/all`,
      getAuthHeaders()
    );
    return res.data;
  },

  getActiveBanners: async () => {
    const res = await axios.get(`${API_BASE_URL}/banners`);
    return res.data;
  },

  addBanner: async (payload) => {
    const res = await axios.post(
      `${API_BASE_URL}/banners/add`,
      payload,
      getAuthHeaders()
    );
    return res.data.banner;
  },

  updateBanner: async (id, payload) => {
    const res = await axios.put(
      `${API_BASE_URL}/banners/${id}`,
      payload,
      getAuthHeaders()
    );
    return res.data.banner;
  },

  deleteBanner: async (id) => {
    const res = await axios.delete(
      `${API_BASE_URL}/banners/${id}`,
      getAuthHeaders()
    );
    return res.data;
  },

  toggleBanner: async (id) => {
    const res = await axios.patch(
      `${API_BASE_URL}/banners/${id}/toggle`,
      {},
      getAuthHeaders()
    );
    return res.data.banner;
  }
};

// ===== CATEGORY SERVICE =====
export const categoryService = {
  // Get all categories
  getAllCategories: async () => {
    const res = await axios.get(
      `${API_BASE_URL}/categories`,
      getAuthHeaders()
    );
    return res.data;
  },

  // Get single category
  getCategory: async (id) => {
    const res = await axios.get(
      `${API_BASE_URL}/categories/${id}`,
      getAuthHeaders()
    );
    return res.data;
  },

  // Create category
  createCategory: async (categoryData) => {
    const res = await axios.post(
      `${API_BASE_URL}/categories`,
      categoryData,
      getAuthHeaders()
    );
    return res.data;
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    const res = await axios.put(
      `${API_BASE_URL}/categories/${id}`,
      categoryData,
      getAuthHeaders()
    );
    return res.data;
  },

  // Delete category
  deleteCategory: async (id) => {
    const res = await axios.delete(
      `${API_BASE_URL}/categories/${id}`,
      getAuthHeaders()
    );
    return res.data;
  },

  // Bulk delete categories
  bulkDeleteCategories: async (categoryIds) => {
    const res = await axios.post(
      `${API_BASE_URL}/categories/bulk-delete`,
      { categoryIds },
      getAuthHeaders()
    );
    return res.data;
  },
};

// ===== SUBCATEGORY SERVICE =====
export const subcategoryService = {
  // Get all subcategories
  getAllSubcategories: async () => {
    const res = await axios.get(
      `${API_BASE_URL}/subcategories`,
      getAuthHeaders()
    );
    return res.data;
  },

  // Get subcategories by category
  getSubcategoriesByCategory: async (categoryId) => {
    const res = await axios.get(
      `${API_BASE_URL}/subcategories/category/${categoryId}`,
      getAuthHeaders()
    );
    return res.data;
  },

  // Get single subcategory
  getSubcategory: async (id) => {
    const res = await axios.get(
      `${API_BASE_URL}/subcategories/${id}`,
      getAuthHeaders()
    );
    return res.data;
  },

  // Create subcategory
  createSubcategory: async (subcategoryData) => {
    const res = await axios.post(
      `${API_BASE_URL}/subcategories`,
      subcategoryData,
      getAuthHeaders()
    );
    return res.data;
  },

  // Update subcategory
  updateSubcategory: async (id, subcategoryData) => {
    const res = await axios.put(
      `${API_BASE_URL}/subcategories/${id}`,
      subcategoryData,
      getAuthHeaders()
    );
    return res.data;
  },

  // Delete subcategory
  deleteSubcategory: async (id) => {
    const res = await axios.delete(
      `${API_BASE_URL}/subcategories/${id}`,
      getAuthHeaders()
    );
    return res.data;
  },
};
