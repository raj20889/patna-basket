const mongoose = require('mongoose');
const VirtualStore = require('../models/VirtualStore');
require('dotenv').config();

(async () => {
  await mongoose.connect(process.env.MONGO_URL);
  const stores = await VirtualStore.find({}).sort({displayOrder:1});
  stores.forEach(s=>{
    console.log(`${s.storeName}: banner=${s.storeBanner}`);
  });
  await mongoose.connection.close();
  process.exit(0);
})();
