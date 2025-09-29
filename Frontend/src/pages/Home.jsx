// Home.jsx
import React, { useState, useEffect, useMemo, Suspense } from "react";
import axios from "axios";
import PublicNavbar from "../components/Navbar/PublicNavbar";
import BannerComponent from "../components/BannerComponent";
import CategoryLinks from "../components/CategoryLinks";
import CategoryGrid from "../components/CategoryGrid";
import ProductsLoaderTemplate from "./Customer/ProductsLoaderTemplate";

// Lazy load heavy sections
const RelatedProducts = React.lazy(() => import("../components/RelatedProducts"));
const ColdDrinksJuices = React.lazy(() => import("../components/ColdDrinksJuices"));
const RollingPaperTobacco = React.lazy(() => import("../components/RollingPaper&Tobacco"));
const SnacksAndChips = React.lazy(() => import("../components/SnacksAndChips"));
const CandiesAndGums = React.lazy(() => import("../components/CandiesAndGums"));
const ProductComponent = React.lazy(() => import("../components/ProductComponent"));

const Home = () => {
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState({});
  const [cartUpdated, setCartUpdated] = useState(false);
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const role = localStorage.getItem("role");

  // Check auth status on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    setUserIsLoggedIn(!!token);
  }, []);

  // Build product map for faster cart calculations
  const productMap = useMemo(() => {
    const map = {};
    products.forEach((p) => (map[p._id] = p));
    return map;
  }, [products]);

  // Calculate totals from cart state
  const calculateTotals = (cartItems) => {
    const count = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
    const total = Object.entries(cartItems).reduce((sum, [productId, qty]) => {
      return sum + (productMap[productId]?.price || 0) * qty;
    }, 0);
    return { count, total };
  };

  // Fetch products first
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products`);
        setProducts(res.data);
      } catch (err) {
        console.error("Products fetch error:", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    if (role !== "admin") fetchProducts();
  }, [role]);

  // Fetch cart separately
  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (userIsLoggedIn) {
          const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/cart`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          const cartMap = {};
          res.data.products?.forEach((item) => {
            cartMap[item.productId._id] = item.quantity;
          });
          setCart(cartMap);
          const { count, total } = calculateTotals(cartMap);
          setCartCount(count);
          setTotalPrice(total);
        } else {
          const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
          const cartMap = {};
          guestCart.forEach((item) => {
            cartMap[item.productId] = item.quantity;
          });
          setCart(cartMap);
          const { count, total } = calculateTotals(cartMap);
          setCartCount(count);
          setTotalPrice(total);
        }
      } catch (err) {
        console.error("Cart fetch error:", err);
      }
    };

    if (role !== "admin") fetchCart();
  }, [role, cartUpdated, userIsLoggedIn, productMap]);

  // Handle cart changes
  const handleCartChange = async (productId, change) => {
    const currentQty = cart[productId] || 0;
    const newQty = currentQty + change;

    if (newQty < 0) return;

    setLoading((prev) => ({ ...prev, [productId]: true }));

    try {
      if (!userIsLoggedIn) {
        // Guest cart
        const product = productMap[productId];
        if (!product) return;

        let guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
        const index = guestCart.findIndex((item) => item.productId === productId);

        if (index > -1) {
          if (newQty > 0) {
            guestCart[index].quantity = newQty;
          } else {
            guestCart.splice(index, 1);
          }
        } else if (newQty > 0) {
          guestCart.push({
            productId,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: newQty,
          });
        }

        localStorage.setItem("guestCart", JSON.stringify(guestCart));

        const updatedCart = { ...cart };
        if (newQty > 0) {
          updatedCart[productId] = newQty;
        } else {
          delete updatedCart[productId];
        }

        setCart(updatedCart);
        const { count, total } = calculateTotals(updatedCart);
        setCartCount(count);
        setTotalPrice(total);
      } else {
        // User cart
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/cart/add`,
          { productId, quantity: newQty },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.data.products) {
          const cartMap = {};
          res.data.products.forEach((item) => {
            cartMap[item.productId._id] = item.quantity;
          });

          setCart(cartMap);
          const { count, total } = calculateTotals(cartMap);
          setCartCount(count);
          setTotalPrice(total);
        }
      }
      setCartUpdated((prev) => !prev);
    } catch (err) {
      console.error("Cart update error:", err);
    } finally {
      setLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  if (loadingProducts) {
    return <ProductsLoaderTemplate />;
  }

  return (
    <div>
      <PublicNavbar cartCount={cartCount} totalPrice={totalPrice} />
      {role !== "admin" && (
        <>
          <BannerComponent />
          <CategoryLinks />
          <CategoryGrid />

          <Suspense fallback={<div>Loading...</div>}>
            <RelatedProducts
              products={products}
              cart={cart}
              onCartChange={handleCartChange}
              isLoggedIn={userIsLoggedIn}
              cartUpdated={cartUpdated}
            />
            <ColdDrinksJuices
              products={products}
              cart={cart}
              onCartChange={handleCartChange}
              isLoggedIn={userIsLoggedIn}
              cartUpdated={cartUpdated}
            />
            <RollingPaperTobacco
              products={products}
              cart={cart}
              onCartChange={handleCartChange}
              isLoggedIn={userIsLoggedIn}
              cartUpdated={cartUpdated}
            />
            <SnacksAndChips
              products={products}
              cart={cart}
              onCartChange={handleCartChange}
              isLoggedIn={userIsLoggedIn}
              cartUpdated={cartUpdated}
            />
            <CandiesAndGums
              products={products}
              cart={cart}
              onCartChange={handleCartChange}
              isLoggedIn={userIsLoggedIn}
              cartUpdated={cartUpdated}
            />
            <ProductComponent
              products={products}
              cart={cart}
              onCartChange={handleCartChange}
              cartUpdated={cartUpdated}
              isLoggedIn={userIsLoggedIn}
            />
          </Suspense>
        </>
      )}
    </div>
  );
};

export default Home;
