


import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId: paramOrderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingStatus, setTrackingStatus] = useState([]);
  const [token, setToken] = useState(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);
  const [error, setError] = useState(null);

  // Get orderId from multiple possible sources
  const { state = {} } = location;
  const stateOrderId = state?.orderId || null;
  const orderId = paramOrderId || stateOrderId;

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    
    if (storedToken) {
      setToken(storedToken);
      
      if (orderId) {
        fetchOrder(orderId, storedToken);
      } else {
        fetchLatestOrder(storedToken);
      }
    } else {
      navigate('/login');
    }
  }, [location, navigate, orderId]);

  const fetchOrder = async (orderId, authToken) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      // Convert createdAt string to Date object
      const orderData = {
        ...res.data,
        createdAt: new Date(res.data.createdAt)
      };
      
      setOrder(orderData);
      generateTrackingStatus(orderData.status, orderData.createdAt);
      calculateEstimatedDelivery(orderData.createdAt);
    } catch (err) {
      console.error('Order fetch error:', err);
      setError('Failed to load order details');
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestOrder = async (authToken) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          limit: 1,
          sort: '-createdAt'
        }
      });
      
      if (res.data.length > 0) {
        // Convert createdAt string to Date object
        const latestOrder = {
          ...res.data[0],
          createdAt: new Date(res.data[0].createdAt)
        };
        
        setOrder(latestOrder);
        generateTrackingStatus(latestOrder.status, latestOrder.createdAt);
        calculateEstimatedDelivery(latestOrder.createdAt);
      } else {
        setError('No orders found');
        toast.info('No orders found');
        navigate('/');
      }
    } catch (err) {
      console.error('Orders fetch error:', err);
      setError('Failed to load order details');
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const generateTrackingStatus = (currentStatus, createdAt) => {
    const statusFlow = [
      { status: 'pending_payment', label: 'Payment Pending', description: 'Waiting for payment confirmation' },
      { status: 'confirmed', label: 'Order Confirmed', description: 'Your order has been confirmed' },
      { status: 'preparing', label: 'Preparing Order', description: 'Restaurant is preparing your food' },
      { status: 'shipped', label: 'On the Way', description: 'Your order is out for delivery' },
      { status: 'delivered', label: 'Delivered', description: 'Order has been delivered' },
      { status: 'cancelled', label: 'Cancelled', description: 'Order has been cancelled' }
    ];

    const currentIndex = statusFlow.findIndex(s => s.status === currentStatus);
    
    const generatedStatus = statusFlow.map((status, index) => ({
      ...status,
      completed: index < currentIndex,
      current: index === currentIndex,
      date: index <= currentIndex ? 
        new Date(createdAt.getTime() + index * 2 * 60 * 60 * 1000) : 
        null
    }));

    setTrackingStatus(generatedStatus);
  };

  const calculateEstimatedDelivery = (createdAt) => {
    const minDeliveryTime = new Date(createdAt.getTime() + 10 * 60 * 1000);
    const maxDeliveryTime = new Date(createdAt.getTime() + 15 * 60 * 1000);
    
    setEstimatedDelivery({
      min: minDeliveryTime,
      max: maxDeliveryTime
    });
  };

  const handleBackToHome = () => {
    navigate('/customer/dashboard');
  };

  const handleViewOrderDetails = () => {
    if (order?._id) {
      navigate(`/orders/${order._id}`);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 className="mt-3 text-xl font-medium text-gray-900">{error}</h2>
          <p className="mt-2 text-gray-600">
            {error === 'No orders found' 
              ? 'You have not placed any orders yet.' 
              : 'Please try again or contact support if the problem persists.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto">
      {/* Success Message */}
      <div className="text-center mb-10">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">
          {order.paymentMethod === 'COD' ? 'Order Placed Successfully!' : 'Payment Successful!'}
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          {order.paymentMethod === 'COD' ? 
            'Your order has been placed. Pay when your order arrives.' : 
            'Your payment has been processed successfully.'}
        </p>
        <p className="mt-2 text-gray-500">
          Order ID: {order._id}
        </p>
      </div>

      {/* Order Summary Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
        </div>
        
        {/* Order Items */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-medium text-gray-700 mb-4">Items Ordered</h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.unit}</p>
                  <p className="text-gray-700">₹{item.price.toFixed(2)} × {item.quantity}</p>
                </div>
                <div className="font-semibold text-gray-900">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Totals */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="text-gray-900">₹{order.deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-4 pt-2 border-t border-gray-200">
            <span className="text-gray-900">Total</span>
            <span className="text-blue-600">₹{order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">Payment Method</h3>
          <div className="flex items-center">
            {order.paymentMethod === 'COD' ? (
              <>
                <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span>Cash on Delivery (COD)</span>
              </>
            ) : order.paymentMethod === 'CARD' ? (
              <>
                <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
                <span>Credit/Debit Card</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                </svg>
                <span>UPI Payment</span>
              </>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Payment Status: <span className={`font-medium ${
              order.paymentStatus === 'completed' ? 'text-green-600' : 
              order.paymentStatus === 'pending' ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
            </span>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="p-6">
          <h3 className="font-medium text-gray-700 mb-2">Delivery Address</h3>
          <div className="text-gray-600">
            <p className="font-semibold">{order.address.details.split(':')[0]}</p>
            <p>{order.address.details.split(':')[1].trim()}</p>
          </div>
        </div>
      </div>

      {/* Order Tracking */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Order Status</h2>
        </div>
        
        <div className="p-6">
          <div className="relative">
            {/* Timeline */}
            <div className="space-y-4">
              {trackingStatus.map((status, index) => (
                <div key={index} className="flex items-start">
                  {/* Status Icon */}
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    status.completed ? 'bg-green-500' : 
                    status.current ? 'bg-blue-500' : 'bg-gray-300'
                  }`}>
                    {status.completed ? (
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    ) : (
                      <span className="text-xs font-medium text-white">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  
                  {/* Status Content */}
                  <div className={`ml-4 pb-6 ${index !== trackingStatus.length - 1 ? 'border-l border-gray-300' : ''}`}>
                    <div className={`flex flex-col ${index !== trackingStatus.length - 1 ? 'mb-4' : ''}`}>
                      <h3 className={`text-sm font-medium ${
                        status.completed || status.current ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {status.label}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {status.description}
                      </p>
                      {status.date && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(status.date)} at {formatTime(status.date)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Estimate */}
      {estimatedDelivery && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Estimated Delivery</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p className="font-medium text-gray-900">
                  {formatTime(estimatedDelivery.min)} - {formatTime(estimatedDelivery.max)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(estimatedDelivery.min)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Notes */}
      {order.orderNotes && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Order Notes</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700">{order.orderNotes}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleBackToHome}
          className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back to Home
        </button>
        <button
          onClick={handleViewOrderDetails}
          className="flex-1 py-3 px-6 bg-blue-600 rounded-lg font-medium text-white hover:bg-blue-700 transition-colors"
        >
          View Order Details
        </button>
      </div>
    </div>
  </div>
  );
};

export default OrderConfirmation;