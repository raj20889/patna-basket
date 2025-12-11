const express = require('express');
const router = express.Router();
const VirtualStore = require('../models/VirtualStore');
const verifyToken = require('../middlewares/verifyToken');

// Get all stores (admin) - MUST be before /:id route
router.get('/admin/all', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const stores = await VirtualStore.find({})
      .sort({ displayOrder: 1 })
      .populate('categories', 'name')
      .populate('subcategories', 'name');
    res.json(stores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all active virtual stores (public)
router.get('/', async (req, res) => {
  try {
    const stores = await VirtualStore.find({ isActive: true })
      .sort({ displayOrder: 1 })
      .populate('categories')
      .populate('subcategories')
      .populate('featuredProducts', 'name price image discount');
    
    console.log('GET /stores - Returning stores with storeBanner:', stores.map(s => ({ 
      name: s.storeName, 
      hasBanner: !!s.storeBanner, 
      banner: s.storeBanner 
    })));
    
    res.json(stores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single store (public)
router.get('/:id', async (req, res) => {
  try {
    const store = await VirtualStore.findById(req.params.id)
      .populate('categories')
      .populate('subcategories')
      .populate('featuredProducts');
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    // Increment visit count
    store.visitCount = (store.visitCount || 0) + 1;
    await store.save();
    
    res.json(store);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create virtual store (admin)
router.post('/add', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const newStore = new VirtualStore(req.body);
    await newStore.save();
    res.status(201).json(newStore);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update virtual store (admin)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const updated = await VirtualStore.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete virtual store (admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    await VirtualStore.findByIdAndDelete(req.params.id);
    res.json({ message: 'Virtual store deleted' });
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
    
    const store = await VirtualStore.findById(req.params.id);
    store.isActive = !store.isActive;
    await store.save();
    
    res.json(store);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
