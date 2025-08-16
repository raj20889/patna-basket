import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const DeliveryManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [currentCarrier, setCurrentCarrier] = useState('');
  const [currentTrackingNumber, setCurrentTrackingNumber] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrders(response.data.orders);
    } catch (err) {
      setError('Error fetching orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDeliveryDetails = useCallback(async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/orders/${orderId}/delivery-details`, 
        { carrier: currentCarrier, trackingNumber: currentTrackingNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingOrderId(null);
      fetchOrders(); // Re-fetch orders to get the updated data
    } catch (err) {
      console.error('Error updating delivery details:', err);
      alert('Failed to update delivery details.');
    }
  }, [currentCarrier, currentTrackingNumber, fetchOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleEditClick = (order) => {
    setEditingOrderId(order._id);
    setCurrentCarrier(order.carrier || '');
    setCurrentTrackingNumber(order.trackingNumber || '');
  };

  const statusColors = {
    pending_payment: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-green-100 text-green-800',
    delivered: 'bg-teal-100 text-teal-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return <div className="bg-white p-6 rounded-lg shadow">Loading deliveries...</div>;
  }

  if (error) {
    return <div className="bg-white p-6 rounded-lg shadow text-red-600">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">Delivery Management</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carrier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map(order => (
              <tr key={order._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">DLV-{order._id.slice(-4).toUpperCase()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">ORD-{order._id.slice(-4).toUpperCase()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingOrderId === order._id ? (
                    <input
                      type="text"
                      value={currentCarrier}
                      onChange={(e) => setCurrentCarrier(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  ) : (
                    order.carrier || 'N/A'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingOrderId === order._id ? (
                    <input
                      type="text"
                      value={currentTrackingNumber}
                      onChange={(e) => setCurrentTrackingNumber(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  ) : (
                    order.trackingNumber || 'N/A'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                    {order.status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {editingOrderId === order._id ? (
                    <button 
                      onClick={() => updateDeliveryDetails(order._id)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      Save
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleEditClick(order)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                  )}
                  <button className="text-red-600 hover:text-red-900">Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DeliveryManagement