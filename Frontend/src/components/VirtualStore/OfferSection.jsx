import React from 'react';
import { Gift, Zap, Tag } from 'lucide-react';

const OfferSection = ({ offers = [] }) => {
  const defaultOffers = [
    {
      id: 1,
      title: 'Buy 1 Get 1',
      description: 'On selected items',
      icon: <Gift className="w-6 h-6" />,
      color: 'bg-pink-100 text-pink-700'
    },
    {
      id: 2,
      title: '₹10 OFF',
      description: 'On orders above ₹50',
      icon: <Tag className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 3,
      title: 'Limited Stock Deal',
      description: 'Today only!'
    }
  ];

  const normalizeOffers = (items) => {
    if (!Array.isArray(items) || items.length === 0) return defaultOffers;
    return items.map((o, idx) => ({
      id: o.id || idx,
      title: o.title || o.name || 'Offer',
      description: o.description || o.details || '',
      color: o.color || 'bg-emerald-50 text-emerald-700',
      icon: o.icon || <Gift className="w-6 h-6" />
    }));
  };

  const displayOffers = normalizeOffers(offers);

  return (
    <div className="bg-white py-4 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <h3 className="text-lg font-bold text-gray-800 mb-3">🎁 Offers & Deals</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {displayOffers.map((offer) => (
            <div
              key={offer.id}
              className={`p-4 rounded-lg border-2 border-dashed ${offer.color} cursor-pointer hover:shadow-md transition-all group`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{offer.icon}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{offer.title}</h4>
                  <p className="text-xs opacity-80">{offer.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OfferSection;
