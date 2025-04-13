const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()

// Register


router.post('/register', async (req, res) => {
    try {
        const { name, phone, password, role } = req.body

        if (!name || !phone || !password) {
            return res.status(400).json({ msg: 'All fields are required' })
        }

        const existingUser = await User.findOne({ phone })
        if (existingUser) {
            return res.status(400).json({ msg: 'Phone already registered' })
        }

        const hashPass = await bcrypt.hash(password, 10)

        const newUser = new User({
            name,
            phone,
            password: hashPass,
            role // optional → will take 'customer' if not provided
        })

        await newUser.save()

        res.status(201).json({ msg: 'Registration Successful' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ msg: 'Server Error' })
    }
})




// Login
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body
        const user = await User.findOne({ phone })
        if (!user) return res.status(400).json({ msg: 'User Not Found' })

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' })

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '3d' })

        res.status(200).json({ token, user })
    } catch (err) {
        res.status(500).json(err)
    }
})



// Middleware → Token Verify
const verifyToken = (req, res, next) => {
    const token = req.headers.token
    if (!token) return res.status(401).json({ msg: 'Access Denied' })

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ msg: 'Invalid Token' })
        req.user = user
        next()
    })
}

// Profile API
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.status(200).json(user)
    } catch (err) {
        res.status(500).json(err)
    }
})








module.exports = router;

