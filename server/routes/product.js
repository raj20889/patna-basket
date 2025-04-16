const express = require('express');
const Product = require('../models/Product');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// Add Product (Admin Only)
router.post('/add', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ msg: 'Product Added', product: newProduct });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get All Products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json(err);
    }
});



// Updated Search Route
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        
        if (!query || typeof query !== 'string' || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters long'
            });
        }

        const cleanQuery = query.trim();
        
        // Perform text search
        const results = await Product.find(
            { $text: { $search: cleanQuery } },
            { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' } });

        res.json({
            success: true,
            count: results.length,
            products: results
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing search',
            error: error.message
        });
    }
});




// Get Single Product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: 'Product not found' });
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json(err);
    }
});







// In your product routes file (routes/product.js)

// Get Products by Category
router.get('/category/:category', async (req, res) => {
    try {
      const category = req.params.category;
      const products = await Product.find({ category: new RegExp(category, 'i') });
      res.status(200).json(products);
    } catch (err) {
      res.status(500).json(err);
    }
  });
module.exports = router;