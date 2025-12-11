// Seed categories with proper structure
const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const categories = [
  {
    name: 'Beverages',
    description: 'Cold drinks, juices, and beverages',
    image: 'https://dummyimage.com/300x300/2196f3/ffffff&text=Beverages',
    isActive: true,
    displayOrder: 1
  },
  {
    name: 'Snacks',
    description: 'Chips, biscuits, chocolates, and namkeen',
    image: 'https://dummyimage.com/300x300/ff9800/ffffff&text=Snacks',
    isActive: true,
    displayOrder: 2
  },
  {
    name: 'Dairy',
    description: 'Milk, butter, cheese, and dairy products',
    image: 'https://dummyimage.com/300x300/ffc107/000000&text=Dairy',
    isActive: true,
    displayOrder: 3
  },
  {
    name: 'Fruits',
    description: 'Fresh fruits and seasonal produce',
    image: 'https://dummyimage.com/300x300/4caf50/ffffff&text=Fruits',
    isActive: true,
    displayOrder: 4
  },
  {
    name: 'Vegetables',
    description: 'Fresh vegetables and salad items',
    image: 'https://dummyimage.com/300x300/8bc34a/000000&text=Vegetables',
    isActive: true,
    displayOrder: 5
  },
  {
    name: 'Bakery',
    description: 'Bread, cakes, and bakery items',
    image: 'https://dummyimage.com/300x300/d2691e/ffffff&text=Bakery',
    isActive: true,
    displayOrder: 6
  },
  {
    name: 'Meat & Fish',
    description: 'Fresh meat and fish products',
    image: 'https://dummyimage.com/300x300/e91e63/ffffff&text=Meat',
    isActive: true,
    displayOrder: 7
  },
  {
    name: 'Beauty & Care',
    description: 'Beauty products and personal care',
    image: 'https://dummyimage.com/300x300/9c27b0/ffffff&text=Beauty',
    isActive: true,
    displayOrder: 8
  },
  {
    name: 'Household',
    description: 'Household cleaning and essentials',
    image: 'https://dummyimage.com/300x300/00bcd4/ffffff&text=Household',
    isActive: true,
    displayOrder: 9
  },
  {
    name: 'Health & Medicine',
    description: 'Health supplements and medicines',
    image: 'https://dummyimage.com/300x300/f44336/ffffff&text=Health',
    isActive: true,
    displayOrder: 10
  }
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✓ Connected to MongoDB');

    // Check existing
    const existing = await Category.countDocuments();
    if (existing > 0) {
      console.log(`⚠ ${existing} categories already exist. Skipping seed...`);
      await mongoose.connection.close();
      process.exit(0);
    }

    const created = await Category.insertMany(categories);
    console.log(`✓ Created ${created.length} categories:\n`);
    
    created.forEach(cat => {
      console.log(`  • ${cat.name} (Order: ${cat.displayOrder})`);
    });
    
    console.log('\n✓ Categories seeded successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding categories:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedCategories();
