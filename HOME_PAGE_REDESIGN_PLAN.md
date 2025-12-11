# Home Page Redesign Plan - Patna Basket
## Inspired by Zepto, Blinkit & Swiggy Instamart

---

## Executive Summary

This document outlines a comprehensive redesign of the Patna Basket home page to match the production-level quality and interactivity of leading quick commerce platforms (Zepto, Blinkit, Swiggy Instamart). All features will be admin-manageable through the existing Product Management dashboard.

**Goal**: Transform the home page into a conversion-optimized, visually engaging shopping experience with minimal load times and maximum interactivity.

---

## 1. Hero Section Redesign

### Current State
- Static banner carousel
- Basic navigation

### Proposed Changes

#### 1.1 Delivery Promise Banner
**What Competitors Do:**
- Blinkit: "Delivery in 18 minutes" - Large, bold text
- Zepto: "Delivery in 10 minutes" - Prominent header
- Swiggy: "14 MINS delivery" - Badge on products

**Implementation for Patna Basket:**
```
┌─────────────────────────────────────────┐
│  🚀 Delivery in 30 minutes or FREE      │
│     [Your Location: Patna, Bihar]       │
│     [Change Location]                   │
└─────────────────────────────────────────┘
```

**Admin Control:**
- Delivery time (number + unit: minutes/hours)
- Promise text (editable)
- Background color/gradient
- Icon selection
- Enable/disable feature

**Database Model: `DeliveryPromise`**
```javascript
{
  deliveryTime: Number,
  deliveryUnit: String, // 'minutes' or 'hours'
  promiseText: String, // "or FREE", "guaranteed"
  isActive: Boolean,
  backgroundColor: String,
  icon: String // URL or icon name
}
```

#### 1.2 Smart Search Bar with Quick Suggestions

**What Competitors Do:**
- Blinkit: "bread, sugar, butter, paneer, chocolate, curd, rice, egg, chips"
- Zepto: "Avocado | Strawberry | Pomegranate | Beetroot..."
- Swiggy: "Poker" "Ice Cream Cake" "Peanuts" "Condoms" etc.

**Implementation:**
```
┌────────────────────────────────────────────────────┐
│  🔍 Search for "Paan" "Milk" "Atta" "Eggs"        │
│  [Search 7000+ products]                           │
└────────────────────────────────────────────────────┘

Quick Searches (Clickable Chips):
[🥛 Milk] [🍞 Bread] [🥚 Eggs] [🍫 Chocolate]
```

**Features:**
- Autocomplete with product images
- Recent searches (user-specific)
- Trending searches (admin-defined)
- Search result count display
- Voice search integration

**Admin Control Panel: "Quick Search Management"**
- Add/Edit/Delete quick search terms
- Set display order
- Choose icon/emoji for each term
- Enable/disable individual searches
- Analytics: Click-through rate tracking

**Database Models:**

**`QuickSearch`**
```javascript
{
  keyword: String,
  displayText: String,
  icon: String, // emoji or image URL
  displayOrder: Number,
  isActive: Boolean,
  clickCount: Number, // analytics
  linkedProducts: [ObjectId] // optional pre-filtered results
}
```

**`TrendingSearch`** (Auto-populated from user searches)
```javascript
{
  keyword: String,
  searchCount: Number,
  lastSearchedAt: Date,
  weeklyTrend: Number // percentage change
}
```

---

## 2. Category Grid Enhancement

### Current State
- Basic category links
- Limited visual hierarchy

### Proposed Changes

#### 2.1 Image-Based Category Grid

**What Competitors Do:**
- Blinkit: "Shop by category" - 20+ categories with colorful images
- Zepto: Category icons with product images
- Swiggy: Image-heavy category tiles

**Implementation:**
```
Shop by Category
┌─────┬─────┬─────┬─────┬─────┬─────┐
│ 🥛  │ 🍞  │ 🥚  │ 🍚  │ 🧴  │ 🧹  │
│Dairy│Bread│Eggs │Rice │Bath │Clean│
└─────┴─────┴─────┴─────┴─────┴─────┘
```

**Features:**
- Large, high-quality category images (400x400px minimum)
- Hover effects: Scale + shadow + "Shop Now" overlay
- Lazy loading for images
- Grid responsiveness: 6 cols desktop, 4 tablet, 2 mobile

