// components/NotificationPanel.jsx
import { useEffect, useState } from 'react'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/notifications/order-notifications')
        setNotifications(res.data)
      } catch (err) {
        console.error('Failed to fetch notifications:', err)
      }
    }

    fetchNotifications()
  }, [])

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">🛒 Order Notifications</h2>
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
