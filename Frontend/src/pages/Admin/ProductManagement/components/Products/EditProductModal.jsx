import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import FormInput from '../shared/FormInput';
import Toast from '../shared/Toast';
import MultiSelectDropdown from '../../../../../components/Shared/MultiSelectDropdown';
import { validationRules, messages } from '../../constants';

const EditProductModal = ({ isOpen, onClose, onUpdate, product, categories, subcategories = [], loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: [],
    subcategory: [],
    image: '',
    stock: 0,
    discount: { value: '', type: 'percentage', isActive: false, badgeText: '', badgeColor: 'red' },
    badges: [],
    deliveryTime: '',
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

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: Array.isArray(product.category)
          ? product.category
          : product.category
            ? [product.category]
            : [],
        subcategory: Array.isArray(product.subcategory)
          ? product.subcategory
          : product.subcategory
            ? [product.subcategory]
            : [],
        image: product.image || '',
        stock: product.stock || 0,
        discount: {
          value: product.discount?.value || '',
          type: product.discount?.type || 'percentage',
          isActive: product.discount?.isActive ?? Boolean(product.discount?.value),
          badgeText: product.discount?.badgeText || '',
          badgeColor: product.discount?.badgeColor || 'red',
        },
        badges: Array.isArray(product.badges) ? product.badges : [],
        deliveryTime: product.deliveryTime || '',
      });
    }
  }, [product, isOpen]);

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

    const discountValue = Number(formData.discount?.value || 0);

    const payload = {
      ...formData,
      description: formData.description,
      price: Number(formData.price),
      stock: Number(formData.stock),
      discount: {
        ...formData.discount,
        value: discountValue,
        isActive: discountValue > 0,
      },
      badges: Array.isArray(formData.badges) ? formData.badges : [],
    };

    try {
      setIsSubmitting(true);
      await onUpdate(product._id, payload);
      setToast({ type: 'success', message: messages.product.updateSuccess });
      setTimeout(() => onClose(), 500);
    } catch (err) {
      setToast({ type: 'error', message: messages.product.updateError });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockUpdate = async () => {
    try {
      setIsSubmitting(true);
      await onUpdate(product._id, { stock: formData.stock }); // Update stock explicitly
      setToast({ type: 'success', message: 'Stock updated successfully!' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to update stock.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} title="Edit Product" onClose={onClose} size="md">
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            required
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
          />

          <FormInput
            label="Description"
            type="textarea"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />

          <FormInput
            label="Image URL"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
          />

          <FormInput
            label="Stock"
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            error={errors.stock}
            required
          />

          <FormInput
            label="Discount Value"
            type="number"
            name="discount.value"
            value={formData.discount?.value || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              discount: { ...prev.discount, value: e.target.value },
            }))}
            placeholder="Enter discount value"
          />

          <FormInput
            label="Discount Type"
            type="select"
            name="discount.type"
            value={formData.discount?.type || 'percentage'}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              discount: { ...prev.discount, type: e.target.value },
            }))}
            options={[
              { label: 'Percentage', value: 'percentage' },
              { label: 'Flat', value: 'flat' }
            ]}
          />

          <FormInput
            label="Discount Badge Text"
            name="discount.badgeText"
            value={formData.discount?.badgeText || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              discount: { ...prev.discount, badgeText: e.target.value },
            }))}
            placeholder="Enter badge text (optional)"
          />

          <FormInput
            label="Discount Badge Color"
            type="select"
            name="discount.badgeColor"
            value={formData.discount?.badgeColor || 'red'}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              discount: { ...prev.discount, badgeColor: e.target.value },
            }))}
            options={[
              { label: 'Red', value: 'red' },
              { label: 'Orange', value: 'orange' },
              { label: 'Green', value: 'green' },
              { label: 'Blue', value: 'blue' },
            ]}
          />

          <FormInput
            label="Custom Badges"
            name="badges"
            value={formData.badges.join(', ')}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              badges: e.target.value.split(',').map((badge) => badge.trim()).filter(Boolean),
            }))}
            placeholder="Enter badges separated by commas"
          />

          <FormInput
            label="Delivery Time"
            name="deliveryTime"
            value={formData.deliveryTime}
            onChange={handleInputChange}
            placeholder="Enter delivery time (e.g., 30 mins)"
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </form>
      </Modal>
    </>
  );
};

export default EditProductModal;
