const mongoose = require('mongoose');
require('dotenv').config();

const updateStores = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    const db = mongoose.connection.db;
    
    const stores = [
      { name: 'dfssdg', url: 'https://dummyimage.com/400x300/f5f5f5/111111&text=Store+Banner' },
      { name: 'Paan Corner', url: 'https://dummyimage.com/400x300/f2e8dc/111111&text=Paan+Corner' },
      { name: 'Fresh Market', url: 'https://dummyimage.com/400x300/e8f5e9/111111&text=Fresh+Market' },
      { name: 'Beauty & Wellness', url: 'https://dummyimage.com/400x300/fce4ec/111111&text=Beauty+Wellness' },
      { name: 'Snack Station', url: 'https://dummyimage.com/400x300/fef3e0/111111&text=Snack+Station' },
      { name: 'Home Essentials', url: 'https://dummyimage.com/400x300/e3f2fd/111111&text=Home+Essentials' },
      { name: 'Local Favorites', url: 'https://dummyimage.com/400x300/fff3e0/111111&text=Local+Favorites' }
    ];
    
    let updated = 0;
    for (const store of stores) {
      const result = await db.collection('virtualstores').updateOne(
        { storeName: store.name },
        { $set: { storeBanner: store.url } }
      );
      if (result.modifiedCount > 0) {
        console.log(`✓ Updated ${store.name}`);
        updated++;
      }
    }
    
    console.log(`\n✓ Total updated: ${updated} stores`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

updateStores();
