const express = require('express');
const router = express.Router();
const QuickSearch = require('../models/QuickSearch');
const verifyToken = require('../middlewares/verifyToken');

// Get all active quick searches (public)
router.get('/', async (req, res) => {
  try {
    const searches = await QuickSearch.find({ isActive: true })
      .sort({ displayOrder: 1 })
      .populate('linkedProducts', 'name price image discount');
    res.json(searches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all quick searches (admin)
router.get('/admin/all', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const searches = await QuickSearch.find({}).sort({ displayOrder: 1 });
    res.json(searches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add quick search (admin)
router.post('/add', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const newSearch = new QuickSearch(req.body);
    await newSearch.save();
    res.status(201).json(newSearch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update quick search (admin)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const updated = await QuickSearch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete quick search (admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    await QuickSearch.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quick search deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track click analytics (public)
router.post('/:id/click', async (req, res) => {
  try {
    const search = await QuickSearch.findByIdAndUpdate(
      req.params.id,
      { $inc: { clickCount: 1 } },
      { new: true }
    );
    res.json(search);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk update display order (admin)
router.post('/bulk-reorder', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { updates } = req.body; // Array of { id, displayOrder }
    const promises = updates.map(({ id, displayOrder }) =>
      QuickSearch.findByIdAndUpdate(id, { displayOrder }, { new: true })
    );
    
    const results = await Promise.all(promises);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
