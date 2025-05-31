import axios from 'axios';

const API_URL = 'http://localhost:5000/api/orders';

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

export const searchOrders = async (query) => {
  try {
    const response = await api.get('/search/orders', { params: { q: query } });
    return response.data;
  } catch (error) {
    console.error('Search orders error:', error);
    throw error;
  }
};