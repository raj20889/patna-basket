import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart } from '../redux/cartSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const cartItems = useSelector((state) => state.cart.items);
  const [loadingStates, setLoadingStates] = useState({});

  const handleRemove = async (productId) => {
    setLoadingStates((prev) => ({ ...prev, [productId]: true }));
    try {
      if (token) {
        // Remove from server for logged-in user
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/cart/remove/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      // Remove from Redux (guest and logged-in)
      dispatch(removeFromCart({ productId }));
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Failed to remove item');
    } finally {
      setLoadingStates((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      // If quantity would go below 1, remove the product instead
      handleRemove(productId);
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [productId]: true }));
    try {
      if (token) {
        // Update on server for logged-in user
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/cart/add`, 
          { productId, quantity: newQuantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      // Update Redux
      dispatch(updateQuantity({ productId, quantity: newQuantity }));
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Failed to update quantity');
    } finally {
      setLoadingStates((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    navigate(token ? '/checkout' : '/login?redirect=/checkout');
  };

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow divide-y">
                {cartItems.map((item) => (
                  <div key={item.productId} className="p-4 flex gap-4">
                    <div className="flex-shrink-0 w-20 h-20">
                      <img
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-gray-600 mt-1">₹{item.price.toFixed(2)}</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center border rounded">
                        <button
                          onClick={() => {
                            if (item.quantity === 1) {
                              handleRemove(item.productId);
                            } else {
                              handleQuantityChange(item.productId, item.quantity - 1);
                            }
                          }}
                          disabled={loadingStates[item.productId]}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 border-l border-r font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          disabled={loadingStates[item.productId]}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item.productId)}
                        disabled={loadingStates[item.productId]}
                        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                      >
                        {loadingStates[item.productId] ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleClearCart}
                className="mt-4 text-red-600 hover:text-red-800 font-medium"
              >
                Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charge</span>
                    <span>₹{totalPrice > 0 ? '0' : '0'}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Handling Fee</span>
                    <span>₹{totalPrice > 0 ? '2' : '0'}</span>
                  </div>
                </div>

                <div className="flex justify-between text-xl font-bold mb-6">
                  <span>Total</span>
                  <span>₹{(totalPrice + (totalPrice > 0 ? 2 : 0)).toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="w-full mt-3 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
