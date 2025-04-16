import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const RelatedProducts = ({ products, onCartUpdate, cart: parentCart, loading: parentLoading }) => {
  const navigate = useNavigate();
  const [localCart, setLocalCart] = useState({});
  const [localLoading, setLocalLoading] = useState({});

  // Sync with parent cart state
  useEffect(() => {
    if (parentCart) {
      setLocalCart(parentCart);
    }
  }, [parentCart]);

  useEffect(() => {
    if (parentLoading) {
      setLocalLoading(parentLoading);
    }
  }, [parentLoading]);

  const handleChange = async (productId, change) => {
    const currentQty = localCart[productId] || 0;
    const newQty = currentQty + change;

    if (newQty < 0) return;

    setLocalLoading(prev => ({ ...prev, [productId]: true }));
    setLocalCart(prev => ({ ...prev, [productId]: newQty }));

    try {
      updateGuestCart(productId, newQty);
    } catch (err) {
      console.error("Error updating cart", err);
      // Revert UI if error occurs
      setLocalCart(prev => ({ ...prev, [productId]: currentQty }));
    } finally {
      setLocalLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const updateGuestCart = (productId, quantity) => {
    let guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
    const product = products.find(p => p._id === productId);
    
    if (!product) return;

    const index = guestCart.findIndex(item => item.productId === productId);

    if (index > -1) {
      if (quantity > 0) {
        guestCart[index].quantity = quantity;
      } else {
        guestCart.splice(index, 1);
      }
    } else if (quantity > 0) {
      guestCart.push({
        productId,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
      });
    }

    localStorage.setItem("guestCart", JSON.stringify(guestCart));
    calculateAndUpdateCart(guestCart);
  };

  const calculateAndUpdateCart = (cartItems) => {
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    onCartUpdate(count, total);
  };

  const handleAddToCart = (productId) => {
    handleChange(productId, 1);
  };

  // Filter dairy-related products
  const dairyProducts = products.filter(product => {
    const lowerName = product.name.toLowerCase();
    return lowerName.includes('milk') || 
           lowerName.includes('bread') || 
           lowerName.includes('egg');
  });

  if (dairyProducts.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Dairy &amp; Bread</h2>
        <button 
          className="text-blue-500 text-sm font-medium"
          onClick={() => navigate('/category/dairy')}
        >
          See all
        </button>
      </div>
      
      <div className="relative">
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {dairyProducts.map(product => {
            const quantity = localCart[product._id] || 0;
            const isLoading = localLoading[product._id];

            return (
              <div 
                key={product._id} 
                className="flex-shrink-0 w-44 border-[1px] border-slate-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
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
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
                
                {/* Product Details */}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product._id);
                        }}
                        disabled={isLoading}
                        className={`bg-blue-50 border-green-600 text-green-600 text-xs font-bold px-4 py-1.5  cursor-pointer  rounded hover:bg-blue-100 ${
                          isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isLoading ? '...' : 'ADD'}
                      </button>
                      </div>
                    ) : (
                      <div 
                        className="flex items-center space-x-2 cursor-pointer  bg-green-600 rounded px-2 py-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleChange(product._id, -1)}
                          disabled={isLoading}
                          className="text-white cursor-pointer font-size- xs font-bold"
                        >
                          -
                        </button>
                        <div  className='h-full w-2'>
                        <span className="text-sm text-white font-medium">{quantity}</span>
                        </div>
                        <button
                          onClick={() => handleChange(product._id, 1)}
                          disabled={isLoading}
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
        
        {/* Navigation Arrows */}
        {dairyProducts.length > 4 && (
          <>
            <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100">
              <FiChevronLeft size={20} />
            </button>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100">
              <FiChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RelatedProducts;