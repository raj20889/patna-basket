const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Models
const QuickSearch = require('../models/QuickSearch');
const VirtualStore = require('../models/VirtualStore');
const DeliveryPromise = require('../models/DeliveryPromise');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✓ MongoDB connected');

    // Clear existing data
    await QuickSearch.deleteMany({});
    await VirtualStore.deleteMany({});
    await DeliveryPromise.deleteMany({});

    // Seed Quick Searches
    const quickSearches = [
      {
        keyword: 'milk',
        displayText: 'Milk',
        icon: '🥛',
        displayOrder: 1,
        isActive: true,
        category: 'product'
      },
      {
        keyword: 'bread',
        displayText: 'Bread',
        icon: '🍞',
        displayOrder: 2,
        isActive: true,
        category: 'product'
      },
      {
        keyword: 'eggs',
        displayText: 'Eggs',
        icon: '🥚',
        displayOrder: 3,
        isActive: true,
        category: 'product'
      },
      {
        keyword: 'atta',
        displayText: 'Atta',
        icon: '🌾',
        displayOrder: 4,
        isActive: true,
        category: 'product'
      },
      {
        keyword: 'paneer',
        displayText: 'Paneer',
        icon: '🧀',
        displayOrder: 5,
        isActive: true,
        category: 'product'
      },
      {
        keyword: 'rice',
        displayText: 'Rice',
        icon: '🍚',
        displayOrder: 6,
        isActive: true,
        category: 'product'
      },
      {
        keyword: 'chocolate',
        displayText: 'Chocolate',
        icon: '🍫',
        displayOrder: 7,
        isActive: true,
        category: 'product'
      },
      {
        keyword: 'chips',
        displayText: 'Chips',
        icon: '🥔',
        displayOrder: 8,
        isActive: true,
        category: 'product'
      },
      {
        keyword: 'sugar',
        displayText: 'Sugar',
        icon: '🍬',
        displayOrder: 9,
        isActive: true,
        category: 'product'
      },
      {
        keyword: 'butter',
        displayText: 'Butter',
        icon: '🧈',
        displayOrder: 10,
        isActive: true,
        category: 'product'
      }
    ];

    await QuickSearch.insertMany(quickSearches);
    console.log(`✓ Seeded ${quickSearches.length} quick searches`);

    // Seed Virtual Stores
    const virtualStores = [
      {
        storeName: 'Paan Corner',
        storeIcon: '🚬',
        storeBanner: 'https://images.unsplash.com/photo-1585518419759-eb1aab6b3c4e?w=400&h=300&fit=crop',
        storeDescription: 'All your paan and tobacco needs',
        storeColor: '#8B4513',
        displayOrder: 1,
        isActive: true,
        storeType: 'physical'
      },
      {
        storeName: 'Fresh Market',
        storeIcon: '🥬',
        storeBanner: 'https://images.unsplash.com/photo-1488459716781-6918f33427d1?w=400&h=300&fit=crop',
        storeDescription: 'Fresh vegetables, fruits, and dairy',
        storeColor: '#27AE60',
        displayOrder: 2,
        isActive: true,
        storeType: 'virtual'
      },
      {
        storeName: 'Beauty & Wellness',
        storeIcon: '💆',
        storeBanner: 'https://images.unsplash.com/photo-1596462502278-af3efdc991db?w=400&h=300&fit=crop',
        storeDescription: 'Cosmetics, skincare, and personal care',
        storeColor: '#E75480',
        displayOrder: 3,
        isActive: true,
        storeType: 'virtual'
      },
      {
        storeName: 'Snack Station',
        storeIcon: '🍿',
        storeBanner: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd5fde1?w=400&h=300&fit=crop',
        storeDescription: 'Chips, namkeen, biscuits, and chocolates',
        storeColor: '#D4A017',
        displayOrder: 4,
        isActive: true,
        storeType: 'virtual'
      },
      {
        storeName: 'Home Essentials',
        storeIcon: '🧹',
        storeBanner: 'https://images.unsplash.com/photo-1584622181473-0410f00a6205?w=400&h=300&fit=crop',
        storeDescription: 'Cleaning supplies and kitchen items',
        storeColor: '#3498DB',
        displayOrder: 5,
        isActive: true,
        storeType: 'virtual'
      },
      {
        storeName: 'Local Favorites',
        storeIcon: '⭐',
        storeBanner: 'https://images.unsplash.com/photo-1608270861620-7891c28b3f86?w=400&h=300&fit=crop',
        storeDescription: 'Best local Patna brands and products',
        storeColor: '#F39C12',
        displayOrder: 6,
        isActive: true,
        storeType: 'physical'
      }
    ];

    await VirtualStore.insertMany(virtualStores);
    console.log(`✓ Seeded ${virtualStores.length} virtual stores`);

    // Seed Delivery Promise
    const deliveryPromise = {
      deliveryTime: 30,
      deliveryUnit: 'minutes',
      promiseText: 'or FREE',
      isActive: true,
      backgroundColor: '#00A82D',
      icon: '🚀'
    };

    await DeliveryPromise.create(deliveryPromise);
    console.log('✓ Seeded delivery promise');

    console.log('\n✅ All seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();
