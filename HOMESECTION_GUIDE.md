# Home Section Management System - Complete Implementation Guide

## Overview
Admin-controlled dynamic home page sections system where admins can create, edit, reorder, and manage which product categories appear on the homepage without coding.

## Architecture

### Database Models
**HomeSection.js** - MongoDB schema
```javascript
{
  title: String,              // Section title (e.g., "Cold Drinks & Juices")
  description: String,        // Optional description
  subcategoryFilter: String,  // Filter to match product subcategories (case-insensitive)
  categoryPath: String,       // Navigation path for "View More" (e.g., "beverages")
  displayOrder: Number,       // Sort order (1, 2, 3, etc.)
  image: String,              // Optional image URL for section thumbnail
  isActive: Boolean,          // Show/hide without deleting
  createdAt: Date,            // Auto timestamp
  updatedAt: Date             // Auto timestamp
}
```

### Backend API Routes

**Base URL:** `/home-sections`

#### Public Endpoints
- **GET /home-sections** - Fetch all active sections (sorted by displayOrder)
  - Returns: Array of section objects
  - Used by: Home.jsx, Dashboard.jsx (customers)

#### Admin Endpoints (require token + admin role)
- **GET /home-sections/admin/all** - Fetch all sections including inactive
  - Returns: Array of all section objects
  - Used by: HomeSectionManagement component

- **GET /home-sections/:id** - Fetch single section
  - Returns: Single section object

- **POST /home-sections/add** - Create new section
  - Body: {title, description, subcategoryFilter, categoryPath, displayOrder, image}
  - Returns: Created section object

- **PUT /home-sections/:id** - Update section
  - Body: {title, description, subcategoryFilter, categoryPath, displayOrder, image, isActive}
  - Returns: Updated section object

- **DELETE /home-sections/:id** - Delete section
  - Returns: Success message

- **PATCH /home-sections/:id/toggle** - Toggle active status
  - Returns: Updated section object with toggled isActive

### Frontend Components

#### HomeSectionManagement.jsx
Admin panel for managing home sections
- **Location:** `Frontend/src/pages/Admin/ProductManagement/HomeSectionManagement.jsx`
- **Features:**
  - List all sections with search/filter
  - Create new section with form
  - Edit existing section (click "Edit" button)
  - Delete section (with confirmation)
  - Toggle active/inactive status
  - Reorder sections by displayOrder
- **State Management:**
  - `sections[]` - List of all sections
  - `loading` - Fetch status
  - `showForm` - Show/hide form
  - `editingId` - Track which section is being edited
  - `formData` - Form inputs

#### Home.jsx & Dashboard.jsx
Customer pages that display sections dynamically
- **Changes:**
  - Added `homeSections[]` state
  - Fetch from `/home-sections` on mount
  - Map sections to SubcategorySection components dynamically
  - Removed hardcoded SubcategorySection JSX

```jsx
// Now dynamically renders sections:
{homeSections.map((section) => (
  <SubcategorySection 
    key={section._id}
    products={products}
    sectionTitle={section.title}
    subcategoryFilter={section.subcategoryFilter}
    navigatePath={section.categoryPath}
  />
))}
```

#### Integration in ProductManagement
- Added HomeSectionManagement component as "Home Sections" tab
- Location in tabs: Products | Categories | Subcategories | **Home Sections**
- Access: Admin > Product Management > Home Sections tab

## Data Flow

### Creating a Section
1. Admin clicks "+ Add New Section" in HomeSectionManagement
2. Form appears with fields: title, description, subcategoryFilter, categoryPath, displayOrder, image, isActive
3. Admin fills form and clicks "Create Section"
4. POST to `/home-sections/add` with form data
5. Backend validates and inserts into database
6. Response returned with created section
7. Component adds to local `sections[]` state
8. UI updates to show new section in list

### Displaying Sections on Homepage
1. Home.jsx / Dashboard.jsx mounts
2. Fetches `/home-sections` (public endpoint, no auth needed)
3. Returns only active sections sorted by displayOrder
4. Maps to SubcategorySection components
5. SubcategorySection filters products by subcategoryFilter
6. Displays matching products in a card layout

### Reordering Sections
1. Admin edits section and changes displayOrder (e.g., 1 → 3)
2. Clicks "Update Section"
3. PUT request updates displayOrder
4. Database returns updated section
5. UI re-renders with new order (auto-sorted by displayOrder on next fetch)

### Toggling Active Status
1. Admin clicks "Active" or "Inactive" button on section card
2. PATCH to `/home-sections/:id/toggle` flips isActive boolean
3. Section immediately hidden/shown on homepage (next page load)
4. Admin can hide sections temporarily without deleting

## Setup Instructions

### 1. Database Migration
The HomeSection model already exists. If needed, run seed script:

