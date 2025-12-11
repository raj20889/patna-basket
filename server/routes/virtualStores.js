const express = require('express');
const router = express.Router();
const TrendingSearch = require('../models/TrendingSearch');
const verifyToken = require('../middlewares/verifyToken');

// Get trending searches (public)
router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit || 20;
    const trendingSearches = await TrendingSearch.find({ isActive: true })
      .sort({ searchCount: -1 })
      .limit(parseInt(limit));
    res.json(trendingSearches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all trending searches (admin)
router.get('/admin/all', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const searches = await TrendingSearch.find({}).sort({ searchCount: -1 });
    res.json(searches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Log search (public) - tracks trending searches
router.post('/log', async (req, res) => {
  try {
    const { keyword } = req.body;
    
    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({ error: 'Keyword required' });
    }

    const cleanKeyword = keyword.trim().toLowerCase();
    
    const trending = await TrendingSearch.findOneAndUpdate(
      { keyword: cleanKeyword },
      {
        $inc: { searchCount: 1 },
        lastSearchedAt: new Date(),
        isActive: true
      },
      { upsert: true, new: true }
    );
    
    res.json(trending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle active status (admin)
router.patch('/:id/toggle', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const search = await TrendingSearch.findById(req.params.id);
    search.isActive = !search.isActive;
    await search.save();
    
    res.json(search);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete trending search (admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    await TrendingSearch.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trending search deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
