


import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AddressForm = ({ 
  userId, 
  token, 
  onSuccess, 
  onCancel,
  initialData = {} 
}) => {
  const [formData, setFormData] = useState({
    addressType: initialData.addressType || 'Home',
    customName: initialData.customName || '',
    building: initialData.building || '',
    floor: initialData.floor || '',
    locality: initialData.locality || '',
    landmark: initialData.landmark || '',
    contactName: initialData.contactName || '',
    contactPhone: initialData.contactPhone || '',
    isDefault: initialData.isDefault || false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.building) newErrors.building = 'Building name is required';
    if (!formData.locality) newErrors.locality = 'Locality is required';
    if (!formData.contactName) newErrors.contactName = 'Contact name is required';
    if (formData.addressType === 'Other' && !formData.customName) {
      newErrors.customName = 'Custom name is required';
    }
    if (formData.contactPhone && !/^\d{10}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const url = initialData._id 
        ? `${API_BASE_URL}/addresses/${initialData._id}`
        : `${API_BASE_URL}/addresses`;
      
      const method = initialData._id ? 'put' : 'post';
      const data = { ...formData, userId };
      
      const response = await axios[method](url, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      onSuccess(response.data);
    } catch (err) {
      console.error('Error saving address:', err);
      setErrors({
        form: err.response?.data?.message || 'Failed to save address. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            {initialData._id ? 'Edit Address' : 'Add New Address'}
          </h2>
          
          {errors.form && (
            <div className="mb-4 p-2 text-red-600 bg-red-50 rounded">
              {errors.form}
            </div>
          )}

<form onSubmit={handleSubmit} className="space-y-4">
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Save address as:
  </label>
  <div className="flex flex-wrap gap-4">
    {['Home', 'Work', 'Hotel', 'Other'].map(type => (
      <label key={type} className="inline-flex items-center">
        <input
          type="radio"
          name="addressType"
          value={type}
          checked={formData.addressType === type}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
        />
        <span className="ml-2 text-gray-700">{type}</span>
      </label>
    ))}
  </div>
</div>

{formData.addressType === 'Other' && (
  <div className={`space-y-1 ${errors.customName ? 'text-red-600' : ''}`}>
    <label className="block text-sm font-medium text-gray-700">
      Custom Name *
    </label>
    <input
      type="text"
      name="customName"
      value={formData.customName}
      onChange={handleChange}
      placeholder="e.g. Grandma's House"
      className={`block w-full rounded-md border ${errors.customName ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
    />
    {errors.customName && (
      <span className="text-xs">{errors.customName}</span>
    )}
  </div>
)}

<div className={`space-y-1 ${errors.building ? 'text-red-600' : ''}`}>
  <label className="block text-sm font-medium text-gray-700">
    Flat / House no / Building name *
  </label>
  <input
    type="text"
    name="building"
    value={formData.building}
    onChange={handleChange}
    placeholder="e.g. 123 Main St, Sunshine Apartments"
    className={`block w-full rounded-md border ${errors.building ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
  />
  {errors.building && (
    <span className="text-xs">{errors.building}</span>
  )}
</div>

<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">
    Floor (optional)
  </label>
  <input
    type="text"
    name="floor"
    value={formData.floor}
    onChange={handleChange}
    placeholder="e.g. 3rd Floor, Wing B"
    className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
  />
</div>

<div className={`space-y-1 ${errors.locality ? 'text-red-600' : ''}`}>
  <label className="block text-sm font-medium text-gray-700">
    Area / Sector / Locality *
  </label>
  <input
    type="text"
    name="locality"
    value={formData.locality}
    onChange={handleChange}
    placeholder="e.g. Marathahalli, Whitefield"
    className={`block w-full rounded-md border ${errors.locality ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
  />
  {errors.locality && (
    <span className="text-xs">{errors.locality}</span>
  )}
</div>

<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">
    Nearby landmark (optional)
  </label>
  <input
    type="text"
    name="landmark"
    value={formData.landmark}
    onChange={handleChange}
    placeholder="e.g. Near City Mall, Opposite Metro Station"
    className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
  />
</div>

<div className={`space-y-1 ${errors.contactName ? 'text-red-600' : ''}`}>
  <label className="block text-sm font-medium text-gray-700">
    Your name *
  </label>
  <input
    type="text"
    name="contactName"
    value={formData.contactName}
    onChange={handleChange}
    placeholder="Name for delivery"
    className={`block w-full rounded-md border ${errors.contactName ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
  />
  {errors.contactName && (
    <span className="text-xs">{errors.contactName}</span>
  )}
</div>

<div className={`space-y-1 ${errors.contactPhone ? 'text-red-600' : ''}`}>
  <label className="block text-sm font-medium text-gray-700">
    Your phone number (optional)
  </label>
  <input
    type="text"
    name="contactPhone"
    value={formData.contactPhone}
    onChange={handleChange}
    placeholder="10-digit mobile number"
    className={`block w-full rounded-md border ${errors.contactPhone ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2`}
  />
  {errors.contactPhone && (
    <span className="text-xs">{errors.contactPhone}</span>
  )}
</div>

<div className="flex items-center">
  <input
    type="checkbox"
    name="isDefault"
    checked={formData.isDefault}
    onChange={handleChange}
    className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
  />
  <label className="ml-2 block text-sm text-gray-700">
    Set as default address
  </label>
</div>


            <div className="flex justify-end space-x-3 pt-4">
              <button 
                type="button" 
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;