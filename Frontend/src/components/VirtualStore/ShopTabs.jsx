import React from 'react';

const ShopTabs = ({ tabs = [], activeTab, onTabChange }) => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-56 z-20">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-green-100 text-green-700 border-2 border-green-500'
                  : 'text-gray-700 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              {tab.icon && <span className="mr-1">{tab.icon}</span>}
              {tab.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopTabs;
