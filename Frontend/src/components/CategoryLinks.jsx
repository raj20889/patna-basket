import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryLinks = () => {
  const navigate = useNavigate();
  
  const role = localStorage.getItem('role');
  const isCustomer = role === 'customer';

  const categories = [
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
      path: 'Milk'
    }
  ];

  const handleCategoryClick = (categoryPath) => {
    navigate(isCustomer ? `/c/${categoryPath}` : `/${categoryPath}`);
  };

  return (
    <div className="text-center my-5 px-4">
      <h1 className="text-xl md:text-2xl font-bold mb-4">Explore Our Categories</h1>   
      
      {/* Desktop View (unchanged) */}
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
    </div>
  );
};

export default CategoryLinks;