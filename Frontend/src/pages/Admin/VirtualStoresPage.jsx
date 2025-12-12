import React from 'react';
import AdminNavbar from '../../components/Navbar/AdminNavbar';
import VirtualStoresManager from './ProductManagement/components/VirtualStores/VirtualStoresManager';

const VirtualStoresPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <VirtualStoresManager />
      </div>
    </div>
  );
};

export default VirtualStoresPage;
