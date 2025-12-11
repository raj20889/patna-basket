const router = require('express').Router();
const Banner = require('../models/Banner');
const verifyToken = require('../middlewares/verifyToken');

// Get all active banners (public)
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json(banners);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all banners (admin)
router.get('/admin/all', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

  try {
    const banners = await Banner.find().sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json(banners);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get banner by id
router.get('/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ msg: 'Banner not found' });
    res.status(200).json(banner);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Create banner (admin)
router.post('/add', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

  try {
    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json({ msg: 'Banner created successfully', banner });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update banner (admin)
router.put('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

  try {
    const updated = await Banner.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: 'Banner not found' });
    res.status(200).json({ msg: 'Banner updated successfully', banner: updated });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Toggle active state (admin)
router.patch('/:id/toggle', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ msg: 'Banner not found' });

    banner.isActive = !banner.isActive;
    await banner.save();

    res.status(200).json({ msg: 'Banner toggled successfully', banner });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete banner (admin)
router.delete('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

  try {
    const deleted = await Banner.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: 'Banner not found' });

    res.status(200).json({ msg: 'Banner deleted successfully' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
