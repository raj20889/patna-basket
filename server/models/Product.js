const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    desc: { type: String, index: true },
    price: { type: Number, required: true, default: 0 },
    category: [{ type: String, index: true }],
    subcategory: [{ type: String, index: true }], // Added support for subcategories
    image: { type: String },
    discount: {
        isActive: {
            type: Boolean,
            default: false,
            description: 'Enable/disable discount'
        },
        type: {
            type: String,
            enum: ['percentage', 'flat'],
            default: 'percentage',
            description: 'Type of discount'
        },
        value: {
            type: Number,
            default: 0,
            description: 'Discount value (30 for 30% or 50 for ₹50 off)'
        },
        badgeColor: {
            type: String,
            enum: ['red', 'orange', 'green', 'blue'],
            default: 'red',
            description: 'Color of discount badge'
        },
        badgeText: {
            type: String,
            default: '',
            description: 'Custom badge text like "SUPER SAVER"'
        },
        validUntil: {
            type: Date,
            description: 'Discount expiry date'
        }
    },
    deliveryTime: {
        type: String,
        default: '30 MINS',
        description: 'Estimated delivery time badge'
    },
    badges: [
        {
            type: String,
            description: 'Array of custom badges (Bestseller, New, etc.)'
        }
    ],
    stock: { type: Number, required: true, default: 0 } // Add stock field
}, { timestamps: true });

// Updated text index with subcategory
productSchema.index({
    name: 'text',
    desc: 'text',
    category: 'text',
    subcategory: 'text'
}, {
    weights: {
        name: 5,
        desc: 2,
        category: 1,
        subcategory: 1
    },
    name: 'productTextIndexV2' // NEW NAME TO AVOID CONFLICTS
});

const Product = mongoose.model('Product', productSchema);

// Safe index initialization
async function initializeIndexes() {
    try {
        const indexes = await Product.collection.indexes();
        const oldIndex = indexes.find(idx => idx.name === 'productTextIndex');
        
        if (oldIndex) {
            await Product.collection.dropIndex('productTextIndex');
            console.log('✓ Old index dropped');
        }
        
        await Product.createIndexes();
        console.log('✓ New indexes created');
    } catch (err) {
        if (err.codeName === 'NamespaceNotFound') {
            await Product.createIndexes();
        } else {
            console.error('Index error:', err);
        }
    }
}

initializeIndexes();

module.exports = Product;