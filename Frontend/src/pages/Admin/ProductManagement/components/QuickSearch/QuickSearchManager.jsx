import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdDelete, MdEdit } from 'react-icons/md';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const QuickSearchManager = () => {
  const [searches, setSearches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    keyword: '',
    displayText: '',
    icon: '',
    displayOrder: 0,
    isActive: true,
    category: 'product'
  });
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchSearches();
  }, []);

  const fetchSearches = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/quick-searches/admin/all`, { headers });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setSearches(data);
    } catch (error) {
      console.error('Error fetching quick searches:', error);
      setSearches([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'displayOrder' ? parseInt(value) : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/quick-searches/${editingId}`, formData, { headers });
        setEditingId(null);
      } else {
        await axios.post(`${API_BASE_URL}/quick-searches/add`, formData, { headers });
      }
      setFormData({
        keyword: '',
        displayText: '',
        icon: '',
        displayOrder: 0,
        isActive: true,
        category: 'product'
      });
      setShowForm(false);
      fetchSearches();
    } catch (error) {
      console.error('Error saving quick search:', error);
      alert('Failed to save quick search');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (search) => {
    setFormData(search);
    setEditingId(search._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this quick search?')) {
      try {
        await axios.delete(`${API_BASE_URL}/quick-searches/${id}`, { headers });
        fetchSearches();
      } catch (error) {
        console.error('Error deleting quick search:', error);
        alert('Failed to delete quick search');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quick Searches</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) setEditingId(null);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700"
        >
          {showForm ? 'Cancel' : 'Add Search'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded border">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Keyword</label>
              <input
                type="text"
                name="keyword"
                value={formData.keyword}
                onChange={handleInputChange}
                placeholder="e.g., milk"
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Display Text</label>
              <input
                type="text"
                name="displayText"
                value={formData.displayText}
                onChange={handleInputChange}
                placeholder="e.g., Milk"
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Icon/Emoji</label>
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                maxLength="2"
                placeholder="🥛"
                className="w-full px-3 py-2 border rounded text-center text-2xl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Display Order</label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="product">Product</option>
                <option value="brand">Brand</option>
                <option value="category">Category</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <span className="text-sm font-semibold">Active</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      )}

      {/* Quick Searches List */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left text-sm font-semibold">Icon</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Keyword</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Display Text</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Order</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Category</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Clicks</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {searches.sort((a, b) => a.displayOrder - b.displayOrder).map(search => (
              <tr key={search._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 text-2xl">{search.icon}</td>
                <td className="px-4 py-2 text-sm">{search.keyword}</td>
                <td className="px-4 py-2 text-sm">{search.displayText}</td>
                <td className="px-4 py-2 text-sm">{search.displayOrder}</td>
                <td className="px-4 py-2 text-sm capitalize">{search.category}</td>
                <td className="px-4 py-2">
                  <span className={`px-3 py-1 rounded text-white text-xs font-semibold ${search.isActive ? 'bg-green-500' : 'bg-gray-500'}`}>
                    {search.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">{search.clickCount || 0}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(search)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <MdEdit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(search._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {searches.length === 0 && !showForm && (
        <p className="text-center py-6 text-gray-500">No quick searches yet. Create one to get started!</p>
      )}
    </div>
  );
};

export default QuickSearchManager;
