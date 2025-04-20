import React, { useEffect, useState } from "react";
import CustomerNavbar from "../../components/Navbar/CustomerNavbar";
import BannerComponent from "../../components/BannerComponent";
import CategoryLinks from "../../components/CategoryLinks";
import CategoryGrid from "../../components/CategoryGrid";
import RelatedProducts from "../../components/Customer/RelatedProducts";

import ColdDrinksAndJuices from "../../components/Customer/ColdDrinksAndJuices";
import RollingPaperTobacco from "../../components/Customer/RollingPaper&Tobacco";
import AllProducts from "../../components/Customer/AllProducts";
import SnacksAndChips from "../../components/Customer/SnacksAndChips";
import CandiesAndChocolates from "../../components/Customer/CandiesAndChocolates";

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState({});
  const [cartUpdated, setCartUpdated] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  const fetchData = async () => {
    try {
      const [productsRes, cartRes] = await Promise.all([
        fetch("http://localhost:5000/api/products", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch("http://localhost:5000/api/cart", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ]);

      const productsData = await productsRes.json();
      setProducts(productsData);

      if (cartRes.ok) {
        const cartData = await cartRes.json();
        const initialQuantities = {};
        let count = 0;
        let total = 0;

        cartData.products?.forEach((item) => {
          initialQuantities[item.productId._id] = item.quantity;
          count += item.quantity;
          total += item.productId.price * item.quantity;
        });

        setCartItems(initialQuantities);
        setCartCount(count);
        setCartTotal(total);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateCart = async (productId, newQuantity) => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = token ? "api/cart/add" : "api/guest-cart/add";

      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });

      const data = await response.json();
      if (response.ok) {
        // Update local state
        setCartItems((prev) => ({
          ...prev,
          [productId]: newQuantity > 0 ? newQuantity : undefined,
        }));

        // Fetch updated cart details
        const cartResponse = await fetch(`http://localhost:5000/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          const count =
            cartData.products?.reduce((sum, item) => sum + item.quantity, 0) ||
            0;
          const total =
            cartData.products?.reduce(
              (sum, item) => sum + item.productId.price * item.quantity,
              0
            ) || 0;

          setCartCount(count);
          setCartTotal(total);
        }

        setCartUpdated((prev) => !prev);
        return true;
      } else {
        alert(data.msg || "Failed to update cart");
        return false;
      }
    } catch (err) {
      console.error("Error updating cart", err);
      return false;
    }
  };

  const handleAddToCart = async (productId) => {
    await updateCart(productId, 1);
  };

  const handleIncrease = async (productId) => {
    const currentQty = cartItems[productId] || 0;
    await updateCart(productId, currentQty + 1);
  };

  const handleDecrease = async (productId) => {
    const currentQty = cartItems[productId] || 0;
    if (currentQty > 1) {
      await updateCart(productId, currentQty - 1);
    } else {
      const success = await updateCart(productId, 0);
      if (success) {
        setCartItems((prev) => {
          const newItems = { ...prev };
          delete newItems[productId];
          return newItems;
        });
      }
    }
  };

  const handleCartUpdate = (count, total) => {
    setCartCount(count);
    setCartTotal(total);
    setCartUpdated((prev) => !prev);
  };

  if (loading) return <div className="text-center text-xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <CustomerNavbar
        cartUpdated={cartUpdated}
        cartCount={cartCount}
        totalPrice={cartTotal}
      />

      <BannerComponent />
      <CategoryLinks />
      <CategoryGrid />

      <div className="container mx-auto px-4 py-6">
        <RelatedProducts
          products={products}
          onCartUpdate={handleCartUpdate}
          cart={cartItems}
        />

        {/* Add the new component here */}
        <ColdDrinksAndJuices
          products={products}
          onCartUpdate={handleCartUpdate}
          cart={cartItems}
        />

        {/* Add the new component here */}
        <RollingPaperTobacco
          products={products}
          onCartUpdate={handleCartUpdate}
          cart={cartItems}
        />

        <SnacksAndChips
          products={products}
          onCartUpdate={handleCartUpdate}
          cart={cartItems}
          loading={loading} // optional if you have loading states
        />

        <CandiesAndChocolates
          products={products}
          onCartUpdate={handleCartUpdate}
          cart={cartItems}
          loading={loading}
        />
        <h2 className="text-2xl  font-bold mb-6">All Products</h2>
        <AllProducts
          products={products}
          onCartUpdate={handleCartUpdate}
          cart={cartItems}
        />

       
      </div>
    </div>
  );
};

export default Dashboard;
