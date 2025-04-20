import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [selectedTip, setSelectedTip] = useState(0);
  const [donationSelected, setDonationSelected] = useState(true);
  const [cartTotals, setCartTotals] = useState({
    itemsTotal: 0,
    deliveryCharge: 0,
    handlingCharge: 2,
    tipAmount: 0,
    donationAmount: 1,
    grandTotal: 0
  });

  // Initialize with default values from location state or empty values
  const { state = {} } = location;
  const {
    address: initialAddress = null,
    addressId = null,
    cartItems: initialCartItems = [],
    subtotal = 0,
    deliveryFee = 0,
    handlingCharge = 2,
    tipAmount = 0,
    donationAmount = 1,
    total = 0
  } = state;

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      
      // Set initial values from location state
      setAddress(initialAddress);
      setCartItems(initialCartItems);
      setSelectedTip(tipAmount);
      setDonationSelected(donationAmount > 0);

      // If address wasn't passed, fetch it
      if (!initialAddress && addressId) {
        fetchAddress(addressId, storedToken);
      }

      // If cart items weren't passed, fetch them
      if (initialCartItems.length === 0) {
        fetchCartItems(storedToken);
      }

      // Calculate totals
      const itemsTotal = initialCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const grandTotal = itemsTotal + handlingCharge + tipAmount + (donationSelected ? donationAmount : 0);
      
      setCartTotals({
        itemsTotal,
        deliveryCharge: deliveryFee,
        handlingCharge,
        tipAmount,
        donationAmount: donationSelected ? donationAmount : 0,
        grandTotal
      });

      setLoading(false);
    } else {
      navigate('/login');
    }
  }, [location, navigate]);

  const fetchAddress = async (addressId, authToken) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/addresses/${addressId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setAddress(res.data);
    } catch (err) {
      toast.error('Failed to load address');
      console.error('Address fetch error:', err);
    }
  };

  const fetchCartItems = async (authToken) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      // Transform the response to match expected format
      const items = res.data.products?.map(item => ({
        productId: item.productId?._id,
        name: item.productId?.name,
        image: item.productId?.image,
        variant: item.productId?.variant || '1 unit',
        price: item.productId?.price || 0,
        quantity: item.quantity || 1
      })) || [];
      
      setCartItems(items);

      // Update totals from server if available
      if (res.data) {
        setCartTotals({
          itemsTotal: res.data.itemsTotal || 0,
          deliveryCharge: res.data.deliveryCharge || 0,
          handlingCharge: res.data.handlingCharge || 2,
          tipAmount: res.data.tipAmount || 0,
          donationAmount: res.data.donationAmount || 0,
          grandTotal: res.data.grandTotal || 0
        });
        setSelectedTip(res.data.tipAmount || 0);
        setDonationSelected(res.data.donationAmount ? true : false);
      }
    } catch (err) {
      toast.error('Failed to load cart items');
      console.error('Cart fetch error:', err);
    }
  };

  const updateCartCharges = async (tip, donation) => {
    const newTip = tip ?? selectedTip;
    const newDonation = donation ?? donationSelected;
    const newDonationAmount = newDonation ? 1 : 0;
    
    try {
      if (token) {
        await axios.post(`${API_BASE_URL}/cart/update-charges`, {
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

  const handlePaymentSubmit = async () => {
    if (!selectedPayment) {
      toast.error('Please select a payment method');
      return;
    }
  
    try {
      // First create the order
      const orderData = {
        addressId: address?._id,
        paymentMethod: selectedPayment,
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          variant: item.variant,
          price: item.price,
          quantity: item.quantity
        })),
        itemsTotal: cartTotals.itemsTotal,
        deliveryCharge: cartTotals.deliveryCharge,
        handlingCharge: cartTotals.handlingCharge,
        tipAmount: cartTotals.tipAmount,
        donationAmount: cartTotals.donationAmount,
        grandTotal: cartTotals.grandTotal,
        paymentStatus: 'pending'
      };
  
      const response = await axios.post(`${API_BASE_URL}/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      // Then clear the cart
      try {
        await axios.delete(`${API_BASE_URL}/cart`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setCartItems([]);
      } catch (clearCartError) {
        console.warn('Cart clearing failed:', clearCartError);
      }
  
      // Redirect user
      if (selectedPayment === 'COD') {
        toast.success('Order placed successfully! Pay when your order arrives');
        navigate('/order-confirmation', { 
          state: { 
            orderId: response.data.orderId,
            paymentStatus: 'pending'
          } 
        });
      } else {
        window.location.href = response.data.paymentUrl;
      }
  
    } catch (err) {
      console.error('Order submission failed:', err);
      const errorMessage = err.response?.data?.message || 
                          'Error placing order. Please try again.';
      toast.error(errorMessage);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (!user || !token) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Purchase</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Payment Methods Section */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Payment Method</h2>
              
              <div className="space-y-4">
                {/* Cash on Delivery Option */}
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedPayment === 'COD' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  onClick={() => setSelectedPayment('COD')}
                >
                  <div className="flex items-start">
                    <div className="flex items-center h-5 mt-1">
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPayment === 'COD'}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-700">Cash on Delivery (COD)</h3>
                      <p className="text-sm text-gray-500 mt-1">Pay with cash when your order is delivered</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        No additional fees
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credit/Debit Card Option */}
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedPayment === 'CARD' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  onClick={() => setSelectedPayment('CARD')}
                >
                  <div className="flex items-start">
                    <div className="flex items-center h-5 mt-1">
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPayment === 'CARD'}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-700">Credit/Debit Card</h3>
                      <p className="text-sm text-gray-500 mt-1">Pay using your credit or debit card</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visa/visa-original.svg" className="h-6" alt="Visa" />
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mastercard/mastercard-original.svg" className="h-6" alt="Mastercard" />
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg" className="h-6" alt="Apple Pay" />
                      </div>
                    </div>
                  </div>
                  
                  {selectedPayment === 'CARD' && (
                    <div className="mt-4">
                      <div className="border rounded p-4 bg-gray-50">
                        <iframe 
                          width="100%" 
                          height="300px" 
                          title="Payments" 
                          src="https://www.zomato.com/zpaykit/init" 
                          id="payment_widget" 
                          style={{ border: 'none' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* UPI Payment Option */}
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedPayment === 'UPI' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  onClick={() => setSelectedPayment('UPI')}
                >
                  <div className="flex items-start">
                    <div className="flex items-center h-5 mt-1">
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPayment === 'UPI'}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-700">UPI Payment</h3>
                      <p className="text-sm text-gray-500 mt-1">Pay using any UPI app</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/eb/Paytm_Logo.png" className="h-6" alt="Paytm" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/f/f6/PhonePe_Logo.svg" className="h-6" alt="PhonePe" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Google_Pay_%28GPay%29_Logo.svg" className="h-6" alt="Google Pay" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Notes Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Notes</h2>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Any special instructions for your order?"
              ></textarea>
            </div>
          </div>

          {/* Order Summary Section - Styled like Cart */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Order Summary</h2>
              
              {/* Delivery Address */}
              {address && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="font-medium text-gray-700 mb-3">Delivery Address</h3>
                  <div className="text-gray-600 space-y-1">
                    <p className="font-semibold">
                      {address.addressType === 'Other' ? address.customName : address.addressType}: 
                    </p>
                    <p>{address.building}, {address.locality}</p>
                    {address.floor && <p>Floor: {address.floor}</p>}
                    {address.landmark && <p>Landmark: {address.landmark}</p>}
                    <p className="mt-2">
                      <span className="font-medium">Contact:</span> {address.contactName} ({address.contactPhone})
                    </p>
                  </div>
                  <button 
                    className="mt-3 text-blue-600 text-sm font-medium hover:text-blue-800"
                    onClick={() => navigate('/checkout')}
                  >
                    Change Address
                  </button>
                </div>
              )}

              {/* Cart Items */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-700">My Cart</h3>
                  <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded text-sm">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                  {cartItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Your cart is empty</p>
                  ) : (
                    cartItems.map((item, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.variant}</p>
                          <p className="font-semibold text-gray-900">₹{item.price.toFixed(2)}</p>
                        </div>
                        <div className="text-gray-700 font-medium">
                          ×{item.quantity}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bill Details - Styled like Cart */}
              <div className="mt-6">
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
                    <span className="font-medium">₹{cartTotals.handlingCharge.toFixed(2)}</span>
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

              {/* Tip Selection - Same as Cart */}
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

              {/* Pay Now Button */}
              <button
                onClick={handlePaymentSubmit}
                disabled={!selectedPayment}
                className={`w-full mt-6 py-3 rounded-lg font-medium text-white transition-colors ${
                  !selectedPayment 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : selectedPayment === 'COD' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {selectedPayment === 'COD' ? 'Place Order (COD)' : 'Pay Now'}
              </button>

              {/* Security Assurance */}
              <div className="mt-4 flex items-center text-xs text-gray-500">
                <svg className="h-4 w-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                </svg>
                Secure payment processed with 256-bit encryption
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;