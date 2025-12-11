import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VirtualStoresSection = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/stores`);
        const data = Array.isArray(response.data) ? response.data : response.data.data || [];
        console.log('Virtual Stores API Response:', response.data);
        console.log('Processed Stores Data:', data);
        data.forEach((store, idx) => {
          console.log(`Store ${idx} (${store.storeName}):`, { 
            storeBanner: store.storeBanner, 
            storeIcon: store.storeIcon,
            hasBanner: !!store.storeBanner,
            bannerLength: store.storeBanner ? store.storeBanner.length : 0
          });
        });
        setStores(data);
      } catch (error) {
        console.error('Failed to fetch virtual stores:', error);
        setStores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  if (loading) {
    return (
      <div className="bg-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">🏪 Shop by Store</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-40 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (stores.length === 0) return null;

  return (
    <div className="bg-white py-8 px-4 border-b">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🏪 Shop by Store</h2>
          <button
            onClick={() => navigate('/stores')}
            className="text-green-600 hover:text-green-700 font-semibold"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-4 min-w-max">
            {stores.map((store) => (
              <div
                key={store._id}
                onClick={() => navigate(`/store/${store._id}`)}
                className="group cursor-pointer flex-shrink-0 w-32 md:w-40"
              >
                {/* Store Banner Image */}
                <div className="relative rounded-lg overflow-hidden mb-3 h-32 md:h-40 transition-transform group-hover:scale-105 bg-gray-100">
                  {store.storeBanner ? (
                    <img
                      src={store.storeBanner}
                      alt={store.storeName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.nextSibling;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div 
                    className={`absolute inset-0 flex items-center justify-center text-5xl ${!store.storeBanner ? 'flex' : 'hidden'}`}
                    style={{ backgroundColor: store.storeColor || '#f0f0f0' }}
                  >
                    {store.storeIcon}
                  </div>
                </div>

                {/* Store Name */}
                <h3 className="font-semibold text-center text-sm group-hover:text-green-600 transition-colors line-clamp-2">
                  {store.storeName}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualStoresSection;
