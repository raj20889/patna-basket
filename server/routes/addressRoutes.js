const express = require('express')
const router = express.Router()
const Address = require('../models/Address')
const verifyToken = require('../middlewares/verifyToken')

// Add new address
router.post('/', verifyToken, async (req, res) => {
    try {
        const { addressType, building, locality, contactName, floor, landmark, contactPhone, isDefault } = req.body

        // Basic validation
        if (!addressType || !building || !locality || !contactName) {
            return res.status(400).json({ msg: 'Required fields: addressType, building, locality, contactName' })
        }

        // Custom name required if addressType is 'Other'
        if (addressType === 'Other' && !req.body.customName) {
            return res.status(400).json({ msg: 'Custom name required for "Other" address type' })
        }

        // Check if this is first address - then set as default
        const addressCount = await Address.countDocuments({ userId: req.user.id })
        const shouldSetDefault = addressCount === 0 || isDefault

        // If setting as default, unset any existing default
        if (shouldSetDefault) {
            await Address.updateOne(
                { userId: req.user.id, isDefault: true },
                { $set: { isDefault: false } }
            )
        }

        const newAddress = new Address({
            userId: req.user.id,
            addressType,
            customName: addressType === 'Other' ? req.body.customName : undefined,
            building,
            floor,
            locality,
            landmark,
            contactName,
            contactPhone,
            isDefault: shouldSetDefault
        })

        await newAddress.save()

        res.status(201).json(newAddress)
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Only one default address allowed per user' })
        }
        console.error(err)
        res.status(500).json({ msg: 'Server Error' })
    }
})

// Get all addresses for user
router.get('/', verifyToken, async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.user.id }).sort({ isDefault: -1, createdAt: -1 })
        res.status(200).json(addresses)
    } catch (err) {
        console.error(err)
        res.status(500).json({ msg: 'Server Error' })
    }
})

// Update address
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { addressType, building, locality, contactName, floor, landmark, contactPhone, isDefault } = req.body

        // Verify address belongs to user
        const address = await Address.findOne({ _id: req.params.id, userId: req.user.id })
        if (!address) {
            return res.status(404).json({ msg: 'Address not found' })
        }

        // If setting as default, unset any existing default
        if (isDefault) {
            await Address.updateOne(
                { userId: req.user.id, isDefault: true },
                { $set: { isDefault: false } }
            )
        }

        // Update address
        address.addressType = addressType || address.addressType
        address.customName = addressType === 'Other' ? req.body.customName : undefined
        address.building = building || address.building
        address.floor = floor !== undefined ? floor : address.floor
        address.locality = locality || address.locality
        address.landmark = landmark !== undefined ? landmark : address.landmark
        address.contactName = contactName || address.contactName
        address.contactPhone = contactPhone !== undefined ? contactPhone : address.contactPhone
        address.isDefault = isDefault !== undefined ? isDefault : address.isDefault

        await address.save()

        res.status(200).json(address)
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Only one default address allowed per user' })
        }
        console.error(err)
        res.status(500).json({ msg: 'Server Error' })
    }
})

// Delete address
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        // Verify address belongs to user
        const address = await Address.findOne({ _id: req.params.id, userId: req.user.id })
        if (!address) {
            return res.status(404).json({ msg: 'Address not found' })
        }

        // If deleting default address, set another as default if available
        if (address.isDefault) {
            const anotherAddress = await Address.findOne({ 
                userId: req.user.id, 
                _id: { $ne: req.params.id } 
            }).sort({ createdAt: -1 })
            
            if (anotherAddress) {
                anotherAddress.isDefault = true
                await anotherAddress.save()
            }
        }

        await Address.findByIdAndDelete(req.params.id)

        res.status(200).json({ msg: 'Address deleted successfully' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ msg: 'Server Error' })
    }
})

// Set default address
router.patch('/:id/set-default', verifyToken, async (req, res) => {
    try {
        // Verify address belongs to user
        const address = await Address.findOne({ _id: req.params.id, userId: req.user.id })
        if (!address) {
            return res.status(404).json({ msg: 'Address not found' })
        }

        // Unset current default
        await Address.updateOne(
            { userId: req.user.id, isDefault: true },
            { $set: { isDefault: false } }
        )

        // Set new default
        address.isDefault = true
        await address.save()

        res.status(200).json(address)
    } catch (err) {
        console.error(err)
        res.status(500).json({ msg: 'Server Error' })
    }
})

module.exports = router