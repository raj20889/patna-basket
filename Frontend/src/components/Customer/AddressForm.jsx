import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AddressForm = ({ userId, token, onSuccess, onCancel, addressToEdit }) => {
  const isEditMode = !!addressToEdit;
  
  const [formData, setFormData] = useState({
    addressType: isEditMode ? addressToEdit.addressType : 'Home',
    customName: isEditMode ? addressToEdit.customName || '' : '',
    building: isEditMode ? addressToEdit.building : '',
    floor: isEditMode ? addressToEdit.floor || '' : '',
    locality: isEditMode ? addressToEdit.locality : '',
    landmark: isEditMode ? addressToEdit.landmark || '' : '',
    contactName: isEditMode ? addressToEdit.contactName : '',
    contactPhone: isEditMode ? addressToEdit.contactPhone || '' : '',
    isDefault: isEditMode ? addressToEdit.isDefault : false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.addressType || !formData.building || !formData.locality || !formData.contactName) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.addressType === 'Other' && !formData.customName) {
      toast.error('Please provide a custom name for "Other" address type');
      return;
    }

    try {
      let response;
      if (isEditMode) {
        response = await axios.put(
          `${API_BASE_URL}/addresses/${addressToEdit._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/addresses`,
          { ...formData, userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      onSuccess(response.data);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error saving address');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">
          {isEditMode ? 'Edit Address' : 'Add New Address'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Type *
              </label>
              <select
                name="addressType"
                value={formData.addressType}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {formData.addressType === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Name *
                </label>
                <input
                  type="text"
                  name="customName"
                  value={formData.customName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Building/Street *
              </label>
              <input
                type="text"
                name="building"
                value={formData.building}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor/Apartment
              </label>
              <input
                type="text"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Locality *
              </label>
              <input
                type="text"
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Landmark
              </label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name *
              </label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                Set as default address
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              {isEditMode ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;