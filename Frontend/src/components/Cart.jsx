import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedTip, setSelectedTip] = useState(0); // Default tip set to 0
  const [donationSelected, setDonationSelected] = useState(true);
  const [cartTotals, setCartTotals] = useState({
    itemsTotal: 0,
    deliveryCharge: 0,
    handlingCharge: 2,
    tipAmount: 0,
    donationAmount: 1,
    grandTotal: 0
  });
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchCart = useCallback(async () => {
    try {
      if (!token) {
        const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
        setCartItems(guestCart);
        
        // Calculate guest totals
        const itemsTotal = guestCart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const grandTotal = itemsTotal + 2 + selectedTip + (donationSelected ? 1 : 0);
        
        setCartTotals({
          itemsTotal,
          deliveryCharge: 0,
          handlingCharge: 2,
          tipAmount: selectedTip,
          donationAmount: donationSelected ? 1 : 0,
          grandTotal
        });
      } else {
        const res = await axios.get('http://localhost:5000/api/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data) {
          setCartItems(res.data.products?.map(item => ({
            productId: item.productId._id,
            name: item.productId.name,
            price: item.productId.price,
            quantity: item.quantity,
            image: item.productId.image,
            variant: item.productId.variant || '1 unit'
          })) || []);

          // Use server-side calculated totals
          setCartTotals({
            itemsTotal: res.data.itemsTotal || 0,
            deliveryCharge: res.data.deliveryCharge || 0,
            handlingCharge: res.data.handlingCharge || 2,
            tipAmount: res.data.tipAmount || 0,
            donationAmount: res.data.donationAmount || 0,
            grandTotal: res.data.grandTotal || 0
          });

          // Sync local state
          setSelectedTip(res.data.tipAmount || 0);
          setDonationSelected(res.data.donationAmount ? true : false);
        }
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, [token, selectedTip, donationSelected]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateCartCharges = useCallback(async (tip, donation) => {
    const newTip = tip ?? selectedTip;
    const newDonation = donation ?? donationSelected;
    const newDonationAmount = newDonation ? 1 : 0;
    
    try {
      if (token) {
        await axios.post('http://localhost:5000/api/cart/update-charges', {
          tipAmount: newTip,
          donationAmount: newDonationAmount,
          deliveryCharge: 0,
          handlingCharge: 2
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Calculate new totals
      const itemsTotal = token ? cartTotals.itemsTotal : 
        cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      const newGrandTotal = itemsTotal + 2 + newTip + newDonationAmount;
      
      setCartTotals({
        itemsTotal,
        deliveryCharge: 0,
        handlingCharge: 2,
        tipAmount: newTip,
        donationAmount: newDonationAmount,
        grandTotal: newGrandTotal
      });
      
      return newGrandTotal;
    } catch (error) {
      console.error('Error updating cart charges:', error);
      throw error;
    }
  }, [token, cartItems, selectedTip, donationSelected, cartTotals.itemsTotal]);

  const updateQuantity = async (productId, newQuantity) => {
    try {
      if (!token) {
        const updatedCart = cartItems.map(item => 
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        ).filter(item => item.quantity > 0);
        
        localStorage.setItem('guestCart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        
        // Update local totals
        const itemsTotal = updatedCart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const newGrandTotal = itemsTotal + 2 + selectedTip + (donationSelected ? 1 : 0);
        
        setCartTotals(prev => ({
          ...prev,
          itemsTotal,
          grandTotal: newGrandTotal
        }));
      } else {
        await axios.post('http://localhost:5000/api/cart/add', 
          { productId, quantity: newQuantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Refetch cart to get updated totals
        await fetchCart();
      }
    } catch (err) {
      console.error('Error updating cart:', err);
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
    } else {
      await updateCartCharges(selectedTip, donationSelected);
      navigate('/checkout');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl font-bold text-gray-800">My Cart</h1>
          <div className="text-gray-500"></div>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-4xl mb-4">🛒</div>
            <p className="text-lg text-gray-700 mb-6">Your cart is empty</p>
            <button 
              onClick={() => navigate('/')}
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
                      <div className="flex items-center bg-white rounded-lg overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-2 text-gray-700">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
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
                  <span className="font-medium">₹{cartTotals.itemsTotal.toFixed(2)}</span>
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
                  <span className="font-medium">₹{cartTotals.tipAmount.toFixed(2)}</span>
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
                  <span className="font-bold text-lg text-gray-800">₹{cartTotals.grandTotal.toFixed(2)}</span>
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
              >
                <span className="text-left">
                  <span className="block text-sm">Total</span>
                  <span className="font-bold">₹{cartTotals.grandTotal.toFixed(2)}</span>
                </span>
                <span className="flex items-center">
                  Proceed <span className="ml-2 text-xl">→</span>
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