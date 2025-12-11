import React from 'react';
import ProductCard from './ProductCard';

const ProductComponent = ({
  products,
  onCartUpdate,
  onCartChange,
  isAuthenticated,
}) => {
  const userIsLoggedIn = !!localStorage.getItem("token");

  const handleAddToCart = (productId) => {
    if (typeof onCartUpdate === 'function') {
      onCartUpdate(productId, 1);
    }
    if (!userIsLoggedIn && typeof onCartChange === 'function') {
      const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
      const count = guestCart.reduce((s, it) => s + it.quantity, 0);
      const total = guestCart.reduce((s, it) => s + it.quantity * it.price, 0);
      onCartChange(count, total);
    }
  };

  const handleChange = (productId, change) => {
    if (typeof onCartUpdate === 'function') {
      onCartUpdate(productId, change);
    }
    if (!userIsLoggedIn && typeof onCartChange === 'function') {
      const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
      const count = guestCart.reduce((s, it) => s + it.quantity, 0);
      const total = guestCart.reduce((s, it) => s + it.quantity * it.price, 0);
      onCartChange(count, total);
    }
  };


  return (
    <div className="px-4 py-4 bg-white">
      {/* Responsive grid like Blinkit/Zepto */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {Array.isArray(products) && products.map(product => (
          <ProductCard
            key={product._id}
            product={product}
            handleAddToCart={handleAddToCart}
            handleChange={handleChange}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductComponent;