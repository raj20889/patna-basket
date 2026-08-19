import React, { useState } from 'react';
import DataTable from '../shared/DataTable';
import AddProductModal from './AddProductModal';
import BulkAddProductsModal from './BulkAddProductsModal';
import EditProductModal from './EditProductModal';
import DeleteProductModal from './DeleteProductModal';
import { tableColumns } from '../../constants';
import { AiOutlinePlus, AiOutlineSearch, AiOutlineDelete, AiOutlineImport } from 'react-icons/ai';

const ProductList = ({ products, loading, onAdd, onUpdate, onDelete, onBulkAdd, categories, subcategories = [], onSearch, onBulkDelete, onDeleteAll, onStockUpdate, fetchProducts, pagination }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);

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
    setSelectedProducts([]);
  };

  const handlePageChange = async (nextPage) => {
    if (!fetchProducts || loading) return;
    if (nextPage < 1 || nextPage > (pagination?.totalPages || 1)) return;
    setSelectedProducts([]);
    await fetchProducts(nextPage, searchTerm);
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

  const handleBulkAddProducts = async (productDataList) => {
    if (!fetchProducts) {
      console.error('fetchProducts is not defined');
      return;
    }
    const result = await onBulkAdd(productDataList);
    await fetchProducts();
    return result;
  };

  const handleDeleteAllProducts = async () => {
    const totalProducts = pagination?.totalProducts || products.length;
    if (!totalProducts) return;
    if (!window.confirm(`Delete all ${totalProducts} product(s)? This action cannot be undone.`)) return;
    await onDeleteAll();
    setSelectedProducts([]);
    await fetchProducts();
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
          {products.length > 0 && (
            <button
              onClick={handleDeleteAllProducts}
              className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition"
            >
              <AiOutlineDelete size={20} />
              Delete All ({products.length})
            </button>
          )}
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
            onClick={() => setShowBulkAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <AiOutlineImport size={20} />
            Bulk Add
          </button>
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
          image: product.image ? (
            <img
              src={product.image}
              alt={product.name || 'Product'}
              className="h-12 w-12 rounded object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const nextSibling = e.currentTarget.nextElementSibling;
                if (nextSibling) {
                  nextSibling.style.display = 'flex';
                }
              }}
            />
          ) : null,
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
        overrideRender={(key, row) => {
          if (key === 'image') {
            return row.image ? (
              <div className="relative h-12 w-12">
                {row.image}
                <div className="absolute inset-0 hidden items-center justify-center rounded bg-gray-100 text-[10px] text-gray-500">
                  No Image
                </div>
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-[10px] text-gray-500">
                No Image
              </div>
            );
          }
          return null;
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        enableSelection={true}
        selectedItems={selectedProducts}
        onSelectionChange={setSelectedProducts}
      />

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          Showing {products.length} of {pagination?.totalProducts || products.length} products
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange((pagination?.currentPage || 1) - 1)}
            disabled={loading || (pagination?.currentPage || 1) <= 1}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-gray-700">
            Page {pagination?.currentPage || 1} of {pagination?.totalPages || 1}
          </span>
          <button
            onClick={() => handlePageChange((pagination?.currentPage || 1) + 1)}
            disabled={loading || (pagination?.currentPage || 1) >= (pagination?.totalPages || 1)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProduct} // Use the updated handler
        categories={categories}
        subcategories={subcategories}
        loading={loading}
      />

      <BulkAddProductsModal
        isOpen={showBulkAddModal}
        onClose={() => setShowBulkAddModal(false)}
        onBulkAdd={handleBulkAddProducts}
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