**Admin Enhancements for Category Model:**

**Enhanced `Category` Schema:**
```javascript
{
  name: String,
  description: String,
  icon: String, // emoji or small icon
  categoryImage: String, // NEW: Large banner image
  thumbnailImage: String, // NEW: Grid thumbnail
  backgroundColor: String, // NEW: Tile background
  displayOrder: Number,
  showOnHomepage: Boolean, // NEW: Toggle visibility
  featuredProducts: [ObjectId], // NEW: Highlight specific products
  isActive: Boolean
}
```

**Admin Panel: "Category Visual Settings"**
- Upload large category image
- Upload thumbnail (auto-crop to square)
- Set background color/gradient
- Choose display position (drag-and-drop ordering)
- Toggle "Show on Homepage"
- Select featured products for category

---

## 3. Product Sections with Themes

### Current State
- Generic "HomeSection" component
- No thematic organization

### Proposed Changes

#### 3.1 Multiple Themed Sections

**What Competitors Do:**
- Blinkit: "Hot deals" | "Your daily fresh needs" | "Snack it away"
- Zepto: "Laundry Care" | "Household Cleaning" | "Rice" | "Hair care"
- Swiggy: "Hot deals" with percentage badges

**Implementation:**

```
┌─────────────────────────────────────────────────┐
│  🔥 Hot Deals of the Day              [See All] │
├──────┬──────┬──────┬──────┬──────┬──────┬──────┤
│ 40%  │ 30%  │ 25%  │ 50%  │ 15%  │ 20%  │ 35%  │
│ OFF  │ OFF  │ OFF  │ OFF  │ OFF  │ OFF  │ OFF  │
│[IMG] │[IMG] │[IMG] │[IMG] │[IMG] │[IMG] │[IMG] │
│Prod1 │Prod2 │Prod3 │Prod4 │Prod5 │Prod6 │Prod7 │
│₹120  │₹85   │₹45   │₹200  │₹55   │₹95   │₹130  │
│ ADD  │ ADD  │ ADD  │ ADD  │ ADD  │ ADD  │ ADD  │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┘

┌─────────────────────────────────────────────────┐
│  🥬 Your Daily Fresh Needs            [See All] │
├──────┬──────┬──────┬──────┬──────┬──────┬──────┤
│[IMG] │[IMG] │[IMG] │[IMG] │[IMG] │[IMG] │[IMG] │
│Milk  │Bread │Eggs  │Paneer│Butter│Curd  │Atta  │
│₹28   │₹20   │₹110  │₹85   │₹52   │₹30   │₹220  │
│ ADD  │ ADD  │ ADD  │ ADD  │ ADD  │ ADD  │ ADD  │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┘

┌─────────────────────────────────────────────────┐
│  🍿 Snack Attack                      [See All] │
├──────┬──────┬──────┬──────┬──────┬──────┬──────┤
│[IMG] │[IMG] │[IMG] │[IMG] │[IMG] │[IMG] │[IMG] │
│Chips │Kurkur│Namken│Biscui│Chocol│Candy │Cookies│
│₹20   │₹20   │₹25   │₹30   │₹10   │₹5    │₹40   │
│ ADD  │ ADD  │ ADD  │ ADD  │ ADD  │ ADD  │ ADD  │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┘
```

**Enhanced `HomeSection` Schema:**
```javascript
{
  title: String,
  description: String,
  icon: String, // NEW: Section icon/emoji
  theme: String, // NEW: 'deals', 'fresh', 'snacks', 'essentials', 'premium', 'local'
  backgroundColor: String, // NEW: Section background
  titleColor: String, // NEW: Title text color
  displayOrder: Number,
  filter: String, // Existing: Category/subcategory filter
  maxProducts: Number, // NEW: Limit products shown (default 10)
  showDiscount: Boolean, // NEW: Display discount badges
  sectionStyle: String, // NEW: 'horizontal-scroll', 'grid', 'carousel'
  isActive: Boolean
}
```

**Admin Panel: "Section Theme Manager"**
- Pre-defined themes dropdown: Hot Deals, Fresh Essentials, Snacks, Premium, Local Favorites
- Custom theme creator: Choose colors, fonts, spacing
- Section layout selector: Horizontal scroll vs Grid vs Carousel
- Product selection mode: Auto (by filter) or Manual (drag products)
- Preview section before publish

