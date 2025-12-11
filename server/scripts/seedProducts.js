// Seed script to add sample products
const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const sampleProducts = [
  {
    name: 'Coca Cola 2L',
    description: 'Cold refreshing Coca Cola bottle',
    price: 120,
    discount: 10,
    image: 'https://dummyimage.com/300x300/f44336/ffffff&text=Coca+Cola',
    category: 'Beverages',
    subcategory: 'Cold Drinks',
    stock: 50,
    isActive: true,
    rating: 4.5,
    reviews: 120
  },
  {
    name: 'Pepsi 2L',
    description: 'Refreshing Pepsi Cola drink',
    price: 115,
    discount: 8,
    image: 'https://dummyimage.com/300x300/1e88e5/ffffff&text=Pepsi',
    category: 'Beverages',
    subcategory: 'Cold Drinks',
    stock: 45,
    isActive: true,
    rating: 4.3,
    reviews: 98
  },
  {
    name: 'Lay\'s Classic Salted Chips',
    description: 'Crispy salted potato chips',
    price: 50,
    discount: 5,
    image: 'https://dummyimage.com/300x300/ffc107/000000&text=Lays+Chips',
    category: 'Snacks',
    subcategory: 'Chips',
    stock: 100,
    isActive: true,
    rating: 4.6,
    reviews: 250
  },
  {
    name: 'Cadbury Dairy Milk',
    description: 'Delicious chocolate bar',
    price: 40,
    discount: 0,
    image: 'https://dummyimage.com/300x300/8b4513/ffffff&text=Cadbury',
    category: 'Snacks',
    subcategory: 'Chocolate',
    stock: 150,
    isActive: true,
    rating: 4.7,
    reviews: 320
  },
  {
    name: 'Britannia Tiger Biscuits',
    description: 'Crunchy tea biscuits',
    price: 35,
    discount: 10,
    image: 'https://dummyimage.com/300x300/d2691e/ffffff&text=Britannia',
    category: 'Snacks',
    subcategory: 'Biscuits',
    stock: 80,
    isActive: true,
    rating: 4.4,
    reviews: 180
  },
  {
    name: 'Sprite 2L',
    description: 'Lemon flavored carbonated drink',
    price: 110,
    discount: 8,
    image: 'https://dummyimage.com/300x300/76ff03/000000&text=Sprite',
    category: 'Beverages',
    subcategory: 'Cold Drinks',
    stock: 60,
    isActive: true,
    rating: 4.5,
    reviews: 140
  },
  {
    name: 'Doritos Nacho Cheese',
    description: 'Cheesy corn chips',
    price: 60,
    discount: 12,
    image: 'https://dummyimage.com/300x300/ff9800/000000&text=Doritos',
    category: 'Snacks',
    subcategory: 'Chips',
    stock: 75,
    isActive: true,
    rating: 4.5,
    reviews: 200
  },
  {
    name: 'Amul Butter',
    description: 'Fresh butter 500g',
    price: 180,
    discount: 5,
    image: 'https://dummyimage.com/300x300/ffe082/000000&text=Amul+Butter',
    category: 'Dairy',
    subcategory: 'Butter',
    stock: 40,
    isActive: true,
    rating: 4.8,
    reviews: 95
  },
  {
    name: 'Parle G Biscuits',
    description: 'Classic sweet biscuits',
    price: 25,
    discount: 0,
    image: 'https://dummyimage.com/300x300/ff6f00/ffffff&text=Parle+G',
    category: 'Snacks',
    subcategory: 'Biscuits',
    stock: 200,
    isActive: true,
    rating: 4.6,
    reviews: 450
  },
  {
    name: 'Frooti Mango Drink',
    description: 'Fruity mango beverage',
    price: 30,
    discount: 5,
    image: 'https://dummyimage.com/300x300/ff6f00/ffffff&text=Frooti',
    category: 'Beverages',
    subcategory: 'Juices',
    stock: 120,
    isActive: true,
    rating: 4.2,
    reviews: 160
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✓ Connected to MongoDB');

    // Clear existing products (optional - comment out to keep existing)
    // await Product.deleteMany({});
    // console.log('Cleared existing products');

    const created = await Product.insertMany(sampleProducts);
    console.log(`✓ Created ${created.length} sample products:\n`);
    
    created.forEach(product => {
      console.log(`  • ${product.name} - ₹${product.price} (${product.category} > ${product.subcategory})`);
    });
    
    console.log('\n✓ Products seeded successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    if (error.code === 11000) {
      console.log('⚠ Some products already exist (skipped duplicates)');
      await mongoose.connection.close();
      process.exit(0);
    }
    console.error('✗ Error seeding products:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedProducts();
