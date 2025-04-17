import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddressList from './AddressList';
import AddressForm from './AddressForm';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Checkout = () => {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      fetchAddresses(storedToken);
    } else {
      navigate('/login');
    }
    setLoading(false);
  }, [navigate]);

  const fetchAddresses = async (authToken) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/addresses`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setAddresses(res.data);
    } catch (err) {
      showNotification('Failed to load addresses', 'error');
      console.error('Address fetch error:', err);
    }
  };

  const showNotification = (message, type = 'success') => {
    toast[type](message);
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address._id);
    showNotification('Address selected successfully');
  };

  const handleAddressAdded = (newAddress) => {
    setAddresses([...addresses, newAddress]);
    setShowAddressForm(false);
    showNotification('Address added successfully');
  };

  const handleAddressUpdated = (updatedAddress) => {
    setAddresses(addresses.map(addr => 
      addr._id === updatedAddress._id ? updatedAddress : addr
    ));
    showNotification('Address updated successfully');
    
    // If the updated address was the selected one, update the selection
    if (selectedAddress === updatedAddress._id) {
      setSelectedAddress(updatedAddress._id);
    }
  };

  const handleAddressDeleted = (addressId) => {
    setAddresses(addresses.filter(addr => addr._id !== addressId));
    if (selectedAddress === addressId) {
      setSelectedAddress(null);
    }
    showNotification('Address deleted successfully');
  };
  const proceedToPayment = async () => {
    if (!selectedAddress) {
      showNotification('Please select an address', 'error');
      return;
    }
  
    try {
      // Get the selected address from local state first
      let address = addresses.find(addr => addr._id === selectedAddress);
      
      // If not found locally, fetch from API
      if (!address) {
        const addressResponse = await axios.get(`${API_BASE_URL}/addresses/${selectedAddress}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        address = addressResponse.data;
      }
  
      // Fetch cart with populated product details
      const cartResponse = await axios.get(`${API_BASE_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      // Prepare cart items in the format Payment component expects
      const cartItems = cartResponse.data.products.map(item => ({
        productId: item.productId._id,
        name: item.productId.name,
        image: item.productId.image,
        unit: item.productId.unit || '1 item', // Default unit if not specified
        price: item.productId.price,
        quantity: item.quantity
      }));
  
      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const deliveryFee = 40; // Or fetch from API if dynamic
      const total = subtotal + deliveryFee;
  
      navigate('/payment', { 
        state: { 
          address, // Full address object
          addressId: selectedAddress, // Address ID
          cartItems, // Array of cart items with product details
          subtotal,
          deliveryFee,
          total
        } 
      });
    } catch (error) {
      console.error('Payment preparation error:', error);
      showNotification('Failed to prepare payment details', 'error');
      
      // Fallback: Try to proceed with minimum required data
      const localAddress = addresses.find(addr => addr._id === selectedAddress);
      if (localAddress) {
        navigate('/payment', { 
          state: { 
            address: localAddress,
            addressId: selectedAddress,
            cartItems: [], // Empty array as fallback
            subtotal: 0,
            deliveryFee: 40,
            total: 40
          } 
        });
      }
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (!user || !token) return null;

  return (
    <div className="checkout-container max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Select Delivery Address</h2>
      
      <AddressList 
        addresses={addresses}
        selectedAddress={selectedAddress}
        onSelect={handleAddressSelect}
        onDelete={handleAddressDeleted}
        onEdit={(address) => {
          setEditingAddress(address);
          setShowAddressForm(true);
        }}
      />
      
      <button 
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        onClick={() => {
          setEditingAddress(null);
          setShowAddressForm(true);
        }}
      >
        Add New Address
      </button>
      
      {showAddressForm && (
        <AddressForm 
          userId={user._id}
          token={token}
          addressToEdit={editingAddress}
          onSuccess={(address) => {
            if (editingAddress) {
              handleAddressUpdated(address);
            } else {
              handleAddressAdded(address);
            }
            setShowAddressForm(false);
            setEditingAddress(null);
          }}
          onCancel={() => {
            setShowAddressForm(false);
            setEditingAddress(null);
          }}
        />
      )}
      
      {selectedAddress && (
        <button 
          className="mt-6 w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 text-lg font-medium transition-colors"
          onClick={proceedToPayment}
        >
          Proceed to Payment
        </button>
      )}
    </div>
  );
};

export default Checkout;