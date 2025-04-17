import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from './contexts/CartContext';

import Home from "./pages/Home";
import AddProduct from "./pages/AddProduct";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import CustomerNavbar from "./components/Navbar/CustomerNavbar";
import DeliveryNavbar from "./components/Navbar/DeliveryNavbar";
import AdminNavbar from "./components/Navbar/AdminNavbar";
import Dashboard from "./pages/customer/dashboard";
import CartPage from "./components/Cart";
import SearchResults from "./components/SearchResultsPage";
import SubcategoryWithProducts from "./components/SubcategoryWithProducts";
import CustomerSubCategory from "./components/Customer/SubcategoryWithProducts";
import Checkout from "./components/Customer/Checkout";
import Payment from "./components/Customer/Payment";
import OrderConfirmation from "./components/Customer/OrderConfirmation";
import OrderDetails from "./components/Customer/orders";
import CustomerOrders from "./components/Customer/CustomerOrders.JSX";

const App = () => {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/:category" element={<SubcategoryWithProducts />} />
          

          {/* Protected Admin Routes */}
          <Route
            path="/add-product"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <>
                  <AdminNavbar />
                  <AddProduct />
                </>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <>
                  <AdminNavbar />
                  <h1 className="p-4 text-2xl">Welcome Admin!</h1>
                </>
              </PrivateRoute>
            }
          />

          {/* Protected Customer Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <PrivateRoute allowedRoles={["customer"]}>
                <>
                
                  <Dashboard />
                </>
              </PrivateRoute>
            }
          />

          <Route
            path="/c/:category"
            element={
              <PrivateRoute allowedRoles={["customer"]}>
                <>
                
                  <CustomerSubCategory />
                </>
              </PrivateRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <PrivateRoute allowedRoles={["customer"]}>
                <>
               
                  <Checkout />
                </>
              </PrivateRoute>
            }
          />

          <Route
            path="/payment"
            element={
              <PrivateRoute allowedRoles={["customer"]}>
                <>
                  <CustomerNavbar />
                  <Payment />
                </>
              </PrivateRoute>
            }
          />

<Route
            path="/order-confirmation"
            element={
              <PrivateRoute allowedRoles={["customer"]}>
                <>
               
                  < OrderConfirmation />
                </>
              </PrivateRoute>
            }
          />

  {/* Order Details Route */}
  <Route
        path="/orders/:orderId"
        element={
          <PrivateRoute allowedRoles={["customer"]}>
            <OrderDetails />
          </PrivateRoute>
        }
      />

<Route
  path="/orders"
  element={
    <PrivateRoute allowedRoles={["customer"]}>
      <CustomerOrders />
    </PrivateRoute>
  }
/>
          {/* Protected Delivery Route */}
          <Route
            path="/delivery/orders"
            element={
              <PrivateRoute allowedRoles={["delivery"]}>
                <>
                  <DeliveryNavbar />
                  <h1 className="p-4 text-2xl">Delivery Orders Page</h1>
                </>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </CartProvider>
  );
};

export default App;