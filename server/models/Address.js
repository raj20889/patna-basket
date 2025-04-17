const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    addressType: {
        type: String,
        enum: ['Home', 'Work', 'Hotel', 'Other'],
        required: true
    },
    customName: {
        type: String,
        required: function() {
            return this.addressType === 'Other'
        }
    },
    building: {
        type: String,
        required: true
    },
    floor: {
        type: String
    },
    locality: {
        type: String,
        required: true
    },
    landmark: {
        type: String
    },
    contactName: {
        type: String,
        required: true
    },
    contactPhone: {
        type: String
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

// Ensure only one default address per user
addressSchema.index({ userId: 1, isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } })

module.exports = mongoose.model('Address', addressSchema)