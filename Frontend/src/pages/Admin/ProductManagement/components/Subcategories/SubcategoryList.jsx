import React, { useMemo, useState } from 'react';
import DataTable from '../shared/DataTable';
import AddSubcategoryModal from './AddSubcategoryModal';
import EditSubcategoryModal from './EditSubcategoryModal';
import DeleteSubcategoryModal from './DeleteSubcategoryModal';
import EmptyState from '../shared/EmptyState';
import SearchBar from '../shared/SearchBar';
import { tableColumns } from '../../constants';

const SubcategoryList = ({
  subcategories,
  categories,
  loading,
  onAdd,
  onUpdate,
  onDelete,
  onBulkDelete,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const processedRows = useMemo(() => {
    return subcategories.map((sub) => {
      console.log('Subcategory data:', sub); // Debug log
      return {
        ...sub,
        categoryName: sub.category?.name || sub.category || '-',
      };
    });
  }, [subcategories]);

  const filteredRows = useMemo(() => {
    if (!searchTerm) return processedRows;
    const term = searchTerm.toLowerCase();
    return processedRows.filter((sub) =>
      sub.name.toLowerCase().includes(term) ||
      sub.categoryName.toLowerCase().includes(term)
    );
  }, [processedRows, searchTerm]);

  const handleEdit = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setEditModalOpen(true);
  };

  const handleDelete = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setDeleteModalOpen(true);
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) {
      alert('Please select subcategories to delete');
      return;
    }
    setBulkDeleteModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await onBulkDelete(selectedItems);
      setSelectedItems([]);
      setBulkDeleteModalOpen(false);
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };

  return (
    <div className="space-y-40">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search subcategories" />
        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete ({selectedItems.length})
            </button>
          )}
          <button
            onClick={onRefresh}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            disabled={loading}
          >
            Refresh
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Add Subcategory
          </button>
        </div>
      </div>

      {filteredRows.length === 0 && !loading ? (
        <EmptyState
          title="No subcategories yet"
          description="Create your first subcategory to organize products under their categories."
          actionLabel="Create subcategory"
          onAction={() => setAddModalOpen(true)}
        />
      ) : (
        <DataTable
          columns={tableColumns.subcategories}
          data={filteredRows}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          rowKey="_id"
          emptyMessage="No subcategories found"
          enableSelection={true}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          overrideRender={(key, row) => {
            if (key === 'category') return row.categoryName;
            if (key === 'image') {
              return row.image ? (
                <img 
                  src={row.image} 
                  alt={row.name} 
                  className="w-12 h-12 object-cover rounded"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                  }}
                />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                  No image
                </div>
              );
            }
            return row[key];
          }}
        />
      )}

      <AddSubcategoryModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={onAdd}
        categories={categories}
        loading={loading}
      />

      <EditSubcategoryModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onUpdate={onUpdate}
        subcategory={selectedSubcategory}
        categories={categories}
        loading={loading}
      />

      <DeleteSubcategoryModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={onDelete}
        subcategory={selectedSubcategory}
        loading={loading}
      />

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Multiple Subcategories</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selectedItems.length}</strong> subcategor{selectedItems.length === 1 ? 'y' : 'ies'}? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setBulkDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcategoryList;
