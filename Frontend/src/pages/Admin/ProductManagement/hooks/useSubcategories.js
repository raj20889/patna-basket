import { useState, useCallback } from 'react';
import { subcategoryService } from '../services/apiService';

export const useSubcategories = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all subcategories
  const fetchSubcategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subcategoryService.getAllSubcategories();
      setSubcategories(data || []);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch subcategories');
      console.error('Fetch subcategories error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get subcategories by category
  const getSubcategoriesByCategory = useCallback(async (categoryId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await subcategoryService.getSubcategoriesByCategory(categoryId);
      setSubcategories(data || []);
      return data;
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch subcategories');
      throw new Error(err.response?.data?.msg || 'Failed to fetch subcategories');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create subcategory
  const createSubcategory = useCallback(async (subcategoryData) => {
    try {
      setLoading(true);
      setError(null);
      const newSubcategory = await subcategoryService.createSubcategory(subcategoryData);
      setSubcategories([...subcategories, newSubcategory]);
      return newSubcategory;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to create subcategory';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [subcategories]);

  // Update subcategory
  const updateSubcategory = useCallback(async (id, subcategoryData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedSubcategory = await subcategoryService.updateSubcategory(id, subcategoryData);
      setSubcategories(subcategories.map(s => s._id === id ? updatedSubcategory : s));
      return updatedSubcategory;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to update subcategory';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [subcategories]);

  // Delete subcategory
  const deleteSubcategory = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await subcategoryService.deleteSubcategory(id);
      setSubcategories(subcategories.filter(s => s._id !== id));
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to delete subcategory';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [subcategories]);

  // Bulk delete subcategories
  const bulkDeleteSubcategories = useCallback(async (ids) => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all(ids.map(id => subcategoryService.deleteSubcategory(id)));
      setSubcategories(subcategories.filter(s => !ids.includes(s._id)));
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to delete subcategories';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [subcategories]);

  return {
    subcategories,
    loading,
    error,
    fetchSubcategories,
    getSubcategoriesByCategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    bulkDeleteSubcategories,
  };
};
