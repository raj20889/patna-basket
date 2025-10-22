# Patna Basket 🛒

[Live Demo](https://patna-basket.vercel.app/)

**Patna Basket** is a Quick Commerce grocery delivery platform based in Indrapuri, Patna. It allows users to order groceries online and get them delivered within **30 minutes**. The platform also supports self-pickup and local delivery via WhatsApp notifications.

---
Photos
<img width="958" height="443" alt="image" src="https://github.com/user-attachments/assets/3addec17-9b5d-42a4-bfab-7826d58c7e56" />
<img width="960" height="392" alt="image" src="https://github.com/user-attachments/assets/e066e938-5b66-419c-ab23-34aefbc65ca0" />

<img width="948" height="400" alt="image" src="https://github.com/user-attachments/assets/160f20d9-32d1-403a-8e7b-f2933fbefe9b" />




## Features

### Customer
- Browse nearby grocery shops and products.
- Add products to cart and place orders.
- Track order status in real-time with **Socket.IO**.
- View delivery location on **Google Maps**.
- Option for **self-pickup** or **small radius delivery**.

### Admin
- Manage shops, products, and categories dynamically.
- Track all orders and deliveries.
- Manage delivery charges based on distance.

### Delivery Boy
- Receive order notifications.
- Update order status in real-time.
- View delivery route with Google Maps integration.

---

## Technology Stack

- **Frontend:** React.js, Vite, Tailwind CSS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Real-time:** Socket.IO  
- **Maps & Location:** Google Maps API

---

## Project Structure
├── .github/                       # Optional: For GitHub Actions/CI (e.g., automated deployments, tests)
│   └── workflows/
│       └── deploy.yml
├── public/                        # Static assets served directly (e.g., index.html, logo, favicons)
│   ├── index.html                 # Your main HTML file
│   └── logo.png                   # Example: Your project's logo
├── src/                           # Main application source code
│   ├── api/                       # API service definitions (frontend's interaction with backend)
│   │   ├── OrderService.js
│   │   ├── product.js
│   │   └── users.js
│   ├── assets/                    # Shared static assets (images, icons, fonts)
│   │   ├── Banner/
│   │   │   └── ... (e.g., 3.avif, a.webp, 1.webp from your previous carousel)
│   │   └── logo.png               # If not in public, put here for modularity
│   ├── components/                # Reusable UI components (not full pages)
│   │   ├── Admin/                 # Admin-specific reusable components
│   │   │   └── ...
│   │   ├── Customer/              # Customer-specific reusable components
│   │   │   ├── AddressForm.jsx
│   │   │   ├── AddressList.jsx
│   │   │   ├── AddressManager.jsx
│   │   │   ├── AllProducts.jsx
│   │   │   ├── CandiesAndChocolates.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── ColdDrinks.jsx
│   │   │   ├── ColdDrinksAndJuices.jsx
│   │   │   ├── CustomerOrders.jsx
│   │   │   ├── LocationSelector.jsx
│   │   │   ├── OrderConfirmation.jsx
│   │   │   ├── OrderDetails.jsx
│   │   │   ├── orders.js            # Assuming this is a component, not an API service
│   │   │   ├── OrderStatusTracker.jsx
│   │   │   ├── OrderSummary.jsx
│   │   │   ├── PaymentMethods.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── RelatedProducts.jsx
│   │   │   ├── RollingPaperAndTobacco.jsx
│   │   │   ├── SearchResults.jsx
│   │   │   └── SnacksAndChips.jsx
│   │   ├── Navbar/                # Navbar components (admin, customer, public)
│   │   │   ├── AdminNavbar.jsx
│   │   │   ├── CustomerNavbar.jsx
│   │   │   ├── Navbar.jsx           # Generic/Base Navbar
│   │   │   └── PublicNavbar.jsx
│   │   ├── BannerComponent.jsx      # From Image 2
│   │   ├── CandiesAndGums.jsx       # From Image 2
│   │   ├── Cart.jsx                 # From Image 2
│   │   ├── CategoryGrid.jsx         # From Image 2
│   │   ├── CategoryLinks.jsx        # From Image 2
│   │   ├── CheckoutSlider.jsx       # From Image 2
│   │   ├── ErrorBoundary.jsx        # From Image 2
│   │   ├── PrivateRoute.jsx         # From Image 2
│   │   ├── ProductComponent.jsx     # From Image 2
│   │   ├── ProductDetails.jsx       # From Image 2
│   │   ├── RelatedProducts.jsx      # From Image 2
│   │   ├── RollingPaperAndTobacco.jsx # From Image 2
│   │   ├── SearchResultsPage.jsx    # From Image 2
│   │   └── SubcategoryWithProducts.jsx # From Image 2
│   ├── contexts/                  # React Context APIs
│   │   └── AuthContext.jsx
│   ├── hooks/                     # Optional: Custom React Hooks
│   │   └── useAuth.js
│   ├── pages/                     # Top-level page components (routed components)
│   │   ├── Admin/                 # Admin-specific pages
│   │   │   ├── DashboardAnalytics.jsx
│   │   │   ├── DeliveryManagement.jsx
│   │   │   ├── InvoiceManagement.jsx
│   │   │   ├── NotificationPanel.jsx
│   │   │   ├── OrderDetails.jsx     # Assuming this is a page view of order details
│   │   │   ├── OrderManagement.jsx
│   │   │   └── ProductManagement.jsx
│   │   ├── Customer/              # Customer-specific pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ProductsLoaderTemplate.css # CSS for this specific loader (consider consolidating CSS)
│   │   │   ├── ProductsLoaderTemplate.jsx
│   │   │   ├── AddProduct.jsx       # If admin adds product via this page
│   │   │   ├── CartPage.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   └── SharedPage.jsx         # Example: A page that both admin/customer might access (e.g., About Us)
│   ├── utils/                     # Utility functions (helpers, constants)
│   │   └── api.js                 # Helper for API calls (e.g., axios instance, base URL)
│   ├── App.jsx                    # Main application component
│   ├── index.css                  # Global styles (or put in assets/styles)
│   ├── main.jsx                   # Entry point (e.g., where ReactDOM.render is called)
│   └── routes.jsx                 # Optional: If you have a separate file for routing configuration
├── .env                           # Environment variables
├── .eslintrc.cjs                  # ESLint configuration
├── .gitignore                     # Files/folders to ignore from Git
├── package.json                   # Project metadata and dependencies
├── package-lock.json              # Specific dependency versions
├── README.md                      # Project description, setup instructions, etc.
├── vite.config.js                 # Vite configuration
└── vercel.json                    # Vercel deployment configuration

BACKEND

├── server/                        # Your backend application (Node.js/Express)
│   ├── config/                    # Optional: Database connection, environment config
│   │   └── db.js                  # Database connection setup
│   ├── controllers/               # Business logic, handling requests and interacting with models
│   │   ├── addressController.js
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── notificationController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   └── userController.js
│   ├── middlewares/               # Express middleware functions
│   │   ├── addressValidation.js
│   │   └── verifyToken.js         # Authentication middleware (e.g., JWT verification)
│   ├── models/                    # Mongoose schemas or other ORM definitions
│   │   ├── Address.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/                    # Express route definitions, linking to controllers
│   │   ├── addressRoutes.js
│   │   ├── auth.js                # Renamed to authRoutes.js for consistency
│   │   ├── cart.js                # Renamed to cartRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── order.js               # This seems redundant if orderRoutes.js exists. Clarify or combine.
│   │   ├── orderRoutes.js
│   │   ├── product.js             # Renamed to productRoutes.js
│   │   └── users.js               # Renamed to userRoutes.js
│   ├── utils/                     # Optional: Backend utilities (e.g., error handlers, helpers)
│   │   └── errorHandler.js
│   ├── .env                       # Backend environment variables (e.g., DB URI, JWT secret)
│   ├── .gitignore                 # Backend specific gitignore
│   ├── package.json               # Backend dependencies
│   ├── package-lock.json
│   └── server.js                  # Main Express application entry point
├── .gitignore                     # Global .gitignore for the monorepo (e.g., ignoring .DS_Store, common build outputs)
├── README.md                      # Project overview, setup, usage for both frontend & backend
└── docker-compose.yml             # Optional: For containerizing both services



---

## Installation

### Backend
```bash
cd backend
npm install
npm run dev

cd frontend
npm install
npm run dev

