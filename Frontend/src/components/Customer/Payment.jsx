import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaymentMethods from './PaymentMethods';
import OrderSummary from './OrderSummary';

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
        deliveryCharge: 0,
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
          deliveryCharge: 0 || 0,
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
        deliveryCharge: 0,
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
          <PaymentMethods 
            selectedPayment={selectedPayment}
            setSelectedPayment={setSelectedPayment}
          />
          
          <OrderSummary 
            address={address}
            cartItems={cartItems}
            cartTotals={cartTotals}
            selectedTip={selectedTip}
            donationSelected={donationSelected}
            selectedPayment={selectedPayment}
            navigate={navigate}
            handleTipChange={handleTipChange}
            clearTip={clearTip}
            handleDonationToggle={handleDonationToggle}
            handlePaymentSubmit={handlePaymentSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default Payment;