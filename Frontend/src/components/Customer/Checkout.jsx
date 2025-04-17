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
      toast.error('Failed to load addresses');
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
      const response = await axios.get(`${API_BASE_URL}/addresses/${selectedAddress}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      navigate('/payment', { 
        state: { 
          address: response.data,
          addressId: selectedAddress 
        } 
      });
    } catch (error) {
      showNotification('Failed to verify address', 'error');
      console.error('Address verification error:', error);
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
        onEdit={(addressId) => {
          // You can implement edit functionality here
          console.log('Edit address', addressId);
        }}
      />
      
      <button 
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        onClick={() => setShowAddressForm(true)}
      >
        Add New Address
      </button>
      
      {showAddressForm && (
        <AddressForm 
          userId={user._id}
          token={token}
          onSuccess={handleAddressAdded}
          onCancel={() => setShowAddressForm(false)}
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