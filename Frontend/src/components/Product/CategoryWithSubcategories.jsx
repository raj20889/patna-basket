import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomerNavbar from '../Navbar/CustomerNavbar';
import PublicNavbar from '../Navbar/PublicNavbar';
import ProductCard from './ProductCard';

const CategoryWithSubcategories = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [subcategoryCounts, setSubcategoryCounts] = useState({});
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState(null);
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const slugify = (text = '') =>
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-');

  // Check auth status on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    setUserIsLoggedIn(!!token);
  }, []);

  // 🔹 Fetch products and subcategories by category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsPromise = axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/products/category/${category}`
        );

        const categoriesPromise = axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/categories`
        );

        const [productsRes, categoriesRes] = await Promise.all([productsPromise, categoriesPromise]);

        const products = productsRes.data || [];
        setAllProducts(products);
        setFilteredProducts(products);

        // Map route param to category id using slug match
        const matchedCategory = (categoriesRes.data || []).find((cat) => slugify(cat.name) === slugify(category));
        setCategoryId(matchedCategory?._id || null);
        setCategoryName(matchedCategory?.name || category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
        setCategoryData(matchedCategory);

        // Fetch subcategories for this category if we found it
        if (matchedCategory?._id) {
          const subRes = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/subcategories/category/${matchedCategory._id}`
          );
          const subcategoriesData = subRes.data || [];
          setSubcategories(subcategoriesData);

          // Calculate product count per subcategory
          const counts = {};
          subcategoriesData.forEach(sub => {
            counts[sub.name] = products.filter(product => {
              const subs = Array.isArray(product.subcategory)
                ? product.subcategory
                : product.subcategory ? [product.subcategory] : [];
              return subs.some(s => s && s.toLowerCase() === sub.name.toLowerCase());
            }).length;
          });
          setSubcategoryCounts(counts);

          // Don't auto-select first subcategory - show all products by default
          setSelectedSubcategory(null);
        } else {
          // Fall back to deriving from products if no category match
          const uniqueSubcategories = [
            ...new Set(
              products
                .map((product) => product.subcategory)
                .filter(Boolean)
                .flatMap((sub) => (Array.isArray(sub) ? sub : [sub]))
            )
          ];
          setSubcategories(uniqueSubcategories);
          
          // Calculate counts for fallback
          const counts = {};
          uniqueSubcategories.forEach(subName => {
            counts[subName] = products.filter(product => {
              const subs = Array.isArray(product.subcategory)
                ? product.subcategory
                : product.subcategory ? [product.subcategory] : [];
              return subs.some(s => s && s.toLowerCase() === subName.toLowerCase());
            }).length;
          });
          setSubcategoryCounts(counts);
          setSelectedSubcategory(null);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  // 🔹 Filter products when subcategory changes
  useEffect(() => {
    if (selectedSubcategory) {
      const filtered = allProducts.filter((product) => {
        const subs = Array.isArray(product.subcategory)
          ? product.subcategory
          : product.subcategory
            ? [product.subcategory]
            : [];
        return subs.some((s) => s && s.toLowerCase() === selectedSubcategory.toLowerCase());
      });
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(allProducts);
    }
  }, [selectedSubcategory, allProducts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {userIsLoggedIn ? <CustomerNavbar /> : <PublicNavbar />}
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-lg text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {userIsLoggedIn ? <CustomerNavbar /> : <PublicNavbar />}

      {/* Category Header - Modern with animations */}
      <div 
        className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-2.5 shadow-2xl overflow-hidden"
      >
        {/* Animated background overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        
        {/* Decorative circles */}
        <div className="absolute top-0 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl animate-bounce"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 animate-fadeInUp">
            {categoryData?.icon && (
              <span className="text-4xl transform transition-transform hover:scale-110 hover:rotate-12 duration-300">
                {categoryData.icon}
              </span>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight drop-shadow-lg">
                {categoryName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1 w-20 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-xs md:text-sm text-white/80 font-medium">
                  {allProducts.length} Products
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-4 pb-8">
        {/* Mobile Filter Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden w-full mb-3 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-between"
        >
          <span className="font-semibold text-gray-700">
            {selectedSubcategory || 'All Products'}
          </span>
          <svg 
            className={`w-5 h-5 transform transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className="flex gap-6">
          {/* Left Sidebar - Subcategories */}
          <div 
            className={`
              ${isMobileMenuOpen ? 'block' : 'hidden'} 
              lg:block 
              w-full lg:w-64 
              flex-shrink-0 
              ${isMobileMenuOpen ? 'mb-4' : ''}
            `}
          >
            <div className="lg:sticky lg:top-20 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Subcategories
                </span>
                <span className="text-white/80 text-sm">{subcategories.length}</span>
              </div>

              <div className="max-h-[70vh] overflow-y-auto">
                {/* "All Products" option */}
                <button
                  onClick={() => {
                    setSelectedSubcategory(null);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3.5 border-b transition-all duration-200 flex items-center justify-between group ${
                    selectedSubcategory === null
                      ? 'bg-blue-50 border-l-4 border-l-blue-500 font-semibold text-blue-600'
                      : 'hover:bg-gray-50 text-gray-700 border-l-4 border-l-transparent hover:border-l-gray-300'
                  }`}
                >
                  <span>All Products</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedSubcategory === null 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                  }`}>
                    {allProducts.length}
                  </span>
                </button>

                {/* Individual subcategories */}
                {subcategories.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <div className="text-gray-400 text-4xl mb-2">📦</div>
                    <p className="text-sm text-gray-500">No subcategories yet</p>
                  </div>
                )}

                {subcategories.map((subcategory) => (
                  <button
                    key={subcategory._id || subcategory.name}
                    onClick={() => {
                      setSelectedSubcategory(subcategory.name);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3.5 border-b transition-all duration-200 flex items-center gap-3 group ${
                      selectedSubcategory === subcategory.name
                        ? 'bg-blue-50 border-l-4 border-l-blue-500 font-semibold text-blue-600'
                        : 'hover:bg-gray-50 text-gray-700 border-l-4 border-l-transparent hover:border-l-gray-300'
                    }`}
                  >
                    {subcategory.image && (
                      <img
                        src={subcategory.image}
                        alt={subcategory.name}
                        className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <span className="flex-1 truncate">{subcategory.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                      selectedSubcategory === subcategory.name 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    }`}>
                      {subcategoryCounts[subcategory.name] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Products Grid */}
          <div className="flex-1 min-w-0">
            {filteredProducts.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-800">
                      {filteredProducts.length}
                    </span> product{filteredProducts.length !== 1 ? 's' : ''} found
                    {selectedSubcategory && (
                      <span className="ml-2 text-blue-600">
                        in {selectedSubcategory}
                      </span>
                    )}
                  </div>
                  {selectedSubcategory && (
                    <button
                      onClick={() => setSelectedSubcategory(null)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear Filter
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product._id}
                      product={product}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6">
                  {selectedSubcategory 
                    ? `No products available in "${selectedSubcategory}" subcategory.`
                    : 'This category is currently empty.'
                  }
                </p>
                <div className="flex gap-3 justify-center">
                  {selectedSubcategory && (
                    <button
                      onClick={() => setSelectedSubcategory(null)}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      View All Products
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add custom animations
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-shimmer {
    animation: shimmer 3s infinite;
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out;
  }
`;
document.head.appendChild(style);

export default CategoryWithSubcategories;
