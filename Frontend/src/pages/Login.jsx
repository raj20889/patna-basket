import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Login = () => {
  const [credentials, setCredentials] = useState({ phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials({ ...credentials, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', credentials)

      const token = res.data.token
      const user = res.data.user

      // ✅ Save token and user info
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('role', user.role)

      alert('Login successful!')

      // ✅ Sync guestCart to logged-in user's cart
      const guestCart = JSON.parse(localStorage.getItem('guestCart')) || []

      if (guestCart.length > 0) {
        for (const item of guestCart) {
          await axios.post(
            'http://localhost:5000/api/cart/add',
            {
              productId: item.productId,
              quantity: item.quantity,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          )
        }

        // ✅ Clear guestCart after syncing
        localStorage.removeItem('guestCart')
        console.log("Guest cart synced to user cart.")
      }

      // ✅ Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (user.role === 'delivery') {
        navigate('/delivery/orders')
      } else {
        navigate('/customer/dashboard')
      }

    } catch (err) {
      console.error('Login error:', err)
      alert(err?.response?.data?.msg || 'Login failed. Try again.')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-md">
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={credentials.phone}
            onChange={handleChange}
            autoFocus
            className="w-full border border-gray-300 p-2 rounded"
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        <div className="mt-4 text-center text-sm">
          New to Patna Basket Register ?{' '}
          <button 
            type="button" 
            onClick={() => navigate('/register')}
            className="text-blue-600 hover:underline"
          >
            Register here
          </button>
        </div>
      </form>
    </div>
  )
}

export default Login
