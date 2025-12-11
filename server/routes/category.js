const express = require('express');
const Category = require('../models/Category');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// Get All Categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ msg: 'Error fetching categories', error: err.message });
    }
});

// Get Single Category
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ msg: 'Category not found' });
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ msg: 'Error fetching category', error: err.message });
    }
});

// Create Category (Admin Only)
router.post('/', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

    try {
        const { name, description } = req.body;
        
        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ msg: 'Category already exists' });
        }

        const newCategory = new Category({ name, description });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(500).json({ msg: 'Error creating category', error: err.message });
    }
});

// Update Category (Admin Only)
router.put('/:id', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updatedCategory) return res.status(404).json({ msg: 'Category not found' });
        res.status(200).json(updatedCategory);
    } catch (err) {
        res.status(500).json({ msg: 'Error updating category', error: err.message });
    }
});

// Delete Category (Admin Only)
router.delete('/:id', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) return res.status(404).json({ msg: 'Category not found' });
        res.status(200).json({ msg: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Error deleting category', error: err.message });
    }
});

// Bulk Delete Categories (Admin Only)
router.post('/bulk-delete', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

    const { categoryIds } = req.body;
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        return res.status(400).json({ msg: 'No category IDs provided' });
    }

    try {
        const result = await Category.deleteMany({ _id: { $in: categoryIds } });
        res.status(200).json({ msg: `${result.deletedCount} category(ies) deleted successfully`, deletedCount: result.deletedCount });
    } catch (err) {
        res.status(500).json({ msg: 'Error deleting categories', error: err.message });
    }
});

module.exports = router;
