import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddressList from '../Address/AddressList';
import AddressForm from '../Address/AddressForm';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { setCart } from '../../../redux/cartSlice'; // Correct action import

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const   SHOP_LOCATION = { lat: 25.60222, lng: 85.11936 }; // Updated coordinates for Indrapuri Road No 0, Atal Path, Patna, Bihar, 800024

const Checkout = () => {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [deliveryDetails, setDeliveryDetails] = useState({}); // New state for delivery details
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Initialize Redux dispatch

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

      const defaultAddress = res.data.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress._id);
      }
    } catch (err) {
      showNotification('Failed to load addresses', 'error');
      console.error('Address fetch error:', err);
    }
  };

  const showNotification = (message, type = 'success') => {
    toast[type](message, {
      position: 'bottom-center',
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    console.log(`Calculating distance with inputs: lat1=${lat1}, lon1=${lon1}, lat2=${lat2}, lon2=${lon2}`); // Debug log
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const normalize = (str) => str?.toLowerCase().replace(/[^a-z0-9]/g, '');

  const fetchDeliveryDetails = async (address) => {
    const { fullAddress, city, state, zip } = address;

    if (!fullAddress && (!city || !state || !zip)) {
      console.warn('Invalid address fields:', { fullAddress, city, state, zip });
      showNotification('Invalid address. Please provide complete address details.', 'error');
      return;
    }

    const refinedAddress = fullAddress || `${city}, ${state}, ${zip}`;
    console.log(`Final refined address sent to OpenCage Geocoding API: ${refinedAddress}`); // Debug log

    try {
      const response = await axios.get(
        `${API_BASE_URL}/geocode`,
        { params: { address: refinedAddress } }
      );
      console.log('OpenCage API response:', response.data); // Debug log

      const { results } = response.data;
      if (results.length > 0) {
        // Normalize and filter results
        const validResults = results.filter((result) => {
          const comp = result.components || {};

          const pincodeMatch = comp.postcode === zip;
          const stateMatch = normalize(comp.state) === normalize(state);

          return pincodeMatch || stateMatch; // OR instead of AND
        });

        // Select the best result
        let bestResult;
        if (validResults.length > 0) {
          bestResult = validResults.sort((a, b) => b.confidence - a.confidence)[0];
        } else {
          bestResult = results.sort((a, b) => b.confidence - a.confidence)[0];
        }

        console.log('Best result selected:', bestResult);

        const { lat, lng } = bestResult.geometry;
        const distance = calculateDistance(SHOP_LOCATION.lat, SHOP_LOCATION.lng, parseFloat(lat), parseFloat(lng));
        let deliveryCharge = Math.max(20, distance * 10).toFixed(2);
        deliveryCharge = Math.min(deliveryCharge, 30); // Cap the delivery charge at 30

        console.log(`Latitude: ${lat}, Longitude: ${lng}, Distance: ${distance} km`); // Log distance, lat, and lng
        console.log(`Shop Location: Latitude: ${SHOP_LOCATION.lat}, Longitude: ${SHOP_LOCATION.lng}`);
        console.log(`Current Address: ${refinedAddress}`);
        console.log(`Calculated Delivery Details:`, {
          Latitude: lat,
          Longitude: lng,
          Distance: distance,
          DeliveryCharge: deliveryCharge,
        });

        setDeliveryDetails({ lat, lng, distance, deliveryCharge: parseFloat(deliveryCharge) }); // Ensure deliveryCharge is a number
        dispatch(setCart({ deliveryCharge: parseFloat(deliveryCharge) }));
      } else {
        console.warn('No results from OpenCage API for address:', refinedAddress);
        showNotification('Failed to fetch accurate location details. Using default delivery charge.', 'warning');

        const defaultDeliveryCharge = 30.00; // Default to maximum delivery charge
        setDeliveryDetails({ lat: null, lng: null, distance: null, deliveryCharge: defaultDeliveryCharge });
        dispatch(setCart({ deliveryCharge: defaultDeliveryCharge }));
      }
    } catch (error) {
      console.error('OpenCage API error:', error);
      showNotification('Failed to calculate delivery details. Please try again later.', 'error');
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address._id);
    fetchDeliveryDetails(address);
    showNotification('Address selected successfully');
  };

  const handleAddressAdded = (newAddress) => {
    setAddresses([...addresses, newAddress]);
    setShowAddressForm(false);
    showNotification('Address added successfully');

    // If this is the first address or it's marked as default, select it
    if (addresses.length === 0 || newAddress.isDefault) {
      setSelectedAddress(newAddress._id);
    }
  };

  const handleAddressUpdated = (updatedAddress) => {
    setAddresses(addresses.map(addr => 
      addr._id === updatedAddress._id ? updatedAddress : addr
    ));
    showNotification('Address updated successfully');

    // If the updated address is now default or was selected, update selection
    if (updatedAddress.isDefault || selectedAddress === updatedAddress._id) {
      setSelectedAddress(updatedAddress._id);
    }
  };

  const handleAddressDeleted = (addressId) => {
    setAddresses(addresses.filter(addr => addr._id !== addressId));
    if (selectedAddress === addressId) {
      setSelectedAddress(null);
      // Select another default address if available
      const defaultAddr = addresses.find(addr => addr.isDefault && addr._id !== addressId);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr._id);
      }
    }
    showNotification('Address deleted successfully');
  };

  const proceedToPayment = async () => {
    if (!selectedAddress) {
      showNotification('Please select an address', 'error');
      return;
    }
    setPaymentLoading(true);
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
      const deliveryFee = deliveryDetails.deliveryCharge || 40; // Or fetch from API if dynamic
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
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!user || !token) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 pt-4">Select Delivery Address</h2>

        <div className="space-y-4 mb-6">
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
        </div>

        {deliveryDetails.lat && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-bold mb-2">Delivery Details</h3>
            <p>Latitude: {deliveryDetails.lat}</p>
            <p>Longitude: {deliveryDetails.lng}</p>
            <p>Distance: {deliveryDetails.distance.toFixed(2)} km</p>
            <p>Delivery Charge: ₹{deliveryDetails.deliveryCharge.toFixed(2)}</p>
          </div>
        )}

        <div>
          <h3>Shop Location</h3>
          <p>Latitude: {SHOP_LOCATION.lat}, Longitude: {SHOP_LOCATION.lng}</p>
        </div>
        <div>
          <h3>Current Address</h3>
          <p>{deliveryDetails?.address || 'No address selected'}</p>
        </div>
        <div>
          <h3>Calculated Delivery Details</h3>
          <p>Latitude: {deliveryDetails?.lat || 'N/A'}</p>
          <p>Longitude: {deliveryDetails?.lng || 'N/A'}</p>
          <p>Distance: {deliveryDetails?.distance || 'N/A'} km</p>
          <p>Delivery Charge: ₹{deliveryDetails?.deliveryCharge || 'N/A'}</p>
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

        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t border-gray-200">
          {selectedAddress ? (
            <button
              className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 text-lg font-medium transition-colors flex items-center justify-center"
              onClick={proceedToPayment}
              disabled={paymentLoading}
            >
              {paymentLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
              ) : (
                'Proceed to Payment'
              )}
            </button>
          ) : (
            <button
              className="w-full bg-gray-400 text-white px-4 py-3 rounded-lg text-lg font-medium cursor-not-allowed"
              disabled
            >
              Select an Address
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;