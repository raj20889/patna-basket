import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryLinks = () => {
  const navigate = useNavigate();
  
  // Get user role from localStorage
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
    if (isCustomer) {
      // For logged-in customers, navigate to the protected route
      navigate(`/c/${categoryPath}`);
    } else {
      // For non-logged-in users, navigate to the public route
      navigate(`/${categoryPath}`);
    }
  };

  return (
    <div className="text-center text-2xl font-bold my-5">
      <h1>Explore Our Categories</h1>   
      <div className="flex justify-evenly p-5">
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
    </div>
  );
};

export default CategoryLinks;