#### 3.2 Discount Badge System

**What Competitors Do:**
- Large colored badges: "30% OFF" "49% OFF"
- Position: Top-left or top-right corner
- Colors: Red, orange, green (attention-grabbing)

**Implementation:**

**Enhanced `Product` Schema:**
```javascript
{
  // ... existing fields
  discount: {
    isActive: Boolean,
    type: String, // 'percentage' or 'flat'
    value: Number, // 30 for 30% or 50 for ₹50 off
    badgeColor: String, // 'red', 'orange', 'green', 'blue'
    badgeText: String, // Custom text like "SUPER SAVER" or "LIMITED OFFER"
    validUntil: Date // Expiry date
  },
  deliveryTime: String, // NEW: "18 MINS" or "30 MINS"
  badges: [String] // NEW: ['Bestseller', 'New Arrival', 'Local Favorite']
}
```

**Badge Priority System:**
1. Discount Badge (if discount > 20%)
2. Custom Badge (if set)
3. Delivery Time Badge
4. Stock Status ("Only 3 left!")

**Admin Panel: "Discount & Badges Manager"**
- Bulk apply discounts to categories/subcategories
- Schedule discounts: Start date + End date
- Badge library: Pre-designed badges + custom upload
- Badge position selector: Top-left, Top-right, Bottom
- A/B testing: Compare badge variants

---

## 4. "Shop by Store" Concept

### What Competitors Do
- Blinkit: "Shop by store" → Book Store, Pet Store, Stationery, Pharma, Sports, Party, Print, Beauty, Electronics
- Concept: Virtual stores within the platform

### Implementation for Patna Basket

```
┌──────────────────────────────────────────────────┐
│  🏪 Shop by Store                     [View All] │
├──────┬──────┬──────┬──────┬──────┬──────┬──────┤
│[IMG] │[IMG] │[IMG] │[IMG] │[IMG] │[IMG] │[IMG] │
│ 📚   │ 🐾   │ 💊   │ 🏏   │ 🎉   │ 🖨️   │ 🔌   │
│Book  │Pet   │Pharma│Sports│Party │Print │Elect.│
│Store │Store │Store │Store │Store │Store │Store │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┘
```

**New Database Model: `VirtualStore`**
```javascript
{
  storeName: String, // "Paan Corner", "Beauty Store", "Pharma"
  storeIcon: String, // Emoji or image URL
  storeBanner: String, // Large banner image
  storeDescription: String,
  storeColor: String, // Brand color
  categories: [ObjectId], // Linked categories
  subcategories: [ObjectId], // Linked subcategories
  featuredProducts: [ObjectId], // Highlighted products
  displayOrder: Number,
  isActive: Boolean,
  storeType: String // 'physical', 'virtual', 'partner'
}
```

**Use Cases for Patna Basket:**
1. **Paan Corner** → Cigarettes, Paan Masala, Tobacco (existing category)
2. **Local Favorites** → Products from local Patna brands
3. **Fresh Market** → Vegetables, Fruits, Dairy
4. **Beauty & Wellness** → Cosmetics, Skincare, Haircare
5. **Home Essentials** → Cleaning, Kitchen, Appliances
6. **Snack Station** → Chips, Namkeen, Biscuits, Chocolates

**Admin Panel: "Virtual Stores Manager"**
- Create new virtual store
- Assign categories/subcategories
- Upload store banner + icon
- Set store color theme
- Curate featured products
- Enable/disable store visibility

---

## 5. Enhanced Product Card Design

### Current State
- Basic product card with image, name, price, ADD button

### Proposed Changes

**What Competitors Show:**
- Large discount badge
- Delivery time badge
- Original price (strikethrough) + discounted price
- Product weight/quantity
- Product rating + review count
- High-quality product images

**New Product Card Structure:**

```
┌─────────────────┐
│  30% OFF   🔥   │ ← Badge overlay
│                 │
│    [Product]    │ ← High-res image
│     Image       │
│                 │
├─────────────────┤
│ Product Name    │
│ 500g | 4.5⭐    │ ← Weight + Rating
│                 │
│ ₹85  ₹120       │ ← New price + strikethrough
│                 │
│  [ ADD TO CART ]│ ← Prominent button
└─────────────────┘
```

