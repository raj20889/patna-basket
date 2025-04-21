import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FiShoppingBag, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiTruck, 
  FiDollarSign,
  FiHome 
} from 'react-icons/fi';
import { FaCcVisa, FaCcMastercard, FaCcPaypal, FaCcApplePay } from 'react-icons/fa';
import { BsCash } from 'react-icons/bs';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success && Array.isArray(response.data.orders)) {
          setOrders(response.data.orders);
        } else {
          setError('No orders found');
          setOrders([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return <FiCheckCircle className="text-green-500" />;
      case 'cancelled': return <FiXCircle className="text-red-500" />;
      case 'shipped': return <FiTruck className="text-blue-500" />;
      default: return <FiClock className="text-yellow-500" />;
    }
  };

  const getPaymentIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'visa': return <FaCcVisa className="text-blue-800" />;
      case 'mastercard': return <FaCcMastercard className="text-red-800" />;
      case 'paypal': return <FaCcPaypal className="text-blue-500" />;
      case 'apple pay': return <FaCcApplePay className="text-black" />;
      case 'cod': return <BsCash className="text-green-600" />;
      default: return <FiDollarSign className="text-gray-500" />;
    }
  };

  const filteredOrders = activeFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === activeFilter.toLowerCase());

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <Link 
          to="/customer/dashboard" 
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiHome className="mr-2" />
          Go Home
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your Orders</h1>
        <div className="w-8"></div> {/* Spacer for alignment */}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="flex space-x-2 mt-4 md:mt-0 overflow-x-auto pb-2 w-full md:w-auto">
          {['all', 'pending_payment', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiXCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-gray-500">
            {activeFilter === 'all' 
              ? "You haven't placed any orders yet."
              : `You don't have any ${activeFilter.replace('_', ' ')} orders.`}
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <li key={order._id || order.id}>
                <Link
                  to={`/orders/${order._id || order.id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center">
                        <div className="mr-3 flex-shrink-0">
                          {getStatusIcon(order.status)}
                        </div>
                        <p className="text-sm font-medium text-green-600 truncate">
                          Order #{order._id?.substring(0, 8) || order.id?.substring(0, 8)}
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center text-sm text-gray-500">
                        <span className="hidden sm:inline mr-1">Placed on</span>
                        <time dateTime={order.createdAt}>
                          {formatDate(order.createdAt)}
                        </time>
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <span className="mr-1.5">{getPaymentIcon(order.paymentMethod)}</span>
                          {order.paymentMethod?.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
                        </p>
                        <p className="mt-2 sm:mt-0 sm:ml-6 flex items-center text-sm text-gray-500">
                          <span className="mr-1.5">●</span>
                          {order.items?.length || 0} items
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center">
                        <p className="text-base font-medium text-gray-900">
                          ₹{(order.grandTotal || order.total || 0).toFixed(2)}
                        </p>
                        <span className="ml-1 text-sm text-gray-500">
                          {order.paymentStatus === 'completed' ? '(Paid)' : '(Pending)'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 sm:hidden">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;