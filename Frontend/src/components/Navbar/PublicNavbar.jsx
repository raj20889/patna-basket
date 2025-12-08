import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import LocationSelector from '../Customer/LocationSelector';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

const PublicNavbar = () => {
  const [blink, setBlink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isPatnaLocation, setIsPatnaLocation] = useState(false);
  const [showCongratsDialog, setShowCongratsDialog] = useState(false);
  const [showSorryDialog, setShowSorryDialog] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(() => {
    const savedAddress = localStorage.getItem('selectedAddress');
    const isPatna = savedAddress?.toLowerCase().includes('patna');
    setIsPatnaLocation(isPatna || false);
    return savedAddress ? savedAddress : 'Select your location';
  });
  const navigate = useNavigate();

  const cartTotalQuantity = useSelector((state) => state.cart.totalQuantity);
  const cartTotalPrice = useSelector((state) => state.cart.totalPrice);

  const handleLocationChange = (address) => {
    setCurrentAddress(address);
    localStorage.setItem('selectedAddress', address);
    
    const isPatna = address.toLowerCase().includes('patna');
    setIsPatnaLocation(isPatna);
    
    if (isPatna) {
      setShowCongratsDialog(true);
    } else {
      setShowSorryDialog(true);
    }
  };

  const handleCartClick = () => {
    if (!isPatnaLocation) return;
    
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
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors relative ${
              isPatnaLocation 
                ? 'bg-[#54B226] hover:bg-[#3F8C1F]' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            style={{ transform: blink ? 'scale(1.05)' : 'scale(1)' }}
            disabled={!isPatnaLocation}
          >
            <span className="text-white text-lg">🛒</span>
            <div className="flex flex-col text-white">
              <div className="text-xs font-medium leading-none">
                {cartTotalQuantity} items
              </div>
              <div className="text-sm font-bold">
                ₹{cartTotalPrice.toFixed(2)}
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
              onClick={isPatnaLocation ? handleCartClick : null}
              className={`relative p-2 ${
                isPatnaLocation ? '' : 'opacity-50 cursor-not-allowed'
              }`}
              style={{ transform: blink ? 'scale(1.05)' : 'scale(1)' }}
              disabled={!isPatnaLocation}
            >
              <span className="text-lg">🛒</span>
              {cartTotalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartTotalQuantity}
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
              <div className="font-bold">₹{cartTotalPrice.toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Congratulations Dialog for Patna */}
      <Dialog
        open={showCongratsDialog}
        onClose={() => setShowCongratsDialog(false)}
      >
        <DialogContent>
          <div className="p-4 text-center">
            <h3 className="text-lg font-bold text-green-600 mb-2">Congratulations!</h3>
            <p>We are delivering in your city (Patna)!</p>
          </div>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowCongratsDialog(false)}
            color="primary"
            variant="contained"
          >
            Great!
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sorry Dialog for non-Patna locations */}
      <Dialog
        open={showSorryDialog}
        onClose={() => setShowSorryDialog(false)}
      >
        <DialogContent>
          <div className="p-4 text-center">
            <h3 className="text-lg font-bold text-red-600 mb-2">Sorry</h3>
            <p>Currently we are not delivering in your city.</p>
            <p className="mt-2 text-sm text-gray-600">We only deliver in Patna at this time.</p>
          </div>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowSorryDialog(false)}
            color="primary"
            variant="outlined"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </nav>
  );
};

export default PublicNavbar;