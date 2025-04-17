import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PublicNavbar = ({ cartCount, totalPrice }) => {
  const [blink, setBlink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(0);
  const [displayTotal, setDisplayTotal] = useState(0);
  const navigate = useNavigate();

  // Sync with props and localStorage
  useEffect(() => {
    const updateCartDisplay = () => {
      if (!localStorage.getItem("token")) {
        const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
        const count = guestCart.reduce((sum, item) => sum + item.quantity, 0);
        const total = guestCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setDisplayCount(count);
        setDisplayTotal(total);
      } else {
        // For logged-in users, use props directly
        setDisplayCount(cartCount);
        setDisplayTotal(totalPrice);
      }
    };

    // Initial update
    updateCartDisplay();

    // Listen for custom cart update events
    const handleCartUpdate = () => updateCartDisplay();
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [cartCount, totalPrice]);

  const handleCartClick = () => {
    setBlink(true);
    setTimeout(() => setBlink(false), 300);
    navigate('/cart');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="text-xl font-bold text-green-600">Patna Basket</Link>

      <div className="space-x-4 flex items-center">
        <span>📍 Indrapuri, Patna</span>
        
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

        <Link to="/login" className="text-blue-600 hover:underline">Login</Link>

        <button 
          onClick={handleCartClick}
          className="text-gray-700 hover:text-green-600 relative flex items-center focus:outline-none"
          style={blink ? { 
            transform: 'scale(1.1)',
            transition: 'transform 0.3s ease-in-out'
          } : {}}
        >
          🛒
          {displayCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-green-600 text-white text-xs rounded-full px-2">
              {displayCount}
            </span>
          )}
          <span className="ml-2 text-sm font-semibold text-gray-800">
            ₹{displayTotal.toFixed(2)}
          </span>
        </button>
      </div>
    </nav>
  );
};

export default PublicNavbar;