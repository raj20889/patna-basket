import { useState, useEffect } from 'react';
import { getUsers, updateUser, deleteUser } from '../../api/users';
import AdminNavbar from '../../components/Navbar/AdminNavbar';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';

const CustomerManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    role: 'customer',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const users = await getUsers();
      
      if (!Array.isArray(users)) {
        throw new Error('Invalid data format received from API');
      }
      
      setUsers(users || []);
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUserId(user._id);
    setEditFormData({
      name: user.name || '',
      phone: user.phone || '',
      role: user.role || 'customer',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateUser = async (userId) => {
    if (!userId) return;
    
    try {
      setError('');
      await updateUser(userId, editFormData);
      setEditingUserId(null);
      await fetchUsers();
      setSuccessMessage('User updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Update user error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!userId || !window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setError('');
      await deleteUser(userId);
      await fetchUsers();
      setSuccessMessage('User deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      if (filteredUsers.length % usersPerPage === 1) {
        setCurrentPage(prev => Math.max(1, prev - 1));
      }
    } catch (err) {
      console.error('Delete user error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => {
    if (!user) return false;
    const nameMatch = user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = user.phone?.includes(searchTerm);
    return nameMatch || phoneMatch;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <input
            type="text"
            placeholder="Search by name or phone..."
            className="p-2 border rounded w-full md:w-96"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <button 
            onClick={() => navigate('/admin/users/add')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full md:w-auto"
          >
            Add New User
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white rounded-lg shadow mb-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUserId === user._id ? (
                            <input
                              type="text"
                              name="name"
                              value={editFormData.name}
                              onChange={handleEditChange}
                              className="p-1 border rounded"
                            />
                          ) : (
                            user.name
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUserId === user._id ? (
                            <input
                              type="text"
                              name="phone"
                              value={editFormData.phone}
                              onChange={handleEditChange}
                              className="p-1 border rounded"
                            />
                          ) : (
                            user.phone
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUserId === user._id ? (
                            <select
                              name="role"
                              value={editFormData.role}
                              onChange={handleEditChange}
                              className="p-1 border rounded"
                            >
                              <option value="customer">Customer</option>
                              <option value="admin">Admin</option>
                              <option value="delivery">Delivery</option>
                            </select>
                          ) : (
                            user.role
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                          {editingUserId === user._id ? (
                            <>
                              <button
                                onClick={() => handleUpdateUser(user._id)}
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingUserId(null)}
                                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditClick(user)}
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        {filteredUsers.length === 0 
                          ? 'No users found matching your search' 
                          : 'No users on this page'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="mx-4">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default CustomerManager;