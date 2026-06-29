// ===== VALIDATION RULES =====
export const validationRules = {
  product: {
    name: {
      required: true,
      minLength: 3,
      maxLength: 100,
      message: 'Product name must be between 3 and 100 characters',
    },
    description: {
      required: false,
      maxLength: 500,
      message: 'Description must be less than 500 characters',
    },
    price: {
      required: true,
      min: 0,
      message: 'Price must be a positive number',
    },
    category: {
      required: true,
      message: 'Category is required',
    },
    subcategory: {
      required: false,
      message: 'Subcategory is optional',
    },
    image: {
      required: false,
      message: 'Image URL is optional',
    },
    stock: {
      required: true,
      min: 0,
      message: 'Stock must be a non-negative integer',
    },
    discount: {
      required: false,
      min: 0,
      max: 100,
      message: 'Discount must be a number between 0 and 100',
    },
    badges: {
      required: false,
      message: 'Badges are optional',
    },
    deliveryTime: {
      required: false,
      message: 'Delivery time is optional',
    },
  },
  category: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      message: 'Category name must be between 2 and 50 characters',
    },
    description: {
      required: false,
      maxLength: 200,
      message: 'Description must be less than 200 characters',
    },
  },
  subcategory: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      message: 'Subcategory name must be between 2 and 50 characters',
    },
    category: {
      required: true,
      message: 'Category is required',
    },
    description: {
      required: false,
      maxLength: 200,
      message: 'Description must be less than 200 characters',
    },
  },
};

// ===== MESSAGES =====
export const messages = {
  product: {
    addSuccess: 'Product added successfully! ✅',
    updateSuccess: 'Product updated successfully! ✅',
    deleteSuccess: 'Product deleted successfully! ✅',
    addError: 'Failed to add product. Please try again.',
    updateError: 'Failed to update product. Please try again.',
    deleteError: 'Failed to delete product. Please try again.',
    deleteConfirm: 'Are you sure you want to delete this product?',
  },
  category: {
    addSuccess: 'Category created successfully! ✅',
    updateSuccess: 'Category updated successfully! ✅',
    deleteSuccess: 'Category deleted successfully! ✅',
    addError: 'Failed to create category. Please try again.',
    updateError: 'Failed to update category. Please try again.',
    deleteError: 'Failed to delete category. Please try again.',
    deleteConfirm: 'Are you sure you want to delete this category?',
  },
  subcategory: {
    addSuccess: 'Subcategory created successfully! ✅',
    updateSuccess: 'Subcategory updated successfully! ✅',
    deleteSuccess: 'Subcategory deleted successfully! ✅',
    addError: 'Failed to create subcategory. Please try again.',
    updateError: 'Failed to update subcategory. Please try again.',
    deleteError: 'Failed to delete subcategory. Please try again.',
    deleteConfirm: 'Are you sure you want to delete this subcategory?',
  },
};

// ===== TABLE COLUMNS =====
export const tableColumns = {
  products: [
    { key: 'name', label: 'Product Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'subcategory', label: 'Subcategory', sortable: false },
    { key: 'price', label: 'Price', sortable: true },
    { key: 'stock', label: 'Stock', sortable: true },
    { key: 'discount', label: 'Discount', sortable: false },
    { key: 'badges', label: 'Badges', sortable: false },
    { key: 'deliveryTime', label: 'Delivery Time', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false },
  ],
  categories: [
    { key: 'name', label: 'Category Name', sortable: true },
    { key: 'description', label: 'Description', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false },
  ],
  subcategories: [
    { key: 'image', label: 'Image', sortable: false },
    { key: 'name', label: 'Subcategory Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'description', label: 'Description', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false },
  ],
};

// ===== MODAL TYPES =====
export const modalTypes = {
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'delete',
};
