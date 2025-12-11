import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DeliveryPromiseBanner.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DeliveryPromiseBanner = () => {
  const [promise, setPromise] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveryPromise = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/delivery-promise`);
        const data = response.data.data || response.data;
        setPromise(data);
      } catch (error) {
        console.error('Failed to fetch delivery promise:', error);
        // Set default
        setPromise({
          deliveryTime: 30,
          deliveryUnit: 'minutes',
          promiseText: 'or FREE',
          backgroundColor: '#00A82D',
          icon: '🚀'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryPromise();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-4 bg-gray-200 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 h-8"></div>
      </div>
    );
  }

  if (!promise) return null;

  return (
    <div
      className="delivery-promise-banner"
      style={{ backgroundColor: promise.backgroundColor }}
    >
      <div className="delivery-promise-content">
        <div className="promise-icon-wrapper">
          <span className="promise-icon">{promise.icon}</span>
          <span className="promise-icon-shadow">{promise.icon}</span>
        </div>
        <div className="promise-text">
          <span className="promise-label">Delivery in</span>
          <span className="promise-time">
            {promise.deliveryTime} {promise.deliveryUnit}
          </span>
          <span className="promise-guarantee">{promise.promiseText}</span>
        </div>
        <div className="promise-shine"></div>
      </div>
    </div>
  );
};

export default DeliveryPromiseBanner;
