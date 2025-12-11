import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Store } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VirtualStoresSection = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef(null);
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

  // Check scroll position and update arrow visibility
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    checkScroll();
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [stores]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="bg-white pt-3 md:pt-4 pb-2 md:pb-3 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-1.5 rounded-lg shadow-lg animate-pulse">
              <Store className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <h2 className="text-lg md:text-xl font-bold">🏪 Shop by Store</h2>
          </div>
          <div className="flex gap-3 md:gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-24 md:w-28">
                <div className="bg-gray-200 rounded-xl h-24 md:h-28 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (stores.length === 0) return null;

  return (
    <div className="bg-white pt-3 md:pt-4 pb-2 md:pb-3 px-4 border-b">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-1.5 rounded-lg shadow-lg animate-pulse">
              <Store className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                🏪 Shop by Store
              </h2>
              <p className="text-xs text-gray-600">Popular local stores</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {showLeftArrow && (
              <button 
                onClick={() => scroll('left')}
                className="p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110 border border-gray-200"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
            )}
            {showRightArrow && (
              <button 
                onClick={() => scroll('right')}
                className="p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110 border border-gray-200"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            )}
            <button
              onClick={() => navigate('/stores')}
              className="text-green-600 hover:text-green-700 font-semibold text-sm md:text-base"
            >
              View All →
            </button>
          </div>
        </div>

        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="flex gap-3 md:gap-4 min-w-max px-0.5">
              {stores.map((store, index) => (
                <StoreCard 
                  key={store._id}
                  store={store}
                  navigate={navigate}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Store Card Component
const StoreCard = ({ store, navigate, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="flex-shrink-0 w-24 md:w-28 cursor-pointer group"
      onClick={() => navigate(`/store/${store._id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
      }}
    >
      {/* Store Card */}
      <div className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border-2 border-transparent hover:border-green-400">
        {/* Gradient Overlay on Hover */}
        <div className={`absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        
        {/* Store Banner/Icon */}
        <div className="relative w-full h-24 md:h-28 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
          {store.storeBanner ? (
            <img 
              src={store.storeBanner}
              alt={store.storeName}
              className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = e.target.nextSibling;
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }}
              loading="lazy"
            />
          ) : null}
          <div 
            className={`absolute inset-0 flex items-center justify-center text-4xl md:text-5xl ${!store.storeBanner ? 'flex' : 'hidden'}`}
            style={{ backgroundColor: store.storeColor || '#f3f4f6' }}
          >
            {store.storeIcon || '🏪'}
          </div>
          
          {/* Sparkle Effect on Hover */}
          {isHovered && (
            <>
              <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
              <div className="absolute top-4 right-4 w-1 h-1 bg-white rounded-full animate-pulse" />
              <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" />
            </>
          )}
        </div>
        
        {/* Store Info */}
        <div className="p-2 md:p-2.5">
          <h3 className="font-bold text-xs md:text-sm text-gray-800 text-center group-hover:text-green-600 transition-colors line-clamp-1">
            {store.storeName}
          </h3>
        </div>
      </div>
    </div>
  );
};

// Add keyframe animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
  `;
  document.head.appendChild(style);
}

export default VirtualStoresSection;
