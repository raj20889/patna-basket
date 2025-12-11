import React, { useEffect, useState } from 'react';
import Modal from '../shared/Modal';
import FormInput from '../shared/FormInput';
import Toast from '../shared/Toast';
import { validationRules, messages } from '../../constants';

const EditSubcategoryModal = ({ isOpen, onClose, onUpdate, subcategory, categories, loading }) => {
  const [formData, setFormData] = useState({ name: '', category: '', description: '', image: '' });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subcategory) {
      setFormData({
        name: subcategory.name || '',
        category: subcategory.category?._id || subcategory.category || '',
        description: subcategory.description || '',
        image: subcategory.image || '',
      });
    }
  }, [subcategory]);

  const validateForm = () => {
    const newErrors = {};
    const rules = validationRules.subcategory;

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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !subcategory) return;

    try {
      setIsSubmitting(true);
      await onUpdate(subcategory._id, formData);
      setToast({ type: 'success', message: messages.subcategory.updateSuccess });
      setTimeout(() => {
        onClose();
      }, 400);
    } catch (err) {
      setToast({ type: 'error', message: messages.subcategory.updateError });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} title="Edit Subcategory" onClose={onClose} size="md">
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Subcategory Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />

          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          <FormInput
            label="Description"
            type="textarea"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional description"
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};

export default EditSubcategoryModal;
