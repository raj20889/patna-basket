import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddressList from './AddressList';
import AddressForm from './AddressForm';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AddressManager = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      fetchAddresses(storedToken);
    }
    setLoading(false);
  }, []);

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
    toast[type](message, {
      position: "bottom-center",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
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
    setShowAddressForm(false);
    showNotification('Address updated successfully');
  };

  const handleAddressDeleted = (addressId) => {
    setAddresses(addresses.filter(addr => addr._id !== addressId));
    showNotification('Address deleted successfully');
  };

  const handleSetDefault = async (addressId) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/addresses/${addressId}/set-default`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update local state to reflect the new default
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr._id === addressId
      })));
      
      showNotification('Default address updated successfully');
    } catch (err) {
      showNotification('Failed to set default address', 'error');
      console.error('Set default error:', err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Addresses</h2>
        
        {addresses.length === 0 && !showAddressForm && (
          <div className="bg-white rounded-lg p-6 text-center mb-6 shadow-sm">
            <p className="text-gray-600 mb-4">You haven't added any addresses yet</p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setShowAddressForm(true)}
            >
              Add Your First Address
            </button>
          </div>
        )}
        
        <div className="space-y-4 mb-6">
          <AddressList 
            addresses={addresses}
            onDelete={handleAddressDeleted}
            onEdit={(address) => {
              setEditingAddress(address);
              setShowAddressForm(true);
            }}
            onSetDefault={handleSetDefault}
          />
        </div>
        
        <button 
          className="w-full bg-white border-2 border-blue-500 text-blue-600 px-4 py-3 rounded-lg hover:bg-blue-50 font-medium transition-colors mb-6"
          onClick={() => {
            setEditingAddress(null);
            setShowAddressForm(true);
          }}
        >
          + Add New Address
        </button>
        
        {showAddressForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressManager;