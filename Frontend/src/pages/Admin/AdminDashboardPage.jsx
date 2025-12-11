import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/Navbar/AdminNavbar';
import NotificationPanel from './NotificationPanel';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Product Management', route: '/admin/product-management' },
    { name: 'User Management', route: '/admin/user-management' },
    { name: 'Order Management', route: '/admin/order-management' },
    { name: 'Invoice & Transaction', route: '/admin/transaction-management' },
    { name: 'Delivery Management', route: '/admin/delivery-management' },
    { name: 'Notification Banner', route: '/admin/notification' },
  ];

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold text-green-700 mb-8">Patna Basket Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {navItems.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.route)}
              className="cursor-pointer p-6 bg-white shadow hover:shadow-md rounded-2xl border border-gray-200 transition transform hover:scale-[1.02]"
            >
              <h2 className="text-xl font-semibold text-gray-800">{item.name}</h2>
              <p className="mt-2 text-sm text-gray-500">Manage {item.name.toLowerCase()} here</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
