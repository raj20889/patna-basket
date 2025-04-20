const AddressList = ({ addresses, selectedAddress, onSelect, onDelete, onEdit }) => {
  const getAddressTypeDisplay = (address) => {
    if (address.addressType === 'Other') {
      return address.customName || 'Other';
    }
    return address.addressType;
  };

  return (
    <div className="space-y-3">
      {addresses.length === 0 ? (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
          No addresses found. Please add an address.
        </div>
      ) : (
        addresses.map(address => (
          <div 
            key={address._id} 
            className={`border-2 rounded-xl p-4 transition-all ${selectedAddress === address._id ? 
              'border-blue-500 bg-blue-50 shadow-sm' : 
              'border-gray-200 hover:border-gray-300 bg-white'}`}
          >
            <div 
              onClick={() => onSelect(address)} 
              className="cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <h3 className="font-medium text-lg text-gray-800">
                    {getAddressTypeDisplay(address)}
                  </h3>
                  {address.isDefault && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                      Default
                    </span>
                  )}
                </div>
                {selectedAddress === address._id && (
                  <span className="text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              
              <div className="mt-2 space-y-1 text-gray-600">
                <p className="flex items-start">
                  <span className="mr-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  {address.building}, {address.locality}
                </p>
                {address.floor && (
                  <p className="flex items-start">
                    <span className="mr-2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </span>
                    Floor: {address.floor}
                  </p>
                )}
                {address.landmark && (
                  <p className="flex items-start">
                    <span className="mr-2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                    Landmark: {address.landmark}
                  </p>
                )}
                <p className="flex items-start pt-1">
                  <span className="mr-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                    </svg>
                  </span>
                  {address.contactName} {address.contactPhone && `(${address.contactPhone})`}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end mt-3 space-x-3">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(address);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center px-3 py-1 rounded hover:bg-blue-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (address.isDefault && addresses.length > 1) {
                    if (window.confirm('This is your default address. Are you sure you want to delete it?')) {
                      onDelete(address._id);
                    }
                  } else {
                    onDelete(address._id);
                  }
                }}
                className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center px-3 py-1 rounded hover:bg-red-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AddressList;