import React from 'react';
import { Star, MapPin, Clock, X } from 'lucide-react';

const ShopHeader = ({ store, onClose }) => {
  const banner = store?.storeBanner || store?.bannerImage;
  const icon = store?.storeIcon || store?.icon;
  const name = store?.storeName || store?.name || 'Virtual Store';
  const rating = store?.rating || store?.averageRating || 4.7;
  const description = store?.storeDescription || store?.description;
  const tags = store?.tags || [];
  const deliveryTime = store?.deliveryTime || '15-25';
  const distance = store?.distance || 'Nearby';
  const isOpen = store?.isActive !== false;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
      {/* Banner Image */}
      <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
        {banner ? (
          <img
            src={banner}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : null}
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 rounded-full p-2 hover:bg-white shadow-lg transition-all"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </div>

      {/* Store Info Card */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-start gap-4">
          {/* Store Logo/Icon */}
          {icon && (
            <div className="text-5xl flex-shrink-0">
              {icon}
            </div>
          )}

          <div className="flex-1">
            {/* Store Name & Rating */}
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
              <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-semibold text-yellow-700">
                  {rating}
                </span>
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {tags.slice(0, 4).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Delivery Time, Distance, Status */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-600">
                  {deliveryTime} mins
                </span>
              </div>

              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{distance} km</span>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {isOpen ? '🟢 Open' : '🔴 Closed'}
              </span>
            </div>

            {/* Store Description */}
            {description && (
              <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                {description}
              </p>
            )}

            {/* Famous For */}
            {store?.famousFor && store.famousFor.length > 0 && (
              <div className="mt-2 text-xs text-gray-700">
                <span className="font-semibold">Famous for: </span>
                {store.famousFor.join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopHeader;
