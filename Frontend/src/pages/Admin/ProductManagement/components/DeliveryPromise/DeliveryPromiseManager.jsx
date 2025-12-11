import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DeliveryPromiseManager = () => {
  const [promises, setPromises] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    deliveryTime: 30,
    deliveryUnit: 'minutes',
    promiseText: 'or FREE',
    backgroundColor: '#00A82D',
    icon: '🚀'
  });
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchPromises();
  }, []);

  const fetchPromises = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/delivery-promise/admin/all`, { headers });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setPromises(data);
    } catch (error) {
      console.error('Error fetching delivery promises:', error);
      setPromises([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'deliveryTime' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/delivery-promise/add`, formData, { headers });
      setFormData({
        deliveryTime: 30,
        deliveryUnit: 'minutes',
        promiseText: 'or FREE',
        backgroundColor: '#00A82D',
        icon: '🚀'
      });
      setShowForm(false);
      fetchPromises();
    } catch (error) {
      console.error('Error creating delivery promise:', error);
      alert('Failed to create delivery promise');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this delivery promise?')) {
      try {
        await axios.delete(`${API_BASE_URL}/delivery-promise/${id}`, { headers });
        fetchPromises();
      } catch (error) {
        console.error('Error deleting delivery promise:', error);
        alert('Failed to delete delivery promise');
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/delivery-promise/${id}`, 
        { isActive: !currentStatus }, 
        { headers }
      );
      fetchPromises();
    } catch (error) {
      console.error('Error toggling delivery promise:', error);
      alert('Failed to toggle delivery promise');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Delivery Promise</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700"
        >
          {showForm ? 'Cancel' : 'New Promise'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded border">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Delivery Time</label>
              <input
                type="number"
                name="deliveryTime"
                value={formData.deliveryTime}
                onChange={handleInputChange}
                min="1"
                max="120"
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Unit</label>
              <select
                name="deliveryUnit"
                value={formData.deliveryUnit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Promise Text</label>
              <input
                type="text"
                name="promiseText"
                value={formData.promiseText}
                onChange={handleInputChange}
                placeholder="e.g., or FREE, guaranteed"
                className="w-full px-3 py-2 border rounded"
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
                className="w-full px-3 py-2 border rounded text-center text-2xl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Background Color</label>
              <input
                type="color"
                name="backgroundColor"
                value={formData.backgroundColor}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {/* Current Active Promise */}
      {promises.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Active Promises</h3>
          <div className="space-y-3">
            {promises.map(promise => (
              <div
                key={promise._id}
                className="p-4 border rounded flex items-center justify-between"
                style={{ borderLeftColor: promise.backgroundColor, borderLeftWidth: '4px' }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{promise.icon}</span>
                  <div>
                    <p className="font-semibold">
                      {promise.deliveryTime} {promise.deliveryUnit}
                    </p>
                    <p className="text-sm text-gray-600">{promise.promiseText}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(promise._id, promise.isActive)}
                    className={`px-3 py-1 rounded text-white text-sm font-semibold transition-colors ${
                      promise.isActive 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-gray-500 hover:bg-gray-600'
                    }`}
                  >
                    {promise.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleDelete(promise._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPromiseManager;
