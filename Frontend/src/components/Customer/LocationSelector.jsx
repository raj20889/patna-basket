import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddressForm from './AddressForm'; // Make sure this path is correct

// Helper function to extract the most relevant part of the address
const getShortAddress = (address) => {
  if (!address) return '';
  
  const parts = address.split(',');
  if (parts.length >= 2) {
    return `${parts[0].trim()}, ${parts[1].trim()}`;
  }
  return parts[0].trim();
};

const LocationSelector = ({ currentAddress, onLocationChange, mobileView = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/addresses', {
          headers: { 
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.data) {
          setSavedAddresses(response.data);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        toast.error('Failed to load addresses');
      } finally {
        setLoading(false);
      }
    };

    if (showModal && isLoggedIn) {
      fetchAddresses();
    }
  }, [showModal, isLoggedIn]);

  useEffect(() => {
    if (searchQuery.trim() && showModal) {
      const timer = setTimeout(() => {
        searchLocations(searchQuery);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, showModal]);

  const searchLocations = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([]);
      toast.error('Failed to search locations');
    } finally {
      setIsSearching(false);
    }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            const address = response.data.display_name.split(',')[0] + ', ' + response.data.address.city;
            handleAddressSelect(address);
          } catch (error) {
            toast.error("Couldn't fetch address details. Please enter manually.");
          }
        },
        (error) => {
          toast.error("Location access denied. Please select manually.");
        }
      );
    } else {
      toast.error("Geolocation not supported by your browser.");
    }
  };

  const handleAddressSelect = (address) => {
    onLocationChange(address);
    setShowModal(false);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleAddressAdded = (newAddress) => {
    setSavedAddresses([...savedAddresses, newAddress]);
    setShowAddressForm(false);
    toast.success('Address added successfully');
  };

  const filteredAddresses = savedAddresses.filter(address => 
    address.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
    address.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
    address.addressType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAddressIcon = (type) => {
    switch(type) {
      case 'Home': return '🏠';
      case 'Work': return '🏢';
      case 'Hotel': return '🏨';
      default: return '📍';
    }
  };

  return (
    <div className="location-selector">
      {/* Current Location Display */}
      <div 
        className={`flex flex-col cursor-pointer`}
        onClick={() => setShowModal(true)}
      >
        <div className="text-xs text-gray-500">Delivery in 8 minutes</div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">
            {currentAddress ? getShortAddress(currentAddress) : 'Select Location'}
          </span>
          <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-600"></div>
        </div>
      </div>

      {/* Location Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-white rounded-t-lg md:rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex items-center z-10">
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 mr-2"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h3 className="text-lg font-semibold flex-grow">Select your Location</h3>
            </div>

            {/* Search Box */}
            <div className="sticky top-[68px] bg-white p-4 border-b border-gray-200 z-10">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for area, street name..."
                  className="w-full py-2 pl-10 pr-4 rounded-lg bg-gray-100 border border-transparent focus:border-green-500 focus:bg-white focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <button
                onClick={detectLocation}
                className="w-full mt-3 px-4 py-2 text-green-600 hover:bg-green-50 rounded-md flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Use current location
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto">
              {/* Search Results */}
              {isSearching ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : searchResults.length > 0 && (
                <div className="p-4 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Search Results</h4>
                  <div className="space-y-3">
                    {searchResults.map((result, index) => (
                      <div 
                        key={index}
                        className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleAddressSelect(result.display_name)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-xl mt-1">📍</div>
                          <div className="flex-grow">
                            <div className="font-medium">
                              {result.address.road || result.address.neighbourhood || result.address.suburb || 'Location'}
                            </div>
                            <div className="text-gray-600 text-sm">
                              {result.display_name}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved Addresses List */}
              {isLoggedIn && !isSearching && searchResults.length === 0 && (
                <div className="p-4 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Your saved addresses</h4>
                  
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                  ) : filteredAddresses.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      {searchQuery ? 'No addresses match your search' : 'No saved addresses found'}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredAddresses.map((address) => (
                        <div 
                          key={address._id}
                          className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleAddressSelect(address.locality)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-xl mt-1">
                              {getAddressIcon(address.addressType)}
                            </div>
                            <div className="flex-grow">
                              <div className="font-medium capitalize">
                                {address.addressType === 'Other' ? address.customName : address.addressType}
                              </div>
                              <div className="text-gray-600 text-sm">
                                {address.building}, {address.locality}
                                {address.landmark && `, near ${address.landmark}`}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Add New Address Button */}
              {isLoggedIn && !searchQuery && !isSearching && (
                <button
                  onClick={() => {
                    setShowModal(false);
                    setShowAddressForm(true);
                  }}
                  className="w-full mt-4 px-4 py-3 text-center border-2 border-dashed border-gray-300 rounded-md hover:bg-gray-50 text-green-600 font-medium"
                >
                  + Add New Address
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <AddressForm 
              userId={user?._id}
              token={token}
              onSuccess={(address) => {
                handleAddressAdded(address);
                setShowAddressForm(false);
              }}
              onCancel={() => setShowAddressForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;