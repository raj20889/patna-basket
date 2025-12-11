import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HomeSectionManagement = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subcategoryFilter: '',
    categoryPath: '',
    displayOrder: 0,
    image: '',
    isActive: true
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');

  // Fetch all sections
  const fetchSections = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/home-sections/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSections(response.data);
    } catch (err) {
      console.error('Error fetching sections:', err);
      alert('Failed to fetch sections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : name === 'displayOrder' ? parseInt(value) : value
    });
  };

  // Handle form submission (Add/Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.subcategoryFilter || !formData.categoryPath) {
      alert('Please fill all required fields');
      return;
    }

    try {
      if (editingId) {
        // Update
        const response = await axios.put(
          `${API_URL}/home-sections/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSections(sections.map(s => s._id === editingId ? response.data.section : s));
        alert('Section updated successfully');
      } else {
        // Add new
        const response = await axios.post(
          `${API_URL}/home-sections/add`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSections([...sections, response.data.section]);
        alert('Section created successfully');
      }

      resetForm();
    } catch (err) {
      console.error('Error saving section:', err);
      alert(err.response?.data?.msg || 'Failed to save section');
    }
  };

  // Handle edit
  const handleEdit = (section) => {
    setFormData(section);
    setEditingId(section._id);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;

    try {
      await axios.delete(`${API_URL}/home-sections/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSections(sections.filter(s => s._id !== id));
      alert('Section deleted successfully');
    } catch (err) {
      console.error('Error deleting section:', err);
      alert('Failed to delete section');
    }
  };

  // Handle toggle active status
  const handleToggle = async (id) => {
    try {
      const response = await axios.patch(
        `${API_URL}/home-sections/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSections(sections.map(s => s._id === id ? response.data.section : s));
    } catch (err) {
      console.error('Error toggling section:', err);
      alert('Failed to toggle section');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subcategoryFilter: '',
      categoryPath: '',
      displayOrder: 0,
      image: '',
      isActive: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Home Section Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            ...styles.button,
            backgroundColor: showForm ? '#ff6b6b' : '#4CAF50'
          }}
        >
          {showForm ? 'Cancel' : '+ Add New Section'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={styles.formContainer}>
          <h2>{editingId ? 'Edit Section' : 'Add New Section'}</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Cold Drinks & Juices"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Section description"
                rows="3"
                style={styles.input}
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label>Subcategory Filter *</label>
                <input
                  type="text"
                  name="subcategoryFilter"
                  value={formData.subcategoryFilter}
                  onChange={handleChange}
                  placeholder="e.g., Juices"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Category Path *</label>
                <input
                  type="text"
                  name="categoryPath"
                  value={formData.categoryPath}
                  onChange={handleChange}
                  placeholder="e.g., beverages"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label>Display Order</label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://..."
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                {' '}Active
              </label>
            </div>

            <button type="submit" style={styles.submitButton}>
              {editingId ? 'Update Section' : 'Create Section'}
            </button>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading && <p style={styles.loading}>Loading sections...</p>}

      {/* Sections List */}
      {!loading && sections.length === 0 && (
        <p style={styles.empty}>No sections found. Create one to get started!</p>
      )}

      {!loading && sections.length > 0 && (
        <div style={styles.sectionsList}>
          <h2>Sections ({sections.length})</h2>
          {sections.map((section) => (
            <div key={section._id} style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div>
                  <h3>{section.title}</h3>
                  <p style={styles.meta}>
                    Filter: <strong>{section.subcategoryFilter}</strong> | 
                    Path: <strong>{section.categoryPath}</strong> | 
                    Order: <strong>{section.displayOrder}</strong>
                  </p>
                </div>
                <div style={styles.actions}>
                  <button
                    onClick={() => handleToggle(section._id)}
                    style={{
                      ...styles.actionButton,
                      backgroundColor: section.isActive ? '#2196F3' : '#FFC107'
                    }}
                  >
                    {section.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleEdit(section)}
                    style={{ ...styles.actionButton, backgroundColor: '#FF9800' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(section._id)}
                    style={{ ...styles.actionButton, backgroundColor: '#f44336' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              {section.description && (
                <p style={styles.description}>{section.description}</p>
              )}
              {section.image && (
                <img
                  src={section.image}
                  alt={section.title}
                  style={styles.thumbnail}
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    borderBottom: '2px solid #eee',
    paddingBottom: '20px'
  },
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  formContainer: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
    border: '1px solid #ddd'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '15px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit'
  },
  submitButton: {
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#666'
  },
  empty: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#999',
    fontSize: '16px'
  },
  sectionsList: {
    marginTop: '30px'
  },
  sectionCard: {
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px'
  },
  meta: {
    fontSize: '12px',
    color: '#666',
    margin: '5px 0 0 0'
  },
  description: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '10px'
  },
  actions: {
    display: 'flex',
    gap: '10px'
  },
  actionButton: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px'
  },
  thumbnail: {
    maxWidth: '100px',
    maxHeight: '100px',
    borderRadius: '4px',
    marginTop: '10px'
  }
};

export default HomeSectionManagement;
