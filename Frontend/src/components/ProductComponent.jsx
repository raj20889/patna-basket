import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, updateQuantity, setCart } from '../redux/cartSlice';
import axios from 'axios';

const ProductComponent = ({
  products,
  onCartUpdate,       // function(productId, changeOrQuantity) for logged-in flows
  onCartChange,       // function(count, total) for guest flows
  isAuthenticated,    // optional explicit flag
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const userIsLoggedIn = !!localStorage.getItem("token");





  return (

    <div className="px-4 py-6 bg-white">
      <div className="relative">
      <div className="flex overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide space-x-4">
          {products.map(product => {
            const quantity = cartItems.find(item => item.productId === product._id)?.quantity || 0;


            return (
              <div 
                key={product._id} 
                className="flex-shrink-0 border-[1px] border-slate-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div 
                  className="relative h-40 bg-gray-100 flex items-center justify-center p-2 cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  {product.discountPercentage > 0 && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {product.discountPercentage}% OFF
                    </div>
                  )}
                <img
                  src={product.image || '/placeholder-product.jpg'}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
                </div>
                
                <div className="p-2">
                  <div className="flex items-center mb-1">
                    <div className="w-3 h-3 mr-1">
                      <img 
                        src="https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=90/assets/eta-icons/15-mins.png" 
                        alt="delivery time"
                        className="w-full h-full"
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-600">22 mins</span>
                  </div>
                  
                  <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
                  <div className="text-xs text-gray-500 mb-1">{product.weight || '1 pc'}</div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-sm">₹{product.price.toFixed(2)}</div>
                      {product.originalPrice && (
                        <div className="text-xs text-gray-400 line-through">₹{product.originalPrice.toFixed(2)}</div>
                      )}
                    </div>
                    
                    {quantity === 0 ? (
                      <div className='border-green-600 rounded-md border-[1.5px] mb-2'>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const token = localStorage.getItem('token');
                            if (token) {
                              try {
                                // Call server to add item to logged-in user's cart
                                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/cart/add`, {
                                  productId: product._id,
                                  quantity: 1
                                }, { headers: { Authorization: `Bearer ${token}` } });

                                // Update Redux immediately for responsive UI
                                dispatch(addToCart({
                                  productId: product._id,
                                  name: product.name,
                                  price: product.price,
                                  image: product.image,
                                  quantity: 1
                                }));

                                // Notify other parts to re-fetch if they want authoritative server state
                                window.dispatchEvent(new Event('cartUpdated'));

                                // Inform parent/search page about add (logged-in)
                                if (typeof onCartUpdate === 'function') {
                                  try { onCartUpdate(product._id, 1); } catch (e) { /* ignore */ }
                                }
                              } catch (err) {
                                console.error('Error adding to cart (logged-in):', err);
                                alert('Failed to add to cart. Please try again.');
                              }
                            } else {
                              // Guest user: local Redux/localStorage
                              dispatch(addToCart({
                                productId: product._id,
                                name: product.name,
                                price: product.price,
                                image: product.image,
                                quantity: 1
                              }));
                              // Notify parent about guest cart change
                              if (typeof onCartChange === 'function') {
                                try {
                                  const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
                                  const count = guestCart.reduce((s, it) => s + it.quantity, 0);
                                  const total = guestCart.reduce((s, it) => s + it.quantity * it.price, 0);
                                  onCartChange(count, total);
                                } catch (e) { /* ignore */ }
                              }
                            }
                          }}
                          disabled={false}
                          className={`bg-blue-50 border-green-600 text-green-600 text-xs font-bold px-4 py-1.5 cursor-pointer rounded hover:bg-blue-100 ${
                          ''
                          }`}
                        >
                          ADD
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="flex items-center space-x-2 cursor-pointer bg-green-600 rounded px-2 py-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={async () => {
                            const token = localStorage.getItem('token');
                              if (quantity === 1) {
                                if (token) {
                                  try {
                                    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/cart/remove/${product._id}`, {
                                      headers: { Authorization: `Bearer ${token}` }
                                    });
                                    dispatch(removeFromCart({ productId: product._id }));
                                    window.dispatchEvent(new Event('cartUpdated'));
                                    if (typeof onCartUpdate === 'function') { try { onCartUpdate(product._id, -1); } catch(e){} }
                                  } catch (err) {
                                    console.error('Error removing item (logged-in):', err);
                                    alert('Failed to remove item.');
                                  }
                                } else {
                                  dispatch(removeFromCart({ productId: product._id }));
                                  if (typeof onCartChange === 'function') {
                                    try {
                                      const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
                                      const count = guestCart.reduce((s, it) => s + it.quantity, 0);
                                      const total = guestCart.reduce((s, it) => s + it.quantity * it.price, 0);
                                      onCartChange(count, total);
                                    } catch (e) {}
                                  }
                                }
                              } else {
                                if (token) {
                                  try {
                                    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/cart/add`, { productId: product._id, quantity: quantity - 1 }, { headers: { Authorization: `Bearer ${token}` } });
                                    dispatch(updateQuantity({ productId: product._id, quantity: quantity - 1 }));
                                    window.dispatchEvent(new Event('cartUpdated'));
                                    if (typeof onCartUpdate === 'function') { try { onCartUpdate(product._id, -1); } catch(e){} }
                                  } catch (err) {
                                    console.error('Error decreasing quantity (logged-in):', err);
                                    alert('Failed to update quantity.');
                                  }
                                } else {
                                  dispatch(updateQuantity({ productId: product._id, quantity: quantity - 1 }));
                                  if (typeof onCartChange === 'function') {
                                    try {
                                      const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
                                      const count = guestCart.reduce((s, it) => s + it.quantity, 0);
                                      const total = guestCart.reduce((s, it) => s + it.quantity * it.price, 0);
                                      onCartChange(count, total);
                                    } catch (e) {}
                                  }
                                }
                              }
                          }}
                          disabled={false}
                          className="text-white cursor-pointer font-size-xs font-bold"
                        >
                          -
                        </button>
                        <div className='h-full w-2'>
                          <span className="text-sm text-white font-medium">{quantity}</span>
                        </div>
                        <button
                          onClick={async () => {
                            const token = localStorage.getItem('token');
                            if (token) {
                              try {
                                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/cart/add`, { productId: product._id, quantity: quantity + 1 }, { headers: { Authorization: `Bearer ${token}` } });
                                dispatch(updateQuantity({ productId: product._id, quantity: quantity + 1 }));
                                window.dispatchEvent(new Event('cartUpdated'));
                                if (typeof onCartUpdate === 'function') { try { onCartUpdate(product._id, 1); } catch(e){} }
                              } catch (err) {
                                console.error('Error increasing quantity (logged-in):', err);
                                alert('Failed to update quantity.');
                              }
                            } else {
                              dispatch(updateQuantity({ productId: product._id, quantity: quantity + 1 }));
                              if (typeof onCartChange === 'function') {
                                try {
                                  const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
                                  const count = guestCart.reduce((s, it) => s + it.quantity, 0);
                                  const total = guestCart.reduce((s, it) => s + it.quantity * it.price, 0);
                                  onCartChange(count, total);
                                } catch (e) {}
                              }
                            }
                          }}
                          disabled={false}
                          className="text-white cursor-pointer font-bold"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductComponent;