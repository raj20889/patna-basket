import React from 'react';
import Modal from '../shared/Modal';

const DeleteSubcategoryModal = ({ isOpen, onClose, onConfirm, subcategory, loading }) => {
  if (!subcategory) return null;

  return (
    <Modal isOpen={isOpen} title="Delete Subcategory" onClose={onClose} size="sm">
      <div className="space-y-4">
        <p className="text-gray-700">Are you sure you want to delete <span className="font-semibold">{subcategory.name}</span>? This action cannot be undone.</p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(subcategory._id)}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteSubcategoryModal;
