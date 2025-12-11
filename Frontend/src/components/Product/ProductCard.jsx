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
  const truncateTitle = (text, max = 24) => {
    if (!text) return "";
    const trimmed = text.trim();
    if (trimmed.length <= max) return trimmed;
    // Prefer cutting at last space before max to avoid mid-word cuts
    const slice = trimmed.slice(0, max);
    const lastSpace = slice.lastIndexOf(" ");
    const base = lastSpace > 12 ? slice.slice(0, lastSpace) : slice; // keep at least ~12 chars before forcing mid-word
    return base + "...";
  };
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
    <div
      className="flex-shrink-0 w-36 md:w-40 rounded-xl overflow-hidden bg-white/70 backdrop-blur-md border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group"
      style={{
        animation: 'pc-fade-in 0.5s ease-out both'
      }}
    >
      {/* Product Image */}
      <div
        className="relative h-32 md:h-36 bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer overflow-hidden rounded-lg m-2"
        onClick={() => navigate(`/product/${product._id}`)}
      >
        {/* Discount Badge */}
        {showDiscount && (
          <div className={`absolute top-2 left-2 z-30 ${getBadgeColorClass()} text-white text-xs font-bold px-2 py-1 rounded`}>
            {product.discount.badgeText || (
              <>
                {product.discount.value}{product.discount.type === 'percentage' ? '%' : '₹'} OFF
              </>
            )}
          </div>
        )}

        {/* Custom Badges */}
        {product.badges && product.badges.length > 0 && (
          <div className="absolute top-2 right-2 z-30 flex flex-col gap-1">
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
        <div className="absolute bottom-2 right-2 z-30 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-semibold text-gray-800">
          {product.deliveryTime || '30 MINS'}
        </div>

        <img
          src={product.image || "/placeholder-product.jpg"}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transform transition-transform duration-500 group-hover:scale-105 z-20"
          onError={(e) => {
            e.target.src = "/placeholder-product.jpg";
          }}
        />

        {/* Decorative gradient glow */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity z-10" />
      </div>

      {/* Product Details */}
      <div className="p-2">
        <h3 className="font-semibold text-xs md:text-sm line-clamp-2 mb-1 text-gray-900 group-hover:text-purple-600 transition-colors">
          {truncateTitle(product?.name || product?.title || "Product")}
        </h3>
        <div className="text-[10px] md:text-[11px] text-gray-500 mb-2">
          {product.weight || "1 pc"}
        </div>

        <div className="flex justify-between items-end gap-2 mb-1.5">
          {/* Price */}
          <div className="flex flex-col">
            <div className="font-extrabold text-xs md:text-sm tracking-wide">₹{discountedPrice.toFixed(2)}</div>
            {showDiscount && (
              <div className="text-[10px] md:text-xs text-gray-400 line-through">
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
              className={`rounded-lg px-2.5 py-1.5 text-white text-[11px] md:text-xs font-bold bg-gradient-to-r from-green-600 to-emerald-600 shadow hover:shadow-md hover:brightness-110 active:scale-95 transition-all ${
                isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {isLoading ? "..." : "ADD"}
            </button>
          ) : (
            <div
              className="flex items-center space-x-2 bg-green-600 rounded-lg px-2 py-1.5 shadow-md"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => handleDecrease()}
                disabled={isLoading}
                className="text-white font-bold text-[11px] md:text-xs hover:scale-110 transition-transform"
              >
                −
              </button>
              <span className="text-[11px] md:text-xs text-white font-medium w-4 text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleIncrease()}
                disabled={isLoading}
                className="text-white font-bold text-[11px] md:text-xs hover:scale-110 transition-transform"
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
