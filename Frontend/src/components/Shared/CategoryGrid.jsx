import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const CACHE_TIME = 5 * 60 * 1000;
let categoryCache = { data: null, fetchedAt: 0 };

const CategoryGrid = () => {
  const navigate = useNavigate();
  const hasCache = categoryCache.data !== null;
  const [categories, setCategories] = useState(() => categoryCache.data || []);
  const [loading, setLoading] = useState(!hasCache);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef(null);
  
  // Get user role from localStorage
  const role = localStorage.getItem('role');
  const isCustomer = role === 'customer';

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      const isFresh = Date.now() - categoryCache.fetchedAt < CACHE_TIME;
      if (categoryCache.data !== null && isFresh) return;

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/categories`);
        const fetchedCategories = (response.data || []).map(cat => ({
          name: cat.name,
          imageUrl: cat.image || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          path: cat.name.toLowerCase().replace(/\s+/g, '-'),
          description: cat.description || 'Explore our fresh selection'
        }));
        categoryCache = { data: fetchedCategories, fetchedAt: Date.now() };
        setCategories(fetchedCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback to default categories if API fails
        const fallbackCategories = [
          { name: 'Fruits', imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'fruits', description: 'Fresh & Juicy' },
          { name: 'Vegetables', imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'vegetables', description: 'Farm Fresh' },
          { name: 'Dairy', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'dairy', description: 'Pure & Healthy' },
        ];
        categoryCache = { data: fallbackCategories, fetchedAt: Date.now() };
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
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
  }, [categories]);

  const handleCategoryClick = (categoryPath) => {
    if (isCustomer) {
      navigate(`/c/${categoryPath}`);
    } else {
      navigate(`/${categoryPath}`);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-white pt-4 md:pt-6 pb-2 md:pb-3">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1.5 rounded-lg shadow-lg animate-pulse">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Shop by Category
              </h2>
              <p className="text-xs text-gray-600">Fresh products across all categories</p>
            </div>
          </div>
          <div className="hidden md:flex gap-2">
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
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading amazing categories...</p>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-600 text-lg">No categories available</p>
            </div>
          </div>
        ) : (
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
                {categories.map((category, index) => (
                  <CategoryItem 
                    key={index}
                    category={category}
                    onClick={handleCategoryClick}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Category Item Component with animations
const CategoryItem = ({ category, onClick, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="flex-shrink-0 w-24 md:w-28 cursor-pointer group"
      onClick={() => onClick(category.path)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
      }}
    >
      {/* Category Card */}
      <div className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border-2 border-transparent hover:border-purple-400">
        {/* Gradient Overlay on Hover */}
        <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        
        {/* Image Container */}
        <div className="relative w-full h-24 md:h-28 overflow-hidden">
          <img 
            src={category.imageUrl} 
            alt={category.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
            loading="lazy"
          />
          
          {/* Sparkle Effect on Hover */}
          {isHovered && (
            <>
              <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
              <div className="absolute top-4 right-4 w-1 h-1 bg-white rounded-full animate-pulse" />
              <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
            </>
          )}
        </div>
        
        {/* Content */}
        <div className="p-2 md:p-2.5">
          <h3 className="font-bold text-xs md:text-sm text-gray-800 text-center group-hover:text-purple-600 transition-colors line-clamp-1">
            {category.name}
          </h3>
        </div>
      </div>
    </div>
  );
};

// Add keyframe animation
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

export default CategoryGrid;