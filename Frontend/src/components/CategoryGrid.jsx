import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryGrid = () => {
  const navigate = useNavigate();
  
  // Get user role from localStorage
  const role = localStorage.getItem('role');
  const isCustomer = role === 'customer';

  const categories = [
    { name: 'Fruits', imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'fruits' },
    { name: 'Vegetables', imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'vegetables' },
    { name: 'Dairy', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'dairy' },
    { name: 'Bakery', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'bakery' },
    { name: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1551029506-0807df4e2031?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'beverages' },
    { name: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1582415458708-42c7ba2ba40a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'snacks' },
    { name: 'Meat', imageUrl: 'https://images.unsplash.com/photo-1602476521643-20a927a7aa4c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'meat' },
    { name: 'Seafood', imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'seafood' },
    { name: 'Frozen', imageUrl: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'frozen' },
    { name: 'Canned', imageUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'canned' },
    { name: 'Spices', imageUrl: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'spices' },
    { name: 'Condiments', imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'condiments' },
    { name: 'Grains', imageUrl: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'grains' },
    { name: 'Pasta', imageUrl: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'pasta' },
    { name: 'Oils', imageUrl: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'oils' },
    { name: 'Cereals', imageUrl: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'cereals' },
    { name: 'Tea', imageUrl: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'tea' },
    { name: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1415604934674-561df9abf539?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'coffee' },
    { name: 'Sweets', imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'sweets' },
    { name: 'Nuts', imageUrl: 'https://images.unsplash.com/photo-1616634375264-2d2e17736a36?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', path: 'nuts' }
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
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-4">
        {categories.map((category, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
            onClick={() => handleCategoryClick(category.path)}
          >
            <div className="w-20 h-20 md:w-25 md:h-30 rounded-2xl overflow-hidden border-2 border-gray-200">
              <img 
                src={category.imageUrl} 
                alt={category.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <span className="mt-2 text-xs md:text-sm text-center font-medium">{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;