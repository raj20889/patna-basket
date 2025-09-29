import React, { useState, useEffect, useMemo, Suspense } from "react";
import axios from "axios";
import PublicNavbar from "../components/Navbar/PublicNavbar";
import BannerComponent from "../components/BannerComponent";
import CategoryLinks from "../components/CategoryLinks";
import CategoryGrid from "../components/CategoryGrid";
import ProductsLoaderTemplate from "./Customer/ProductsLoaderTemplate";

const RelatedProducts = React.lazy(() => import("../components/RelatedProducts"));
const ColdDrinksJuices = React.lazy(() => import("../components/ColdDrinksJuices"));
const RollingPaperTobacco = React.lazy(() => import("../components/RollingPaper&Tobacco"));
const SnacksAndChips = React.lazy(() => import("../components/SnacksAndChips"));
const CandiesAndGums = React.lazy(() => import("../components/CandiesAndGums"));
const ProductComponent = React.lazy(() => import("../components/ProductComponent"));

const Home = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState({});
  const [cartUpdated, setCartUpdated] = useState(false);
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const role = localStorage.getItem("role");

  // Check auth status
  useEffect(() => {
    const token = localStorage.getItem("token");
    setUserIsLoggedIn(!!token);
  }, []);

  // Product map for fast lookup
  const productMap = useMemo(() => {
    const map = {};
    products.forEach((p) => (map[p._id] = p));
    return map;
  }, [products]);

  // Helper: calculate totals
  const calculateTotals = (cartItems) => {
    const count = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
    const total = Object.entries(cartItems).reduce((sum, [productId, qty]) => {
      return sum + (productMap[productId]?.price || 0) * qty;
    }, 0);
    return { count, total };
  };

  // Fetch products progressively (in background)
  useEffect(() => {
    let ignore = false;
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products`);
        if (!ignore) setProducts(res.data);
      } catch (err) {
        console.error("Products fetch error:", err);
      } finally {
        if (!ignore) setLoadingProducts(false);
      }
    };
    if (role !== "admin") fetchProducts();
    return () => { ignore = true; };
  }, [role]);

  // Fetch cart (parallel to product fetch)
  useEffect(() => {
    const fetchCart = async () => {
      try {
        let cartMap = {};
        if (userIsLoggedIn) {
          const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/cart`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          res.data.products?.forEach((item) => {
            cartMap[item.productId._id] = item.quantity;
          });
        } else {
          const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
          guestCart.forEach((item) => (cartMap[item.productId] = item.quantity));
        }
        setCart(cartMap);
        const { count, total } = calculateTotals(cartMap);
        setCartCount(count);
        setTotalPrice(total);
      } catch (err) {
        console.error("Cart fetch error:", err);
      }
    };
    if (role !== "admin") fetchCart();
  }, [role, cartUpdated, userIsLoggedIn, productMap]);

  // Handle cart changes (unchanged)
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
          if (newQty > 0) guestCart[index].quantity = newQty;
          else guestCart.splice(index, 1);
        } else if (newQty > 0) {
          guestCart.push({ productId, name: product.name, price: product.price, image: product.image, quantity: newQty });
        }

        localStorage.setItem("guestCart", JSON.stringify(guestCart));

        const updatedCart = { ...cart };
        if (newQty > 0) updatedCart[productId] = newQty;
        else delete updatedCart[productId];

        setCart(updatedCart);
        const { count, total } = calculateTotals(updatedCart);
        setCartCount(count);
        setTotalPrice(total);
      } else {
        // User cart
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/cart/add`,
          { productId, quantity: newQty },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        if (res.data.products) {
          const cartMap = {};
          res.data.products.forEach((item) => (cartMap[item.productId._id] = item.quantity));
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

  return (
    <div>
      <PublicNavbar cartCount={cartCount} totalPrice={totalPrice} />
      {role !== "admin" && (
        <>
          <BannerComponent />
          <CategoryLinks />
          <CategoryGrid />

          {/* Show skeleton loaders while products are coming */}
          {loadingProducts && <ProductsLoaderTemplate />}

          {/* Lazy load sections independently so first one shows ASAP */}
          <Suspense fallback={<div>Loading Related Products...</div>}>
            <RelatedProducts products={products} cart={cart} onCartChange={handleCartChange} isLoggedIn={userIsLoggedIn} cartUpdated={cartUpdated} />
          </Suspense>

          <Suspense fallback={<div>Loading Cold Drinks...</div>}>
            <ColdDrinksJuices products={products} cart={cart} onCartChange={handleCartChange} isLoggedIn={userIsLoggedIn} cartUpdated={cartUpdated} />
          </Suspense>

          <Suspense fallback={<div>Loading Snacks...</div>}>
            <SnacksAndChips products={products} cart={cart} onCartChange={handleCartChange} isLoggedIn={userIsLoggedIn} cartUpdated={cartUpdated} />
          </Suspense>

          <Suspense fallback={<div>Loading Candies...</div>}>
            <CandiesAndGums products={products} cart={cart} onCartChange={handleCartChange} isLoggedIn={userIsLoggedIn} cartUpdated={cartUpdated} />
          </Suspense>

          <Suspense fallback={<div>Loading All Products...</div>}>
            <ProductComponent products={products} cart={cart} onCartChange={handleCartChange} cartUpdated={cartUpdated} isLoggedIn={userIsLoggedIn} />
          </Suspense>
        </>
      )}
    </div>
  );
};

export default Home;
