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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddressTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      addressType: type
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Enhanced validation
    if (!formData.building || !formData.locality || !formData.contactName) {
      toast.error('Please fill all required fields', { position: "bottom-center" });
      setIsSubmitting(false);
      return;
    }

    if (formData.addressType === 'Other' && !formData.customName) {
      toast.error('Please provide a custom name for "Other" address type', { position: "bottom-center" });
      setIsSubmitting(false);
      return;
    }

    if (formData.contactPhone && !/^[0-9]{10}$/.test(formData.contactPhone)) {
      toast.error('Please enter a valid 10-digit phone number', { position: "bottom-center" });
      setIsSubmitting(false);
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
        toast.success('Address updated successfully', { position: "bottom-center" });
      } else {
        response = await axios.post(
          `${API_BASE_URL}/addresses`,
          { ...formData, userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Address added successfully', { position: "bottom-center" });
      }
      onSuccess(response.data);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Error saving address', { position: "bottom-center" });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addressTypeOptions = [
    { value: 'Home', label: 'Home', icon: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=45/layout-engine/v2/2024-12/address_home_location_v4/light.png' },
    { value: 'Work', label: 'Work', icon: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=45/layout-engine/v2/2024-12/address_work_location_v4/light.png' },
    { value: 'Hotel', label: 'Hotel', icon: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=45/layout-engine/v2/2024-12/address_hotel_location_v4/light.png' },
    { value: 'Other', label: 'Other', icon: 'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=45/layout-engine/v2/2024-12/address_other_location_v4/light.png' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }} className="bg-white rounded-lg max-w-md max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <span className="text-lg font-medium">Enter complete address</span>
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="icon-cross">×</span>
          </button>
        </div>

        {/* Form Content */}
        <div className="p-4 overflow-y-auto flex-grow">
          {/* Address Type Selection */}
          <div className="mb-6">
            <div className="text-sm font-medium mb-2">Save address as *</div>
            <div className="flex flex-wrap gap-2">
              {addressTypeOptions.map((option) => (
                <div 
                  key={option.value}
                  className={`flex items-center px-3 py-2 border rounded-full cursor-pointer ${formData.addressType === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => handleAddressTypeChange(option.value)}
                >
                  <img src={option.icon} width="18" height="18" alt={option.label} className="mr-2" />
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Building/House No */}
            <div className="relative">
              <input
                type="text"
                name="building"
                value={formData.building}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer"
                placeholder=" "
                required
              />
              <label className="absolute left-3 top-1/2 -translate-y-1/2 peer-focus:text-xs peer-focus:top-2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base transition-all duration-200 text-gray-500 pointer-events-none bg-white px-1 text-xs peer-focus:text-blue-500">
                Flat / House no / Building name *
              </label>
            </div>

            {/* Floor */}
            <div className="relative">
              <input
                type="text"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer"
                placeholder=" "
              />
              <label className="absolute left-3 top-1/2 -translate-y-1/2 peer-focus:text-xs peer-focus:top-2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base transition-all duration-200 text-gray-500 pointer-events-none bg-white px-1 text-xs peer-focus:text-blue-500">
                Floor (optional)
              </label>
            </div>

            {/* Locality */}
            <div className="relative">
              <textarea
                rows="1"
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer min-h-[50px]"
                placeholder=" "
                required
              />
              <label className="absolute left-3 top-4 peer-focus:text-xs peer-focus:top-2 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base transition-all duration-200 text-gray-500 pointer-events-none bg-white px-1 text-xs peer-focus:text-blue-500">
                Area / Sector / Locality *
              </label>
            </div>

            {/* Landmark */}
            <div className="relative">
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer"
                placeholder=" "
              />
              <label className="absolute left-3 top-1/2 -translate-y-1/2 peer-focus:text-xs peer-focus:top-2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base transition-all duration-200 text-gray-500 pointer-events-none bg-white px-1 text-xs peer-focus:text-blue-500">
                Nearby landmark (optional)
              </label>
            </div>

            {/* Divider with text */}
            <div className="py-4">
              <div className="text-sm text-gray-500 font-medium">
                Enter your details for seamless delivery experience
              </div>
            </div>

            {/* Contact Name */}
            <div className="relative">
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer"
                placeholder=" "
                required
              />
              <label className="absolute left-3 top-1/2 -translate-y-1/2 peer-focus:text-xs peer-focus:top-2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base transition-all duration-200 text-gray-500 pointer-events-none bg-white px-1 text-xs peer-focus:text-blue-500">
                Your name *
              </label>
            </div>

            {/* Contact Phone */}
            <div className="relative">
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer"
                placeholder=" "
                maxLength="10"
                pattern="[0-9]{10}"
              />
              <label className="absolute left-3 top-1/2 -translate-y-1/2 peer-focus:text-xs peer-focus:top-2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base transition-all duration-200 text-gray-500 pointer-events-none bg-white px-1 text-xs peer-focus:text-blue-500">
                Your phone number (optional)
              </label>
              {formData.contactPhone && !/^[0-9]{10}$/.test(formData.contactPhone) && (
                <p className="mt-1 text-sm text-red-500">Please enter a valid 10-digit number</p>
              )}
            </div>

            {/* Default Address Checkbox */}
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isDefault" className="ml-3 text-sm text-gray-700">
                Set as default address
              </label>
            </div>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditMode ? 'Updating...' : 'Saving...'}
              </span>
            ) : (
              'Save Address'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;