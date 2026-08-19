import { useState, useCallback } from 'react';
import { productService } from '../services/apiService';

export const useProducts = () => {
  const PAGE_SIZE = 10;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });

  // Fetch all products
  const fetchProducts = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getAllProducts(page, PAGE_SIZE, search);
      setProducts(data.products || []);
      setPagination({
        currentPage: data.currentPage || page,
        totalPages: data.totalPages || 1,
        totalProducts: data.totalProducts || 0,
      });
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch products');
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add product
  const addProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      setError(null);
      const newProduct = await productService.addProduct(productData);
      setProducts([newProduct, ...products]);
      return newProduct;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to add product';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [products]);

  // Update product
  const updateProduct = useCallback(async (id, productData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProduct = await productService.updateProduct(id, productData);
      setProducts(products.map(p => p._id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to update product';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [products]);

  // Update product stock
  const updateProductStock = useCallback(async (id, newStock) => {
    try {
      setError(null);
      const updatedProduct = await productService.updateProduct(id, { stock: newStock });
      setProducts((prevProducts) =>
        prevProducts.map((p) => (p._id === id ? { ...p, stock: newStock } : p))
      );
      return updatedProduct;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to update stock';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Delete product
  const deleteProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await productService.deleteProduct(id);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to delete product';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [products]);

  // Bulk add products
  const bulkAddProducts = useCallback(async (productsToAdd) => {
    try {
      setLoading(true);
      setError(null);
      const result = await productService.bulkAddProducts(productsToAdd);
      if (Array.isArray(result.products) && result.products.length > 0) {
        setProducts(prevProducts => [...result.products, ...prevProducts]);
      }
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to import products';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk delete products
  const bulkDeleteProducts = useCallback(async (productIds) => {
    try {
      setLoading(true);
      setError(null);
      await productService.bulkDeleteProducts(productIds);
      setProducts(products.filter(p => !productIds.includes(p._id)));
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to delete products';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [products]);

  // Delete all products
  const deleteAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await productService.deleteAllProducts();
      setProducts([]);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to delete all products';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search products
  const searchProducts = useCallback(async (query) => {
    await fetchProducts(1, query);
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    addProduct,
    updateProduct,
    updateProductStock,
    deleteProduct,
    bulkAddProducts,
    bulkDeleteProducts,
    deleteAllProducts,
    searchProducts,
  };
};
