import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blink, setBlink] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (!token) {
          // Handle guest cart
          const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
          setCartItems(guestCart);
        } else {
          // Handle logged-in user cart
          const res = await axios.get('http://localhost:5000/api/cart', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCartItems(res.data.products.map(item => ({
            productId: item.productId._id,
            name: item.productId.name,
            price: item.productId.price,
            quantity: item.quantity,
            image: item.productId.image
          })));
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token]);

  // Trigger blink animation when component mounts
  useEffect(() => {
    setBlink(true);
    const timer = setTimeout(() => setBlink(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const updateQuantity = async (productId, newQuantity) => {
    try {
      if (!token) {
        // Update guest cart
        const updatedCart = cartItems.map(item => 
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        ).filter(item => item.quantity > 0);
        
        localStorage.setItem('guestCart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);
      } else {
        // Update server cart
        await axios.post('http://localhost:5000/api/cart/add', 
          { productId, quantity: newQuantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setCartItems(prev => prev.map(item => 
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        ).filter(item => item.quantity > 0));
      }
    } catch (err) {
      console.error('Error updating cart:', err);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleProceedToCheckout = () => {
    if (!token) {
      setShowLoginPrompt(true);
    } else {
      navigate('/checkout');
    }
  };

  if (loading) return <div className="text-center py-10">Loading cart...</div>;

  return (
    <div className={`container mx-auto px-4 py-6 ${blink ? 'animate-pulse' : ''}`}>
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg mb-4">Your cart is empty</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {cartItems.map(item => (
              <div key={item.productId} className="flex items-center border-b py-4">
                <img 
                  src={item.image || 'https://via.placeholder.com/100'} 
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded mr-4"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-gray-600">₹{item.price}</p>
                </div>
                <div className="flex items-center">
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center border rounded-l-md"
                  >
                    -
                  </button>
                  <span className="w-10 text-center border-t border-b">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center border rounded-r-md"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg h-fit">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-3 border-t">
                <span>Total</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            {showLoginPrompt && (
              <div className="mb-4 p-3 bg-yellow-100 rounded-md text-yellow-800">
                <p className="font-medium">Please login to proceed to checkout</p>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="bg-gray-300 text-gray-800 px-4 py-1 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
            >
              Proceed to Checkout
            </button>

            {!token && (
              <p className="mt-3 text-sm text-gray-600">
                You need to login to complete your purchase. Your cart will be saved.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;