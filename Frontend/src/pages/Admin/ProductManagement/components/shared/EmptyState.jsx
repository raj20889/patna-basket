import React from 'react';

const EmptyState = ({ title, description, actionLabel, onAction }) => {
  return (
    <div className="text-center py-10 px-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
