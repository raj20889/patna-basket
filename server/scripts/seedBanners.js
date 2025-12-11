// Seed banners with current hardcoded slides
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Banner = require('../models/Banner');

dotenv.config();

const banners = [
  {
    title: 'Seasonal Sale',
    description: 'Seasonal deals and offers',
    image: 'https://mcprod.sparindia.com/media/catalog/category/web-header.png',
    path: 'seasonal-sale',
    displayOrder: 1,
    isActive: true
  },
  {
    title: 'Paan Corner',
    description: 'Fresh paan corner picks',
    image: 'https://cdn.zeptonow.com/production/tr:w-1280,ar-3840-705,pr-true,f-auto,q-80/inventory/banner/4ea3de05-f469-4df2-9548-db9c9863dfdf.png',
    path: 'paan-corner',
    displayOrder: 2,
    isActive: true
  },
  {
    title: 'Cadbury Offers',
    description: 'Chocolates for every mood',
    image: 'https://media.starquik.com/bannerslider/n/p/npobe_cadbury_cadbury_1400x400.jpg',
    path: 'special-offers',
    displayOrder: 3,
    isActive: true
  },
  {
    title: 'Mango Season',
    description: 'Fresh mango season picks',
    image: 'https://media.starquik.com/bannerslider/s/t/startquik_mango_25_post_1400x400.jpg',
    path: 'fruits',
    displayOrder: 4,
    isActive: true
  },
  {
    title: 'Paan Corner Duplicate',
    description: 'Additional paan corner banner',
    image: 'https://cdn.zeptonow.com/production/tr:w-1280,ar-3840-705,pr-true,f-auto,q-80/inventory/banner/4ea3de05-f469-4df2-9548-db9c9863dfdf.png',
    path: 'paan-corner',
    displayOrder: 5,
    isActive: true
  }
];

const seedBanners = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✓ Connected to MongoDB');

    const existingCount = await Banner.countDocuments();
    if (existingCount > 0) {
      console.log(`\n⚠ ${existingCount} banner(s) already exist. Skipping seeding...`);
      return;
    }

    console.log('\nSeeding banners...');
    const created = await Banner.insertMany(banners);
    console.log(`✓ Created ${created.length} banner(s):\n`);
    created.forEach((banner) => {
      console.log(`  • ${banner.title || banner.path} (Order: ${banner.displayOrder})`);
    });

    console.log('\n✓ Banner seeding completed!');
  } catch (err) {
    console.error('✗ Error seeding banners:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedBanners();
