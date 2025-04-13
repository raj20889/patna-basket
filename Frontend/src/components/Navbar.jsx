import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"))
    setUser(storedUser)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    setUser(null)
    navigate("/login")
  }

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-green-600">Patna Basket</h1>
      
      <div className="space-x-4">
        <Link to="/" className="text-gray-700 hover:text-green-600">Home</Link>

        {/* ✅ Only Admin can see Add Product */}
        {user?.role === "admin" && (
          <Link to="/add-product" className="text-gray-700 hover:text-green-600">
            Add Product
          </Link>
        )}

        {/* ✅ Show Logout if Logged In */}
        {user ? (
          <button
            onClick={handleLogout}
            className="text-red-600 hover:underline"
          >
            Logout
          </button>
        ) : (
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar
