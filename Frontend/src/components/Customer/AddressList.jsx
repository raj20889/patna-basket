import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AddressList = ({ 
  addresses, 
  selectedAddress, 
  onSelect, 
  onDelete, 
  onEdit 
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/addresses/${addressId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      onDelete(addressId);
    } catch (err) {
      console.error('Failed to delete address:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {addresses.length === 0 ? (
        <p className="text-gray-500 text-center py-4">You haven't saved any addresses yet.</p>
      ) : (
        addresses.map(address => (
          <div 
            key={address._id} 
            className={`border p-4 rounded-lg shadow-sm cursor-pointer transition-colors ${
              selectedAddress === address._id 
                ? 'border-blue-500 bg-blue-50' 
                : 'hover:border-blue-300 hover:bg-blue-50'
            }`}
            onClick={() => onSelect(address)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">
                  {address.addressType === 'Other' 
                    ? address.customName 
                    : address.addressType} Address
                  {address.isDefault && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </h3>
                <p>{address.building}, {address.locality}</p>
                <p>{address.landmark && `Near ${address.landmark}`}</p>
                <p>Contact: {address.contactName} ({address.contactPhone})</p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(address._id);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1"
                  disabled={loading}
                >
                  Edit
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(address._id);
                  }}
                  className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AddressList;