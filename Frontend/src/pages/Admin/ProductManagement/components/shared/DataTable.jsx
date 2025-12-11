import React from 'react';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';

const DataTable = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  loading, 
  overrideRender,
  enableSelection = false,
  selectedItems = [],
  onSelectionChange
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No data found. Create one to get started!</p>
      </div>
    );
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = data.map(item => item._id);
      onSelectionChange(allIds);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      onSelectionChange(selectedItems.filter(itemId => itemId !== id));
    } else {
      onSelectionChange([...selectedItems, id]);
    }
  };

  const isAllSelected = data.length > 0 && selectedItems.length === data.length;

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm text-gray-700">
        <thead className="bg-gray-100 border-b">
          <tr>
            {enableSelection && (
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 cursor-pointer"
                />
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-semibold">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row._id || idx} className="border-b hover:bg-gray-50 transition">
              {enableSelection && (
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(row._id)}
                    onChange={() => handleSelectItem(row._id)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </td>
              )}
              {columns.map((col) => {
                const cellValue = overrideRender ? overrideRender(col.key, row) : null;

                return (
                  <td key={`${row._id}-${col.key}`} className="px-4 py-3">
                    {col.key === 'actions' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(row)}
                          className="text-blue-500 hover:text-blue-700 transition"
                          title="Edit"
                        >
                          <AiOutlineEdit size={20} />
                        </button>
                        <button
                          onClick={() => onDelete(row)}
                          className="text-red-500 hover:text-red-700 transition"
                          title="Delete"
                        >
                          <AiOutlineDelete size={20} />
                        </button>
                      </div>
                    ) : cellValue !== null && cellValue !== undefined ? (
                      cellValue
                    ) : col.key === 'price' ? (
                      `₹${row[col.key]}`
                    ) : (
                      Array.isArray(row[col.key])
                        ? row[col.key].join(', ')
                        : row[col.key] || '-'
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