**Features:**
- Image zoom on hover
- Quick view modal (without leaving page)
- Wishlist heart icon
- "Out of stock" overlay
- "Only X left" urgency badge
- Delivery time display

**Enhanced Frontend Component: `ProductCard.jsx`**
```jsx
<ProductCard>
  {discount > 0 && <DiscountBadge />}
  {badges.map(badge => <CustomBadge />)}
  <ProductImage 
    onHover="zoom" 
    lazyLoad={true}
  />
  <ProductInfo>
    <Name />
    <WeightAndRating />
    <PriceSection>
      <CurrentPrice />
      {originalPrice && <StrikethroughPrice />}
    </PriceSection>
    <StockIndicator />
    <AddToCartButton />
  </ProductInfo>
</ProductCard>
```

---

## 6. Popular Searches Section (SEO + UX)

### What Competitors Do
- Zepto: "Popular Searches" section at bottom with:
  - Products: Avocado, Strawberry, Pomegranate, etc.
  - Brands: Yakult, Aashirvaad, Lays, Amul, etc.
  - Categories: Grocery, Cigarettes, Chips, Curd, etc.

### Implementation

```
┌──────────────────────────────────────────────────┐
│  📈 Popular Searches                              │
├──────────────────────────────────────────────────┤
│  Products:                                        │
│  [Bread] [Milk] [Atta] [Eggs] [Paneer] [Rice]   │
│                                                   │
│  Brands:                                          │
│  [Amul] [Parle] [Britannia] [Tata] [Fortune]    │
│                                                   │
│  Categories:                                      │
│  [Dairy] [Paan Corner] [Snacks] [Beverages]     │
└──────────────────────────────────────────────────┘
```

**Purpose:**
- SEO: Internal linking to boost category/product pages
- UX: Quick access to popular items
- Analytics: Track popular search trends

**Admin Panel: "Popular Searches Config"**
- Auto-populate from analytics (top 50 searches)
- Manual override: Pin specific searches
- Group by type: Products, Brands, Categories
- Set display limit (default 20)

---

## 7. Interactive Features

### 7.1 Infinite Scroll for Categories
- Load products dynamically as user scrolls
- "Load More" button alternative
- Loading skeleton to indicate data fetch

### 7.2 Add to Cart Animation
- Product card → Cart icon animation
- Cart icon badge update with bounce effect
- Success toast: "Added to cart"

### 7.3 Sticky Header & Cart
- Header sticks on scroll
- Cart icon always visible
- Mini cart preview on hover

### 7.4 Loading Skeletons
- Replace loading spinners with skeleton screens
- Matches final content layout
- Smooth transition when data loads

**Implementation Libraries:**
- React Intersection Observer (infinite scroll)
- Framer Motion (animations)
- React Loading Skeleton (placeholders)

---

## 8. Mobile Optimization

### Features from Competitors
- Bottom navigation bar (Home, Categories, Search, Cart, Profile)
- Swipeable category cards
- Fixed "Add to Cart" button on product details
- App install banner

### Implementation

**Bottom Navigation (Mobile Only):**
```
┌─────┬─────┬─────┬─────┬─────┐
│ 🏠  │ 📋  │ 🔍  │ 🛒  │ 👤  │
│Home │Cats │Search Cart │Me   │
└─────┴─────┴─────┴─────┴─────┘
```

**App Install Prompt:**
```
┌────────────────────────────────────┐
│ 📱 Get faster access with our app  │
│     [Install Now] [Maybe Later]    │
└────────────────────────────────────┘
```

**Admin Control:**
- Enable/disable app install banner
- Set banner display frequency (every visit, once per week)
- Customize banner text + colors

---

## 9. Performance Optimizations

### Techniques Used by Competitors

1. **Image Optimization:**
   - WebP format with fallback
   - Multiple sizes for responsive images
   - CDN hosting (Cloudinary, imgix)

2. **Code Splitting:**
   - Lazy load components
   - Route-based splitting
   - Vendor bundle optimization

3. **Caching Strategy:**
   - Service workers for offline mode
   - Cache API responses (5-minute TTL)
   - Browser cache headers

