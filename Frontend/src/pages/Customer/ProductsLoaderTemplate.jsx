import React from 'react';
import './ProductsLoaderTemplate.css';

const ProductsLoaderTemplate = () => {
  return (
    <div className="shimmer-container">
      {/* Header */}
      <div className="shimmer-header">
        <div className="shimmer-logo"></div>
        <div className="shimmer-account"></div>
      </div>
      
      {/* Delivery Info */}
      <div className="shimmer-delivery-info">
        <div className="shimmer-text medium"></div>
      </div>
      
      {/* Location Search */}
      <div className="shimmer-location-search">
        <div className="shimmer-icon"></div>
        <div className="shimmer-text long"></div>
      </div>
      
      {/* Categories */}
      <div className="shimmer-categories">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="shimmer-category">
            <div className="shimmer-category-icon"></div>
            <div className="shimmer-text short"></div>
          </div>
        ))}
      </div>
      
      {/* Product Sections */}
      {['Dairy & Bread', 'Cold Drinks & Juices', 'Rolling Paper & Tobacco', 'Snacks & Chips', 'Candies & Chocolates'].map((title, index) => (
        <div key={index} className="shimmer-section">
          <div className="shimmer-section-header">
            <div className="shimmer-text long"></div>
            <div className="shimmer-text short"></div>
          </div>
          <div className="shimmer-products">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="shimmer-product">
                <div className="shimmer-product-image"></div>
                <div className="shimmer-product-info">
                  <div className="shimmer-text medium"></div>
                  <div className="shimmer-text short"></div>
                  <div className="shimmer-price"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* All Products Section */}
      <div className="shimmer-section">
        <div className="shimmer-section-header">
          <div className="shimmer-search-bar">
            <div className="shimmer-text long"></div>
            <div className="shimmer-filter">
              <div className="shimmer-text short"></div>
              <div className="shimmer-text short"></div>
            </div>
          </div>
        </div>
        <div className="shimmer-products-grid">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="shimmer-product-card">
              <div className="shimmer-product-image"></div>
              <div className="shimmer-product-details">
                <div className="shimmer-text long"></div>
                <div className="shimmer-text short"></div>
                <div className="shimmer-price"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsLoaderTemplate;