# Patna Basket

Patna Basket is a quick commerce application designed to provide a seamless shopping experience.

## Tech Stack Used

### Frontend
- **React**: A JavaScript library for building user interfaces.
- **Vite**: A fast build tool that provides an instant development server and bundles your code for production.
- **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
- **Ant Design / Material-UI**: UI libraries for pre-built components.
- **Axios**: Promise-based HTTP client for making API requests.
- **React Router DOM**: For handling routing within the application.
- **JWT-Decode**: For decoding JSON Web Tokens.
- **React Toastify**: For displaying notifications.

### Backend
- **Node.js**: JavaScript runtime environment.
- **Express.js**: A fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB (Mongoose)**: A NoSQL database, with Mongoose as an ODM (Object Data Modeling) library for Node.js.
- **Bcrypt.js**: For hashing passwords.
- **CORS**: Middleware to enable Cross-Origin Resource Sharing.
- **Dotenv**: For loading environment variables from a `.env` file.
- **Express-Validator**: For request data validation.
- **JSON Web Token (JWT)**: For authentication and authorization.
- **Socket.io**: For real-time, bidirectional event-based communication.
- **Nodemon**: A utility that monitors for any changes in your source and automatically restarts your server.

## How to Run the App Locally

### Prerequisites
- Node.js (v18 or higher) and npm installed.
- MongoDB Atlas account or a local MongoDB instance running.

### Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
   (Replace `your_mongodb_connection_string` and `your_jwt_secret` with your actual MongoDB URI and a strong secret key.)
4. Start the backend server:
   ```bash
   npm start
   ```
   The backend server will run on `http://localhost:5000` (or your specified PORT).

### Frontend Setup
1. Navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend application will run on `http://localhost:5173` (or a similar port).

## Features Covered
- User Authentication (Registration, Login, Logout)
- Product Management (Listing, Viewing)
- Cart Management (Add to cart, Update quantity, Remove from cart)
- Address Management
- Order Placement
- Real-time communication (e.g., for order status updates, if implemented via Socket.io)

## Demo Login
(If you have specific demo credentials, please add them here. Otherwise, you can leave this section as a placeholder or remove it.)

- **Email**: `user@example.com`
- **Password**: `password123`
(Note: These are placeholder credentials. You will need to register a user after setting up the application.)