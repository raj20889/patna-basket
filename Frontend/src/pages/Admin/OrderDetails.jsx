import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrder(response.data.order);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch order details');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return <div className="text-center py-8">Loading order details...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!order) {
    return <div className="text-center py-8">Order not found</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">Order Details - #{order.id.substring(order.id.length - 6).toUpperCase()}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p>{order.userId?.name}</p>
            <p className="text-gray-600">{order.userId?.phone}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Shipping Information</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p>{order.address.details}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-medium text-gray-900 mb-2">Order Items</h3>
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.image && (
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-md" src={item.image} alt={item.name} />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.variant}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Order Notes</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            {order.orderNotes || 'No notes available'}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
          <div className="bg-gray-50 p-4 rounded-md space-y-2">
            <div className="flex justify-between">
              <span>Items Total:</span>
              <span>${order.itemsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge:</span>
              <span>${order.deliveryCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Handling Charge:</span>
              <span>${order.handlingCharge.toFixed(2)}</span>
            </div>
            {order.tipAmount > 0 && (
              <div className="flex justify-between">
                <span>Tip Amount:</span>
                <span>${order.tipAmount.toFixed(2)}</span>
              </div>
            )}
            {order.donationAmount > 0 && (
              <div className="flex justify-between">
                <span>Donation:</span>
                <span>${order.donationAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 my-2"></div>
            <div className="flex justify-between font-medium">
              <span>Grand Total:</span>
              <span>${order.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;