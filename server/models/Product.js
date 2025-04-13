const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    desc: {
        type: String,
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
    },
    image: {
        type: String,
    },
}, { timestamps: true })

module.exports = mongoose.model('Product', productSchema)
