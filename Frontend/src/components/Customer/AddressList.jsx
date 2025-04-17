const AddressList = ({ addresses, selectedAddress, onSelect, onDelete, onEdit }) => {
  const getAddressTypeDisplay = (address) => {
    if (address.addressType === 'Other') {
      return address.customName || 'Other';
    }
    return address.addressType;
  };

  return (
    <div className="space-y-4">
      {addresses.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No addresses found. Please add an address.
        </div>
      ) : (
        addresses.map(address => (
          <div 
            key={address._id} 
            className={`border rounded-lg p-4 ${selectedAddress === address._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
          >
            <div 
              onClick={() => onSelect(address)} 
              className="cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-lg">
                  {getAddressTypeDisplay(address)}
                  {address.isDefault && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </h3>
              </div>
              <p className="mt-1">{address.building}, {address.locality}</p>
              {address.floor && <p>Floor: {address.floor}</p>}
              {address.landmark && <p>Landmark: {address.landmark}</p>}
              <p className="mt-2">
                Contact: {address.contactName} ({address.contactPhone})
              </p>
            </div>
            
            <div className="flex justify-end mt-2 space-x-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(address);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(address._id);
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
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