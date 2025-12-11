import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './QuickSearchChips.css'; // Import animation styles

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const QuickSearchChips = () => {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuickSearches = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/quick-searches`);
        const data = Array.isArray(response.data) ? response.data : response.data.data || [];
        setSearches(data);
      } catch (error) {
        console.error('Failed to fetch quick searches:', error);
        setSearches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuickSearches();
  }, []);

  const handleSearch = async (keyword) => {
    try {
      // Log the search for analytics
      await axios.post(`${API_BASE_URL}/trending-searches/log`, { keyword });
      
      // Navigate to search results
      navigate(`/search?q=${encodeURIComponent(keyword)}`);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-10 w-24 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full animate-pulse flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (searches.length === 0) return null;

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quick Searches</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {searches.map((search, index) => (
            <button
              key={search._id}
              onClick={() => handleSearch(search.keyword)}
              className="quick-search-chip"
              style={{
                '--animation-delay': `${index * 0.08}s`
              }}
              title={search.displayText}
            >
              <span className="chip-icon">{search.icon}</span>
              <span className="chip-text">{search.displayText}</span>
              <span className="chip-shine"></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickSearchChips;
