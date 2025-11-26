import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Login = () => {
  const [credentials, setCredentials] = useState({ phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const googleButtonRef = useRef(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials({ ...credentials, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, credentials)

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
            `${import.meta.env.VITE_API_BASE_URL}/cart/add`,
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
        navigate('/Customer/dashboard')
      }

    } catch (err) {
      console.error('Login error:', err)
      alert(err?.response?.data?.msg || 'Login failed. Try again.')
    }

    setLoading(false)
  }

  // Handle Google ID token response from Google Identity Services
  const handleGoogleCredential = async (credentialResponse) => {
    try {
      const idToken = credentialResponse?.credential
      if (!idToken) return

      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/google`, { idToken })

      const token = res.data.token
      const user = res.data.user

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('role', user.role)

      // ✅ Sync guestCart to logged-in user's cart
      const guestCart = JSON.parse(localStorage.getItem('guestCart')) || []

      if (guestCart.length > 0) {
        for (const item of guestCart) {
          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/cart/add`,
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

      // Redirect same as regular login
      if (user.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (user.role === 'delivery') {
        navigate('/delivery/orders')
      } else {
        navigate('/Customer/dashboard')
      }
    } catch (err) {
      console.error('Google login failed', err)
      alert(err?.response?.data?.msg || 'Google login failed')
    }
  }

  // Initialize Google button
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID is not set. Google Sign-In will not be initialized.')
      return
    }

    const tryInit = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredential,
        })

        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, { theme: 'outline', size: 'large' })
        }
      }
    }

    // In case the script hasn't loaded yet, poll briefly
    if (!window.google) {
      const interval = setInterval(() => {
        if (window.google) {
          tryInit()
          clearInterval(interval)
        }
      }, 200)
      return () => clearInterval(interval)
    }

    tryInit()
  }, [])

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

      <div className="mt-6 text-center">
        <div ref={googleButtonRef} />
        {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <div className="mt-3 text-sm text-gray-500">
            Google sign-in is not configured for this environment. To enable it, add
            <code className="mx-1 px-1 bg-gray-100 rounded">VITE_GOOGLE_CLIENT_ID</code> to
            <strong className="mx-1">Frontend/.env.local</strong> and restart the dev server.
          </div>
        )}
      </div>
    </div>
  )
}

export default Login
