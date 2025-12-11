// Seed home sections with default data
const axios = require('axios');

const API_URL = 'http://localhost:5000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'your-admin-token-here';

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
    console.log('Seeding home sections...');
    
    for (const section of homeSections) {
      const response = await axios.post(
        `${API_URL}/home-sections/add`,
        section,
        {
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`
          }
        }
      );
      console.log(`✓ Created section: ${response.data.section.title}`);
    }
    
    console.log('\n✓ Home sections seeding completed!');
  } catch (err) {
    console.error('Error seeding home sections:', err.response?.data || err.message);
  }
};

seedHomeSections();
