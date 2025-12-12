# Virtual Store Experience - Implementation Guide

## Overview
The Virtual Store Experience is a comprehensive feature that simulates a real grocery store environment. Customers can browse products organized into shelves/sections, enjoy animations, and have a complete shopping experience.

## Architecture

### Frontend Components

#### 1. **StoreView.jsx** (Main Page)
- **Location**: `/Frontend/src/pages/Customer/VirtualStore/StoreView.jsx`
- **Purpose**: Main orchestrator for the Virtual Store
- **Features**:
  - Fetches store data from `/api/stores/:storeId`
  - Fetches products from `/api/products/store/:storeId`
  - Renders all sections and components
  - Handles loading and error states

#### 2. **ShopHeader.jsx** (Store Info Bar)
- **Location**: `/Frontend/src/components/VirtualStore/ShopHeader.jsx`
- **Purpose**: Displays store branding and key information
- **Features**:
  - Store banner image
  - Star rating display (⭐)
  - Category tags (max 4)
  - Delivery time (⏱️)
  - Distance/Location (📍)
  - Open/Closed status
  - Store description
  - Famous for items

#### 3. **ShelfRow.jsx** (Horizontal Scroll Shelf)
- **Location**: `/Frontend/src/components/VirtualStore/ShelfRow.jsx`
- **Purpose**: Reusable horizontal scrolling shelf component
- **Features**:
  - Smooth scroll with arrow buttons
  - Auto-hide arrows at edges
  - Maps products to StoreProductCard
  - Responsive design
  - Title and icon display

#### 4. **StoreProductCard.jsx** (Compact Product Card)
- **Location**: `/Frontend/src/components/VirtualStore/StoreProductCard.jsx`
- **Purpose**: Compact product display for shelves
- **Features**:
  - Product image with lazy loading
  - Price and discount badge
  - Add to cart (+/-) buttons
  - Redux cart integration
  - Hover scaling animation
  - Fixed width (w-32)

#### 5. **FloatingCartBar.jsx** (Sticky Cart Summary)
- **Location**: `/Frontend/src/components/VirtualStore/FloatingCartBar.jsx`
- **Purpose**: Fixed bottom bar showing cart info
- **Features**:
  - Cart item count badge
  - Total price display
  - Checkout button
  - Only visible when cart has items
  - Green gradient styling

#### 6. **OfferSection.jsx** (Promotions Display)
- **Location**: `/Frontend/src/components/VirtualStore/OfferSection.jsx`
- **Purpose**: Display active offers and deals
- **Features**:
  - Buy 1 Get 1 promotions
  - Flat discount offers
  - Limited stock deals
  - Color-coded by offer type
  - Clickable offer cards

#### 7. **CategoryAisle.jsx** (Category Section)
- **Location**: `/Frontend/src/components/VirtualStore/CategoryAisle.jsx`
- **Purpose**: Display products by category like store aisles
- **Features**:
  - Category icon and name
  - Description text
  - "View All" button for each category
  - Color-coded backgrounds
  - Uses ShelfRow internally

#### 8. **StoreInfo.jsx** (Store Details)
- **Location**: `/Frontend/src/components/VirtualStore/StoreInfo.jsx`
- **Purpose**: Display store information and policies
- **Features**:
  - Location and distance
  - Opening hours
  - Contact information
  - Delivery info
  - Store facilities (WiFi, Parking, ATM)
  - Important policies

#### 9. **ReviewSection.jsx** (Customer Reviews)
- **Location**: `/Frontend/src/components/VirtualStore/ReviewSection.jsx`
- **Purpose**: Display and manage customer reviews
- **Features**:
  - Store rating summary
  - Star ratings distribution chart
  - Individual review display
  - Verified badge for reviews
  - "Write Review" button
  - Helpful/Reply buttons

#### 10. **ShopTabs.jsx** (Navigation Tabs)
- **Location**: `/Frontend/src/components/VirtualStore/ShopTabs.jsx`
- **Purpose**: Navigation between store sections
- **Features**:
  - Customizable tabs
  - Active tab styling
  - Icon support
  - Mobile scrollable

### Backend API Endpoints

