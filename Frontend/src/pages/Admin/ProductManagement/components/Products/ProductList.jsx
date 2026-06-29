import React, { useState, useEffect } from 'react';
import DataTable from '../shared/DataTable';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import DeleteProductModal from './DeleteProductModal';
import { tableColumns } from '../../constants';
import { AiOutlinePlus, AiOutlineSearch, AiOutlineDelete } from 'react-icons/ai';

const ProductList = ({ products, loading, onAdd, onUpdate, onDelete, categories, subcategories = [], onSearch, onBulkDelete, onStockUpdate, fetchProducts }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);

  console.log('fetchProducts prop:', fetchProducts); // Debugging log to verify if fetchProducts is passed

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  const handleStockUpdate = (productId, newStock) => {
    if (onStockUpdate) {
      onStockUpdate(productId, newStock);
    }
  };

  const handleAddProduct = async (productData) => {
    if (!fetchProducts) {
      console.error('fetchProducts is not defined');
      return;
    }
    await onAdd(productData);
    await fetchProducts(); // Re-fetch products to update the list
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 relative">
          <AiOutlineSearch className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {selectedProducts.length > 0 && (
            <button
              onClick={() => onBulkDelete(selectedProducts)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <AiOutlineDelete size={20} />
              Delete Selected ({selectedProducts.length})
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <AiOutlinePlus size={20} />
            Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={tableColumns.products}
        data={products.map(product => ({
          ...product,
          category: Array.isArray(product.category) ? product.category.join(', ') : product.category,
          subcategory: Array.isArray(product.subcategory) ? product.subcategory.join(', ') : product.subcategory,
          description: product.description || product.desc || '',
          discount: product.discount && product.discount.isActive
            ? `${product.discount.value}${product.discount.type === 'percentage' ? '%' : '₹'} OFF`
            : 'No Discount',
          badges: product.badges && product.badges.length > 0 ? product.badges.join(', ') : 'None',
          deliveryTime: product.deliveryTime || 'N/A',
          stock: (
            <input
              type="number"
              value={product.stock}
              onChange={(e) => handleStockUpdate(product._id, e.target.value)}
              className="w-20 border border-gray-300 rounded-md p-1 text-center"
            />
          ),
        }))
        }
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        enableSelection={true}
        selectedItems={selectedProducts}
        onSelectionChange={setSelectedProducts}
      />

      {/* Modals */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProduct} // Use the updated handler
        categories={categories}
        subcategories={subcategories}
        loading={loading}
      />

      <EditProductModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        onUpdate={onUpdate}
        product={selectedProduct}
        categories={categories}
        subcategories={subcategories}
        loading={loading}
      />

      <DeleteProductModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        onDelete={onDelete}
        product={selectedProduct}
        loading={loading}
      />
    </div>
  );
};

export default ProductList;
