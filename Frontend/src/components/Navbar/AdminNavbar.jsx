import { Link, useNavigate } from 'react-router-dom'

const AdminNavbar = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.clear()
    navigate("/")
  }

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-green-600">Welcome, Admin 👨‍💼</h1>

      <div className="space-x-4">
        <Link to="/account" className="text-gray-700 hover:text-green-600">Account</Link>
        <Link to="/add-product" className="text-gray-700 hover:text-green-600">Add Product</Link>
        <button onClick={handleLogout} className="text-red-600 hover:underline">Logout</button>
      </div>
    </nav>
  )
}

export default AdminNavbar
