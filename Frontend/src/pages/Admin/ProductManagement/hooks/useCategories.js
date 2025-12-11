import { useState, useCallback } from 'react';
import { categoryService } from '../services/apiService';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAllCategories();
      setCategories(data || []);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch categories');
      console.error('Fetch categories error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single category
  const getCategory = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getCategory(id);
      return data;
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch category');
      throw new Error(err.response?.data?.msg || 'Failed to fetch category');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create category
  const createCategory = useCallback(async (categoryData) => {
    try {
      setLoading(true);
      setError(null);
      const newCategory = await categoryService.createCategory(categoryData);
      setCategories([...categories, newCategory]);
      return newCategory;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to create category';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [categories]);

  // Update category
  const updateCategory = useCallback(async (id, categoryData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCategory = await categoryService.updateCategory(id, categoryData);
      setCategories(categories.map(c => c._id === id ? updatedCategory : c));
      return updatedCategory;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to update category';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [categories]);

  // Delete category
  const deleteCategory = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await categoryService.deleteCategory(id);
      setCategories(categories.filter(c => c._id !== id));
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to delete category';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [categories]);

  // Bulk delete categories
  const bulkDeleteCategories = useCallback(async (ids) => {
    try {
      setLoading(true);
      setError(null);
      await categoryService.bulkDeleteCategories(ids);
      setCategories(categories.filter(c => !ids.includes(c._id)));
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to delete categories';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [categories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    bulkDeleteCategories,
  };
};
