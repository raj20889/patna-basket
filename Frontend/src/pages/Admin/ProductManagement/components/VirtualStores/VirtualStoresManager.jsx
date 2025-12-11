import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdDelete, MdEdit, MdToggleOn, MdToggleOff } from 'react-icons/md';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VirtualStoresManager = () => {
  const [stores, setStores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    storeName: '',
    storeIcon: '',
    storeBanner: '',
    storeDescription: '',
    storeColor: '#00A82D',
    displayOrder: 0,
    isActive: true,
    storeType: 'virtual'
  });
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stores/admin/all`, { headers });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setStores(data);
    } catch (error) {
      console.error('Error fetching virtual stores:', error);
      setStores([]);
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
        await axios.put(`${API_BASE_URL}/stores/${editingId}`, formData, { headers });
        setEditingId(null);
      } else {
        await axios.post(`${API_BASE_URL}/stores/add`, formData, { headers });
      }
      setFormData({
        storeName: '',
        storeIcon: '',
        storeBanner: '',
        storeDescription: '',
        storeColor: '#00A82D',
        displayOrder: 0,
        isActive: true,
        storeType: 'virtual'
      });
      setShowForm(false);
      fetchStores();
    } catch (error) {
      console.error('Error saving virtual store:', error);
      alert('Failed to save virtual store');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (store) => {
    setFormData(store);
    setEditingId(store._id);
    setShowForm(true);
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/stores/${id}/toggle`, {}, { headers });
      fetchStores();
    } catch (error) {
      console.error('Error toggling store:', error);
      alert('Failed to toggle store status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this virtual store?')) {
      try {
        await axios.delete(`${API_BASE_URL}/stores/${id}`, { headers });
        fetchStores();
      } catch (error) {
        console.error('Error deleting virtual store:', error);
        alert('Failed to delete virtual store');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Virtual Stores</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) setEditingId(null);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700"
        >
          {showForm ? 'Cancel' : 'Add Store'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded border">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Store Name</label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleInputChange}
                placeholder="e.g., Paan Corner"
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Icon/Emoji</label>
              <input
                type="text"
                name="storeIcon"
                value={formData.storeIcon}
                onChange={handleInputChange}
                maxLength="2"
                placeholder="🚬"
                className="w-full px-3 py-2 border rounded text-center text-2xl"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-2">Store Banner URL</label>
              <input
                type="url"
                name="storeBanner"
                value={formData.storeBanner}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border rounded mb-2"
              />
              {formData.storeBanner && (
                <div className="border rounded overflow-hidden">
                  <img 
                    src={formData.storeBanner} 
                    alt="Store Banner Preview" 
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%23ddd" width="400" height="200"/%3E%3Ctext x="50%25" y="50%25" fill="%23999" text-anchor="middle" dy=".3em" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                name="storeDescription"
                value={formData.storeDescription}
                onChange={handleInputChange}
                placeholder="Store description"
                rows="2"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Store Color</label>
              <input
                type="color"
                name="storeColor"
                value={formData.storeColor}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
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
              <label className="block text-sm font-semibold mb-2">Store Type</label>
              <select
                name="storeType"
                value={formData.storeType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="virtual">Virtual</option>
                <option value="physical">Physical</option>
                <option value="partner">Partner</option>
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

      {/* Stores List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.sort((a, b) => a.displayOrder - b.displayOrder).map(store => (
          <div key={store._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            {/* Store Image */}
            <div className="h-32 flex items-center justify-center text-5xl relative bg-gray-100 overflow-hidden">
              {store.storeBanner ? (
                <img 
                  src={store.storeBanner} 
                  alt={store.storeName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`absolute inset-0 flex items-center justify-center text-5xl ${!store.storeBanner ? 'flex' : 'hidden'}`}
                style={{ backgroundColor: store.storeColor }}
              >
                {store.storeIcon}
              </div>
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded text-white text-xs font-bold ${store.isActive ? 'bg-green-500' : 'bg-gray-500'}`}>
                  {store.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Store Info */}
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{store.storeName}</h3>
              <p className="text-sm text-gray-600 mb-3">{store.storeDescription}</p>
              <p className="text-xs text-gray-500 mb-3">Order: {store.displayOrder}</p>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(store)}
                  className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm font-semibold hover:bg-blue-600 flex items-center justify-center gap-1"
                >
                  <MdEdit /> Edit
                </button>
                <button
                  onClick={() => handleToggle(store._id, store.isActive)}
                  className={`flex-1 text-white px-3 py-2 rounded text-sm font-semibold flex items-center justify-center gap-1 ${store.isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'}`}
                >
                  {store.isActive ? <MdToggleOn /> : <MdToggleOff />}
                  {store.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(store._id)}
                  className="bg-red-500 text-white px-3 py-2 rounded text-sm font-semibold hover:bg-red-600 flex items-center gap-1"
                >
                  <MdDelete />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stores.length === 0 && !showForm && (
        <p className="text-center py-6 text-gray-500">No virtual stores yet. Create one to get started!</p>
      )}
    </div>
  );
};

export default VirtualStoresManager;
