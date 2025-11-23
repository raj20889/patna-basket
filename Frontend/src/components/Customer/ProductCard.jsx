import React from "react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({
  product,
  quantity,
  isProductLoading,
  handleAddToCart,
  handleChange,
}) => {
  console.log(`Product ${product._id} isProductLoading: ${isProductLoading}`);
  const navigate = useNavigate();

  return (
    <div className="flex-shrink-0 w-44 border border-slate-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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

        <h3 className="font-medium text-sm line-clamp-2 mb-1">
          {product.name}
        </h3>
        <div className="text-xs text-gray-500 mb-1">
          {product.weight || "1 pc"}
        </div>

        <div className="flex justify-between items-center">
          {/* Price */}
          <div>
            <div className="font-bold text-sm">₹{product.price.toFixed(2)}</div>
            {product.originalPrice && (
              <div className="text-xs text-gray-400 line-through">
                ₹{product.originalPrice.toFixed(2)}
              </div>
            )}
          </div>

          {/* Cart Buttons */}
          {quantity === 0 ? (
            <div className="border-green-600 rounded-md border-[1.5px] mb-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product._id);
                }}
                disabled={isProductLoading}
                className={`bg-blue-50 border-green-600 text-green-600 text-xs font-bold px-4 py-1.5 rounded hover:bg-blue-100 ${
                  isProductLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isProductLoading ? (
                  <div className="h-3 w-8 bg-gray-300 animate-pulse rounded"></div>
                ) : (
                  "ADD"
                )}
              </button>
            </div>
          ) : (
            <div
              className="flex items-center space-x-2 bg-green-600 rounded px-2 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              {isProductLoading ? (
                <>
                  <div className="h-4 w-4 bg-gray-300 animate-pulse rounded"></div>
                  <div className="h-4 w-6 bg-gray-300 animate-pulse rounded"></div>
                  <div className="h-4 w-4 bg-gray-300 animate-pulse rounded"></div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleChange(product._id, -1)}
                    disabled={isProductLoading}
                    className="text-white font-bold"
                  >
                    -
                  </button>
                  <span className="text-sm text-white font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleChange(product._id, 1)}
                    disabled={isProductLoading}
                    className="text-white font-bold"
                  >
                    +
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
