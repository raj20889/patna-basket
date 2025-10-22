# Patna Basket 🛒

[Live Demo](https://patna-basket.vercel.app/)

**Patna Basket** is a Quick Commerce grocery delivery platform based in Indrapuri, Patna. It allows users to order groceries online and get them delivered within **30 minutes**. The platform also supports self-pickup and local delivery via WhatsApp notifications.

---

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

├── .github/ # Optional: GitHub Actions / CI workflows
│ └── workflows/
│ └── deploy.yml
├── public/ # Static assets served directly
│ ├── index.html
│ └── logo.png
├── src/ # Main application source code
│ ├── api/ # API service definitions
│ │ ├── OrderService.js
│ │ ├── product.js
│ │ └── users.js
│ ├── assets/ # Images, icons, fonts
│ │ ├── Banner/
│ │ │ └── ...
│ │ └── logo.png
│ ├── components/ # Reusable UI components
│ │ ├── Admin/
│ │ │ └── ...
│ │ ├── Customer/
│ │ │ ├── AddressForm.jsx
│ │ │ ├── AddressList.jsx
│ │ │ ├── AddressManager.jsx
│ │ │ ├── AllProducts.jsx
│ │ │ ├── CandiesAndChocolates.jsx
│ │ │ ├── Checkout.jsx
│ │ │ ├── ColdDrinks.jsx
│ │ │ ├── ColdDrinksAndJuices.jsx
│ │ │ ├── CustomerOrders.jsx
│ │ │ ├── LocationSelector.jsx
│ │ │ ├── OrderConfirmation.jsx
│ │ │ ├── OrderDetails.jsx
│ │ │ ├── orders.js
│ │ │ ├── OrderStatusTracker.jsx
│ │ │ ├── OrderSummary.jsx
│ │ │ ├── PaymentMethods.jsx
│ │ │ ├── ProductCard.jsx
│ │ │ ├── RelatedProducts.jsx
│ │ │ ├── RollingPaperAndTobacco.jsx
│ │ │ ├── SearchResults.jsx
│ │ │ └── SnacksAndChips.jsx
│ │ ├── Navbar/
│ │ │ ├── AdminNavbar.jsx
│ │ │ ├── CustomerNavbar.jsx
│ │ │ ├── Navbar.jsx
│ │ │ └── PublicNavbar.jsx
│ │ ├── BannerComponent.jsx
│ │ ├── CandiesAndGums.jsx
│ │ ├── Cart.jsx
│ │ ├── CategoryGrid.jsx
│ │ ├── CategoryLinks.jsx
│ │ ├── CheckoutSlider.jsx
│ │ ├── ErrorBoundary.jsx
│ │ ├── PrivateRoute.jsx
│ │ ├── ProductComponent.jsx
│ │ ├── ProductDetails.jsx
│ │ ├── RelatedProducts.jsx
│ │ ├── RollingPaperAndTobacco.jsx
│ │ ├── SearchResultsPage.jsx
│ │ └── SubcategoryWithProducts.jsx
│ ├── contexts/
│ │ └── AuthContext.jsx
│ ├── hooks/
│ │ └── useAuth.js
│ ├── pages/
│ │ ├── Admin/
│ │ │ ├── DashboardAnalytics.jsx
│ │ │ ├── DeliveryManagement.jsx
│ │ │ ├── InvoiceManagement.jsx
│ │ │ ├── NotificationPanel.jsx
│ │ │ ├── OrderDetails.jsx
│ │ │ ├── OrderManagement.jsx
│ │ │ └── ProductManagement.jsx
│ │ ├── Customer/
│ │ │ ├── Dashboard.jsx
│ │ │ ├── ProductsLoaderTemplate.css
│ │ │ ├── ProductsLoaderTemplate.jsx
│ │ │ ├── AddProduct.jsx
│ │ │ ├── CartPage.jsx
│ │ │ ├── Home.jsx
│ │ │ ├── Login.jsx
│ │ │ └── Register.jsx
│ │ └── SharedPage.jsx
│ ├── utils/
│ │ └── api.js
│ ├── App.jsx
│ ├── index.css
│ ├── main.jsx
│ └── routes.jsx
├── .env
├── .eslintrc.cjs
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
├── vite.config.js
└── vercel.json

Backend
├── server/
│ ├── config/
│ │ └── db.js
│ ├── controllers/
│ │ ├── addressController.js
│ │ ├── authController.js
│ │ ├── cartController.js
│ │ ├── notificationController.js
│ │ ├── orderController.js
│ │ ├── productController.js
│ │ └── userController.js
│ ├── middlewares/
│ │ ├── addressValidation.js
│ │ └── verifyToken.js
│ ├── models/
│ │ ├── Address.js
│ │ ├── Cart.js
│ │ ├── Order.js
│ │ ├── Product.js
│ │ └── User.js
│ ├── routes/
│ │ ├── addressRoutes.js
│ │ ├── authRoutes.js
│ │ ├── cartRoutes.js
│ │ ├── notificationRoutes.js
│ │ ├── orderRoutes.js
│ │ ├── productRoutes.js
│ │ └── userRoutes.js
│ ├── utils/
│ │ └── errorHandler.js
│ ├── .env
│ ├── package.json
│ ├── package-lock.json
│ └── server.js
└── docker-compose.yml # Optional

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

