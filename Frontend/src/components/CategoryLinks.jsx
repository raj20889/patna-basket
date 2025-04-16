import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryLinks = () => {
  const navigate = useNavigate();

  const categories = [
    {
      name: 'Staples',
      imageUrl: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      path: '/staples'
    },
    {
      name: 'Paan Shop',
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      path: '/paan-shop'
    },
    {
      name: 'Snacks',
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      path: '/snacks'
    }
  ];

  return (
    <div className="text-center text-2xl font-bold my-5">
      <h1>Explore Our Categories</h1>   
      <div className="flex justify-evenly p-5">
        {categories.map((category, index) => (
          <div 
            key={index} 
            className="w-[25%] cursor-pointer transition-transform duration-300 hover:scale-105 text-center rounded-lg overflow-hidden shadow-md"
            onClick={() => navigate(category.path)}
          >
            <img 
              src={category.imageUrl} 
              alt={category.name} 
              className="w-full h-40 object-cover"
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