import React, { useState } from 'react';
import DataTable from '../shared/DataTable';
import AddCategoryModal from './AddCategoryModal';
import EditCategoryModal from './EditCategoryModal';
import DeleteCategoryModal from './DeleteCategoryModal';
import { tableColumns } from '../../constants';
import { AiOutlinePlus, AiOutlineDelete } from 'react-icons/ai';

const CategoryList = ({ categories, loading, onAdd, onUpdate, onDelete, onBulkDelete }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleDelete = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} categor${selectedIds.length > 1 ? 'ies' : 'y'}?`)) return;
    await onBulkDelete(selectedIds);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-3">
        <div />
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <AiOutlineDelete size={20} />
              Delete Selected ({selectedIds.length})
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <AiOutlinePlus size={20} />
            Add Category
          </button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={tableColumns.categories}
        data={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        enableSelection={true}
        selectedItems={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Modals */}
      <AddCategoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={onAdd}
        loading={loading}
      />

      <EditCategoryModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCategory(null);
        }}
        onUpdate={onUpdate}
        category={selectedCategory}
        loading={loading}
      />

      <DeleteCategoryModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCategory(null);
        }}
        onDelete={onDelete}
        category={selectedCategory}
        loading={loading}
      />
    </div>
  );
};

export default CategoryList;
