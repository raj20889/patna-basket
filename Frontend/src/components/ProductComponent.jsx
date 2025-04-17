import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductComponent = ({ 
  products, 
  cart: propCart, 
  onCartChange,  // Changed from onCartUpdate to onCartChange
  cartUpdated 
}) => {
    const [localCart, setLocalCart] = useState({});
    const [loading, setLoading] = useState({});
    const navigate = useNavigate();

    // Initialize cart from localStorage or fetch from server
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            // Load guest cart
            const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
            const guestCartMap = {};
            guestCart.forEach(item => {
                guestCartMap[item.productId] = item.quantity;
            });
            setLocalCart(guestCartMap);
            calculateAndUpdateCart(guestCart);
        } else {
            // Sync with parent cart prop
            setLocalCart(propCart || {});
        }
    }, [propCart, cartUpdated]);

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
        setLocalCart(prev => ({ ...prev, [productId]: quantity }));
        calculateAndUpdateCart(guestCart);
    };

    const calculateAndUpdateCart = (cartItems) => {
        const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (onCartChange) onCartChange(count, total);  // Changed from onCartUpdate to onCartChange
    };

    const handleChange = async (productId, change) => {
        const token = localStorage.getItem("token");
        const currentQty = localCart[productId] || 0;
        const newQty = currentQty + change;

        if (newQty < 0) return;

        setLoading(prev => ({ ...prev, [productId]: true }));

        try {
            // Optimistic UI update
            setLocalCart(prev => ({ ...prev, [productId]: newQty }));
            
            if (!token) {
                updateGuestCart(productId, newQty);
            } else {
                // Call parent handler to update server and global state
                await onCartChange(productId, change);
            }
        } catch (err) {
            console.error("Error updating cart", err);
            // Revert on error
            setLocalCart(prev => ({ ...prev, [productId]: currentQty }));
        } finally {
            setLoading(prev => ({ ...prev, [productId]: false }));
        }
    };

    const handleAddToCart = (productId) => {
        handleChange(productId, 1);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {products.map(product => {
                const quantity = localCart[product._id] || 0;
                const isLoading = loading[product._id];

                return (
                    <div key={product._id} className="border p-4 rounded shadow-lg hover:shadow-xl transition-shadow">
                        <img 
                            src={product.image || '/placeholder-product.jpg'} 
                            alt={product.name} 
                            className="w-full h-40 object-cover mb-2 rounded"
                            onError={(e) => {
                                e.target.src = '/placeholder-product.jpg';
                            }}
                        />
                        <h2 className="font-bold text-xl">{product.name}</h2>
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                        <p className="text-lg font-semibold mt-2">₹{product.price.toFixed(2)}</p>

                        {quantity === 0 ? (
                            <button
                                onClick={() => handleAddToCart(product._id)}
                                disabled={isLoading}
                                className={`mt-3 w-full py-2 rounded hover:bg-green-700 transition-colors ${
                                    isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white'
                                }`}
                            >
                                {isLoading ? 'Adding...' : 'Add to Cart'}
                            </button>
                        ) : (
                            <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => handleChange(product._id, -1)}
                                        disabled={isLoading}
                                        className={`px-3 py-1 rounded ${
                                            isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'
                                        }`}
                                    >
                                        -
                                    </button>
                                    <span className="font-medium">{quantity}</span>
                                    <button
                                        onClick={() => handleChange(product._id, 1)}
                                        disabled={isLoading}
                                        className={`px-3 py-1 rounded ${
                                            isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'
                                        }`}
                                    >
                                        +
                                    </button>
                                </div>
                                {isLoading && (
                                    <div className="ml-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ProductComponent;