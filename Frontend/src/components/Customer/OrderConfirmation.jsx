import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    
    if (!storedToken) {
      navigate('/login');
      return;
    }

    // Get orderId from URL params or location state
    const params = new URLSearchParams(window.location.search);
    const urlOrderId = params.get('orderId');
    
    if (urlOrderId) {
      setOrderId(urlOrderId);
    }
    
    setLoading(false);
  }, [navigate]);

  const handleDashboardRedirect = () => {
    navigate('/customer/dashboard');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
        
        <p className="text-gray-600 mb-6">
          Your order has been successfully placed{orderId ? ` (Order ID: ${orderId})` : ''}.
        </p>
        
        <button
          onClick={handleDashboardRedirect}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;