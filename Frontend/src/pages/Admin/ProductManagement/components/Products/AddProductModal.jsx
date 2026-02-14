import React, { useState } from 'react';
import Modal from '../shared/Modal';
import FormInput from '../shared/FormInput';
import Toast from '../shared/Toast';
import MultiSelectDropdown from '../../../../../components/Shared/MultiSelectDropdown';
import { validationRules, messages } from '../../constants';

const AddProductModal = ({ isOpen, onClose, onAdd, categories, subcategories = [], loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: [],
    subcategory: [],
    image: '',
    stock: 0, // Add stock field to form data
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSubcategories = (subcategories || []).filter((sub) => {
    const catName = (sub.category && sub.category.name) || sub.categoryName || sub.category;
    return Array.isArray(formData.category)
      && formData.category.length > 0
      && catName
      && formData.category.some((c) => c.toLowerCase() === catName.toLowerCase());
  });

  const validateForm = () => {
    const newErrors = {};
    const rules = validationRules.product;

    Object.keys(rules).forEach((field) => {
      const rule = rules[field];
      const value = formData[field];

      if (rule.required && (Array.isArray(value) ? value.length === 0 : !value)) {
        newErrors[field] = rule.message;
      } else if (rule.minLength && value && value.length < rule.minLength) {
        newErrors[field] = rule.message;
      } else if (rule.maxLength && value && value.length > rule.maxLength) {
        newErrors[field] = rule.message;
      } else if (rule.min && value && Number(value) < rule.min) {
        newErrors[field] = rule.message;
      }
    });

    if (!formData.category || formData.category.length === 0) {
      newErrors.category = 'Select at least one category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCategoryChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setFormData((prev) => ({ ...prev, category: selected, subcategory: [] }));
    if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
  };

  const handleSubcategoryChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setFormData((prev) => ({ ...prev, subcategory: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await onAdd(formData);
      setToast({ type: 'success', message: messages.product.addSuccess });
      setTimeout(() => {
        setFormData({
          name: '',
          description: '',
          price: '',
          category: [],
          subcategory: [],
          image: '',
          stock: 0,
        });
        onClose();
      }, 500);
    } catch (err) {
      setToast({ type: 'error', message: messages.product.addError });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} title="Add New Product" onClose={onClose} size="md">
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            required
            placeholder="e.g. Fresh Milk"
          />

          <div className="mb-4">
            <MultiSelectDropdown
              label="Categories"
              options={categories}
              selected={formData.category}
              onChange={(selected) => {
                setFormData(prev => ({ ...prev, category: selected, subcategory: [] }));
                if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
              }}
              error={errors.category}
              required
              placeholder="Select categories"
            />
          </div>

          <div className="mb-4">
            <MultiSelectDropdown
              label="Subcategories"
              options={availableSubcategories}
              selected={formData.subcategory}
              onChange={(selected) => setFormData(prev => ({ ...prev, subcategory: selected }))}
              placeholder={formData.category.length === 0 ? "Select categories first" : "Select subcategories"}
            />
          </div>

          <FormInput
            label="Price"
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            error={errors.price}
            required
            placeholder="0.00"
          />

          <FormInput
            label="Description"
            type="textarea"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Product description"
          />

          <FormInput
            label="Image URL"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
          />

          <FormInput
            label="Stock"
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            error={errors.stock}
            required
            placeholder="Enter stock quantity"
          />

          <div className="flex gap-2 mt-6">
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Adding...' : 'Add Product'}
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

export default AddProductModal;
