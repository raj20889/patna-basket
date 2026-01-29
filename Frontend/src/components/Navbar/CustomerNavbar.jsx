
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import LocationSelector from '../Customer/Address/LocationSelector';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useSelector, useDispatch } from 'react-redux';
import { setCart as setReduxCart } from '../../redux/cartSlice';

const CustomerNavbar = ({ 
  cartUpdated, 
  cartCount: propCartCount, 
  totalPrice: propTotalPrice,
  forceUpdate 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dispatch = useDispatch();
  const reduxCart = useSelector((state) => state.cart);
  const [cartCount, setCartCount] = useState(propCartCount || 0);
  const [totalPrice, setTotalPrice] = useState(propTotalPrice || 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [blink, setBlink] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
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
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user')) || {};

  // Update cart count and total from Redux
  useEffect(() => {
    if (reduxCart && reduxCart.items) {
      const count = reduxCart.items.reduce((sum, item) => sum + item.quantity, 0);
      const total = reduxCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setCartCount(count);
      setTotalPrice(total);
    }
  }, [reduxCart]);

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
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/customer/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileSearch(false);
    }
  };

  const handleCartClick = () => {
    if (!isPatnaLocation) return;
    
    setBlink(true);
    setTimeout(() => setBlink(false), 300);
    navigate('/cart');
    setIsMobileMenuOpen(false);
  };

  const fetchCartDetails = async () => {
    try {
      if (!token) {
        const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
        let count = 0;
        let total = 0;
        
        guestCart.forEach(item => {
          count += item.quantity;
          total += item.price * item.quantity;
        });
        
        setCartCount(count);
        setTotalPrice(total);
        // Sync Redux so other views (ProductCard/Cart page) update instantly
        dispatch(setReduxCart({ cartItems: guestCart }));
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cart`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch cart details');
        }
        
        const data = await res.json();
        let quantity = 0;
        let price = 0;
        
        if (data?.products?.length > 0) {
          data.products.forEach(item => {
            quantity += item.quantity;
            price += item.productId.price * item.quantity;
          });
        }
        
        setCartCount(quantity);
        setTotalPrice(price);
        // Normalize and sync into Redux for immediate UI updates
        const cartItems = (data?.products || []).map((item) => ({
          productId: item.productId?._id || item.productId,
          name: item.productId?.name,
          price: item.productId?.price,
          image: item.productId?.image,
          quantity: item.quantity || 1,
        }));
        dispatch(setReduxCart({ cartItems }));
      }
    } catch (err) {
      console.error('Error fetching cart details:', err);
      setCartCount(0);
      setTotalPrice(0);
    }
  };

  useEffect(() => {
    fetchCartDetails();
    
    // Listen for cart updates from ProductCard
    const handleCartUpdate = () => {
      fetchCartDetails();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [cartUpdated, forceUpdate]);

  useEffect(() => {
    setCartCount(propCartCount || 0);
    setTotalPrice(propTotalPrice || 0);
  }, [propCartCount, propTotalPrice]);

  return (
    <nav className="bg-white shadow-md px-4 pt-4 pb-1 sticky w-full top-0 z-50">
      {/* Desktop View */}
      <div className="hidden md:flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link to="/Customer/dashboard" className="text-2xl font-bold text-green-600 flex items-center">
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

        <form 
          onSubmit={handleSearchSubmit}
          className="flex-grow max-w-2xl mx-4 relative"
        >
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
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1 text-gray-700 hover:text-green-600"
            >
              <span>Account</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {showDropdown && (
              <div className="account-dropdown--container absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 p-4">
                <div className="account-dropdown__account-info mb-4">
                  <div className="account-dropdown__account-info--heading text-lg font-semibold">My Account</div>
                  <div className="text-gray-600">{user.phone || user.email || 'Welcome!'}</div>
                </div>
                
                <ul className="account-dropdown--list space-y-2">
                  <li>
                    <Link to="/orders" className="account-dropdown--nav_item full-width block px-3 py-2 hover:bg-gray-100 rounded">
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <Link to="/customer/addresses" className="account-dropdown--nav_item full-width block px-3 py-2 hover:bg-gray-100 rounded">
                      Saved Addresses
                    </Link>
                  </li>
                  <li>
                    <Link to="/gift-cards" className="account-dropdown--nav_item full-width block px-3 py-2 hover:bg-gray-100 rounded">
                      E-Gift Cards
                    </Link>
                  </li>
                  <li>
                    <a href="/faq" className="account-dropdown--nav_item full-width block px-3 py-2 hover:bg-gray-100 rounded">
                      FAQ's
                    </a>
                  </li>
                  <li>
                    <Link to="/privacy" className="account-dropdown--nav_item full-width block px-3 py-2 hover:bg-gray-100 rounded">
                      Account Privacy
                    </Link>
                  </li>
                  <li>
                    <button 
                      onClick={handleLogout}
                      className="account-dropdown--nav_item account-dropdown__logout-btn full-width block w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-red-600"
                    >
                      Log Out
                    </button>
                  </li>
                </ul>
                
                <div className="account-dropdown__qrcode mt-4 pt-4 border-t border-gray-200 flex items-center gap-4">
                  <div className="border border-gray-300 p-2 rounded">
                    <svg height="77" width="77" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 0 0 L 2 0 L 2 2 L 0 2 Z" fill="#000000" transform="matrix(1,0,0,1,0,0)"></path>
                      <path d="M 0 0 L 2 0 L 2 2 L 0 2 Z" fill="#000000" transform="matrix(1,0,0,1,2,0)"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="account-dropdown__qrcode--heading font-medium">
                      Simple way to<br /> get groceries<br /> <span className="text-green-600">in minutes</span>
                    </div>
                    <div className="text-sm text-gray-600">Scan the QR code and download our app</div>
                  </div>
                </div>
              </div>
            )}
          </div>

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
                {cartCount} items
              </div>
              <div className="text-sm font-bold">
                ₹{totalPrice.toFixed(2)}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex flex-col">
        {/* Top Row */}
        <div className="flex justify-between items-center">
          <Link to="/Customer/dashboard" className="text-xl font-bold text-green-600 flex items-center">
            <span className="relative">
              Patna Basket
              <span className="absolute -right-3 -bottom-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowMobileSearch(!showMobileSearch)}
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
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="mt-2">
          <LocationSelector 
            currentAddress={currentAddress}
            onLocationChange={handleLocationChange}
            mobileView={true}
          />
        </div>

        {/* Mobile Search */}
        {showMobileSearch && (
          <form 
            onSubmit={handleSearchSubmit}
            className="mt-3 relative"
          >
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mt-3 py-2 border-t border-gray-200">
            <div className="px-4 py-2 mb-2">
              <div className="text-lg font-semibold">Welcome, {user.name || 'Customer'}</div>
              <div className="text-gray-600 text-sm">{user.phone || user.email || ''}</div>
            </div>

            <ul className="space-y-1">
              <li>
                <Link 
                  to="/orders" 
                  className="block px-4 py-2 hover:bg-gray-100 rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link 
                  to="/customer/addresses" 
                  className="block px-4 py-2 hover:bg-gray-100 rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Saved Addresses
                </Link>
              </li>
              <li>
                <Link 
                  to="/gift-cards" 
                  className="block px-4 py-2 hover:bg-gray-100 rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  E-Gift Cards
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="block px-4 py-2 hover:bg-gray-100 rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  FAQ's
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="block px-4 py-2 hover:bg-gray-100 rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Account Privacy
                </Link>
              </li>
            </ul>

            <div className="mt-4 pt-4 border-t border-gray-200 px-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">Cart Total:</div>
                <div className="font-bold">₹{totalPrice.toFixed(2)}</div>
              </div>
              
              
              <button 
                onClick={handleLogout}
                className="w-full mt-2 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
              >
                Log Out
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4 px-4">
              <div className="border border-gray-300 p-2 rounded">
                <svg height="60" width="60" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 0 0 L 2 0 L 2 2 L 0 2 Z" fill="#000000" transform="matrix(1,0,0,1,0,0)"></path>
                  <path d="M 0 0 L 2 0 L 2 2 L 0 2 Z" fill="#000000" transform="matrix(1,0,0,1,2,0)"></path>
                </svg>
              </div>
              <div>
                <div className="font-medium">
                  Simple way to get groceries <span className="text-green-600">in minutes</span>
                </div>
                <div className="text-xs text-gray-600">Scan the QR code and download our app</div>
              </div>
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

export default CustomerNavbar;