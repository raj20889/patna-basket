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
    <div className="px-4 py-6 bg-white">
      <div className="relative">
        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide space-x-4">
          {Array.isArray(products) && products.map(product => (
            <div key={product._id} className="flex-shrink-0">
              <ProductCard
                product={product}
                handleAddToCart={handleAddToCart}
                handleChange={handleChange}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductComponent;