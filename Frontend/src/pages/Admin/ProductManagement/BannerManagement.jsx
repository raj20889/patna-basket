import React, { useEffect, useState } from 'react';
import { useBanners } from './hooks/useBanners';

const BannerManagement = () => {
  const {
    banners,
    loading,
    error,
    fetchBanners,
    addBanner,
    updateBanner,
    deleteBanner,
    toggleBanner,
  } = useBanners();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    path: '',
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      path: '',
      displayOrder: 0,
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'displayOrder' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image || !formData.path) {
      alert('Image URL and Path are required');
      return;
    }

    const payload = { ...formData, displayOrder: Number(formData.displayOrder) || 0 };

    try {
      if (editingId) {
        await updateBanner(editingId, payload);
        alert('Banner updated');
      } else {
        await addBanner(payload);
        alert('Banner added');
      }
      resetForm();
    } catch (err) {
      console.error('Banner save error', err);
    }
  };

  const handleEdit = (banner) => {
    setFormData({
      title: banner.title || '',
      description: banner.description || '',
      image: banner.image || '',
      path: banner.path || '',
      displayOrder: banner.displayOrder || 0,
      isActive: banner.isActive,
    });
    setEditingId(banner._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await deleteBanner(id);
      alert('Banner deleted');
    } catch (err) {
      console.error('Delete banner error', err);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleBanner(id);
    } catch (err) {
      console.error('Toggle banner error', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Banner Management</h2>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className={`px-4 py-2 rounded-lg text-white ${showForm ? 'bg-red-500' : 'bg-blue-500'} hover:opacity-90`}
        >
          {showForm ? 'Close' : 'Add Banner'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
          <div className="flex flex-col gap-2">
            <label className="font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
              placeholder="Optional title"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
              placeholder="Short description"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium">Image URL *</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
              placeholder="https://..."
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium">Path *</label>
            <input
              type="text"
              name="path"
              value={formData.path}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
              placeholder="e.g., fruits or offers"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium">Display Order</label>
            <input
              type="number"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label className="font-medium">Active</label>
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {editingId ? 'Update Banner' : 'Create Banner'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Preview</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Path</th>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center">Loading...</td>
              </tr>
            ) : banners.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-gray-500">No banners found</td>
              </tr>
            ) : (
              banners
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map((banner) => (
                  <tr key={banner._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img src={banner.image} alt={banner.title || banner.path} className="h-12 w-32 object-cover rounded" />
                    </td>
                    <td className="px-4 py-3">{banner.title || '-'}</td>
                    <td className="px-4 py-3">{banner.path}</td>
                    <td className="px-4 py-3">{banner.displayOrder}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggle(banner._id)}
                        className="text-indigo-600 hover:underline"
                      >
                        Toggle
                      </button>
                      <button
                        onClick={() => handleDelete(banner._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BannerManagement;
