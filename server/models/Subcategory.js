const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    description: {
        type: String,
        trim: true,
    },
    image: {
        type: String,
        default: '',
        trim: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Subcategory', subcategorySchema);
