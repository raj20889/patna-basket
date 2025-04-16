import { useNavigate } from 'react-router-dom'

const DeliveryNavbar = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.clear()
    navigate("/login")
  }

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-50">

      <h1 className="text-xl font-bold text-green-600">Patna Basket</h1>

      <div className="space-x-4">
        <span className="text-gray-700">Orders</span>
        <span className="text-yellow-600">Offline</span>
        <button onClick={handleLogout} className="text-red-600 hover:underline">Logout</button>
      </div>
    </nav>
  )
}

export default DeliveryNavbar
