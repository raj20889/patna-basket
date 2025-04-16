const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    desc: { type: String, index: true },
    price: { type: Number, required: true },
    category: { type: String, index: true },
    subcategory: { type: String, index: true }, // NEW FIELD
    image: { type: String },
}, { timestamps: true });

// Updated text index with subcategory
productSchema.index({
    name: 'text',
    desc: 'text',
    category: 'text',
    subcategory: 'text' // ADDED
}, {
    weights: {
        name: 5,
        desc: 2,
        category: 1,
        subcategory: 1 // ADDED
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