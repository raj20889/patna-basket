import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../../redux/cartSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = React.useState(false);
  const cartItem = useSelector((state) =>
    state.cart.items.find((item) => item.productId === product._id)
  );
  const quantity = cartItem ? cartItem.quantity : 0;
  const token = localStorage.getItem("token");

  const syncToServer = async (newQuantity) => {
    if (!token) return; // Guest users don't need server sync
    
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/cart/add`,
        { productId: product._id, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error("Error syncing cart to server:", error);
    }
  };

  const handleAddToCart = async () => {
    setIsLoading(true);
    dispatch(addToCart({ 
      productId: product._id, 
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1 
    }));
    await syncToServer(1);
    setTimeout(() => setIsLoading(false), 100);
  };

  const handleIncrease = async () => {
    setIsLoading(true);
    const newQuantity = quantity + 1;
    dispatch(addToCart({ 
      productId: product._id, 
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: newQuantity 
    }));
    await syncToServer(newQuantity);
    setTimeout(() => setIsLoading(false), 100);
  };

  const handleDecrease = async () => {
    if (quantity > 1) {
      setIsLoading(true);
      const newQuantity = quantity - 1;
      dispatch(addToCart({ 
        productId: product._id, 
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: newQuantity 
      }));
      await syncToServer(newQuantity);
      setTimeout(() => setIsLoading(false), 100);
    } else {
      dispatch(removeFromCart({ productId: product._id }));
      if (token) {
        try {
          await axios.delete(
            `${import.meta.env.VITE_API_BASE_URL}/cart/remove/${product._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
          console.error("Error removing from server cart:", error);
        }
      }
    }
  };

  const navigate = useNavigate();

  // Calculate discounted price
  const getDiscountedPrice = () => {
    if (!product.discount || !product.discount.isActive) {
      return product.price;
    }
    
    if (product.discount.type === 'percentage') {
      return product.price * (1 - product.discount.value / 100);
    } else if (product.discount.type === 'flat') {
      return product.price - product.discount.value;
    }
    return product.price;
  };

  const discountedPrice = getDiscountedPrice();
  const showDiscount = product.discount?.isActive && product.discount?.value > 0;

  // Get badge color class
  const getBadgeColorClass = () => {
    const colorMap = {
      'red': 'bg-red-500',
      'orange': 'bg-orange-500',
      'green': 'bg-green-500',
      'blue': 'bg-blue-500'
    };
    return colorMap[product.discount?.badgeColor] || 'bg-red-500';
  };

  return (
    <div className="flex-shrink-0 w-44 border border-slate-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div
        className="relative h-40 bg-gray-100 flex items-center justify-center p-2 cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={() => navigate(`/product/${product._id}`)}
      >
        {/* Discount Badge */}
        {showDiscount && (
          <div className={`absolute top-2 left-2 ${getBadgeColorClass()} text-white text-xs font-bold px-2 py-1 rounded`}>
            {product.discount.badgeText || (
              <>
                {product.discount.value}{product.discount.type === 'percentage' ? '%' : '₹'} OFF
              </>
            )}
          </div>
        )}

        {/* Custom Badges */}
        {product.badges && product.badges.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {product.badges.slice(0, 2).map((badge, idx) => (
              <span
                key={idx}
                className="bg-yellow-400 text-xs font-bold px-2 py-1 rounded text-black"
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Delivery Time Badge */}
        <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-semibold text-gray-800">
          {product.deliveryTime || '30 MINS'}
        </div>

        <img
          src={product.image || "/placeholder-product.jpg"}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain"
          onError={(e) => {
            e.target.src = "/placeholder-product.jpg";
          }}
        />
      </div>

      {/* Product Details */}
      <div className="p-2">
        <h3 className="font-medium text-sm line-clamp-2 mb-1">
          {product.name}
        </h3>
        <div className="text-xs text-gray-500 mb-1">
          {product.weight || "1 pc"}
        </div>

        <div className="flex justify-between items-start gap-2 mb-2">
          {/* Price */}
          <div>
            <div className="font-bold text-sm">₹{discountedPrice.toFixed(2)}</div>
            {showDiscount && (
              <div className="text-xs text-gray-400 line-through">
                ₹{product.price.toFixed(2)}
              </div>
            )}
          </div>

          {/* Cart Buttons */}
          {quantity === 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={isLoading}
              className={`border border-green-600 rounded px-3 py-1 text-green-600 text-xs font-bold hover:bg-green-50 transition-colors ${
                isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {isLoading ? "..." : "ADD"}
            </button>
          ) : (
            <div
              className="flex items-center space-x-1 bg-green-600 rounded px-2 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => handleDecrease()}
                disabled={isLoading}
                className="text-white font-bold text-xs"
              >
                −
              </button>
              <span className="text-xs text-white font-medium w-4 text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleIncrease()}
                disabled={isLoading}
                className="text-white font-bold text-xs"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
