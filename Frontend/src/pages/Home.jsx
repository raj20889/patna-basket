import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductComponent from "../components/ProductComponent";
import PublicNavbar from "../components/Navbar/PublicNavbar";
import BannerComponent from "../components/BannerComponent";
import CategoryLinks from "../components/CategoryLinks";
import CategoryGrid from "../components/CategoryGrid";
import RelatedProducts from "../components/RelatedProducts";
import ColdDrinksJuices from "../components/ColdDrinksJuices";
import RollingPaperTobacco from "../components/RollingPaper&Tobacco";
import SnacksAndChips from "../components/SnacksAndChips";
import CandiesAndGums from "../components/CandiesAndGums";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState({});
  const [cartUpdated, setCartUpdated] = useState(false);
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);
  const role = localStorage.getItem("role");

  // Check auth status on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    setUserIsLoggedIn(!!token);
  }, []);

  // Calculate totals from cart state
  const calculateTotals = (cartItems) => {
    const count = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
    const total = Object.entries(cartItems).reduce((sum, [productId, qty]) => {
      const product = products.find((p) => p._id === productId);
      return sum + (product ? product.price * qty : 0);
    }, 0);
    return { count, total };
  };

  // Initialize cart and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, cartRes] = await Promise.all([
          axios.get("http://localhost:5000/api/products"),
          userIsLoggedIn
            ? axios.get("http://localhost:5000/api/cart", {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              })
            : Promise.resolve({ data: { products: [] } }),
        ]);

        setProducts(productsRes.data);

        // Initialize cart
        const cartMap = {};
        if (userIsLoggedIn && cartRes.data.products?.length > 0) {
          cartRes.data.products.forEach((item) => {
            cartMap[item.productId._id] = item.quantity;
          });
        } else if (!userIsLoggedIn) {
          const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
          guestCart.forEach((item) => {
            cartMap[item.productId] = item.quantity;
          });
        }

        setCart(cartMap);
        const { count, total } = calculateTotals(cartMap);
        setCartCount(count);
        setTotalPrice(total);
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };

    if (role !== "admin") fetchData();
  }, [role, cartUpdated, userIsLoggedIn]);

  // Handle cart changes
  const handleCartChange = async (productId, change) => {
    const currentQty = cart[productId] || 0;
    const newQty = currentQty + change;

    if (newQty < 0) return;

    setLoading((prev) => ({ ...prev, [productId]: true }));

    try {
      if (!userIsLoggedIn) {
        // Handle guest cart
        const product = products.find((p) => p._id === productId);
        if (!product) return;

        let guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
        const index = guestCart.findIndex(
          (item) => item.productId === productId
        );

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

        // Update state
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
        // Handle user cart
        const res = await axios.post(
          "http://localhost:5000/api/cart/add",
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

  return (
    <div>
      <PublicNavbar cartCount={cartCount} totalPrice={totalPrice} />
      {role !== "admin" && (
        <>
          <BannerComponent />
          <CategoryLinks />
          <CategoryGrid />

          <RelatedProducts
            products={products}
            cart={cart}
            onCartChange={handleCartChange}
            isLoggedIn={userIsLoggedIn}
            key={cartUpdated}
          />

          <ColdDrinksJuices
            products={products}
            cart={cart}
            onCartChange={handleCartChange}
            isLoggedIn={userIsLoggedIn}
            key={cartUpdated}
          />

          <RollingPaperTobacco
            products={products}
            cart={cart}
            onCartChange={handleCartChange}
            isLoggedIn={userIsLoggedIn}
            key={cartUpdated}
          />

          <SnacksAndChips
            products={products}
            cart={cart}
            onCartChange={handleCartChange}
            isLoggedIn={userIsLoggedIn}
            key={cartUpdated}
          />

          <CandiesAndGums
            products={products}
            cart={cart}
            onCartChange={handleCartChange}
            isLoggedIn={userIsLoggedIn}
            key={cartUpdated}
          />
          <ProductComponent
            products={products}
            cart={cart}
            onCartChange={handleCartChange}
            cartUpdated={cartUpdated}
            isLoggedIn={userIsLoggedIn}
          />
        </>
      )}
    </div>
  );
};

export default Home;
