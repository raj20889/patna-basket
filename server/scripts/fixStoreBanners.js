// Fix script - update store banner URLs to use placeholder images
const mongoose = require('mongoose');
const VirtualStore = require('../models/VirtualStore');
const dotenv = require('dotenv');

dotenv.config();

const fixStoreBanners = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✓ Connected to MongoDB');

    // Update stores with new working URLs
    const updates = [
      {
        storeName: 'Paan Corner',
        storeBanner: 'https://via.placeholder.com/400x300?text=Paan+Corner'
      },
      {
        storeName: 'Fresh Market',
        storeBanner: 'https://via.placeholder.com/400x300?text=Fresh+Market'
      },
      {
        storeName: 'Beauty & Wellness',
        storeBanner: 'https://via.placeholder.com/400x300?text=Beauty+Wellness'
      },
      {
        storeName: 'Snack Station',
        storeBanner: 'https://via.placeholder.com/400x300?text=Snack+Station'
      },
      {
        storeName: 'Home Essentials',
        storeBanner: 'https://via.placeholder.com/400x300?text=Home+Essentials'
      },
      {
        storeName: 'Local Favorites',
        storeBanner: 'https://via.placeholder.com/400x300?text=Local+Favorites'
      }
    ];

    console.log('\nUpdating store banner URLs...\n');

    for (const update of updates) {
      const result = await VirtualStore.updateOne(
        { storeName: update.storeName },
        { $set: { storeBanner: update.storeBanner } }
      );
      console.log(`✓ Updated ${update.storeName}`);
    }

    console.log('\n✓ All store banners updated successfully!');
    console.log('\nRefresh your browser to see the changes.');

  } catch (err) {
    console.error('✗ Error updating stores:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

fixStoreBanners();
