import axios from 'axios';
import { useEffect, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const getOrCreate = (storage, key) => {
  let value = storage.getItem(key);
  if (!value) {
    value = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    storage.setItem(key, value);
  }
  return value;
};

const getDeviceCategory = () => {
  if (window.innerWidth < 768) return 'mobile';
  if (window.innerWidth < 1024) return 'tablet';
  return 'desktop';
};

const getBrowser = () => {
  const agent = navigator.userAgent;
  if (agent.includes('Edg')) return 'Edge';
  if (agent.includes('Chrome')) return 'Chrome';
  if (agent.includes('Firefox')) return 'Firefox';
  if (agent.includes('Safari')) return 'Safari';
  return 'Other';
};

const sentKeys = new Set();

export const trackProductEvent = async ({
  eventType,
  product,
  eventSource = 'homepage',
  searchQuery,
  categoryContext,
  quantity,
  orderId,
  dedupeKey
}) => {
  if (!product?._id || !eventType) return;
  const key = dedupeKey || `${eventType}:${product._id}`;
  if (dedupeKey && sentKeys.has(key)) return;
  if (dedupeKey) sentKeys.add(key);

  try {
    await axios.post(`${API_BASE_URL}/analytics/events`, {
      eventType,
      productId: product._id,
      anonymousId: getOrCreate(localStorage, 'pb_anonymous_id'),
      sessionId: getOrCreate(sessionStorage, 'pb_session_id'),
      eventId: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      eventSource,
      searchQuery,
      categoryContext,
      quantity,
      orderId,
      deviceCategory: getDeviceCategory(),
      browser: getBrowser(),
      referrer: document.referrer || undefined
    }, { headers: localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : undefined });
  } catch (error) {
    // Analytics must never block shopping interactions.
    console.warn('Product analytics event failed:', error.message);
  }
};

export const useProductImpression = (product, eventSource = 'homepage', context = {}) => {
  const { searchQuery, categoryContext } = context;
  const elementRef = useRef(null);
  useEffect(() => {
    if (!elementRef.current || !product?._id) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        trackProductEvent({ eventType: 'PRODUCT_IMPRESSION', product, eventSource, searchQuery, categoryContext });
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [product, eventSource, searchQuery, categoryContext]);
  return elementRef;
};