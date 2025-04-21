import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import OrderStatusTracker from './OrderStatusTracker';
import axios from 'axios';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  CreditCardIcon,
  BanknotesIcon,
  UserIcon,
  PhoneIcon,
  HomeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success && response.data.order) {
          setOrder(response.data.order);
        } else {
          setError('Order not found or invalid data format');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load order details');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'COD':
        return <BanknotesIcon className="h-5 w-5 text-green-500" />;
      case 'UPI':
      case 'NETBANKING':
        return <CreditCardIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <CreditCardIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatStatusText = (status) => {
    if (!status) return 'Unknown';
    return status.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const calculateSubtotal = () => {
    if (!order?.items) return 0;
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <Link 
          to="/orders" 
          className="inline-flex items-center text-green-600 hover:text-green-800"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">Order not found</p>
          <Link 
            to="/orders" 
            className="mt-4 inline-flex items-center text-green-600 hover:text-green-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          to="/orders" 
          className="inline-flex items-center text-green-600 hover:text-green-800"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Orders
        </Link>
      </div>

       {/* Add the OrderStatusTracker here */}
       <OrderStatusTracker 
  status={order.status} 
  paymentStatus={order.paymentStatus}
  paymentMethod={order.paymentMethod}
/>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Order #{order._id?.substring(0, 8) || order.id?.substring(0, 8)}</h1>
              <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {getStatusIcon(order.status)}
                <span className="ml-2">{formatStatusText(order.status)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shipping Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2 text-gray-500" />
              Shipping Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <UserIcon className="h-5 w-5 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                <p className="text-gray-700">
                  <span className="font-medium">Contact: </span> 
                  {order.address?.addressId?.contactName || 'N/A'}
                </p>
              </div>
              <div className="flex items-start">
                <PhoneIcon className="h-5 w-5 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                <p className="text-gray-700">
                  <span className="font-medium">Phone: </span> 
                  {order.address?.addressId?.contactPhone || 'N/A'}
                </p>
              </div>
              <div className="flex items-start">
                <HomeIcon className="h-5 w-5 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                <p className="text-gray-700">
                  <span className="font-medium">Address: </span> 
                  {order.address?.details ? 
      order.address.details.split(', ')
        .slice(0, -1) // Remove last two parts
        .join(', ') : 
      'N/A'}
                </p>
              </div>
              {order.estimatedDelivery && (
                <p className="text-gray-700">
                  <span className="font-medium">Estimated Delivery: </span> 
                  {formatDate(order.estimatedDelivery)}
                </p>
              )}
              {order.deliveredAt && (
                <p className="text-gray-700">
                  <span className="font-medium">Delivered On: </span> 
                  {formatDate(order.deliveredAt)}
                </p>
              )}
            </div>
          </div>

        {/* Payment Information */}
<div>
  <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>
  <div className="space-y-3">
    <div className="flex items-center">
      <span className="font-medium mr-2">Method:</span>
      <span className="inline-flex items-center">
        {getPaymentMethodIcon(order.paymentMethod)}
        <span className="ml-1">
          {order.paymentMethod?.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
          {order.paymentMethod === 'COD' && (
            <span className="ml-2 text-sm text-gray-500">(Pay at time of delivery)</span>
          )}
        </span>
      </span>
    </div>
    <div className="flex items-center">
      <span className="font-medium mr-2">Status:</span>
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
        order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
      </span>
    </div>
    {order.paymentId && (
      <p className="text-gray-700">
        <span className="font-medium">Transaction ID:</span> {order.paymentId}
      </p>
    )}
  </div>
</div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {order.items?.map((item, index) => (
            <div key={index} className="p-6 flex">
              <div className="flex-shrink-0">
                <img 
                  src={item.image || '/placeholder-product.jpg'} 
                  alt={item.name} 
                  className="h-20 w-20 rounded-md object-cover"
                />
              </div>
              <div className="ml-6 flex-1">
                <div className="flex flex-col md:flex-row md:justify-between">
                  <div>
                    <h3 className="text-md font-medium text-gray-900">{item.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{item.variant}</p>
                    <p className="mt-1 text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <p className="text-md font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} each</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <p className="text-gray-600">Subtotal</p>
              <p className="text-gray-900">₹{calculateSubtotal().toFixed(2)}</p>
            </div>
            {order.deliveryCharge == 0 && (
              <div className="flex justify-between">
                <p className="text-gray-600">Delivery Fee</p>
                <p className="text-gray-900 font-bold">Free</p>
              </div>
            )}
            {order.handlingCharge > 0 && (
              <div className="flex justify-between">
                <p className="text-gray-600">Handling Fee</p>
                <p className="text-gray-900">₹{order.handlingCharge?.toFixed(2)}</p>
              </div>
            )}
            {order.tipAmount > 0 && (
              <div className="flex justify-between">
                <p className="text-gray-600">Tip</p>
                <p className="text-gray-900">₹{order.tipAmount?.toFixed(2)}</p>
              </div>
            )}
            {order.donationAmount > 0 && (
              <div className="flex justify-between">
                <p className="text-gray-600">Donation</p>
                <p className="text-gray-900">₹{order.donationAmount?.toFixed(2)}</p>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-4">
              <p className="text-lg font-medium text-gray-900">Total</p>
              <p className="text-lg font-medium text-gray-900">₹{order.grandTotal?.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Notes */}
      {order.orderNotes && (
        <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Order Notes</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700">{order.orderNotes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;