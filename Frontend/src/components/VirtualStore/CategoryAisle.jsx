import React, { useState } from 'react';
import ShelfRow from './ShelfRow';

const CategoryAisle = ({ category = {}, products = [] }) => {
  const {
    name = 'Category',
    icon = '🏪',
    description = '',
    color = 'bg-purple-50'
  } = category;

  const categoryProducts = products.slice(0, 12);

  return (
    <div className={`py-6 border-b border-gray-100 ${color}`}>
      <div className="container mx-auto px-4">
        {/* Category Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="text-3xl">{icon}</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </div>
          <button className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white rounded-lg transition-colors">
            View All →
          </button>
        </div>

        {/* Shelf Display */}
        <ShelfRow products={categoryProducts} showTitle={false} />
      </div>
    </div>
  );
};

export default CategoryAisle;
