const mongoose = require('mongoose');
require('dotenv').config();

const VirtualStore = require('../models/VirtualStore');
const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/patnabasket';

const seedStores = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing virtual stores (optional)
    // await VirtualStore.deleteMany({});
    // console.log('Cleared existing stores');

    // Get some products to feature
    const allProducts = await Product.find().limit(100);

    const stores = [
      {
        storeName: 'Fresh Groceries & Veggies',
        storeIcon: '🥕',
        storeBanner: 'https://via.placeholder.com/800x400?text=Fresh+Groceries',
        storeDescription: 'Premium fresh vegetables, fruits, and organic products',
        storeColor: '#22C55E',
        featuredProducts: allProducts.slice(0, 12).map(p => p._id),
        displayOrder: 1,
        isActive: true,
        storeType: 'virtual',
        visitCount: 0
      },
      {
        storeName: 'Daily Essentials',
        storeIcon: '🛒',
        storeBanner: 'https://via.placeholder.com/800x400?text=Daily+Essentials',
        storeDescription: 'All your daily grocery needs in one place',
        storeColor: '#3B82F6',
        featuredProducts: allProducts.slice(12, 24).map(p => p._id),
        displayOrder: 2,
        isActive: true,
        storeType: 'virtual',
        visitCount: 0
      },
      {
        storeName: 'Beverages & Drinks',
        storeIcon: '🥤',
        storeBanner: 'https://via.placeholder.com/800x400?text=Beverages',
        storeDescription: 'Wide range of drinks, juices, and beverages',
        storeColor: '#F59E0B',
        featuredProducts: allProducts.slice(24, 36).map(p => p._id),
        displayOrder: 3,
        isActive: true,
        storeType: 'virtual',
        visitCount: 0
      },
      {
        storeName: 'Snacks & Bakery',
        storeIcon: '🍪',
        storeBanner: 'https://via.placeholder.com/800x400?text=Snacks',
        storeDescription: 'Delicious snacks, biscuits, and baked goods',
        storeColor: '#EC4899',
        featuredProducts: allProducts.slice(36, 48).map(p => p._id),
        displayOrder: 4,
        isActive: true,
        storeType: 'virtual',
        visitCount: 0
      },
      {
        storeName: 'Dairy & Eggs',
        storeIcon: '🥛',
        storeBanner: 'https://via.placeholder.com/800x400?text=Dairy',
        storeDescription: 'Fresh milk, cheese, butter, and eggs',
        storeColor: '#8B5CF6',
        featuredProducts: allProducts.slice(48, 60).map(p => p._id),
        displayOrder: 5,
        isActive: true,
        storeType: 'virtual',
        visitCount: 0
      }
    ];

    // Check if stores already exist and update or create
    for (const storeData of stores) {
      const existingStore = await VirtualStore.findOne({ storeName: storeData.storeName });

      if (existingStore) {
        // Update existing store
        await VirtualStore.findByIdAndUpdate(existingStore._id, storeData);
        console.log(`✓ Updated: ${storeData.storeName}`);
      } else {
        // Create new store
        const newStore = new VirtualStore(storeData);
        await newStore.save();
        console.log(`✓ Created: ${storeData.storeName}`);
      }
    }

    console.log('\n✅ Virtual Store seeding completed!');
    console.log(`Total stores: ${stores.length}`);
  } catch (error) {
    console.error('❌ Error seeding stores:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedStores();
