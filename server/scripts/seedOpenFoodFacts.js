// Seed products from Open Food Facts into our database
// Legitimate public API: https://world.openfoodfacts.org/data

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

const MONGO_URL = process.env.MONGO_URL;

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function pickImage(p) {
  return (
    p.image_url ||
    p.image_front_url ||
    p.image_small_url ||
    p.image_thumb_url ||
    ''
  );
}

function toTitle(str) {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

function randomPrice(min = 20, max = 200) {
  const r = Math.random() * (max - min) + min;
  return Math.round(r * 100) / 100; // 2 decimals
}

// Map OFF product to our schema
function mapProduct(off) {
  const name = off.product_name || off.generic_name || off.brands || 'Unnamed Product';
  const desc = off.ingredients_text || off.brands || '';
  const image = pickImage(off);
  const catMain = off.pnns_groups_1 ? [off.pnns_groups_1] : [];
  const catSub = off.pnns_groups_2 ? [off.pnns_groups_2] : [];

  return {
    name: name.trim(),
    desc: desc.trim(),
    price: randomPrice(),
    category: catMain.map(toTitle),
    subcategory: catSub.map(toTitle),
    image,
    discount: { isActive: false, type: 'percentage', value: 0 },
    deliveryTime: '30 MINS',
    badges: []
  };
}

async function ensureCategory(catName) {
  if (!catName) return null;
  const name = toTitle(catName);
  let cat = await Category.findOne({ name });
  if (!cat) {
    cat = await Category.create({
      name,
      description: `${name} products`,
      icon: '',
      categoryImage: '',
      thumbnailImage: '',
      backgroundColor: '#ffffff'
    });
    console.log(`+ Category created: ${name}`);
  }
  return cat;
}

async function ensureSubcategory(subName, catDoc) {
  if (!subName || !catDoc) return null;
  const name = toTitle(subName);
  let sub = await Subcategory.findOne({ name, category: catDoc._id });
  if (!sub) {
    sub = await Subcategory.create({
      name,
      category: catDoc._id,
      description: `${name} in ${catDoc.name}`,
      image: ''
    });
    console.log(`+ Subcategory created: ${catDoc.name} / ${name}`);
  }
  return sub;
}

async function fetchOpenFoodFactsProducts(limit = 50) {
  // Use search to get diverse items; fields doc: https://wiki.openfoodfacts.org/API
  const url = `https://world.openfoodfacts.org/cgi/search.pl?action=process&json=true&page_size=${limit}&fields=product_name,generic_name,brands,ingredients_text,image_url,image_front_url,image_small_url,image_thumb_url,pnns_groups_1,pnns_groups_2`;
  
  // Retry logic
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { timeout: 15000 });
      if (!res.ok) {
        if (i < 2) {
          console.log(`Retry ${i + 1}/3 after ${res.status}...`);
          await sleep(2000);
          continue;
        }
        throw new Error(`OFF fetch error: ${res.status}`);
      }
      const data = await res.json();
      const products = Array.isArray(data.products) ? data.products : [];
      return products;
    } catch (err) {
      if (i < 2) {
        console.log(`Network error, retry ${i + 1}/3...`);
        await sleep(2000);
      } else {
        throw err;
      }
    }
  }
  return [];
}

async function run() {
  if (!MONGO_URL) {
    console.error('MONGO_URL env not set');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URL);
  console.log('✓ Connected to MongoDB');

  try {
    const offProducts = await fetchOpenFoodFactsProducts(50);
    console.log(`Fetched ${offProducts.length} OFF products`);

    let created = 0;
    for (const off of offProducts) {
      const doc = mapProduct(off);
      if (!doc.name) continue;

      // Ensure Category/Subcategory documents exist
      let catDoc = null;
      if (doc.category && doc.category.length) {
        catDoc = await ensureCategory(doc.category[0]);
      }
      if (doc.subcategory && doc.subcategory.length && catDoc) {
        await ensureSubcategory(doc.subcategory[0], catDoc);
      }

      // Upsert by name to avoid duplicates
      await Product.updateOne(
        { name: doc.name },
        { $setOnInsert: doc },
        { upsert: true }
      );
      created += 1;
      if (created % 10 === 0) {
        console.log(`Inserted/Upserted ${created} products...`);
        await sleep(300); // polite pacing
      }
    }

    console.log(`✓ Finished. Upserted ${created} products.`);
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Disconnected');
    process.exit(0);
  }
}

run();
