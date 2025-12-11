import { useState, useCallback } from 'react';
import { bannerService } from '../services/apiService';

export const useBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bannerService.getAllBanners();
      setBanners(data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  }, []);

  const addBanner = useCallback(async (payload) => {
    try {
      setLoading(true);
      setError(null);
      const created = await bannerService.addBanner(payload);
      setBanners((prev) => [...prev, created]);
      return created;
    } catch (err) {
      const msg = err.response?.data?.msg || 'Failed to add banner';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBanner = useCallback(async (id, payload) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await bannerService.updateBanner(id, payload);
      setBanners((prev) => prev.map((b) => (b._id === id ? updated : b)));
      return updated;
    } catch (err) {
      const msg = err.response?.data?.msg || 'Failed to update banner';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBanner = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await bannerService.deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      const msg = err.response?.data?.msg || 'Failed to delete banner';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleBanner = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await bannerService.toggleBanner(id);
      setBanners((prev) => prev.map((b) => (b._id === id ? updated : b)));
      return updated;
    } catch (err) {
      const msg = err.response?.data?.msg || 'Failed to toggle banner';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    banners,
    loading,
    error,
    fetchBanners,
    addBanner,
    updateBanner,
    deleteBanner,
    toggleBanner,
  };
};
