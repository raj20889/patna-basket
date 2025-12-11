import React, { useState, useRef, useEffect } from 'react';

const MultiSelectDropdown = ({ 
  label, 
  options = [], 
  selected = [], 
  onChange, 
  error, 
  required,
  placeholder = "Select items"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleCheckboxChange = (optionValue) => {
    const newSelected = selected.includes(optionValue)
      ? selected.filter(item => item !== optionValue)
      : [...selected, optionValue];
    onChange(newSelected);
  };

  const handleRemoveTag = (value) => {
    onChange(selected.filter(item => item !== value));
  };

  const getOptionLabel = (value) => {
    const option = options.find(opt => opt._id === value || opt.name === value);
    return option?.name || value;
  };

  // Filter options based on search query
  const filteredOptions = options.filter(option => 
    option.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mb-4 relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {/* Dropdown Button */}
      <div 
        className={`w-full px-3 py-2 border rounded-md bg-white cursor-pointer focus:outline-none focus:ring-2 min-h-12 flex flex-wrap gap-2 items-center ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          selected.map((value) => (
            <span 
              key={value} 
              className="bg-blue-500 text-white px-2 py-1 rounded text-sm flex items-center gap-1"
            >
              {getOptionLabel(value)}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTag(value);
                }}
                className="ml-1 hover:bg-blue-600 rounded"
              >
                ✕
              </button>
            </span>
          ))
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-full">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.map((option) => (
              <div key={option._id} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.includes(option.name)}
                    onChange={() => handleCheckboxChange(option.name)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{option.name}</span>
                </label>
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-4 py-2 text-sm text-gray-500">
                {searchQuery ? 'No matching options' : 'No options available'}
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default MultiSelectDropdown;
