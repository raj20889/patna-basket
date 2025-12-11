const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    icon: {
        type: String,
        default: '',
        description: 'Emoji or small icon for category'
    },
    categoryImage: {
        type: String,
        default: '',
        description: 'Large banner image (400x400px) for category'
    },
    thumbnailImage: {
        type: String,
        default: '',
        description: 'Square thumbnail for grid display'
    },
    backgroundColor: {
        type: String,
        default: '#FFFFFF',
        description: 'Tile background color (hex code)'
    },
    displayOrder: {
        type: Number,
        default: 0,
        description: 'Position in category grid (lower = higher priority)'
    },
    showOnHomepage: {
        type: Boolean,
        default: true,
        description: 'Toggle visibility on homepage'
    },
    featuredProducts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
