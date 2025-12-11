// Direct seed script - connects to DB and creates home sections
const mongoose = require('mongoose');
const HomeSection = require('../models/HomeSection');
const dotenv = require('dotenv');

dotenv.config();

const homeSections = [
  {
    title: 'Cold Drinks & Juices',
    description: 'Refreshing beverages to quench your thirst',
    subcategoryFilter: 'juice',
    categoryPath: 'beverages',
    displayOrder: 1,
    image: 'https://images.unsplash.com/photo-1600788148184-403f7691d6d0?w=400',
    isActive: true
  },
  {
    title: 'Snacks & Chips',
    description: 'Crunchy and delicious snacks for anytime',
    subcategoryFilter: 'chips',
    categoryPath: 'snacks',
    displayOrder: 2,
    image: 'https://images.unsplash.com/photo-1599599810694-2508a88e8a67?w=400',
    isActive: true
  },
  {
    title: 'Candies & Chocolates',
    description: 'Sweet treats for every occasion',
    subcategoryFilter: 'chocolate',
    categoryPath: 'snacks',
    displayOrder: 3,
    image: 'https://images.unsplash.com/photo-1599599810900-a9a76d49d6c4?w=400',
    isActive: true
  }
];

const seedHomeSections = async () => {
  try {
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✓ Connected to MongoDB');

    // Check existing sections
    const existingCount = await HomeSection.countDocuments();
    if (existingCount > 0) {
      console.log(`\n⚠ ${existingCount} section(s) already exist. Skipping seeding...`);
      return;
    }

    console.log('\nSeeding home sections...');
    
    const created = await HomeSection.insertMany(homeSections);
    console.log(`✓ Created ${created.length} home sections:\n`);
    
    created.forEach(section => {
      console.log(`  • ${section.title} (Order: ${section.displayOrder})`);
    });
    
    console.log('\n✓ Home sections seeding completed!');
  } catch (err) {
    console.error('✗ Error seeding home sections:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedHomeSections();
