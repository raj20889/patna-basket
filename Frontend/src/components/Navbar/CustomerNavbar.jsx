import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CustomerNavbar = ({ 
  cartUpdated, 
  cartCount: propCartCount, 
  totalPrice: propTotalPrice,
  forceUpdate 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(propCartCount || 0);
  const [totalPrice, setTotalPrice] = useState(propTotalPrice || 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [blink, setBlink] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.clear();
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCartClick = () => {
    setBlink(true);
    setTimeout(() => setBlink(false), 300);
    navigate('/cart');
  };

  const fetchCartDetails = async () => {
    try {
      if (!token) {
        // Handle guest cart
        const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
        let count = 0;
        let total = 0;
        
        guestCart.forEach(item => {
          count += item.quantity;
          total += item.price * item.quantity;
        });
        
        setCartCount(count);
        setTotalPrice(total);
      } else {
        // Handle logged-in user cart
        const res = await fetch('http://localhost:5000/api/cart', {
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
      }
    } catch (err) {
      console.error('Error fetching cart details:', err);
      setCartCount(0);
      setTotalPrice(0);
    }
  };

  // Fetch cart details when component mounts or when cart is updated
  useEffect(() => {
    fetchCartDetails();
  }, [cartUpdated, forceUpdate]);

  // Sync with props if they change (for immediate updates)
  useEffect(() => {
    setCartCount(propCartCount || 0);
    setTotalPrice(propTotalPrice || 0);
  }, [propCartCount, propTotalPrice]);

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
      <h1 className="text-xl font-bold text-green-600">Patna Basket</h1>

      <div className="space-x-4 relative flex items-center">
        <span>📍 Your location</span>
        
        <form onSubmit={handleSearchSubmit} className="flex">
          <input
            type="text"
            placeholder="Search groceries..."
            className="border p-1 rounded"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="ml-1 bg-green-500 text-white px-2 rounded hover:bg-green-600"
          >
            Search
          </button>
        </form>

        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="text-gray-700 hover:text-green-600 relative"
        >
          Account ⌄
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-10">
            <Link
              to="/customer/dashboard"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setShowDropdown(false)}
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}

        <button 
          onClick={handleCartClick}
          className="text-gray-700 hover:text-green-600 relative flex items-center focus:outline-none"
          style={blink ? { 
            transform: 'scale(1.1)',
            transition: 'transform 0.3s ease-in-out'
          } : {}}
        >
          🛒
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-green-600 text-white text-xs rounded-full px-2">
              {cartCount}
            </span>
          )}
          <span className="ml-2 text-sm font-semibold text-gray-800">
            ₹{totalPrice.toFixed(2)}
          </span>
        </button>
      </div>
    </nav>
  );
};

export default CustomerNavbar;