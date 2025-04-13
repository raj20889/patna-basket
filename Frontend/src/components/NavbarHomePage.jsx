import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';

const NavbarHomePage = () => {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [location, setLocation] = useState({
    text: "Enter Pincode",
    loading: false,
    error: null
  });
  const [pincode, setPincode] = useState("");
  const [showPincodeInput, setShowPincodeInput] = useState(false);

  const navigate = useNavigate();

  // Fetch location from pincode
  const fetchLocationByPincode = async (pincode) => {
    setLocation(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data[0].Status === "Error") throw new Error(data[0].Message);
      
      const district = data[0]?.PostOffice?.[0]?.District;
      const state = data[0]?.PostOffice?.[0]?.State;
      
      if (!district) throw new Error("No district found for this pincode");
      
      setLocation({
        text: `${district}, ${state}`,
        loading: false,
        error: null
      });
      setShowPincodeInput(false);
      
      // Store in localStorage for future sessions
      localStorage.setItem("userLocation", JSON.stringify({
        district,
        state,
        pincode
      }));
      
    } catch (error) {
      setLocation({
        text: "Invalid Pincode",
        loading: false,
        error: error.message
      });
    }
  };

  // Load saved location on initial render
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const storedLocation = JSON.parse(localStorage.getItem("userLocation"));
    
    setUser(storedUser);
    setCartCount(storedCart.length);
    
    if (storedLocation) {
      setLocation({
        text: `${storedLocation.district}, ${storedLocation.state}`,
        loading: false,
        error: null
      });
      setPincode(storedLocation.pincode);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md p-3 md:p-4 flex justify-between items-center sticky top-0 z-50">
      {/* Left Section */}
      <div className="flex items-center space-x-6">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="src\assets\logo.png" 
            alt="Patna Basket Logo" 
            className="h-12 w-12 md:h-16 md:w-16 object-contain"
          />
        </Link>
        
        {/* Pincode-based Location */}
        <div className="relative">
          {showPincodeInput ? (
            <div className="flex items-center">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit pincode"
                className="border p-1 w-24 text-sm rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <button
                onClick={() => fetchLocationByPincode(pincode)}
                disabled={pincode.length !== 6 || location.loading}
                className="ml-2 bg-green-500 text-white px-2 py-1 text-sm rounded disabled:opacity-50"
              >
                {location.loading ? "..." : "Apply"}
              </button>
            </div>
          ) : (
            <div 
              className="text-sm cursor-pointer group"
              onClick={() => setShowPincodeInput(true)}
            >
              <p className="font-semibold">Delivery to</p>
              <div className="flex items-center">
                <p className="text-green-600">
                  {location.text}
                </p>
                <span className="ml-1 text-xs text-gray-500 group-hover:underline">(Change)</span>
              </div>
            </div>
          )}
          {location.error && (
            <p className="absolute text-xs text-red-500 mt-1">{location.error}</p>
          )}
        </div>
      </div>

      {/* Center Search */}
      <div className="flex-1 mx-4 hidden md:block">
        <input
          type="text"
          placeholder="Search for groceries..."
          className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4 md:space-x-6">
        {user ? (
          <div className="hidden sm:flex items-center space-x-2">
            <span className="text-gray-700 text-sm">Hi, {user.name.split(' ')[0]}</span>
            <button
              onClick={handleLogout}
              className="text-red-600 text-sm hover:underline"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="text-blue-600 text-sm hover:underline">
            Login / Signup
          </Link>
        )}
        
        <Link to="/cart" className="relative">
          <FiShoppingCart size={22} className="text-gray-700 hover:text-green-600" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center">
              {Math.min(cartCount, 9)}{cartCount > 9 ? '+' : ''}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
};

export default NavbarHomePage;