#### Store Endpoints
```
GET  /api/stores                  - Get all stores (paginated)
GET  /api/stores/:storeId         - Get single store details
GET  /api/stores/:storeId/products - Get products for store
POST /api/stores                  - Create store (admin)
PUT  /api/stores/:storeId         - Update store (admin)
DELETE /api/stores/:storeId       - Delete store (admin)
```

#### Response Examples

**GET /api/stores/:storeId**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "storeName": "Fresh Groceries & Veggies",
  "storeIcon": "🥕",
  "storeBanner": "https://...",
  "storeDescription": "Premium fresh vegetables...",
  "storeColor": "#22C55E",
  "rating": {
    "average": 4.5,
    "count": 150
  },
  "featuredProducts": [...],
  "visitCount": 42,
  "isActive": true
}
```

**GET /api/stores/:storeId/products**
```json
{
  "store": {...},
  "products": [...],
  "count": 24
}
```

### Database Models

#### VirtualStore Model
```javascript
{
  storeName: String (unique),
  storeIcon: String,
  storeBanner: String,
  storeDescription: String,
  storeColor: String,
  categories: [ObjectId -> Category],
  subcategories: [ObjectId -> Subcategory],
  featuredProducts: [ObjectId -> Product],
  displayOrder: Number,
  isActive: Boolean,
  storeType: enum['physical', 'virtual', 'partner'],
  visitCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Feature Sections

### 1. **Offers & Deals** (Top Section)
- Display 3-4 promotional offers
- Different types: Buy1Get1, Flat discount, Limited stock
- Color-coded and icon-based design

### 2. **Navigation Tabs**
- Sticky tabs below header
- Allows filtering by: All, Our Special, Trending, Snacks, Drinks, Fresh
- Easy category switching

### 3. **Product Shelves** (4 Main Sections)
- **⭐ Our Specials** - Featured/promoted products
- **🔥 Trending Now** - Currently popular items
- **🛍️ Best Sellers** - Best performing products
- **💰 Great Deals** - Discounted items

Each shelf shows 6-12 products in horizontal scroll with navigation arrows.

### 4. **Category Aisles**
- **🥛 Dairy & Eggs** - Milk, cheese, butter, eggs
- **🍿 Snacks & Bakery** - Packaged snacks, baked goods
- **🥤 Beverages** - Drinks, juices, sodas

Each aisle organized like a real store shelf with category icon and quick "View All" link.

### 5. **All Products Grid**
- Fallback grid view showing all store products
- 2-5 columns responsive design
- Quick product info: image, name, price

### 6. **Store Info Section**
- Location with map/distance display
- Opening hours with closed days
- Contact information
- Delivery time and charges
- Facilities (WiFi, Parking, ATM)
- Store policies

### 7. **Reviews Section**
- Overall store rating
- Rating distribution chart (5⭐, 4⭐, etc.)
- List of customer reviews with:
  - Verified badge
  - Date posted
  - Star rating
  - Review text
  - Reply button

## Routing

### Frontend Routes
```javascript
// Customer-only route
/store/:storeId  -> StoreView component with PrivateRoute protection
```

### Implementation in App.jsx
```jsx
import StoreView from './pages/Customer/VirtualStore/StoreView';

// Inside routes (with PrivateRoute wrapping)
<Route path="/store/:storeId" element={<StoreView />} />
```

## Redux Integration

### Cart Actions Used
- `ADD_TO_CART`: Add item to cart
- `REMOVE_FROM_CART`: Remove item
- `UPDATE_QUANTITY`: Change quantity

### Cart State
```javascript
{
  items: [
    {
      _id: String,
      name: String,
      price: Number,
      quantity: Number,
      image: String,
      discount: {...}
    }
  ]
}
```

## API Integration

### Environment Variables
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### Axios Calls in Components
```javascript
// Fetch store data
const storeRes = await axios.get(
  `${import.meta.env.VITE_API_BASE_URL}/stores/${storeId}`
);

// Fetch products
const productsRes = await axios.get(
  `${import.meta.env.VITE_API_BASE_URL}/products/store/${storeId}`
);
```

## Setup Instructions

### Backend Setup

1. **Create Model**
   - VirtualStore model already exists in `/server/models/VirtualStore.js`

2. **Create Routes**
   - Routes already exist in `/server/routes/stores.js`
   - Updated with `/api/stores/:storeId/products` endpoint

3. **Seed Data**
   ```bash
   cd server
   node scripts/seedVirtualStores.js
   ```

4. **Add Route to server.js**
   ```javascript
   const storesRouter = require('./routes/stores');
   app.use('/api/stores', storesRouter);
   ```

### Frontend Setup

1. **All components already created**:
   - `/Frontend/src/components/VirtualStore/`
   - `/Frontend/src/pages/Customer/VirtualStore/`

2. **Route already added** to App.jsx

3. **No additional setup needed** - components are ready to use

## Testing

### Manual Testing Checklist
- [ ] Navigate to `/store/:storeId`
- [ ] Verify store header displays correctly
- [ ] Check offers section renders
- [ ] Test shelf horizontal scrolling (arrows appear/hide)
- [ ] Click add to cart on products
- [ ] Verify cart updates in FloatingCartBar
- [ ] Check category aisles load
- [ ] Verify all products grid displays
- [ ] Check responsive design on mobile
- [ ] Test checkout button navigation
- [ ] Verify store info section shows correctly
- [ ] Check reviews display with ratings

### API Testing
```bash
# Test store retrieval
curl http://localhost:5000/api/stores

# Test single store
curl http://localhost:5000/api/stores/[storeId]

# Test store products
curl http://localhost:5000/api/stores/[storeId]/products
```

## Performance Optimizations

1. **Image Lazy Loading**
   - Images use `object-cover` for consistent sizing
   - Consider adding `loading="lazy"` attribute

2. **Pagination**
   - Products grid uses array slicing for sections
   - Can implement infinite scroll later

3. **Caching**
   - Store data can be cached in localStorage
   - Refresh on 5-minute interval

4. **Bundle Size**
   - Lucide icons are tree-shakeable
   - Only imported icons are bundled

## Future Enhancements

1. **Admin Panel**
   - Manage store sections and products
   - Create/edit offers
   - View analytics (visits, conversions)

2. **Advanced Features**
   - Search within store
   - Product recommendations
   - Store comparison
   - Wishlist feature
   - Product reviews within store

3. **Analytics**
   - Track shelf performance
   - Popular products
   - Conversion rates
   - Customer journey

4. **Mobile Apps**
   - Native iOS/Android apps
   - Push notifications for deals
   - QR code scanning

## File Structure Summary

```
Frontend/
├── src/
│   ├── pages/
│   │   └── Customer/
│   │       └── VirtualStore/
│   │           └── StoreView.jsx (Main page)
│   ├── components/
│   │   └── VirtualStore/
│   │       ├── ShopHeader.jsx
│   │       ├── ShelfRow.jsx
│   │       ├── StoreProductCard.jsx
│   │       ├── FloatingCartBar.jsx
│   │       ├── OfferSection.jsx
│   │       ├── CategoryAisle.jsx
│   │       ├── StoreInfo.jsx
│   │       ├── ReviewSection.jsx
│   │       └── ShopTabs.jsx
│   └── App.jsx (route configured)

Server/
├── models/
│   └── VirtualStore.js (Model)
├── routes/
│   └── stores.js (API endpoints)
└── scripts/
    └── seedVirtualStores.js (Seed data)
```

## Troubleshooting

### Issue: Store not found
- Check `/api/stores/:storeId` returns data
- Verify storeId in URL matches database

### Issue: Products not loading
- Check `/api/stores/:storeId/products` endpoint
- Verify products exist in database
- Check featured products array is populated

### Issue: Cart not updating
- Verify Redux store is initialized
- Check cart actions are dispatched correctly
- Verify localStorage cart persistence

### Issue: Images not loading
- Check image URLs are valid
- Verify CORS is configured on image server
- Check network tab for image 404s

## Support & Documentation

For detailed component documentation, see inline JSDoc comments in each component file.

For API documentation, check `/server/routes/stores.js` for endpoint details.

For styling, all components use Tailwind CSS utilities for consistency.
