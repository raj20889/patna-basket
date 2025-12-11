const express = require('express');
const HomeSection = require('../models/HomeSection');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// Get all sections (including inactive - for admin) - MUST BE BEFORE /:id
router.get('/admin/all', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });
  
  try {
    const sections = await HomeSection.find()
      .sort({ displayOrder: 1 });
    res.status(200).json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all home sections (for frontend)
router.get('/', async (req, res) => {
  try {
    const sections = await HomeSection.find({ isActive: true })
      .sort({ displayOrder: 1 });
    res.status(200).json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single section
router.get('/:id', async (req, res) => {
  try {
    const section = await HomeSection.findById(req.params.id);
    if (!section) return res.status(404).json({ msg: 'Section not found' });
    res.status(200).json(section);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new section (Admin only)
router.post('/add', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });
  
  try {
    const { title, description, subcategoryFilter, categoryPath, displayOrder, image } = req.body;
    
    // Validation
    if (!title || !subcategoryFilter || !categoryPath) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    const newSection = new HomeSection({
      title,
      description,
      subcategoryFilter,
      categoryPath,
      displayOrder: displayOrder || 0,
      image,
      isActive: true
    });

    await newSection.save();
    res.status(201).json({ msg: 'Section created', section: newSection });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update section (Admin only)
router.put('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });
  
  try {
    const { title, description, subcategoryFilter, categoryPath, displayOrder, image, isActive } = req.body;
    
    const section = await HomeSection.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title,
          description,
          subcategoryFilter,
          categoryPath,
          displayOrder,
          image,
          isActive
        }
      },
      { new: true }
    );

    if (!section) return res.status(404).json({ msg: 'Section not found' });
    
    res.status(200).json({ msg: 'Section updated', section });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete section (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });
  
  try {
    const section = await HomeSection.findByIdAndDelete(req.params.id);
    if (!section) return res.status(404).json({ msg: 'Section not found' });
    
    res.status(200).json({ msg: 'Section deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle section active status (Admin only)
router.patch('/:id/toggle', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });
  
  try {
    const section = await HomeSection.findById(req.params.id);
    if (!section) return res.status(404).json({ msg: 'Section not found' });
    
    section.isActive = !section.isActive;
    await section.save();
    
    res.status(200).json({ msg: 'Section toggled', section });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
