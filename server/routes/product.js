const express = require('express')
const Product = require('../models/Product')
const verifyToken = require('../middlewares/verifyToken')

const router = express.Router()

// Add Product (Admin Only)
router.post('/add', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' })

    try {
        const newProduct = new Product(req.body)
        await newProduct.save()
        res.status(201).json({ msg: 'Product Added', product: newProduct })
    } catch (err) {
        res.status(500).json(err)
    }
})

// Get All Products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find()
        res.status(200).json(products)
    } catch (err) {
        res.status(500).json(err)
    }
})

module.exports = router
