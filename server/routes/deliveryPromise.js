const express = require('express');
const router = express.Router();
const DeliveryPromise = require('../models/DeliveryPromise');
const verifyToken = require('../middlewares/verifyToken');

// Get active delivery promise (public)
router.get('/', async (req, res) => {
  try {
    const deliveryPromise = await DeliveryPromise.findOne({ isActive: true });
    if (!deliveryPromise) {
      return res.json({
        deliveryTime: 30,
        deliveryUnit: 'minutes',
        promiseText: 'or FREE',
        backgroundColor: '#00A82D',
        icon: '🚀'
      });
    }
    res.json(deliveryPromise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all delivery promises (admin)
router.get('/admin/all', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const promises = await DeliveryPromise.find({});
    res.json(promises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create delivery promise (admin)
router.post('/add', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Deactivate existing active promise
    await DeliveryPromise.updateMany({ isActive: true }, { isActive: false });
    
    const newPromise = new DeliveryPromise(req.body);
    await newPromise.save();
    res.status(201).json(newPromise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update delivery promise (admin)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // If activating, deactivate others
    if (req.body.isActive === true) {
      await DeliveryPromise.updateMany({ _id: { $ne: req.params.id } }, { isActive: false });
    }
    
    const updated = await DeliveryPromise.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete delivery promise (admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    await DeliveryPromise.findByIdAndDelete(req.params.id);
    res.json({ message: 'Delivery promise deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
