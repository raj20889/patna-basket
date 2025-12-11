import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/categories`);
        const data = Array.isArray(response.data) ? response.data : response.data.data || [];
        setCategories(data.slice(0, 8)); // Show first 8 categories
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">🏪 Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-24 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) return null;

  const categoryIcons = {
    'Beverages': '🥤',
    'Snacks': '🍿',
    'Dairy': '🥛',
    'Fruits': '🍎',
    'Vegetables': '🥗',
    'Bakery': '🍞',
    'Meat': '🥩',
    'Frozen': '🧊',
    'Pantry': '🛒',
    'Beauty': '💄',
    'Health': '💊',
    'Household': '🧹'
  };

  return (
    <div className="bg-gray-50 py-8 px-4 border-b">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🏪 Shop by Category</h2>
          <button
            onClick={() => navigate('/categories')}
            className="text-green-600 hover:text-green-700 font-semibold text-sm"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category) => (
            <div
              key={category._id}
              onClick={() => navigate(`/category/${category._id}`)}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition-shadow flex flex-col items-center justify-center h-24">
                <span className="text-4xl mb-2">
                  {categoryIcons[category.name] || '📦'}
                </span>
              </div>
              <p className="text-center text-sm font-semibold mt-2 group-hover:text-green-600 transition-colors">
                {category.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySection;
