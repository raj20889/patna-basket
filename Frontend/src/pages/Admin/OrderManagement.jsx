import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getOrders, 
  getOrderDetails, 
  updateOrderStatus, 
  updatePaymentStatus
} from '../../api/OrderService';
import ErrorBoundary from '../../components/ErrorBoundary';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: ''
  });
  const ordersPerPage = 10;

  const navigate = useNavigate();

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending_payment', label: 'Pending Payment' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const paymentStatusOptions = [
    { value: '', label: 'All Payment Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' }, // Changed from 'completed' to 'paid'
    { value: 'refunded', label: 'Refunded' }
  ];

  useEffect(() => {
    console.log('useEffect triggered. Current filters:', filters); // Debugging line
    fetchOrders();

    // Debugging log to see what's being sent to the API
    console.log('Filters object when API call is about to be made:', filters);
  }, [currentPage, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching orders with parameters:', { page: currentPage, limit: ordersPerPage, ...filters }); // Debugging line
      const response = await getOrders({
        page: currentPage,
        limit: ordersPerPage,
        ...filters,
      });
      console.log('API Response:', response); // Added for debugging
      setOrders(response.orders || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');
      const cleanedSearchTerm = searchTerm.startsWith('#') ? searchTerm.substring(1) : searchTerm;
      console.log('Searching for:', cleanedSearchTerm); // Add this line for debugging
      const response = await getOrders({
        search: cleanedSearchTerm,
        page: 1,
        limit: ordersPerPage,
        ...filters,
      });
      setOrders(response.orders || []);
      setCurrentPage(1);
    } catch (err) {
      console.error('Search orders error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to search orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      setLoading(true);
      setError('');
      const response = await getOrderDetails(orderId);
      setSelectedOrder(response.order);
    } catch (err) {
      console.error('Get order details error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to get order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setError('');
      await updateOrderStatus(orderId, newStatus);
      await fetchOrders();
      setSuccessMessage('Order status updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Update order status error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update order status');
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      setError('');
      await updatePaymentStatus(orderId, newStatus);
      await fetchOrders();
      setSuccessMessage('Payment status updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Update payment status error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update payment status');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log(`Filter changed: ${name} = ${value}`); // Debugging line
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Order Management</h1>

        {/* Status Messages */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by customer name, phone or order ID..."
                className="p-2 border rounded flex-grow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Search
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="p-2 border rounded"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <select
              name="paymentStatus"
              value={filters.paymentStatus}
              onChange={handleFilterChange}
              className="p-2 border rounded"
            >
              {paymentStatusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}

     
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Orders Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow mb-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order._id.substring(18, 24).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.userId?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.userId?.phone || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(order.grandTotal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="text-sm border rounded p-1"
                          >
                            {statusOptions.filter(opt => opt.value).map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.paymentStatus}
                            onChange={(e) => handlePaymentStatusChange(order._id, e.target.value)}
                            className="text-sm border rounded p-1 capitalize"
                          >
                            {paymentStatusOptions.filter(opt => opt.value).map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(order._id)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/admin/orders/${order._id}`)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {orders.length > 0 && (
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={orders.length < ordersPerPage}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold mb-4">Order Details</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2">Customer Information</h3>
                    <div className="bg-gray-50 p-4 rounded">
                      <p><span className="font-medium">Name:</span> {selectedOrder.userId?.name || 'N/A'}</p>
                      <p><span className="font-medium">Phone:</span> {selectedOrder.userId?.phone || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Delivery Address</h3>
                    <div className="bg-gray-50 p-4 rounded">
                      <p>{selectedOrder.address?.details || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Order Items</h3>
                  <div className="border rounded overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="flex items-center">
                                {item.image && (
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-10 h-10 object-cover rounded mr-2"
                                  />
                                )}
                                <span>{item.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">{item.variant}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(item.price)}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{item.quantity}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Payment Information</h3>
                    <div className="bg-gray-50 p-4 rounded">
                      <p><span className="font-medium">Method:</span> {selectedOrder.paymentMethod}</p>
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          selectedOrder.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                          selectedOrder.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedOrder.paymentStatus}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Order Summary</h3>
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="flex justify-between mb-1">
                        <span>Items Total:</span>
                        <span>{formatCurrency(selectedOrder.itemsTotal)}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Delivery Charge:</span>
                        <span>{formatCurrency(selectedOrder.deliveryCharge)}</span>
                      </div>
                      {selectedOrder.handlingCharge > 0 && (
                        <div className="flex justify-between mb-1">
                          <span>Handling Charge:</span>
                          <span>{formatCurrency(selectedOrder.handlingCharge)}</span>
                        </div>
                      )}
                      {selectedOrder.tipAmount > 0 && (
                        <div className="flex justify-between mb-1">
                          <span>Tip Amount:</span>
                          <span>{formatCurrency(selectedOrder.tipAmount)}</span>
                        </div>
                      )}
                      {selectedOrder.donationAmount > 0 && (
                        <div className="flex justify-between mb-1">
                          <span>Donation:</span>
                          <span>{formatCurrency(selectedOrder.donationAmount)}</span>
                        </div>
                      )}
                      <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                        <span>Grand Total:</span>
                        <span>{formatCurrency(selectedOrder.grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default OrderManagement;