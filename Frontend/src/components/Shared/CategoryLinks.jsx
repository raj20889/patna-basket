import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CategoryLinks = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const role = localStorage.getItem('role');
  const isCustomer = role === 'customer';

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/categories`);
        const fetchedCategories = (response.data || []).slice(0, 3).map(cat => ({
          name: cat.name,
          imageUrl: cat.image || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          path: cat.name.toLowerCase().replace(/\s+/g, '-')
        }));
        setCategories(fetchedCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback categories if API fails
        setCategories([
          {
            name: 'Staples',
            imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2020/10/AF/AK/RF/115160227/new-product-1000x1000.jpeg',
            path: 'staples'
          },
          {
            name: 'Puja Essentials',
            imageUrl: 'https://cdn.zeptonow.com/production/tr:w-1280,ar-1440-848,pr-true,f-auto,q-80/inventory/banner/f898fb11-c5c6-4b50-a061-8a2b1af3bddd.png',
            path: 'puja-essentials'
          },
          {
            name: 'All Dairy Products',
            imageUrl: 'https://www.sudhatimul.in/images/img_gal/p2.jpg',
            path: 'milk'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryPath) => {
    navigate(isCustomer ? `/c/${categoryPath}` : `/${categoryPath}`);
  };

  return (
    <div className="text-center my-5 px-4">
      <h1 className="text-xl md:text-2xl font-bold mb-4">Explore Our Categories</h1>   
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Loading categories...</div>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="text-gray-500">No categories available</div>
        </div>
      ) : (
        <>
      {/* Desktop View */}
      <div className="hidden sm:flex justify-evenly p-5">
        {categories.map((category, index) => (
          <div 
            key={index} 
            className="w-[25%] cursor-pointer transition-transform duration-300 hover:scale-105 text-center rounded-lg overflow-hidden shadow-md"
            onClick={() => handleCategoryClick(category.path)}
          >
            <img 
              src={category.imageUrl} 
              alt={category.name} 
              className="w-full h-40 object-contain"
              loading="lazy"
            />
            <div className="p-2 font-bold text-lg bg-gray-50">
              {category.name}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile View (new compact scrollable version) */}
      <div className="sm:hidden flex overflow-x-auto gap-3 px-2 py-1 hide-scrollbar -mx-2">
        {categories.map((category, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 w-28 cursor-pointer transition-transform duration-300 hover:scale-105 text-center rounded-lg overflow-hidden shadow-sm"
            onClick={() => handleCategoryClick(category.path)}
          >
            <img 
              src={category.imageUrl} 
              alt={category.name} 
              className="w-full h-20 object-cover"
              loading="lazy"
            />
            <div className="p-1 font-medium text-sm bg-gray-50 truncate">
              {category.name}
            </div>
          </div>
        ))}
      </div>
        </>
      )}
    </div>
  );
};

export default CategoryLinks;