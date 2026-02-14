const express = require('express');
const Product = require('../models/Product');
const verifyToken = require('../middlewares/verifyToken');
const io = require('socket.io');

const router = express.Router();

const normalizeToArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    return [value].filter(Boolean);
};

// Add Product (Admin Only)
router.post('/add', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

    try {
        const payload = {
            ...req.body,
            category: normalizeToArray(req.body.category),
            subcategory: normalizeToArray(req.body.subcategory),
            stock: req.body.stock || 0, // Include stock field with default value
        };

        const newProduct = new Product(payload);
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
      // Convert slug to searchable format (e.g., "dairy" or "fresh-dairy" matches "Dairy", "Fresh Dairy")
      const searchTerm = category.replace(/-/g, ' ');
      const regex = new RegExp(searchTerm, 'i');
      
      const products = await Product.find({
        $or: [
          { category: { $elemMatch: { $regex: regex } } },
          { category: { $regex: regex } } // Fallback for non-array category
        ]
      });
      
      console.log(`Category search for "${category}":`, products.length, 'products found');
      res.status(200).json(products);
    } catch (err) {
      console.error('Error fetching products by category:', err);
      res.status(500).json(err);
    }
});

// Update Product (Admin Only)
router.put('/:id', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

    try {
        const payload = {
            ...req.body,
        };

        if (req.body.category !== undefined) {
            payload.category = normalizeToArray(req.body.category);
        }

        if (req.body.subcategory !== undefined) {
            payload.subcategory = normalizeToArray(req.body.subcategory);
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: payload },
            { new: true }
        );
        if (!updatedProduct) return res.status(404).json({ msg: 'Product not found' });
        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete Product (Admin Only)
router.delete('/:id', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ msg: 'Product not found' });
        res.status(200).json({ msg: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Bulk Delete Products (Admin Only)
router.post('/bulk-delete', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

    try {
        const { productIds } = req.body;
        
        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ msg: 'No product IDs provided' });
        }

        const result = await Product.deleteMany({ _id: { $in: productIds } });
        
        res.status(200).json({ 
            msg: `${result.deletedCount} product(s) deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;