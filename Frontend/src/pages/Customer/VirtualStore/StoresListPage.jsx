import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomerNavbar from '../../../components/Navbar/CustomerNavbar';
import { Store, Star, Clock, MapPin, ChevronRight } from 'lucide-react';

const StoresListPage = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/stores`
      );
      setStores(response.data.stores || response.data || []);
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreClick = (storeId) => {
    navigate(`/store/${storeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4 mx-auto"></div>
            <p className="text-gray-600 font-medium">Loading stores...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavbar />
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <div className="text-6xl">🏪</div>
          <p className="text-gray-600 font-medium">Failed to load stores</p>
          <button
            onClick={fetchStores}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Store className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Virtual Stores</h1>
          </div>
          <p className="text-green-100">Browse our collection of virtual stores</p>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="container mx-auto px-4 py-8">
        {stores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">🏪</div>
            <p className="text-gray-600 font-medium">No stores available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div
                key={store._id}
                onClick={() => handleStoreClick(store._id)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
              >
                {/* Store Banner */}
                <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  {store.storeBanner ? (
                    <img
                      src={store.storeBanner}
                      alt={store.storeName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-6xl">{store.storeIcon || '🏪'}</span>
                    </div>
                  )}
                  
                  {/* Store Icon Badge */}
                  <div className="absolute top-4 left-4 bg-white rounded-full p-3 shadow-lg">
                    <span className="text-3xl">{store.storeIcon || '🏪'}</span>
                  </div>
                </div>

                {/* Store Info */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                    {store.storeName}
                  </h3>
                  
                  {store.storeDescription && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {store.storeDescription}
                    </p>
                  )}

                  {/* Store Stats */}
                  <div className="flex items-center gap-4 mb-4">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-700">
                        {store.rating?.average || 4.5}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({store.rating?.count || 0})
                      </span>
                    </div>

                    {/* Visits */}
                    {store.visitCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Store className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {store.visitCount} visits
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStoreClick(store._id);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors group-hover:bg-green-700"
                  >
                    <span className="font-semibold">Visit Store</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoresListPage;
