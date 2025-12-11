import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import FormInput from '../shared/FormInput';
import Toast from '../shared/Toast';
import { validationRules, messages } from '../../constants';

const EditCategoryModal = ({ isOpen, onClose, onUpdate, category, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        image: category.image || '',
      });
    }
  }, [category, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    const rules = validationRules.category;

    Object.keys(rules).forEach((field) => {
      const rule = rules[field];
      const value = formData[field];

      if (rule.required && !value) {
        newErrors[field] = rule.message;
      } else if (rule.minLength && value && value.length < rule.minLength) {
        newErrors[field] = rule.message;
      } else if (rule.maxLength && value && value.length > rule.maxLength) {
        newErrors[field] = rule.message;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await onUpdate(category._id, formData);
      setToast({ type: 'success', message: messages.category.updateSuccess });
      setTimeout(() => onClose(), 500);
    } catch (err) {
      setToast({ type: 'error', message: messages.category.updateError });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} title="Edit Category" onClose={onClose} size="md">
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Category Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />

          <FormInput
            label="Description"
            type="textarea"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          <FormInput
            label="Image URL"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />

          <div className="flex gap-2 mt-6">
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Updating...' : 'Update Category'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

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

export default EditCategoryModal;
