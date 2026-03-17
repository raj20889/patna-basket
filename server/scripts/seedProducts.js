const dns = require('dns');
// Force Node to use Google DNS for SRV resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config({ path: './server/.env' });

// Connect to the database
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Database connected successfully'))
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

console.log('MONGO_URL:', process.env.MONGO_URL);

const fs = require('fs');
const path = require('path');


const filePath = path.join(__dirname, '../../Product_DATASET/Updated_Grocery_Inventory.csv');

const products = [
  {
    name: "Amul Milk 500ml",
    desc: "Fresh toned milk",
    price: 28,
    category: ["Dairy"],
    subcategory: ["Milk"],
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
    discount: { isActive: true, type: "percentage", value: 10, badgeColor: "green", badgeText: "10% OFF" },
    deliveryTime: "20 MINS",
    badges: ["Bestseller"],
    stock: 100
  },
  {
    name: "Maggi Noodles",
    desc: "2-minute instant noodles",
    price: 14,
    category: ["Snacks"],
    subcategory: ["Noodles"],
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
    discount: { isActive: false },
    deliveryTime: "15 MINS",
    badges: ["Popular"],
    stock: 200
  },
  {
    name: "Lay's Classic Chips",
    desc: "Salted potato chips",
    price: 20,
    category: ["Snacks"],
    subcategory: ["Chips"],
    image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707",
    discount: { isActive: true, type: "flat", value: 5, badgeColor: "orange", badgeText: "₹5 OFF" },
    deliveryTime: "20 MINS",
    badges: ["Trending"],
    stock: 150
  },
  {
    name: "Parle-G Biscuits",
    desc: "Glucose biscuits",
    price: 10,
    category: ["Snacks"],
    subcategory: ["Biscuits"],
    image: "https://images.unsplash.com/photo-1617196038435-9a1f40add352",
    discount: { isActive: false },
    deliveryTime: "25 MINS",
    badges: [],
    stock: 300
  },
  {
    name: "Tata Salt 1kg",
    desc: "Iodized salt",
    price: 28,
    category: ["Essentials"],
    subcategory: ["Salt"],
    image: "https://images.unsplash.com/photo-1582284540020-8acbe03f4924",
    discount: { isActive: true, type: "percentage", value: 5, badgeColor: "blue", badgeText: "5% OFF" },
    deliveryTime: "30 MINS",
    badges: ["Daily Use"],
    stock: 120
  },
  {
    name: "Aashirvaad Atta 5kg",
    desc: "Whole wheat flour",
    price: 250,
    category: ["Staples"],
    subcategory: ["Atta"],
    image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec",
    discount: { isActive: true, type: "percentage", value: 12, badgeColor: "green", badgeText: "SAVE" },
    deliveryTime: "30 MINS",
    badges: ["Bestseller"],
    stock: 80
  },
  {
    name: "Fortune Sunflower Oil 1L",
    desc: "Refined cooking oil",
    price: 140,
    category: ["Cooking"],
    subcategory: ["Oil"],
    image: "https://images.unsplash.com/photo-1604908177522-b8b00cc1c60e",
    discount: { isActive: false },
    deliveryTime: "30 MINS",
    badges: [],
    stock: 90
  },
  {
    name: "Coca Cola 750ml",
    desc: "Soft drink",
    price: 40,
    category: ["Beverages"],
    subcategory: ["Soft Drinks"],
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505",
    discount: { isActive: true, type: "flat", value: 5, badgeColor: "red", badgeText: "DEAL" },
    deliveryTime: "20 MINS",
    badges: ["Cold"],
    stock: 200
  },
  {
    name: "Real Orange Juice",
    desc: "Fruit juice 1L",
    price: 110,
    category: ["Beverages"],
    subcategory: ["Juice"],
    image: "https://images.unsplash.com/photo-1571689936114-7f9b8d6e92f0",
    discount: { isActive: false },
    deliveryTime: "20 MINS",
    badges: [],
    stock: 110
  },
  {
    name: "Bru Coffee 100g",
    desc: "Instant coffee",
    price: 95,
    category: ["Beverages"],
    subcategory: ["Coffee"],
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
    discount: { isActive: true, type: "percentage", value: 8, badgeColor: "orange", badgeText: "SALE" },
    deliveryTime: "25 MINS",
    badges: ["Hot"],
    stock: 75
  },
  {
    name: "Colgate Toothpaste",
    desc: "Strong teeth toothpaste",
    price: 55,
    category: ["Personal Care"],
    subcategory: ["Toothpaste"],
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5",
    discount: { isActive: false },
    deliveryTime: "30 MINS",
    badges: [],
    stock: 140
  },
  {
    name: "Lux Soap",
    desc: "Beauty soap",
    price: 35,
    category: ["Personal Care"],
    subcategory: ["Soap"],
    image: "https://images.unsplash.com/photo-1607000975856-0c0b0c0c0c0c",
    discount: { isActive: true, type: "flat", value: 3, badgeColor: "green", badgeText: "SAVE" },
    deliveryTime: "25 MINS",
    badges: [],
    stock: 200
  },
  {
    name: "Surf Excel Detergent",
    desc: "Washing powder",
    price: 120,
    category: ["Home Care"],
    subcategory: ["Detergent"],
    image: "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659",
    discount: { isActive: true, type: "percentage", value: 10, badgeColor: "blue", badgeText: "10% OFF" },
    deliveryTime: "30 MINS",
    badges: ["Cleaning"],
    stock: 90
  },
  {
    name: "Good Day Biscuits",
    desc: "Butter cookies",
    price: 30,
    category: ["Snacks"],
    subcategory: ["Biscuits"],
    image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec",
    discount: { isActive: false },
    deliveryTime: "20 MINS",
    badges: [],
    stock: 180
  }
];

const seedProducts = async () => {
  try {
    await Product.deleteMany({});
    console.log('All products deleted successfully!');

    await Product.insertMany(products);
    console.log('New products inserted successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
