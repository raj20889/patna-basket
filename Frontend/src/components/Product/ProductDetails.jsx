import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, setCart } from '../../redux/cartSlice';
import axios from "axios";
import socket from '../../utils/socket';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [productLoadingStates, setProductLoadingStates] = useState({});

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const token = localStorage.getItem('token');

  const currentProductInCart = cartItems.find(item => item.productId === product?._id);

  const handleAddToCart = async () => {
    if (!product) return;

    setProductLoadingStates(prev => ({ ...prev, [product._id]: true }));
    try {
      if (!token) {
        dispatch(addToCart({
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1
        }));
      } else {
        await axios.post(`${API_BASE_URL}/cart/add`,
          { productId: product._id, quantity: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setProductLoadingStates(prev => ({ ...prev, [product._id]: false }));
    }
  };

  const handleUpdateQuantity = async (newQuantity) => {
    if (!product) return;

    // Prevent adding more than available stock
    if (newQuantity > product.stock) {
      alert(`Only ${product.stock} items are available in stock.`);
      return;
    }

    setProductLoadingStates(prev => ({ ...prev, [product._id]: true }));
    try {
      if (!token) {
        dispatch(addToCart({
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: newQuantity
        }));
      } else {
        await axios.post(`${API_BASE_URL}/cart/add`,
          { productId: product._id, quantity: newQuantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (err) {
      console.error('Error updating cart quantity:', err);
    } finally {
      setProductLoadingStates(prev => ({ ...prev, [product._id]: false }));
    }
  };

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await axios.get(`${API_BASE_URL}/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    }
    fetchProduct();

    const handleCartUpdate = async () => {
      if (token) {
        try {
          const res = await axios.get(`${API_BASE_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const fetchedCartItems = res.data.products.map(item => ({
            productId: item.productId._id,
            name: item.productId.name,
            price: item.productId.price,
            image: item.productId.image,
            quantity: item.quantity
          }));
          dispatch(setCart({ cartItems: fetchedCartItems }));
        } catch (err) {
          console.error("Error fetching cart after update:", err);
        }
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [id, token, dispatch]);

  useEffect(() => {
    // Listen for stock updates
    const handleStockUpdate = (updatedProduct) => {
      if (updatedProduct.productId === product?._id) {
        setProduct((prevProduct) => ({
          ...prevProduct,
          stock: updatedProduct.stock,
        }));
        console.log(`Stock updated for product ${updatedProduct.productId}: ${updatedProduct.stock}`);
      }
    };

    socket.on('stockUpdate', handleStockUpdate);

    return () => {
      socket.off('stockUpdate', handleStockUpdate); // Cleanup listener on unmount
    };
  }, [product?._id]);

  if (!product) return <div className="text-center py-20">Loading....</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8 bg-white shadow-lg rounded-lg">
      {/* Left: Product Image */}
      <div className="md:w-1/2 flex justify-center items-center bg-gray-100 p-4 rounded-lg">
        <img
          src={product.image || "https://via.placeholder.com/400"}
          alt={product.name}
          className="object-contain h-96 w-full rounded-lg"
        />
      </div>

      {/* Right: Product Info */}
      <div className="md:w-1/2 flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          {product.desc && (
            <p className="text-gray-700 mb-4">{product.desc}</p>
          )}

          <div className="text-2xl font-semibold mb-4 text-green-700">
            ₹{product.price.toFixed(2)}
            {product.originalPrice && (
              <span className="text-gray-400 line-through text-lg ml-2">
                ₹{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-gray-500 mb-4">
            {product.category && (
              <span>Category: {Array.isArray(product.category) ? product.category.join(', ') : product.category}</span>
            )}
            {product.subcategory && (
              <span>Subcategory: {Array.isArray(product.subcategory) ? product.subcategory.join(', ') : product.subcategory}</span>
            )}
          </div>

          {/* Stock Information */}
          <div className="text-lg font-medium mb-4">
            Stock Available: {product.stock}
          </div>

          {/* Add to Cart / Out of Stock */}
          <div className="mt-6">
            {product.stock > 0 ? (
              currentProductInCart && currentProductInCart.quantity > 0 ? (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleUpdateQuantity(currentProductInCart.quantity - 1)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={productLoadingStates[product._id]}
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold">
                    {productLoadingStates[product._id] ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                    ) : (
                      currentProductInCart.quantity
                    )}
                  </span>
                  <button
                    onClick={() => handleUpdateQuantity(currentProductInCart.quantity + 1)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={productLoadingStates[product._id]}
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleUpdateQuantity(0)} // Option to remove all from cart
                    className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    disabled={productLoadingStates[product._id]}
                  >
                    Remove All
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={productLoadingStates[product._id]}
                >
                  {productLoadingStates[product._id] ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    "Add to Cart"
                  )}
                </button>
              )
            ) : (
              <div className="text-red-500 font-semibold">Out of Stock</div>
            )}
          </div>

          {/* Static info section */}
          <div className="bg-gray-100 p-4 rounded-lg text-gray-700 space-y-2">
            <p>• 100% Genuine Product</p>
            <p>• Fast Delivery within 1-2 days</p>
            <p>• Return available within 7 days</p>
            <p>• Customer Support: 24/7</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
