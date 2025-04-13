import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AddProduct from './pages/AddProduct'
import Login from './pages/Login'
import Register from './pages/Register'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import { CartProvider } from './contexts/CartContext'; // Import the CartProvider

const App = () => {
  return (
    <CartProvider>
    <Router>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/add-product"
          element={
            <PrivateRoute>
              <AddProduct />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
    </CartProvider>
  )
}

export default App
