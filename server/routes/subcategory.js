const express = require('express');
const Subcategory = require('../models/Subcategory');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// Get All Subcategories
router.get('/', async (req, res) => {
    try {
        const subcategories = await Subcategory.find().populate('category', 'name').sort({ name: 1 });
        res.status(200).json(subcategories);
    } catch (err) {
        res.status(500).json({ msg: 'Error fetching subcategories', error: err.message });
    }
});

// Get Subcategories by Category
router.get('/category/:categoryId', async (req, res) => {
    try {
        const subcategories = await Subcategory.find({ category: req.params.categoryId })
            .populate('category', 'name')
            .sort({ name: 1 });
        res.status(200).json(subcategories);
    } catch (err) {
        res.status(500).json({ msg: 'Error fetching subcategories', error: err.message });
    }
});

// Get Single Subcategory
router.get('/:id', async (req, res) => {
    try {
        const subcategory = await Subcategory.findById(req.params.id).populate('category', 'name');
        if (!subcategory) return res.status(404).json({ msg: 'Subcategory not found' });
        res.status(200).json(subcategory);
    } catch (err) {
        res.status(500).json({ msg: 'Error fetching subcategory', error: err.message });
    }
});

// Create Subcategory (Admin Only)
router.post('/', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

    try {
        const { name, category, description, image } = req.body;
        
        const newSubcategory = new Subcategory({ name, category, description, image });
        await newSubcategory.save();
        
        const populatedSubcategory = await Subcategory.findById(newSubcategory._id).populate('category', 'name');
        res.status(201).json(populatedSubcategory);
    } catch (err) {
        res.status(500).json({ msg: 'Error creating subcategory', error: err.message });
    }
});

// Update Subcategory (Admin Only)
router.put('/:id', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

    try {
        const updatedSubcategory = await Subcategory.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).populate('category', 'name');
        
        if (!updatedSubcategory) return res.status(404).json({ msg: 'Subcategory not found' });
        res.status(200).json(updatedSubcategory);
    } catch (err) {
        res.status(500).json({ msg: 'Error updating subcategory', error: err.message });
    }
});

// Delete Subcategory (Admin Only)
router.delete('/:id', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

    try {
        const deletedSubcategory = await Subcategory.findByIdAndDelete(req.params.id);
        if (!deletedSubcategory) return res.status(404).json({ msg: 'Subcategory not found' });
        res.status(200).json({ msg: 'Subcategory deleted successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Error deleting subcategory', error: err.message });
    }
});

module.exports = router;
