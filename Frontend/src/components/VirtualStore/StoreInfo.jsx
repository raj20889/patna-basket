import React, { useState } from 'react';
import { MapPin, Clock, Phone, AlertCircle, Check } from 'lucide-react';

const StoreInfo = ({ store = {} }) => {
  const {
    address = '123 Main St, Patna 800001',
    phone = '+91 9876543210',
    openingHours = '9:00 AM - 10:00 PM',
    closedDays = 'Closed on Mondays',
    distance = '2.3 km',
    deliveryTime = '30-45 mins',
    isOpen = true,
    facilities = ['Free Parking', 'WiFi Available', 'Rest Area', 'ATM'],
    about = 'Premium grocery store with fresh produce, quality products, and excellent customer service.'
  } = store;

  return (
    <div className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        {/* About Store */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">ℹ️ About Store</h2>
          <p className="text-gray-700 leading-relaxed">{about}</p>
        </div>

        {/* Store Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Location */}
            <div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Location</h3>
                  <p className="text-gray-600">{address}</p>
                  <p className="text-sm text-gray-500 mt-1">Distance: {distance}</p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Store Hours</h3>
                  <p className="text-gray-600">{openingHours}</p>
                  <p className="text-sm text-gray-500 mt-1">{closedDays}</p>
                  <div className={`mt-2 flex items-center gap-2 ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-600' : 'bg-red-600'}`}></div>
                    <span className="text-sm font-medium">{isOpen ? 'Open Now' : 'Closed'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Contact</h3>
                  <p className="text-gray-600">{phone}</p>
                  <button className="mt-2 text-sm text-blue-600 font-semibold hover:text-blue-700">
                    Call Store
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Delivery Info */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Delivery</h3>
                  <p className="text-gray-600">Expected: {deliveryTime}</p>
                  <p className="text-xs text-gray-500 mt-1">Delivery charges apply based on location</p>
                </div>
              </div>
            </div>

            {/* Facilities */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Store Facilities</h3>
              <div className="grid grid-cols-2 gap-2">
                {facilities.map((facility, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{facility}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Store Policies */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Important Information</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Products are subject to availability at the store</li>
                <li>• Prices may vary based on bulk orders</li>
                <li>• Return policy: 24 hours from delivery</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreInfo;
