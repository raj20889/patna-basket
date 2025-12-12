import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  MdDelete,
  MdEdit,
  MdToggleOn,
  MdToggleOff,
  MdAdd,
  MdClose,
  MdOpenInNew,
  MdRefresh,
  MdOutlineSearch,
  MdEditNote
} from 'react-icons/md';
import StoreEditor from './StoreEditor';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const initialForm = {
  storeName: '',
  storeIcon: '',
  storeBanner: '',
  storeDescription: '',
  storeColor: '#00A82D',
  displayOrder: 0,
  isActive: true,
  storeType: 'virtual'
};

const VirtualStoresManager = () => {
  const [stores, setStores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingStore, setEditingStore] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('order');

  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/stores/admin/all`, { headers });
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setStores(data);
    } catch (err) {
      console.error('Error fetching virtual stores:', err);
      setError('Failed to load virtual stores');
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'displayOrder' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/stores/${editingId}`, formData, { headers });
      } else {
        await axios.post(`${API_BASE_URL}/stores/add`, formData, { headers });
      }
      setFormData(initialForm);
      setEditingId(null);
      setShowForm(false);
      await fetchStores();
    } catch (err) {
      console.error('Error saving virtual store:', err);
      setError('Failed to save virtual store');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (store) => {
    setFormData({
      storeName: store.storeName || '',
      storeIcon: store.storeIcon || '',
      storeBanner: store.storeBanner || '',
      storeDescription: store.storeDescription || '',
      storeColor: store.storeColor || '#00A82D',
      displayOrder: Number(store.displayOrder || 0),
      isActive: store.isActive ?? true,
      storeType: store.storeType || 'virtual'
    });
    setEditingId(store._id);
    setShowForm(true);
  };

  const handleOpenEditor = (store) => {
    setEditingStore(store);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingStore(null);
  };

  const handleToggle = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/stores/${id}/toggle`, {}, { headers });
      fetchStores();
    } catch (err) {
      console.error('Error toggling store:', err);
      setError('Failed to toggle store status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this virtual store?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/stores/${id}`, { headers });
      fetchStores();
    } catch (err) {
      console.error('Error deleting virtual store:', err);
      setError('Failed to delete virtual store');
    }
  };

  const filteredStores = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const list = stores.filter((s) =>
      !term ||
      s.storeName?.toLowerCase().includes(term) ||
      s.storeDescription?.toLowerCase().includes(term)
    );

    return list.sort((a, b) => {
      if (sortKey === 'name') return (a.storeName || '').localeCompare(b.storeName || '');
      if (sortKey === 'status') return (a.isActive === b.isActive) ? 0 : a.isActive ? -1 : 1;
      return Number(a.displayOrder || 0) - Number(b.displayOrder || 0);
    });
  }, [stores, searchTerm, sortKey]);

  const stats = useMemo(() => {
    const total = stores.length;
    const active = stores.filter((s) => s.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [stores]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Virtual Store Manager</h2>
          <p className="text-sm text-gray-600">Create, reorder, activate, and maintain all virtual stores in one place.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchStores}
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold"
          >
            <MdRefresh /> Refresh
          </button>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData(initialForm);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold"
          >
            <MdAdd /> New Store
          </button>
          {showForm && (
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData(initialForm);
              }}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold"
            >
              <MdClose /> Close Form
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white">
          <p className="text-sm opacity-80">Total Stores</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 text-white">
          <p className="text-sm opacity-80">Active</p>
          <p className="text-2xl font-bold">{stats.active}</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-500 to-gray-700 text-white">
          <p className="text-sm opacity-80">Inactive</p>
          <p className="text-2xl font-bold">{stats.inactive}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-xl bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
          <MdOutlineSearch className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sort by</label>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="order">Display Order</option>
            <option value="name">Name</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-xl p-5 space-y-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Store Name</label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleInputChange}
                placeholder="e.g., Paan Corner"
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Icon / Emoji</label>
              <input
                type="text"
                name="storeIcon"
                value={formData.storeIcon}
                onChange={handleInputChange}
                maxLength="2"
                placeholder="🏪"
                className="w-full px-3 py-2 border rounded-lg text-center text-2xl"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Store Banner URL</label>
              <input
                type="url"
                name="storeBanner"
                value={formData.storeBanner}
                onChange={handleInputChange}
                placeholder="https://..."
                className="w-full px-3 py-2 border rounded-lg"
              />
              {formData.storeBanner && (
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={formData.storeBanner}
                    alt="Store Banner Preview"
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Description</label>
              <textarea
                name="storeDescription"
                value={formData.storeDescription}
                onChange={handleInputChange}
                rows="2"
                placeholder="Short description"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Store Color</label>
              <input
                type="color"
                name="storeColor"
                value={formData.storeColor}
                onChange={handleInputChange}
                className="w-full h-10 px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Display Order</label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Store Type</label>
              <select
                name="storeType"
                value={formData.storeType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="virtual">Virtual</option>
                <option value="physical">Physical</option>
                <option value="partner">Partner</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                Active
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingId ? 'Update Store' : 'Create Store'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData(initialForm);
                setEditingId(null);
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold"
            >
              Reset
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && (
          <div className="col-span-full text-center py-8 text-gray-500">Loading stores...</div>
        )}

        {!loading && filteredStores.map((store) => (
          <div key={store._id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-white">
            <div className="h-32 relative bg-gray-100 overflow-hidden">
              {store.storeBanner ? (
                <img
                  src={store.storeBanner}
                  alt={store.storeName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : null}
              <div
                className={`absolute inset-0 flex items-center justify-center text-5xl ${!store.storeBanner ? 'flex' : 'hidden'}`}
                style={{ backgroundColor: store.storeColor || '#f3f4f6' }}
              >
                {store.storeIcon || '🏪'}
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <span className={`px-2 py-1 rounded text-xs font-bold text-white ${store.isActive ? 'bg-emerald-500' : 'bg-slate-500'}`}>
                  {store.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="px-2 py-1 rounded text-xs font-semibold bg-white/90 text-gray-700 border border-gray-200">#{store.displayOrder ?? 0}</span>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{store.storeIcon || '🏪'}</span>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{store.storeName}</h3>
                  <p className="text-xs text-gray-500">{store.storeType || 'virtual'}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{store.storeDescription || 'No description provided.'}</p>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleOpenEditor(store)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold"
                  title="Full Store Editor"
                >
                  <MdEditNote /> Manage
                </button>
                <button
                  onClick={() => handleEdit(store)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
                >
                  <MdEdit /> Edit
                </button>
                <button
                  onClick={() => handleToggle(store._id)}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white ${store.isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {store.isActive ? <MdToggleOn /> : <MdToggleOff />}
                  {store.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(store._id)}
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold"
                  title="Delete"
                >
                  <MdDelete />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Color: {store.storeColor || '#ccc'}</span>
                <span>ID: {store._id?.slice(-6)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && filteredStores.length === 0 && (
        <div className="text-center py-10 text-gray-500">No virtual stores found. Add one to get started.</div>
      )}

      {/* Store Editor Modal */}
      {showEditor && editingStore && (
        <StoreEditor
          store={editingStore}
          onClose={handleCloseEditor}
          onSave={async () => {
            await fetchStores();
            handleCloseEditor();
          }}
          token={token}
        />
      )}
    </div>
  );
};

export default VirtualStoresManager;
