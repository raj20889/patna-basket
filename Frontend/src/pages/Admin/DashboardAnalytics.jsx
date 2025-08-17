import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#FF6384']

const DashboardAnalytics = () => {
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/dashboard`)
      setData(res.data)
    }
    fetchAnalytics()
  }, [])

  if (!data) {
    return <div className="p-6 text-center">Loading dashboard...</div>
  }

  const stats = [
    { name: 'Total Revenue', value: `₹${data.totalRevenue}`, changeType: 'positive' },
    { name: 'Total Orders', value: data.totalOrders },
    { name: 'Today\'s Revenue', value: `₹${data.todayRevenue}` },
    { name: 'Today\'s Orders', value: data.todayOrders },
    { name: 'Total Users', value: data.totalUsers },
    { name: 'Delivered Orders', value: data.orderStatusStats.delivered },
    { name: 'Cancelled Orders', value: data.orderStatusStats.cancelled }
  ]

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">📊 Dashboard Analytics</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow text-center">
            <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Monthly Revenue Line Chart */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">📈 Monthly Revenue</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.monthlyOrders}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#00C49F" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Payment Methods & Top Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">💳 Payment Methods</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.paymentMethodStats}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {data.paymentMethodStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">🔥 Top Products</h3>
          <ul className="space-y-2">
            {data.topProducts.map((prod, i) => (
              <li key={i} className="flex justify-between text-sm border-b py-1">
                <span>{prod._id}</span>
                <span className="font-bold text-gray-700">{prod.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DashboardAnalytics
