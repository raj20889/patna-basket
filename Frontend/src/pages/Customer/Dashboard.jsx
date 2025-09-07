// Dashboard.jsx
import React, { useEffect, useState, lazy, Suspense } from "react";
import CustomerNavbar from "../../components/Navbar/CustomerNavbar";
import BannerComponent from "../../components/BannerComponent";
import CategoryLinks from "../../components/CategoryLinks";
import CategoryGrid from "../../components/CategoryGrid";
import ProductsLoaderTemplate from "./ProductsLoaderTemplate.jsx";

// Lazy load category/product sections
const RelatedProducts = lazy(() =>
  import("../../components/Customer/RelatedProducts")
);
const ColdDrinksAndJuices = lazy(() =>
  import("../../components/Customer/ColdDrinksAndJuices")
);
const RollingPaperTobacco = lazy(() =>
  import("../../components/Customer/RollingPaperAndTobacco.jsx")
);
const AllProducts = lazy(() =>
  import("../../components/Customer/AllProducts")
);
const SnacksAndChips = lazy(() =>
  import("../../components/Customer/SnacksAndChips")
);
const CandiesAndChocolates = lazy(() =>
  import("../../components/Customer/CandiesAndChocolates")
);

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState({});
  const [cartUpdated, setCartUpdated] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loadingProduct, setLoadingProduct] = useState(null);

  // Fetch products and cart
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [productsRes, cartRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
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
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update cart API
  const updateCart = async (productId, newQuantity) => {
    setLoadingProduct(productId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/cart/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ productId, quantity: newQuantity }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        // update cartItems state
        setCartItems((prev) => ({
          ...prev,
          [productId]: newQuantity > 0 ? newQuantity : undefined,
        }));

        // fetch updated cart details
        const cartResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/cart`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

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
    } finally {
      setLoadingProduct(null);
    }
  };

  // Cart Handlers
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

  // Common props for product sections
  const sectionProps = {
    products,
    cart: cartItems,
    loadingProduct,
    handleAddToCart,
    handleChange: (productId, change) =>
      change === 1 ? handleIncrease(productId) : handleDecrease(productId),
  };

  if (loading) return <ProductsLoaderTemplate />;

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
        {products.length === 0 ? (
          <ProductsLoaderTemplate />
        ) : (
          <Suspense fallback={<ProductsLoaderTemplate />}>
            <RelatedProducts {...sectionProps} />
            <ColdDrinksAndJuices {...sectionProps} />
            <RollingPaperTobacco {...sectionProps} />
            <SnacksAndChips {...sectionProps} />
            <CandiesAndChocolates {...sectionProps} />
            <h2 className="text-2xl font-bold mb-6">All Products</h2>
            <AllProducts {...sectionProps} />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
