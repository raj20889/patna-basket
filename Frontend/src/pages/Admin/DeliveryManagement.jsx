const DeliveryManagement = () => {
  const deliveries = [
    { id: 'DLV-2001', orderId: 'ORD-1234', carrier: 'FedEx', tracking: '1234567890', status: 'Delivered' },
    { id: 'DLV-2002', orderId: 'ORD-1235', carrier: 'UPS', tracking: '0987654321', status: 'In Transit' },
    { id: 'DLV-2003', orderId: 'ORD-1236', carrier: 'USPS', tracking: '5647382910', status: 'Processing' },
  ]

  const statusColors = {
    Processing: 'bg-yellow-100 text-yellow-800',
    'In Transit': 'bg-blue-100 text-blue-800',
    Delivered: 'bg-green-100 text-green-800',
    'Delivery Failed': 'bg-red-100 text-red-800',
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
            {deliveries.map(delivery => (
              <tr key={delivery.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{delivery.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{delivery.orderId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{delivery.carrier}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{delivery.tracking}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[delivery.status]}`}>
                    {delivery.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-green-600 hover:text-green-900 mr-3">Track</button>
                  <button className="text-blue-600 hover:text-blue-900">Update</button>
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