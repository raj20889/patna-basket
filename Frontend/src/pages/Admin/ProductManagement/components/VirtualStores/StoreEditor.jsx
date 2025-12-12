import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MdClose,
  MdAdd,
  MdDelete,
  MdEdit,
  MdSave,
  MdArrowBack,
  MdUpload
} from 'react-icons/md';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const StoreEditor = ({ store, onClose, onSave, token }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [storeData, setStoreData] = useState(store);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const handleStoreUpdate = (field, value) => {
    setStoreData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveStore = async () => {
    setSaving(true);
    setError('');
    try {
      await axios.put(`${API_BASE_URL}/stores/${storeData._id}`, storeData, { headers });
      onSave();
    } catch (err) {
      console.error('Error saving store:', err);
      setError('Failed to save store');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'details', label: '📋 Store Details', icon: '📋' },
    { id: 'banner', label: '🖼️ Banner & Media', icon: '🖼️' },
    { id: 'shelves', label: '📦 Shelves', icon: '📦' },
    { id: 'offers', label: '🎁 Offers & Deals', icon: '🎁' },
    { id: 'category', label: '🏷️ Categories', icon: '🏷️' },
    { id: 'shop', label: '🏪 Shop Details', icon: '🏪' },
    { id: 'famous', label: '⭐ Famous For', icon: '⭐' },
    { id: 'reviews', label: '⭐ Reviews', icon: '⭐' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen p-4 flex items-start justify-center">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mt-4 mb-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{storeData.storeIcon || '🏪'}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{storeData.storeName}</h2>
                  <p className="text-sm text-gray-600">Edit store details and sections</p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <MdClose className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto border-b bg-gray-50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-semibold text-sm whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Store Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Store Name</label>
                    <input
                      type="text"
                      value={storeData.storeName}
                      onChange={(e) => handleStoreUpdate('storeName', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Store Icon</label>
                    <input
                      type="text"
                      value={storeData.storeIcon}
                      onChange={(e) => handleStoreUpdate('storeIcon', e.target.value)}
                      maxLength="2"
                      className="w-full px-3 py-2 border rounded-lg text-center text-2xl"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Store Description</label>
                    <textarea
                      value={storeData.storeDescription}
                      onChange={(e) => handleStoreUpdate('storeDescription', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Store Color</label>
                    <input
                      type="color"
                      value={storeData.storeColor || '#00A82D'}
                      onChange={(e) => handleStoreUpdate('storeColor', e.target.value)}
                      className="w-full h-10 px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                    <input
                      type="number"
                      value={storeData.displayOrder || 0}
                      onChange={(e) => handleStoreUpdate('displayOrder', Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Banner & Media Tab */}
            {activeTab === 'banner' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Store Banner URL</label>
                  <input
                    type="url"
                    value={storeData.storeBanner || ''}
                    onChange={(e) => handleStoreUpdate('storeBanner', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {storeData.storeBanner && (
                    <div className="mt-4 border rounded-lg overflow-hidden">
                      <img
                        src={storeData.storeBanner}
                        alt="Banner Preview"
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Shelves Tab */}
            {activeTab === 'shelves' && (
              <ShelvesManager store={storeData} onUpdate={handleStoreUpdate} token={token} />
            )}

            {/* Offers Tab */}
            {activeTab === 'offers' && (
              <OffersManager store={storeData} onUpdate={handleStoreUpdate} />
            )}

            {/* Category Aisle Tab */}
            {activeTab === 'category' && (
              <CategoryManager store={storeData} onUpdate={handleStoreUpdate} token={token} />
            )}

            {/* Shop Details Tab */}
            {activeTab === 'shop' && (
              <ShopDetailsManager store={storeData} onUpdate={handleStoreUpdate} />
            )}

            {/* Famous For Tab */}
            {activeTab === 'famous' && (
              <FamousForManager store={storeData} onUpdate={handleStoreUpdate} />
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <ReviewsManager store={storeData} token={token} />
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-2 p-6 border-t bg-gray-50">
            <button
              onClick={handleSaveStore}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-60"
            >
              <MdSave /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== Shelves Manager ====================
const ShelvesManager = ({ store, onUpdate, token }) => {
  const [shelves, setShelves] = useState(store.shelves || []);
  const [editingIdx, setEditingIdx] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/products`);
        setProducts(Array.isArray(res.data) ? res.data : res.data.data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchProducts();
  }, []);

  const addShelf = () => {
    const newShelf = {
      id: Date.now(),
      title: 'New Shelf',
      icon: '📦',
      productIds: []
    };
    setShelves([...shelves, newShelf]);
  };

  const updateShelf = (idx, field, value) => {
    const updated = [...shelves];
    updated[idx][field] = value;
    setShelves(updated);
    onUpdate('shelves', updated);
  };

  const deleteShelf = (idx) => {
    setShelves(shelves.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      {shelves.map((shelf, idx) => (
        <div key={shelf.id} className="border rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              value={shelf.title}
              onChange={(e) => updateShelf(idx, 'title', e.target.value)}
              placeholder="Shelf Title"
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              value={shelf.icon || ''}
              onChange={(e) => updateShelf(idx, 'icon', e.target.value)}
              maxLength="2"
              placeholder="🎁"
              className="px-3 py-2 border rounded-lg text-center"
            />
            <button
              onClick={() => deleteShelf(idx)}
              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              <MdDelete className="w-5 h-5 mx-auto" />
            </button>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Products</label>
            <div className="max-h-40 overflow-y-auto border rounded bg-white p-2">
              {products.slice(0, 10).map((p) => (
                <label key={p._id} className="flex items-center gap-2 p-1 hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(shelf.productIds || []).includes(p._id)}
                    onChange={(e) => {
                      const ids = e.target.checked
                        ? [...(shelf.productIds || []), p._id]
                        : (shelf.productIds || []).filter((id) => id !== p._id);
                      updateShelf(idx, 'productIds', ids);
                    }}
                  />
                  <span className="text-xs">{p.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={addShelf}
        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold flex items-center justify-center gap-2"
      >
        <MdAdd /> Add Shelf
      </button>
    </div>
  );
};

// ==================== Offers Manager ====================
const OffersManager = ({ store, onUpdate }) => {
  const [offers, setOffers] = useState(store.offers || []);

  const addOffer = () => {
    const newOffer = {
      id: Date.now(),
      title: 'New Offer',
      description: 'Offer description',
      color: 'bg-green-100 text-green-700'
    };
    setOffers([...offers, newOffer]);
    onUpdate('offers', [...offers, newOffer]);
  };

  const updateOffer = (idx, field, value) => {
    const updated = [...offers];
    updated[idx][field] = value;
    setOffers(updated);
    onUpdate('offers', updated);
  };

  const deleteOffer = (idx) => {
    const updated = offers.filter((_, i) => i !== idx);
    setOffers(updated);
    onUpdate('offers', updated);
  };

  return (
    <div className="space-y-4">
      {offers.map((offer, idx) => (
        <div key={offer.id} className="border rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={offer.title}
              onChange={(e) => updateOffer(idx, 'title', e.target.value)}
              placeholder="Offer Title"
              className="px-3 py-2 border rounded-lg"
            />
            <textarea
              value={offer.description}
              onChange={(e) => updateOffer(idx, 'description', e.target.value)}
              placeholder="Offer Description"
              className="px-3 py-2 border rounded-lg"
              rows="2"
            />
          </div>
          <button
            onClick={() => deleteOffer(idx)}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Delete Offer
          </button>
        </div>
      ))}
      <button
        onClick={addOffer}
        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-semibold flex items-center justify-center gap-2"
      >
        <MdAdd /> Add Offer
      </button>
    </div>
  );
};

// ==================== Category Manager ====================
const CategoryManager = ({ store, onUpdate, token }) => {
  const [categories, setCategories] = useState(store.categories || []);
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/categories`);
        setAllCategories(Array.isArray(res.data) ? res.data : res.data.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const toggleCategory = (catId) => {
    const updated = categories.includes(catId)
      ? categories.filter((id) => id !== catId)
      : [...categories, catId];
    setCategories(updated);
    onUpdate('categories', updated);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">Select categories to display in this store:</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {allCategories.slice(0, 20).map((cat) => (
          <label
            key={cat._id}
            className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={categories.includes(cat._id)}
              onChange={() => toggleCategory(cat._id)}
            />
            <span className="text-sm">{cat.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// ==================== Shop Details Manager ====================
const ShopDetailsManager = ({ store, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Time (mins)</label>
          <input
            type="text"
            value={store.deliveryTime || '15-25'}
            onChange={(e) => onUpdate('deliveryTime', e.target.value)}
            placeholder="e.g., 15-25"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Distance (km)</label>
          <input
            type="text"
            value={store.distance || 'Nearby'}
            onChange={(e) => onUpdate('distance', e.target.value)}
            placeholder="e.g., 0.5"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={store.rating || 4.7}
            onChange={(e) => onUpdate('rating', Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Store Type</label>
          <select
            value={store.storeType || 'virtual'}
            onChange={(e) => onUpdate('storeType', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="virtual">Virtual</option>
            <option value="physical">Physical</option>
            <option value="partner">Partner</option>
          </select>
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <input
            type="checkbox"
            checked={store.isActive ?? true}
            onChange={(e) => onUpdate('isActive', e.target.checked)}
          />
          Store Active
        </label>
      </div>
    </div>
  );
};

// ==================== Famous For Manager ====================
const FamousForManager = ({ store, onUpdate }) => {
  const [famousFor, setFamousFor] = useState(store.famousFor || []);
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim()) {
      const updated = [...famousFor, newItem.trim()];
      setFamousFor(updated);
      onUpdate('famousFor', updated);
      setNewItem('');
    }
  };

  const removeItem = (idx) => {
    const updated = famousFor.filter((_, i) => i !== idx);
    setFamousFor(updated);
    onUpdate('famousFor', updated);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">Add items this store is famous for:</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="e.g., Fresh Paan, Betel Leaves"
          className="flex-1 px-3 py-2 border rounded-lg"
          onKeyPress={(e) => e.key === 'Enter' && addItem()}
        />
        <button
          onClick={addItem}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <MdAdd />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {famousFor.map((item, idx) => (
          <div
            key={idx}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-2"
          >
            {item}
            <button
              onClick={() => removeItem(idx)}
              className="text-blue-700 hover:text-blue-900"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== Reviews Manager ====================
const ReviewsManager = ({ store, token }) => {
  const [reviews, setReviews] = useState(store.reviews || []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 font-semibold">Store Reviews & Ratings</p>
      {reviews.length === 0 ? (
        <p className="text-center py-8 text-gray-500">No reviews yet. Customer reviews will appear here.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review, idx) => (
            <div key={idx} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-800">{review.customerName || 'Anonymous'}</p>
                  <div className="text-yellow-500">
                    {'⭐'.repeat(review.rating || 5)}
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {review.date ? new Date(review.date).toLocaleDateString() : 'Recently'}
                </span>
              </div>
              <p className="text-sm text-gray-600">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreEditor;
