import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CategoryGrid = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get user role from localStorage
  const role = localStorage.getItem('role');
  const isCustomer = role === 'customer';

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/categories`);
        const fetchedCategories = (response.data || []).map(cat => ({
          name: cat.name,
          imageUrl: cat.image || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          path: cat.name.toLowerCase().replace(/\s+/g, '-')
        }));
        setCategories(fetchedCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback to default categories if API fails
        setCategories([
          { name: 'Fruits', imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'fruits' },
          { name: 'Vegetables', imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'vegetables' },
          { name: 'Dairy', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'dairy' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryPath) => {
    if (isCustomer) {
      navigate(`/c/${categoryPath}`);
    } else {
      navigate(`/${categoryPath}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-xl md:text-2xl font-bold mb-6">Shop by category</h2>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading categories...</div>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">No categories available</div>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-4 min-w-max">
            {categories.map((category, index) => (
              <CategoryItem 
                key={index}
                category={category}
                onClick={handleCategoryClick}
                className="flex-shrink-0 w-24 md:w-28"
                imageClass="h-24 md:h-28"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Category Item Component
const CategoryItem = ({ category, onClick, className, imageClass }) => {
  return (
    <div 
      className={`flex flex-col items-center cursor-pointer transition-transform hover:scale-105 ${className}`}
      onClick={() => onClick(category.path)}
    >
      <div className={`w-full rounded-2xl overflow-hidden border-2 border-gray-200 ${imageClass}`}>
        <img 
          src={category.imageUrl} 
          alt={category.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <span className="mt-2 text-xs md:text-sm text-center font-medium">{category.name}</span>
    </div>
  );
};

export default CategoryGrid;