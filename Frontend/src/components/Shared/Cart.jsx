import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCart, removeFromCart, updateQuantity, clearCart } from '../../redux/cartSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import socket from "../../utils/socket"; // Import socket instance

const CartPage = () => {
  const [productLoadingStates, setProductLoadingStates] = useState({});
  const [proceedLoading, setProceedLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedTip, setSelectedTip] = useState(0); // Default tip set to 0
  const [donationSelected, setDonationSelected] = useState(true);
  const [stockError, setStockError] = useState({}); // State to track stock errors
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const dispatch = useDispatch();
  const cartState = useSelector((state) => {
    
    return state.cart;
  });
  const { items: cartItems = [], totalQuantity, totalPrice } = cartState;
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Hydrate Redux cart on page mount to avoid empty view until refresh
  useEffect(() => {
    const hydrate = async () => {
      try {
        if (token) {
          const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const items = (res.data?.products || []).map(p => ({
            productId: p.productId?._id || p.productId,
            name: p.productId?.name,
            price: p.productId?.price,
            image: p.productId?.image,
            quantity: p.quantity || 1,
            stock: p.productId?.stock || 0, // Include stock field
          }));
          dispatch(setCart({ cartItems: items }));
        } else {
          const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
          const updatedGuestCart = guestCart.map((item) => ({
            ...item,
            stock: item.stock || 1, // Add a default stock value if missing
          }));
          localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
          dispatch(setCart({ cartItems: updatedGuestCart }));
        }
      } catch (e) {
        console.error('Error hydrating cart on cart page:', e);
      }
    };

    hydrate();
    const onCartUpdated = () => hydrate();
    window.addEventListener('cartUpdated', onCartUpdated);
    return () => window.removeEventListener('cartUpdated', onCartUpdated);
  }, [token, dispatch]);

  useEffect(() => {
    console.log("Cart items:", cartItems); // Debug log to verify stock field
  }, [cartItems]);

  useEffect(() => {
    // Listen for real-time stock updates
    socket.on("stockUpdate", ({ productId, stock }) => {
      console.log('Stock update received:', { productId, stock });
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.productId === productId ? { ...item, stock } : item
        )
      );
    });

    return () => {
      socket.off("stockUpdate"); // Cleanup listener on unmount
    };
  }, [cartItems]); // Add cartItems as a dependency

  const updateCartCharges = useCallback(async (tip, donation) => {
    const newTip = tip ?? selectedTip;
    const newDonation = donation ?? donationSelected;
    const newDonationAmount = newDonation ? 1 : 0;
    
    try {
      if (token) {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/cart/update-charges`, {
          tipAmount: newTip,
          donationAmount: newDonationAmount,
          deliveryCharge: 0,
          handlingCharge: 2
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Calculate new totals
      const itemsTotal = token ? totalPrice : 
        cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      const newGrandTotal = itemsTotal + 2 + newTip + newDonationAmount;
      
      dispatch(setCart({
        cartItems: cartItems,
        itemsTotal,
        deliveryCharge: 0,
        handlingCharge: 2,
        tipAmount: newTip,
        donationAmount: newDonationAmount,
        grandTotal: newGrandTotal
      }));
      
      return newGrandTotal;
    } catch (error) {
      console.error('Error updating cart charges:', error);
      throw error;
    }
  }, [token, cartItems, selectedTip, donationSelected, totalPrice]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    // Find the product in the cart to check its stock
    const product = cartItems.find((item) => item.productId === productId);

    // Ensure stock is defined and enforce the stock limit
    if (product && typeof product.stock === 'number' && newQuantity > product.stock) {
      setStockError((prev) => ({ ...prev, [productId]: `Only these much items are available in stock.` }));

      // Automatically clear the error message after 2 seconds
      setTimeout(() => {
        setStockError((prev) => ({ ...prev, [productId]: null }));
      }, 1000);

      return;
    }

    // Clear stock error for the product if the update is valid
    setStockError((prev) => ({ ...prev, [productId]: null }));

    // If the new quantity would be zero or less, remove the item instead
    if (newQuantity <= 0) {
      await handleRemoveFromCart(productId);
      return;
    }

    setProductLoadingStates((prev) => ({ ...prev, [productId]: true }));
    try {
      if (!token) {
        dispatch(updateQuantity({ productId, quantity: newQuantity }));
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/cart/add`,
          { productId, quantity: newQuantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Update Redux so UI reflects change immediately
        dispatch(updateQuantity({ productId, quantity: newQuantity }));
        // Notify other parts of the app to re-fetch if needed
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (err) {
      console.error("Error updating cart:", err);
    } finally {
      setProductLoadingStates((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleTipChange = async (amount) => {
    setSelectedTip(amount);
    await updateCartCharges(amount, null);
  };

  const clearTip = async () => {
    await handleTipChange(0);
  };

  const handleDonationToggle = async () => {
    const newDonationSelected = !donationSelected;
    setDonationSelected(newDonationSelected);
    await updateCartCharges(null, newDonationSelected);
  };

  const handleProceedToCheckout = async () => {
    if (!token) {
      setShowLoginPrompt(true);
      return;
    }
    setProceedLoading(true);
    try {
      // Additional logic before navigating to checkout if needed
      navigate('/checkout');
    } catch (error) {
      console.error('Error during checkout process:', error);
    } finally {
      setProceedLoading(false);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    console.log(`handleRemoveFromCart called for productId: ${productId}`);
    setProductLoadingStates((prev) => ({ ...prev, [productId]: true }));
    try {
      if (!token) {
        console.log("handleRemoveFromCart: Guest user, dispatching removeFromCart action.");
        dispatch(removeFromCart({ productId }));
      } else {
        console.log("handleRemoveFromCart: Logged-in user, making API call to remove item.");
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/cart/remove/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Remove from Redux so UI updates immediately
        dispatch(removeFromCart({ productId }));
        console.log("handleRemoveFromCart: API call successful, removed from Redux and dispatching cartUpdated event.");
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (err) {
      console.error('Error removing item from cart:', err);
    } finally {
      setProductLoadingStates((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleClearCart = async () => {
    try {
      if (!token) {
        console.log("handleClearCart: Guest user, dispatching clearCart action.");
        dispatch(clearCart());
      } else {
        console.log("handleClearCart: Logged-in user, making API call to clear cart.");
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("handleClearCart: API call successful, dispatching cartUpdated event.");
        window.dispatchEvent(new Event('cartUpdated'));
      }
      // Reset local state for totals
      setSelectedTip(0);
      setDonationSelected(false);
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/orders`,
        {
          items: cartItems,
          addressId: selectedAddress,
          paymentMethod: selectedPaymentMethod,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Clear cart and show success message
      setCartItems([]);
      setSuccessMessage("Order placed successfully!");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Handle insufficient stock error
        const { message } = error.response.data;
        setErrorMessage(message);

        // Sync cart with updated stock values from the backend
        const updatedCart = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/cart`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCartItems(updatedCart.data);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl font-bold text-gray-800">My Cart</h1>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-4xl mb-4">🛒</div>
            <p className="text-lg text-gray-700 mb-6">Your cart is empty</p>
            <button 
              onClick={() => navigate(token ? '/customer/dashboard' : '/')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Delivery Info */}
            <div className="p-4 bg-blue-50 mx-4 rounded-lg my-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full">
                  <img 
                    src="https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=180/assets/eta-icons/15-mins-filled.png" 
                    alt="Delivery" 
                    className="w-10 h-10"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Free delivery in 8 minutes</p>
                  <p className="text-sm text-gray-600">
                    Shipment of {cartItems.reduce((total, item) => total + item.quantity, 0)} items
                  </p>
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-4 px-4">
              {cartItems.map(item => (
                <div key={item.productId} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <img 
                      src={item.image || 'https://via.placeholder.com/100'} 
                      alt={item.name}
                      className="w-16 h-16 object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{item.variant}</p>
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-800">₹{item.price}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRemoveFromCart(item.productId)}
                          className="text-sm text-red-600 hover:text-red-800 transition-colors"
                          disabled={productLoadingStates[item.productId]}
                        >
                          Remove
                        </button>
                        <div className="flex items-center bg-white rounded-lg overflow-hidden">
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                            disabled={productLoadingStates[item.productId]}
                          >
                            -
                          </button>
                          <span className="px-2 text-gray-700">
                            {productLoadingStates[item.productId] ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                            disabled={productLoadingStates[item.productId]}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Display stock error message with enhanced styling */}
                    {stockError[item.productId] && (
                      <div
                        className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded shadow-md transition-opacity duration-500"
                        style={{ animation: 'fadeOut 2s forwards' }}
                      >
                        <p className="text-sm font-semibold">{stockError[item.productId]}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Details */}
            <div className="p-4 mt-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Bill details</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📦</span>
                    <span>Items total</span>
                  </div>
                  <span className="font-medium">₹{cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">🚚</span>
                    <span>Delivery charge</span>
                    <span className="text-gray-400 text-xs">i</span>
                  </div>
                  <div>
                    <span className="text-gray-400 line-through mr-1">₹25</span>
                    <span className="text-blue-600">FREE</span>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">🛍️</span>
                    <span>Handling charge</span>
                    <span className="text-gray-400 text-xs">i</span>
                  </div>
                  <span className="font-medium">₹2.00</span>
                </div>
                
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">👤</span>
                    <span>Tip for delivery partner</span>
                  </div>
                  <span className="font-medium">₹{selectedTip.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <img 
                        src="https://cdn.grofers.com/assets/ui/icons/feeding_india_icon_v6.png" 
                        alt="Feeding India" 
                        className="w-8 h-8"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Feeding India</p>
                      <p className="text-xs text-gray-500">Donation</p>
                    </div>
                  </div>
                  <div 
                    className={`flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer ${donationSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                    onClick={handleDonationToggle}
                  >
                    <span>₹1</span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${donationSelected ? 'bg-blue-600 text-white' : 'border border-gray-300'}`}>
                      {donationSelected && '✓'}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between pt-3 mt-3 border-t border-gray-100">
                  <span className="font-bold text-gray-800">Grand total</span>
                  <span className="font-bold text-lg text-gray-800">₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Tip Selection */}
            <div className="p-4 mt-2">
              <div className="mb-4">
                <h3 className="font-bold text-gray-800 mb-1">Tip your delivery partner</h3>
                <p className="text-sm text-gray-500">
                  Your kindness means a lot! 100% of your tip will go directly to your delivery partner.
                </p>
              </div>
              
              {selectedTip > 0 && (
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">Selected tip: ₹{selectedTip}</span>
                  <button 
                    onClick={clearTip}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
              
              <div className="flex gap-3 overflow-x-auto pb-2">
                {[20, 30, 50, 'Custom'].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => typeof amount === 'number' && handleTipChange(amount)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg ${selectedTip === amount ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'} transition-colors`}
                  >
                    {typeof amount === 'number' ? (
                      <div className="flex items-center gap-2">
                        <img 
                          src={`https://b.zmtcdn.com/data/o2_assets/${
                            amount === 20 ? '2ef961c631b0b3ec214689aca4e95efd1633353812' : 
                            amount === 30 ? '047a7d05ee3bbad4db7e962c25d759cd1633508344' : 
                            '3eff26c9392c33254d314ce8758ffae51633353789'
                          }.png?output-format=webp`} 
                          alt={`₹${amount}`}
                          className="w-5 h-5"
                        />
                        <span>₹{amount}</span>
                      </div>
                    ) : (
                      <span>{amount}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="p-4 mt-2 bg-gray-50 mx-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-1">Cancellation Policy</h4>
              <p className="text-xs text-gray-500">
                Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.
              </p>
            </div>

            {/* Login Prompt */}
            {showLoginPrompt && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                  <h3 className="font-bold text-lg mb-2">Login Required</h3>
                  <p className="text-gray-600 mb-4">Please login to proceed to checkout</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/login')}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setShowLoginPrompt(false)}
                      className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Checkout Button */}
            <div className="sticky bottom-0 p-4 bg-white shadow-lg">
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex justify-between items-center px-6"
                disabled={proceedLoading}
              >
                <span className="text-left">
                  <span className="block text-sm">Total</span>
                  <span className="font-bold">₹{totalPrice.toFixed(2)}</span>
                </span>
                <span className="flex items-center">
                  {proceedLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                  ) : (
                    <>
                      Proceed <span className="ml-2 text-xl">→</span>
                    </>
                  )}
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;