```bash
# From server directory
npm run seed:home-sections

# Or manually:
node scripts/seedHomeSectionsDirect.js
```

### 2. Backend Configuration
- Route already added to `server.js`
- HomeSection model already created
- All API endpoints ready to use

### 3. Frontend Configuration
- All components created and integrated
- HomeSectionManagement added to ProductManagement
- Home.jsx and Dashboard.jsx updated to fetch sections
- API calls use environment variable `VITE_API_BASE_URL`

### 4. Environment Variables Needed
Both frontend and backend use:
- `VITE_API_BASE_URL` (Frontend) - API base URL (e.g., http://localhost:5000)
- `MONGO_URL` (Backend) - MongoDB connection string
- `JWT_SECRET` (Backend) - For token verification

## Usage Examples

### For Admins
1. Navigate to Admin > Product Management
2. Click "Home Sections" tab
3. Click "+ Add New Section"
4. Fill in:
   - Title: "Cold Drinks & Juices"
   - Description: "Refreshing beverages..."
   - Subcategory Filter: "juice"
   - Category Path: "beverages"
   - Display Order: 1
   - Image URL: (Unsplash or custom image)
5. Click "Create Section"
6. Section appears on homepage immediately!

### For Customers
- Visit homepage or dashboard
- See dynamically loaded sections in order
- Click "View More" under section to see all products in that category

## Key Features

✅ **Dynamic Sections** - No code changes needed to add/remove sections
✅ **Reorderable** - Control section order with displayOrder field
✅ **Toggleable** - Hide sections without deleting with isActive flag
✅ **Image Support** - Each section can have a thumbnail image
✅ **Description** - Optional section descriptions
✅ **Admin Control** - Full CRUD operations in admin panel
✅ **Public API** - Frontend can fetch sections without authentication
✅ **Admin API** - Protected endpoints with token + role verification

## Troubleshooting

### Sections not showing on homepage?
1. Check if sections are marked `isActive: true`
2. Check displayOrder - sections sorted by this field ascending
3. Check browser console for API errors
4. Verify `subcategoryFilter` matches product subcategory field

### Admin can't access HomeSectionManagement?
1. Verify user has `role: 'admin'` in database
2. Check JWT token is valid
3. Check browser console for Authorization errors
4. Clear localStorage and re-login

### Sections ordered incorrectly?
1. Check displayOrder values (should be 1, 2, 3, etc.)
2. Sections sorted by displayOrder ascending
3. Edit section to change order

### Image not loading?
1. Check image URL is valid and publicly accessible
2. Check CORS headers allow image domain
3. Try with Unsplash URL: https://images.unsplash.com/...

## Files Modified/Created

### Backend
- ✅ `server/models/HomeSection.js` - MongoDB schema (NEW)
- ✅ `server/routes/homeSection.js` - API endpoints (NEW)
- ✅ `server/server.js` - Route registration (MODIFIED)
- ✅ `server/scripts/seedHomeSectionsDirect.js` - Seed script (NEW)

### Frontend
- ✅ `Frontend/src/pages/Admin/ProductManagement/HomeSectionManagement.jsx` - Admin component (NEW)
- ✅ `Frontend/src/pages/Guest/Home.jsx` - Dynamic sections (MODIFIED)
- ✅ `Frontend/src/pages/Customer/Dashboard.jsx` - Dynamic sections (MODIFIED)
- ✅ `Frontend/src/pages/Admin/ProductManagement/index.jsx` - Tab integration (MODIFIED)

## Next Steps
1. Run seed script to create initial sections
2. Test by navigating to Admin > Product Management > Home Sections
3. Create a test section
4. Visit homepage to see it displayed
5. Reorder, edit, delete, and toggle sections as needed

## API Testing with cURL

```bash
# Get all active sections (public)
curl http://localhost:5000/home-sections

# Create section (needs token)
curl -X POST http://localhost:5000/home-sections/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "Fresh Fruits",
    "description": "Organic fresh fruits",
    "subcategoryFilter": "fruits",
    "categoryPath": "produce",
    "displayOrder": 4,
    "image": "https://images.unsplash.com/...",
    "isActive": true
  }'

# Get all sections (including inactive - admin only)
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:5000/home-sections/admin/all

# Update section
curl -X PUT http://localhost:5000/home-sections/SECTION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"displayOrder": 2, "isActive": true}'

# Toggle active status
curl -X PATCH http://localhost:5000/home-sections/SECTION_ID/toggle \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Delete section
curl -X DELETE http://localhost:5000/home-sections/SECTION_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Performance Notes
- Sections fetched once on page mount (cached in React state)
- Queries use MongoDB `find()` with `.sort({displayOrder: 1})`
- No N+1 queries - sections self-contained
- Recommended: Limit to 10-20 sections per homepage
- Images should be small (~50KB) for fast loading
