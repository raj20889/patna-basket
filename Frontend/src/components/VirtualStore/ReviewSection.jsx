import React, { useState } from 'react';
import { Star, MessageCircle } from 'lucide-react';

const ReviewSection = ({ storeId, reviews = [], storeRating = 4.5 }) => {
  const defaultReviews = [
    {
      id: 1,
      author: 'Raj Kumar',
      rating: 5,
      date: '2 days ago',
      text: 'Excellent quality products and very fast delivery! Will definitely order again.',
      verified: true
    },
    {
      id: 2,
      author: 'Priya Singh',
      rating: 4,
      date: '1 week ago',
      text: 'Good variety of products. Delivery was on time.',
      verified: true
    },
    {
      id: 3,
      author: 'Amit Patel',
      rating: 5,
      date: '2 weeks ago',
      text: 'Amazing experience! Fresh products and friendly staff.',
      verified: true
    }
  ];

  const displayReviews = reviews.length > 0 ? reviews : defaultReviews;

  return (
    <div className="bg-gray-50 py-8 border-t border-gray-200">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">⭐ Customer Reviews</h2>

          {/* Rating Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-800">{storeRating}</div>
                <div className="flex gap-1 mt-2 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(storeRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">Based on {displayReviews.length} reviews</p>
              </div>

              <div className="flex-1">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-sm font-medium w-8">{stars}⭐</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${
                              (displayReviews.filter((r) => r.rating === stars).length /
                                displayReviews.length) *
                              100
                            }%`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Author Info */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-800">{review.author}</h4>
                    {review.verified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{review.date}</p>
                </div>

                {/* Rating */}
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <p className="text-sm text-gray-700 leading-relaxed">{review.text}</p>

              {/* Action */}
              <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                Reply
              </button>
            </div>
          ))}
        </div>

        {/* Write Review Button */}
        <div className="mt-8 text-center">
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
            Write a Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;
