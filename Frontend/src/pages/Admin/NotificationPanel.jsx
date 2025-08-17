// components/NotificationPanel.jsx
import { useEffect, useState } from 'react'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [filterStatus, setFilterStatus] = useState('confirmed'); // Default to 'confirmed'

  const [refreshInterval, setRefreshInterval] = useState(30000); // Default to 30 seconds

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
       const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/notifications/order-notifications?status=${filterStatus}`);
        setNotifications(res.data);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications(); // Initial fetch

    const intervalId = setInterval(fetchNotifications, refreshInterval);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [refreshInterval]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">🛒 Order Notifications</h2>
      <div className="mb-4">
        <label className="inline-flex items-center mr-4">
          <input type="radio" className="form-radio" name="notificationStatus" value="confirmed" checked={filterStatus === 'confirmed'} onChange={() => setFilterStatus('confirmed')} />
          <span className="ml-2">Confirmed</span>
        </label>
        <label className="inline-flex items-center mr-4">
          <input type="radio" className="form-radio" name="notificationStatus" value="pending_payment" checked={filterStatus === 'pending_payment'} onChange={() => setFilterStatus('pending_payment')} />
          <span className="ml-2">Pending Payment</span>
        </label>
        <label className="inline-flex items-center">
          <input type="radio" className="form-radio" name="notificationStatus" value="completed" checked={filterStatus === 'completed'} onChange={() => setFilterStatus('completed')} />
          <span className="ml-2">Completed</span>
        </label>
      </div>
      <div className="space-y-4">
        {notifications.length > 0 ? notifications.map(notification => (
          <div 
            key={notification.id} 
            className="p-4 border-l-4 border-green-500 bg-gray-50"
          >
            <p className="font-medium">{notification.message}</p>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(notification.time), { addSuffix: true })}
            </p>
          </div>
        )) : (
          <p className="text-gray-500">No new order notifications.</p>
        )}
      </div>
    </div>
  )
}

export default NotificationPanel
