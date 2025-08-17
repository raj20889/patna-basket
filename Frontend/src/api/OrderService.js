import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/orders`;
const USER_API_URL = `${import.meta.env.VITE_API_BASE_URL}/user-orders`;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const getOrders = async (params = {}) => {
  try {
    const response = await api.get('/', { params });
    return response.data;
  } catch (error) {
    console.error('Get orders error:', error);
    throw error;
  }
};

export const getUserOrders = async (params = {}) => {
  try {
    const userApi = axios.create({
      baseURL: USER_API_URL,
    });
    userApi.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    const response = await userApi.get('/', { params });
    return response.data;
  } catch (error) {
    console.error('Get user orders error:', error);
    throw error;
  }
};

export const getOrderDetails = async (orderId) => {
  try {
    const response = await api.get(`/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Get order details error:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.put(`/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Update order status error:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (orderId, paymentStatus) => {
  try {
    const response = await api.put(`/${orderId}/payment-status`, { paymentStatus });
    return response.data;
  } catch (error) {
    console.error('Update payment status error:', error);
    throw error;
  }
};

// This function is removed as it's incorrect
/*
export const searchOrders = async (query) => {
  try {
    const response = await api.get('/search/orders', { params: { q: query } });
    return response.data;
  } catch (error) {
    console.error('Search orders error:', error);
    throw error;
  }
};
*/
