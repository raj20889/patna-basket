import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShoppingCart } from 'lucide-react';

const FloatingCartBar = () => {
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items || []);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    const count = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const total = cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
    setCartCount(count);
    setCartTotal(total);
  }, [cartItems]);

  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-2xl z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Cart Items Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-green-600" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500">Cart Total</p>
            <p className="text-xl font-bold text-gray-900">₹{cartTotal.toFixed(2)}</p>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={() => navigate('/checkout')}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:brightness-110 transition-all active:scale-95 shadow-lg"
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default FloatingCartBar;
