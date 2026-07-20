import React, { useState } from 'react';
import Modal from '../shared/Modal';
import { AiOutlineDownload, AiOutlineUpload } from 'react-icons/ai';

const BulkAddProductsModal = ({ isOpen, onClose, onBulkAdd, loading }) => {
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewCount, setPreviewCount] = useState(0);
  const [pendingProducts, setPendingProducts] = useState([]);

  const downloadTemplate = () => {
    const template = [
      'name,description,price,category,subcategory,stock,image,discountValue,discountType,discountBadgeText,discountBadgeColor,deliveryTime',
      'Fresh Milk,Fresh dairy milk,80,Dairy,,20,https://example.com/milk.jpg,10,percentage,Super Saver,red,30 MINS',
      'Bread,Soft bakery bread,45,Bakery,,15,https://example.com/bread.jpg,5,flat,Hot Deal,orange,20 MINS',
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product-bulk-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const parseCsv = (text) => {
    const rows = [];
    let currentRow = [];
    let currentValue = '';
    let inQuotes = false;

    const pushValue = () => {
      currentRow.push(currentValue.trim());
      currentValue = '';
    };

    const pushRow = () => {
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    };

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentValue += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        pushValue();
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i += 1;
        }
        pushValue();
        pushRow();
      } else {
        currentValue += char;
      }
    }

    if (currentValue.length > 0 || currentRow.length > 0) {
      pushValue();
      pushRow();
    }

    if (rows.length === 0) {
      return [];
    }

    const headers = rows[0].map((header) => header.trim().toLowerCase());
    return rows.slice(1).map((row) => {
      const normalizedRow = {};
      headers.forEach((header, index) => {
        normalizedRow[header] = row[index] || '';
      });
      return normalizedRow;
    }).filter((row) => Object.values(row).some((value) => String(value).trim().length > 0));
  };

  const parseJson = (text) => {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.products)) return parsed.products;
    throw new Error('JSON input should be an array of products.');
  };

  const normalizeProductRows = (rows) => {
    return rows.map((row) => {
      const toArray = (value) => {
        if (!value) return [];
        if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
        return String(value)
          .split(/[|,]/)
          .map((item) => item.trim())
          .filter(Boolean);
      };

      const parseFloatSafe = (value) => {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? 0 : parsed;
      };

      const parseIntSafe = (value) => {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? 0 : parsed;
      };

      const discountValue = parseFloatSafe(row.discountValue || row.discount || 0);

      return {
        name: String(row.name || row.productName || row.title || '').trim(),
        description: String(row.description || row.desc || '').trim(),
        price: parseFloatSafe(row.price || row.salePrice || row.unitPrice),
        category: toArray(row.category || row.categories),
        subcategory: toArray(row.subcategory || row.subcategories),
        stock: parseIntSafe(row.stock || row.quantity || 0),
        image: String(row.image || row.imageUrl || '').trim(),
        discount: {
          value: discountValue,
          type: String(row.discountType || 'percentage').toLowerCase() === 'flat' ? 'flat' : 'percentage',
          badgeText: String(row.discountBadgeText || '').trim(),
          badgeColor: String(row.discountBadgeColor || 'red').trim(),
          isActive: discountValue > 0,
        },
        badges: toArray(row.badges || row.badge),
        deliveryTime: String(row.deliveryTime || '').trim(),
      };
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccessMessage('');
    setFileName(file.name);

    try {
      const text = await file.text();
      let parsedRows = [];

      if (file.name.toLowerCase().endsWith('.json')) {
        parsedRows = parseJson(text);
      } else {
        parsedRows = parseCsv(text);
      }

      const normalizedRows = normalizeProductRows(parsedRows);
      const validRows = normalizedRows.filter((row) => row.name && row.price > 0);

      if (validRows.length === 0) {
        throw new Error('No valid rows found. Please check the file and include name and price values.');
      }

      setPendingProducts(validRows);
      setPreviewCount(validRows.length);
      setSuccessMessage(`${validRows.length} product(s) ready to import.`);
    } catch (err) {
      setPendingProducts([]);
      setPreviewCount(0);
      setError(err.message || 'Unable to read the selected file.');
    }
  };

  const handleSubmit = async () => {
    if (!previewCount) {
      setError('Please select a valid CSV or JSON file first.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccessMessage('');

      const result = await onBulkAdd(pendingProducts);
      setSuccessMessage(`${result?.addedCount || previewCount} product(s) imported successfully.`);
      setTimeout(() => {
        setPendingProducts([]);
        setPreviewCount(0);
        setFileName('');
        onClose();
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to import products.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} title="Bulk Add Products" onClose={onClose} size="lg">
      <div className="space-y-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          Upload a CSV or JSON file to add multiple products in one go. Required columns include name, price, and optionally description, category, stock, image, discount fields.
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <AiOutlineUpload size={18} />
            Select File
            <input type="file" accept=".csv,.json" className="hidden" onChange={handleFileChange} />
          </label>

          <button
            type="button"
            onClick={downloadTemplate}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <AiOutlineDownload size={18} />
            Download Template
          </button>
        </div>

        {fileName && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
            Selected file: <span className="font-semibold">{fileName}</span>
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || previewCount === 0}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? 'Importing...' : `Import ${previewCount} Product${previewCount === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BulkAddProductsModal;
