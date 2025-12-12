import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../../redux/cartSlice';

const StoreProductCard = ({ product, storeId }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = React.useState(false);

  const cartItem = useSelector((state) =>
    state.cart.items.find((item) => item.productId === product._id)
  );
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = async () => {
    setIsLoading(true);
    dispatch(addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      storeId: storeId
    }));
    setTimeout(() => setIsLoading(false), 100);
  };

  const handleIncrease = () => {
    setIsLoading(true);
    dispatch(addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity + 1,
      storeId: storeId
    }));
    setTimeout(() => setIsLoading(false), 100);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setIsLoading(true);
      dispatch(addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity - 1,
        storeId: storeId
      }));
      setTimeout(() => setIsLoading(false), 100);
    } else {
      dispatch(removeFromCart({ productId: product._id }));
    }
  };

  return (
    <div className="flex-shrink-0 w-32 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Product Image */}
      <div className="relative h-28 bg-gray-100 overflow-hidden">
        <img
          src={product.image || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = '/placeholder-product.jpg';
          }}
        />
        {product.discount?.isActive && (
          <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            {product.discount.type === 'percentage' ? `${product.discount.value}%` : `₹${product.discount.value}`} OFF
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-2">
        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1">
          {product.name}
        </h3>
        <p className="text-[10px] text-gray-500 mb-2">{product.weight || '1 pc'}</p>

        {/* Price */}
        <div className="mb-2">
          <div className="text-xs font-bold text-gray-900">
            ₹{product.discount?.isActive
              ? (product.price * (1 - (product.discount.type === 'percentage' ? product.discount.value / 100 : 0))).toFixed(2)
              : product.price.toFixed(2)}
          </div>
          {product.discount?.isActive && product.discount.type === 'percentage' && (
            <div className="text-[10px] text-gray-400 line-through">
              ₹{product.price.toFixed(2)}
            </div>
          )}
        </div>

        {/* Cart Button */}
        {quantity === 0 ? (
          <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className="w-full py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[10px] font-bold rounded-md hover:brightness-110 transition-all active:scale-95"
          >
            {isLoading ? '...' : 'Add'}
          </button>
        ) : (
          <div className="flex items-center justify-between gap-1 bg-green-600 rounded-md px-1.5 py-1">
            <button
              onClick={handleDecrease}
              disabled={isLoading}
              className="text-white font-bold text-[10px]"
            >
              −
            </button>
            <span className="text-[10px] text-white font-medium w-3 text-center">{quantity}</span>
            <button
              onClick={handleIncrease}
              disabled={isLoading}
              className="text-white font-bold text-[10px]"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreProductCard;
