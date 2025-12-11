import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import useCartLoader from "./hooks/useCartLoader";

// Guest Pages
import Home from "./pages/Guest/Home";
import AddProduct from "./components/Product/AddProduct";
import Login from "./pages/Guest/Login";
import Register from "./pages/Guest/Register";
import SearchResults from "./components/Shared/SearchResultsPage";
import SubcategoryWithProducts from "./components/Product/SubcategoryWithProducts";
import CategoryWithSubcategories from "./components/Product/CategoryWithSubcategories";
import ProductDetails from "./components/Product/ProductDetails";

// Shared Components
import PrivateRoute from "./components/Shared/PrivateRoute";
import CartPage from "./components/Shared/Cart";

// Navbar Components
import CustomerNavbar from "./components/Navbar/CustomerNavbar";
import DeliveryNavbar from "./components/Navbar/DeliveryNavbar";
import AdminNavbar from "./components/Navbar/AdminNavbar";

// Customer Pages
import Dashboard from "./pages/Customer/Dashboard.jsx";

// Customer Components
import Checkout from "./components/Customer/Payment/Checkout";
import Payment from "./components/Customer/Payment/Payment";
import OrderConfirmation from "./components/Customer/Order/OrderConfirmation";
import OrderDetails from "./components/Customer/Order/OrderDetails";
import CustomerOrders from "./components/Customer/Order/CustomerOrders.jsx";
import AddressManager from "./components/Customer/Address/AddressManager";
import AddressForm from "./components/Customer/Address/AddressForm";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboardPage";
import CustomerManager from "./pages/Admin/CustomerManagement";
import OrderManagement from "./pages/Admin/OrderManagement";
import NotificationPanel from "./pages/Admin/NotificationPanel";
import DeliveryManagement from "./pages/Admin/DeliveryManagement";
import ProductManagement from "./pages/Admin/ProductManagement/index";

const App = () => {
  useCartLoader();
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
          <Route path="/:category" element={<CategoryWithSubcategories />} />
          //product details route
          <Route path="/product/:id" element={<ProductDetails />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/product-management"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <ProductManagement />
              </PrivateRoute>
            }
          />

          <Route
            path="admin/add-product"
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
            path='/admin/user-management'
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <>
                  <AdminNavbar />
                  <CustomerManager />
                </>
              </PrivateRoute>
            }
          />

  <Route
            path='/admin/user-management'
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <>
                  <AdminNavbar />
                  <CustomerManager />
                </>
              </PrivateRoute>
            }
          />

<Route
            path='/admin/order-management'
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <>
                
                  <OrderManagement />
                </>
              </PrivateRoute>
            }
          />


          
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <>
                <AdminDashboard />
                 
                </>
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/notification"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <>
                  <AdminNavbar />
                  <NotificationPanel />
                </>
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/delivery-management"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <>
                  <AdminNavbar />
                  <DeliveryManagement />
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
            path="/customer/search"
            element={
              <PrivateRoute allowedRoles={["customer"]}>
                <>
                  <SearchResults />
                </>
              </PrivateRoute>
            }
          />


          //product details route


          <Route
            path="/c/:category"
            element={
              <PrivateRoute allowedRoles={["customer"]}>
                <CategoryWithSubcategories />
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
            path="customer/addresses"
            element={
              <PrivateRoute allowedRoles={["customer"]}>
                <>
                  <AddressManager />
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
                  <OrderConfirmation />
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
