const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()

const { OAuth2Client } = require('google-auth-library')
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

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

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' })

        res.status(200).json({ token, user })
    } catch (err) {
        res.status(500).json(err)
    }
})


// Google OAuth (frontend sends idToken from Google Identity Services)
router.post('/google', async (req, res) => {
    try {
        const { idToken } = req.body
        if (!idToken) return res.status(400).json({ msg: 'ID token required' })

        const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
        const payload = ticket.getPayload()
        const { sub: googleId, email, name, picture } = payload

        // Try to find existing user by googleId or email
        let user = await User.findOne({ googleId })
        if (!user && email) user = await User.findOne({ email })

        if (!user) {
            // Create a placeholder phone and a random password hash to satisfy schema
            const randomPassword = Math.random().toString(36).slice(-8)
            const hashPass = await bcrypt.hash(randomPassword, 10)

            const phonePlaceholder = `google_${googleId}`

            const newUser = new User({
                name: name || 'Google User',
                email,
                googleId,
                phone: phonePlaceholder,
                password: hashPass,
                role: 'customer',
            })

            user = await newUser.save()
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.status(200).json({ token, user })
    } catch (err) {
        console.error('Google auth error:', err)
        res.status(500).json({ msg: 'Google auth failed' })
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

