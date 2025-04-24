import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import LocationSelector from '../Customer/LocationSelector';

const PublicNavbar = ({ cartCount, totalPrice, cartUpdated }) => {
  const [blink, setBlink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(0);
  const [displayTotal, setDisplayTotal] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(
    localStorage.getItem('selectedAddress') || 'select your address'
  );
  const navigate = useNavigate();

  const updateCartDisplay = () => {
    const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
    const count = guestCart.reduce((sum, item) => sum + item.quantity, 0);
    const total = guestCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setDisplayCount(count);
    setDisplayTotal(total);
  };

  useEffect(() => {
    updateCartDisplay();

    const handleStorageChange = (e) => {
      if (e.key === "guestCart" || e.key === "selectedAddress") {
        updateCartDisplay();
        if (e.key === "selectedAddress") {
          setCurrentAddress(localStorage.getItem('selectedAddress') || 'Select your address');
        }
      }
    };

    // Add custom event listener for cart updates
    const handleCartUpdate = () => updateCartDisplay();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [cartUpdated]); // Add cartUpdated to dependencies

  const handleCartClick = () => {
    setBlink(true);
    setTimeout(() => setBlink(false), 300);
    navigate('/cart');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
    }
  };

  const handleLocationChange = (address) => {
    setCurrentAddress(address);
    localStorage.setItem('selectedAddress', address);
  };

  return (
    <nav className="bg-white shadow-md p-4 sticky w-full top-0 z-50">
      {/* Desktop Navbar */}
      <div className="hidden md:flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-2xl font-bold text-green-600 flex items-center">
            <span className="relative">
              Patna Basket
              <span className="absolute -right-3 -bottom-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
            </span>
          </Link>
          
          <div className="h-8 w-px bg-gray-300"></div>
          
          <LocationSelector 
            currentAddress={currentAddress}
            onLocationChange={handleLocationChange}
          />
        </div>

        <form onSubmit={handleSearchSubmit} className="flex-grow max-w-2xl mx-4 relative">
          <div className="relative">
            <input
              type="text"
              placeholder=""
              className="w-full py-2 pl-10 pr-4 rounded-lg bg-gray-100 border border-transparent focus:border-green-500 focus:bg-white focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {!searchQuery && (
              <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                <TypeAnimation
                  sequence={[
                    'Search "Milk"',
                    1500,
                    'Search "bread"',
                    1500,
                    'Search "eggs"',
                    1500,
                    'Search "paneer"',
                    1500,
                    'Search "rice"',
                    1500,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                  className="text-gray-400 text-sm"
                  cursor={false}
                  preRenderFirstString={true}
                  style={{ fontSize: '14px', display: 'inline-block' }}
                />
              </div>
            )}
          </div>
        </form>

        <div className="flex items-center gap-6">
          <Link to="/login" className="flex items-center gap-1 text-gray-700 hover:text-green-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm font-medium">Login</span>
          </Link>

          <button 
            onClick={handleCartClick}
            className="flex items-center gap-2 px-4 py-2 bg-[#54B226] rounded-md hover:bg-[#3F8C1F] transition-colors relative"
            style={{ transform: blink ? 'scale(1.05)' : 'scale(1)' }}
          >
            <span className="text-white text-lg">🛒</span>
            <div className="flex flex-col text-white">
              <div className="text-xs font-medium leading-none">
                {displayCount} items
              </div>
              <div className="text-sm font-bold">
                ₹{displayTotal.toFixed(2)}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="md:hidden flex flex-col">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-green-600 flex items-center">
            <span className="relative">
              Patna Basket
              <span className="absolute -right-3 -bottom-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            <button 
              onClick={handleCartClick}
              className="relative p-2"
              style={{ transform: blink ? 'scale(1.05)' : 'scale(1)' }}
            >
              <span className="text-lg">🛒</span>
              {displayCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {displayCount}
                </span>
              )}
            </button>
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        <div className="mt-2">
          <LocationSelector 
            currentAddress={currentAddress}
            onLocationChange={handleLocationChange}
            mobileView={true}
          />
        </div>
        
        {showSearch && (
          <form onSubmit={handleSearchSubmit} className="mt-3 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
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
          </form>
        )}
        
        {isMenuOpen && (
          <div className="mt-3 py-2 border-t border-gray-200">
            <Link 
              to="/login" 
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Login
            </Link>
            
            <div className="px-4 py-2 flex items-center justify-between">
              <div className="text-gray-700 font-medium">Cart Total:</div>
              <div className="font-bold">₹{displayTotal.toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;