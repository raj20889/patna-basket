const express = require('express');
const User = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();

// Get All Users (Admin Only)
router.get('/', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

    try {
        const users = await User.find().select('-password'); // Exclude passwords
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Search Users (Admin Only)
router.get('/search', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

    try {
        const query = req.query.q;
        
        if (!query || typeof query !== 'string' || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters long'
            });
        }

        const cleanQuery = query.trim();
        const results = await User.find({
            $or: [
                { name: { $regex: cleanQuery, $options: 'i' } },
                { phone: { $regex: cleanQuery, $options: 'i' } }
            ]
        }).select('-password');

        res.json({
            success: true,
            count: results.length,
            users: results
        });
    } catch (error) {
        console.error('User search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing search',
            error: error.message
        });
    }
});

// Get User by ID (Admin Only)
router.get('/:id', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update User (Admin Only)
router.put('/:id', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).select('-password');
        
        res.status(200).json({ msg: 'User updated', user: updatedUser });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete User (Admin Only)
router.delete('/:id', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ msg: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get Users by Role (Admin Only)
router.get('/role/:role', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

    try {
        const users = await User.find({ 
            role: new RegExp(req.params.role, 'i') 
        }).select('-password');
        
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;