4. **Bundle Size Reduction:**
   - Tree shaking
   - Remove unused CSS
   - Minification + compression

**Implementation Plan:**
- Use Next.js Image component or React Lazy Load Image
- Implement React.lazy() for all route components
- Setup Redis cache for API responses
- Use Webpack Bundle Analyzer to identify large modules

---

## 10. Admin Dashboard Additions

### New Management Sections

#### 10.1 Homepage Manager (New Tab)
- **Delivery Promise Settings**
- **Quick Search Management**
- **Section Theme Manager**
- **Virtual Stores Manager**
- **Popular Searches Config**
- **App Banner Settings**

#### 10.2 Discount Manager (New Tab)
- Bulk apply discounts
- Schedule discount campaigns
- Discount analytics (conversion rate)
- Badge library

#### 10.3 Analytics Dashboard (Enhanced)
- Top searched products
- Top clicked categories
- Conversion funnel
- Page load performance
- Cart abandonment rate

**UI Structure:**
```
Product Management Tabs:
┌──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│Prodct│Categ.│Subcat│Home  │Banner│Stores│Discnt│Analyt│
└──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘
```

---

## 11. Database Schema Summary

### New Models to Create

1. **`DeliveryPromise`** (singleton document)
2. **`QuickSearch`** (multiple documents)
3. **`TrendingSearch`** (auto-generated)
4. **`VirtualStore`** (multiple documents)

### Models to Enhance

1. **`Category`** → Add: categoryImage, thumbnailImage, backgroundColor, showOnHomepage, featuredProducts
2. **`HomeSection`** → Add: icon, theme, backgroundColor, titleColor, maxProducts, showDiscount, sectionStyle
3. **`Product`** → Add: discount (nested object), deliveryTime, badges (array)
4. **`Banner`** → Already complete ✅

---

## 12. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Create new database models (DeliveryPromise, QuickSearch, VirtualStore)
- [ ] Enhance existing models (Category, HomeSection, Product)
- [ ] Setup admin panels for new features
- [ ] Seed initial data (quick searches, virtual stores)

### Phase 2: Hero Section (Week 3)
- [ ] Implement Delivery Promise component
- [ ] Create Smart Search with suggestions
- [ ] Add Quick Search chips
- [ ] Setup search analytics tracking

### Phase 3: Category & Product Cards (Week 4)
- [ ] Redesign category grid with images
- [ ] Create enhanced ProductCard component
- [ ] Implement discount badge system
- [ ] Add loading skeletons

### Phase 4: Themed Sections (Week 5)
- [ ] Build section theme engine
- [ ] Create "Hot Deals" section with sorting
- [ ] Implement "Shop by Store" feature
- [ ] Add horizontal scroll for product sections

### Phase 5: Interactivity (Week 6)
- [ ] Add infinite scroll
- [ ] Implement cart animations
- [ ] Create sticky header
- [ ] Add hover effects

### Phase 6: Mobile & Performance (Week 7)
- [ ] Mobile bottom navigation
- [ ] App install banner
- [ ] Image optimization (WebP)
- [ ] Code splitting & lazy loading

### Phase 7: Analytics & Polish (Week 8)
- [ ] Setup analytics dashboard
- [ ] A/B testing for sections
- [ ] Performance monitoring
- [ ] Bug fixes & refinements

---

## 13. Design System

### Colors
- **Primary**: #00A82D (Green - Fresh/Fast delivery)
- **Discount**: #FF5252 (Red - Urgency)
- **Warning**: #FFA726 (Orange - Limited stock)
- **Info**: #42A5F5 (Blue - New arrivals)
- **Background**: #F5F5F5 (Light gray)
- **Text**: #212121 (Dark gray)

### Typography
- **Headings**: Inter Bold (24px, 20px, 18px)
- **Body**: Inter Regular (16px)
- **Price**: Inter SemiBold (20px)
- **Badges**: Inter Bold (12px uppercase)

### Spacing
- **Section Gap**: 48px
- **Card Gap**: 16px
- **Padding**: 16px (mobile), 24px (desktop)

### Shadows
- **Card Hover**: `0 8px 16px rgba(0,0,0,0.1)`
- **Badge**: `0 2px 8px rgba(0,0,0,0.15)`
- **Header**: `0 2px 4px rgba(0,0,0,0.08)`

