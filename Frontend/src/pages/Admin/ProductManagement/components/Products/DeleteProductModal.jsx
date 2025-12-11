import React, { useState } from 'react';
import ConfirmDialog from '../shared/ConfirmDialog';
import Toast from '../shared/Toast';
import { messages } from '../../constants';

const DeleteProductModal = ({ isOpen, onClose, onDelete, product, loading }) => {
  const [toast, setToast] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onDelete(product._id);
      setToast({ type: 'success', message: messages.product.deleteSuccess });
      setTimeout(() => onClose(), 500);
    } catch (err) {
      setToast({ type: 'error', message: messages.product.deleteError });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <ConfirmDialog
        isOpen={isOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${product?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirm}
        onCancel={onClose}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default DeleteProductModal;
