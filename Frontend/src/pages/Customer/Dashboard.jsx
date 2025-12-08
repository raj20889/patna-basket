// Dashboard.jsx
import React, { useEffect, useState, lazy, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCart, addToCart, removeFromCart } from "../../redux/cartSlice";
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
  
  const [productLoadingStates, setProductLoadingStates] = useState({});
  const dispatch = useDispatch();
  const { items: cartItems, totalQuantity: cartCount, totalPrice: cartTotal } = useSelector((state) => state.cart);

  const token = localStorage.getItem("token");

  const fetchUserCart = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const formattedCartItems = data.products.map(item => ({
          productId: item.productId._id,
          name: item.productId.name,
          price: item.productId.price,
          image: item.productId.images[0],
          quantity: item.quantity,
        }));
        dispatch(setCart(formattedCartItems));
      }
    } catch (error) {
      console.error("Error fetching user cart:", error);
    }
  };

  useEffect(() => {
    fetchUserCart();
  }, [token, dispatch]);

  // Fetch products and cart
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const productsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const productsData = await productsRes.json();
      setProducts(productsData);
    } catch (err) {
      console.error("Error fetching products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Update cart API
  const updateCartOnServer = async (productId, newQuantity) => {
    setProductLoadingStates(prev => ({ ...prev, [productId]: true }));
    try {
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
      if (!response.ok) {
        alert(data.msg || "Failed to update cart");
        return false;
      }
      return true;
    } catch (err) {
      console.error("Error updating cart on server", err);
      return false;
    } finally {
      setProductLoadingStates(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddToCart = async (product) => {
    const { _id: productId, name, price, images } = product;
    const currentItem = cartItems.find(item => item.productId === productId);
    const newQuantity = (currentItem ? currentItem.quantity : 0) + 1;

    const previousCartItems = JSON.parse(JSON.stringify(cartItems)); // Deep copy for rollback

    // Optimistic update
    dispatch(addToCart({ productId, name, price, image: product.image, quantity: newQuantity }));

    const success = await updateCartOnServer(productId, newQuantity);
    if (!success) {
      // Rollback if server update fails
      dispatch(setCart(previousCartItems));
      alert("Failed to add item to cart. Please try again.");
    }
  };

  const handleIncrease = async (product) => {
    const { _id: productId, name, price, images } = product;
    const currentItem = cartItems.find(item => item.productId === productId);
    const newQuantity = (currentItem ? currentItem.quantity : 0) + 1;

    const previousCartItems = JSON.parse(JSON.stringify(cartItems)); // Deep copy for rollback

    // Optimistic update
    dispatch(addToCart({ productId, name, price, image: product.image, quantity: newQuantity }));

    const success = await updateCartOnServer(productId, newQuantity);
    if (!success) {
      // Rollback if server update fails
      dispatch(setCart(previousCartItems));
      alert("Failed to increase item quantity. Please try again.");
    }
  };

  const handleDecrease = async (product) => {
    const { _id: productId, name, price, images } = product;
    const currentItem = cartItems.find(item => item.productId === productId);
    if (!currentItem) return;

    const newQuantity = currentItem.quantity - 1;

    const previousCartItems = JSON.parse(JSON.stringify(cartItems)); // Deep copy for rollback

    // Optimistic update
    if (newQuantity > 0) {
      dispatch(addToCart({ productId, name, price, image: product.image, quantity: newQuantity }));
    } else {
      dispatch(removeFromCart({ productId }));
    }

    const success = await updateCartOnServer(productId, newQuantity);
    if (!success) {
      // Rollback if server update fails
      dispatch(setCart(previousCartItems));
      alert("Failed to decrease item quantity. Please try again.");
    }
  };

  // Common props for product sections
  const sectionProps = {
    products,
    cartItems,
    productLoadingStates,
    handleAddToCart,
    handleIncrease,
    handleDecrease,
  };

  if (loading) return <ProductsLoaderTemplate />;

  return (
    <div className="min-h-screen bg-gray-100">
      <CustomerNavbar
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
