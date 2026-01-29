import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomerNavbar from '../../../components/Navbar/CustomerNavbar';
import PublicNavbar from '../../../components/Navbar/PublicNavbar';
import ShopHeader from '../../../components/VirtualStore/ShopHeader';
import ShelfRow from '../../../components/VirtualStore/ShelfRow';
import FloatingCartBar from '../../../components/VirtualStore/FloatingCartBar';
import OfferSection from '../../../components/VirtualStore/OfferSection';
import CategoryAisle from '../../../components/VirtualStore/CategoryAisle';
import StoreInfo from '../../../components/VirtualStore/StoreInfo';
import ReviewSection from '../../../components/VirtualStore/ReviewSection';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const StoreView = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [shelvesState, setShelvesState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isLoggedIn = !!(token && user);

  useEffect(() => {
    fetchStoreData();
  }, [storeId]);

  const fetchStoreData = async () => {
    setLoading(true);
    setError(null);

    try {
      const storeRes = await axios.get(`${API_BASE_URL}/stores/${storeId}`);
      console.log('Store data fetched:', storeRes.data);
      setStore(storeRes.data);
    } catch (err) {
      console.error('Error fetching store data:', err);
      setError('Failed to load store');
      setLoading(false);
      return;
    }

    try {
      const productsRes = await axios.get(`${API_BASE_URL}/stores/${storeId}/products`);
      const payload = productsRes.data;
      const list = Array.isArray(payload?.products)
        ? payload.products
        : Array.isArray(payload)
        ? payload
        : [];
      setProducts(list);
      // If API provides shelves, use them
      if (Array.isArray(payload?.shelves)) {
        setShelvesState(payload.shelves);
      }
    } catch (err) {
      console.error('Error fetching products for store:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const viewStore = React.useMemo(() => {
    if (!store) return null;
    const tags = store.tags && Array.isArray(store.tags)
      ? store.tags
      : (store.categories || []).map((c) => c.name).filter(Boolean);
    return {
      ...store,
      storeName: store.storeName || store.name,
      name: store.storeName || store.name,
      storeBanner: store.storeBanner || store.bannerImage,
      bannerImage: store.storeBanner || store.bannerImage,
      storeIcon: store.storeIcon || store.icon,
      storeDescription: store.storeDescription || store.description,
      description: store.storeDescription || store.description,
      rating: store.rating || store.averageRating || 4.7,
      tags,
      deliveryTime: store.deliveryTime || '15-25',
      distance: store.distance || 'Nearby',
      isActive: store.isActive !== false
    };
  }, [store]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {isLoggedIn ? <CustomerNavbar /> : <PublicNavbar />}
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4 mx-auto"></div>
            <p className="text-gray-600 font-medium">Loading store...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-gray-50">
        {isLoggedIn ? <CustomerNavbar /> : <PublicNavbar />}
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <div className="text-6xl">🏪</div>
          <p className="text-gray-600 font-medium">Store not found</p>
          <button
            onClick={() => navigate('/stores')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Stores
          </button>
        </div>
      </div>
    );
  }

  const featuredProducts = (store?.featuredProducts || []).map((p) => p.product || p);
  const discounted = products.filter((p) => p.discount?.isActive);

  // Prefer admin-defined shelves when available
  const shelves = (shelvesState && shelvesState.length > 0)
    ? shelvesState.map(s => ({
        title: s.title,
        icon: s.icon || '🛒',
        products: (s.products || s.productIds || []).map(p => p.product || p)
      })).filter(s => s.products && s.products.length > 0)
    : [
        { title: '⭐ Featured', icon: '⭐', products: featuredProducts.slice(0, 12) },
        { title: '🔥 Best Deals', icon: '🔥', products: discounted.slice(0, 12) },
        { title: '🛍️ Popular Picks', icon: '🛍️', products: products.slice(0, 12) },
        { title: '✨ New Arrivals', icon: '✨', products: products.slice(12, 24) }
      ].filter((s) => s.products && s.products.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {isLoggedIn ? <CustomerNavbar /> : <PublicNavbar />}

      {/* Store Header */}
      <ShopHeader store={viewStore} onClose={() => navigate(-1)} />

      {/* Offers & Deals Section */}
      <OfferSection offers={store?.offers || []} />

      {/* Shop Navigation Tabs (Static for now) */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto py-2">
            {['All', 'Our Special', 'Trending', 'Snacks', 'Drinks', 'Fresh'].map((tab) => (
              <button
                key={tab}
                className="px-4 py-2 text-sm font-medium whitespace-nowrap text-gray-700 hover:text-green-600 border-b-2 border-transparent hover:border-green-600 transition-all"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shelves Section */}
      <div>
        {shelves.map((shelf, idx) => (
          <ShelfRow
            key={idx}
            title={shelf.title}
            icon={shelf.icon}
            products={shelf.products}
            storeId={storeId}
          />
        ))}
      </div>

      {/* Category Aisles */}
      <div>
        {(store?.categories || []).map((category) => {
          const catProducts = products.filter(
            (p) => p.category === category._id || p.category?._id === category._id
          );
          return (
            <CategoryAisle
              key={category._id}
              category={{
                name: category.name,
                icon: category.icon || '🏷️',
                description: category.description || '',
                color: 'bg-gray-50'
              }}
              products={catProducts}
            />
          );
        })}
      </div>

      {/* All Products Grid (if needed) */}
      {products.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🏪 All Products in {viewStore?.storeName}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg p-2 text-center border border-gray-200 hover:shadow-lg transition-all">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
                <h4 className="text-xs font-semibold text-gray-800 line-clamp-2">{product.name}</h4>
                <p className="text-xs text-gray-600 mb-2">₹{product.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-600 font-medium">No products available</p>
        </div>
      )}

      {/* Famous For Section */}
      {store?.famousFor && store.famousFor.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 py-8 border-t border-b border-yellow-200">
          <div className="container mx-auto px-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              Famous For
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {store.famousFor.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-4 border border-yellow-200 hover:shadow-md transition-all text-center"
                >
                  <p className="text-sm font-semibold text-gray-800">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Store Info Section */}
      <StoreInfo store={store} />

      {/* Reviews Section */}
      <ReviewSection storeId={storeId} />

      {/* Floating Cart Bar */}
      <FloatingCartBar />
    </div>
  );
};

export default StoreView;
