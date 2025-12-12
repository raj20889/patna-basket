import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../../components/Navbar/AdminNavbar';
import ProductList from './components/Products/ProductList';
import CategoryList from './components/Categories/CategoryList';
import SubcategoryList from './components/Subcategories/SubcategoryList';
import HomeSectionManagement from './HomeSectionManagement';
import BannerManagement from './BannerManagement';
import QuickSearchManager from './components/QuickSearch/QuickSearchManager';
import { useProducts } from './hooks/useProducts';
import { useCategories } from './hooks/useCategories';
import { useSubcategories } from './hooks/useSubcategories';

const ProductManagement = () => {
  const [activeTab, setActiveTab] = useState('products');

  // Products hook
  const {
    products,
    loading: productsLoading,
    error: productsError,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    searchProducts,
  } = useProducts();

  // Categories hook
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    bulkDeleteCategories,
  } = useCategories();

  // Subcategories hook
  const {
    subcategories,
    loading: subcategoriesLoading,
    error: subcategoriesError,
    fetchSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    bulkDeleteSubcategories,
  } = useSubcategories();

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchProducts();
        await fetchCategories();
        await fetchSubcategories();
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    loadData();
  }, []);

  return (
    <div>
      <AdminNavbar />

      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Product Management</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'categories'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('subcategories')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'subcategories'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Subcategories ({subcategories.length})
          </button>
          <button
            onClick={() => setActiveTab('homeSections')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'homeSections'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Home Sections
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'banners'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Banners
          </button>
          <button
            onClick={() => setActiveTab('quickSearch')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'quickSearch'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Quick Searches
          </button>
        </div>

        {/* Error Messages */}
        {productsError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {productsError}
          </div>
        )}
        {categoriesError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {categoriesError}
          </div>
        )}
        {subcategoriesError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {subcategoriesError}
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'products' && (
            <ProductList
              products={products}
              loading={productsLoading}
              onAdd={addProduct}
              onUpdate={updateProduct}
              onDelete={deleteProduct}
              onBulkDelete={bulkDeleteProducts}
              categories={categories}
              subcategories={subcategories}
              onSearch={searchProducts}
            />
          )}

          {activeTab === 'categories' && (
            <CategoryList
              categories={categories}
              loading={categoriesLoading}
              onAdd={createCategory}
              onUpdate={updateCategory}
              onDelete={deleteCategory}
              onBulkDelete={bulkDeleteCategories}
            />
          )}

          {activeTab === 'subcategories' && (
            <SubcategoryList
              subcategories={subcategories}
              categories={categories}
              loading={subcategoriesLoading}
              onAdd={createSubcategory}
              onUpdate={updateSubcategory}
              onDelete={deleteSubcategory}
              onBulkDelete={bulkDeleteSubcategories}
              onRefresh={fetchSubcategories}
            />
          )}

          {activeTab === 'homeSections' && (
            <HomeSectionManagement />
          )}

          {activeTab === 'banners' && (
            <BannerManagement />
          )}


          {activeTab === 'quickSearch' && (
            <QuickSearchManager />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