---

## 14. Success Metrics

### KPIs to Track

1. **Conversion Rate**: Target 3% → 5%
2. **Page Load Time**: Target < 2 seconds
3. **Cart Addition Rate**: Target 15% → 25%
4. **Search Usage**: Target 30% of users
5. **Mobile Traffic**: Target 60%+ mobile users
6. **Average Order Value**: Target ₹500 → ₹650
7. **Bounce Rate**: Target < 40%

---

## 15. Technical Stack Updates

### Additional Libraries Needed

**Frontend:**
- `framer-motion` → Animations
- `react-intersection-observer` → Infinite scroll
- `react-loading-skeleton` → Loading states
- `react-hot-toast` → Toast notifications
- `swiper` → Enhanced carousels
- `react-lazy-load-image-component` → Image lazy loading

**Backend:**
- `node-cache` → In-memory caching
- `compression` → Response compression
- `helmet` → Security headers

**DevOps:**
- `lighthouse-ci` → Performance monitoring
- `webpack-bundle-analyzer` → Bundle optimization

---

## 16. Competitive Feature Comparison

| Feature | Blinkit | Zepto | Swiggy | Patna Basket (Proposed) |
|---------|---------|-------|--------|-------------------------|
| Delivery Time Badge | ✅ 18 min | ✅ 10 min | ✅ 14 min | ✅ 30 min |
| Quick Search Chips | ✅ | ✅ | ✅ | ✅ |
| Discount Badges | ✅ | ✅ | ✅ | ✅ |
| Shop by Store | ✅ | ❌ | ❌ | ✅ |
| Popular Searches SEO | ❌ | ✅ | ❌ | ✅ |
| Virtual Stores | ✅ | ❌ | ❌ | ✅ |
| Themed Sections | ✅ | ✅ | ✅ | ✅ |
| Admin Control | ❌ | ❌ | ❌ | ✅ (Full) |

---

## 17. User Flow Optimization

### Current Flow
```
Home → Category → Subcategory → Product → Cart → Checkout
```

### Proposed Flow (Multiple Entry Points)
```
Home → Quick Search → Product → Cart
Home → Hot Deals → Product → Cart
Home → Virtual Store → Category → Product → Cart
Home → Category Grid → Subcategory → Product → Cart
```

---

## 18. Accessibility Improvements

- **Keyboard Navigation**: Tab through all interactive elements
- **Screen Reader Support**: ARIA labels for all buttons/links
- **Color Contrast**: WCAG AA compliance (4.5:1 ratio)
- **Focus Indicators**: Visible focus states
- **Alt Text**: Descriptive alt text for all images

---

## 19. Localization Considerations

### Hindi Language Support
- All section titles in Hindi/English toggle
- Product names in local language
- Voice search in Hindi
- Regional payment methods (UPI, Paytm, PhonePe)

**Admin Panel:**
- "Language Settings" tab
- Translate section titles
- Set default language by location

---

## 20. Next Steps & Review Points

### Before Implementation Review
1. ✅ Design mockups approval
2. ✅ Database schema validation
3. ⏳ **USER REVIEW** (Current stage)
4. ⏳ Phase 1 sprint planning
5. ⏳ Setup staging environment

### Questions for User
1. **Priority Features**: Which features should we implement first?
2. **Virtual Stores**: Which stores are relevant for Patna customers?
3. **Delivery Promise**: Confirm average delivery time (30 min? 1 hour?)
4. **Budget**: Any premium features (e.g., video carousels) to skip?
5. **Timeline**: Prefer faster rollout (4 weeks) or comprehensive (8 weeks)?

---

## Appendix: Visual Reference Links

### Competitor Screenshots Analyzed
- Blinkit: Hero section, category grid, discount badges, product cards
- Zepto: Section themes, popular searches, delivery time badges
- Swiggy Instamart: Hot deals section, category images

### Design Inspiration
- Minimalist product cards
- Bold discount badges
- Fast-loading skeletons
- Micro-interactions (add to cart bounce)

---

**Document Version**: 1.0  
**Last Updated**: 2025  
**Author**: GitHub Copilot (Claude Sonnet 4.5)  
**Status**: Awaiting User Review ⏳
