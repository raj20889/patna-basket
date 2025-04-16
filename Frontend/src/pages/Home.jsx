import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductComponent from '../components/ProductComponent';
import PublicNavbar from '../components/Navbar/PublicNavbar';
import BannerComponent from '../components/BannerComponent';
import CategoryLinks from '../components/CategoryLinks';
import CategoryGrid from '../components/CategoryGrid';
import RelatedProducts from '../components/RelatedProducts';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState({});
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products');
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    const fetchCartData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        // Load guest cart
        const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
        const guestCartMap = {};
        guestCart.forEach(item => {
          guestCartMap[item.productId] = item.quantity;
        });
        setCart(guestCartMap);
        calculateAndUpdateCart(guestCart);
      } else {
        // Fetch user's cart from server
        try {
          const res = await axios.get('http://localhost:5000/api/cart', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const cartData = res.data;
          const serverCartMap = {};
          
          if (cartData.products && cartData.products.length > 0) {
            cartData.products.forEach(item => {
              serverCartMap[item.productId._id] = item.quantity;
            });
          }

          setCart(serverCartMap);
          
          // Calculate totals from server data
          if (cartData.products) {
            const count = cartData.products.reduce((sum, item) => sum + item.quantity, 0);
            const total = cartData.products.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0);
            setCartCount(count);
            setTotalPrice(total);
          }
        } catch (err) {
          console.error('Error fetching cart:', err);
        }
      }
    };

    if (role !== 'admin') {
      fetchProducts();
      fetchCartData();
    }
  }, [role]);

  const calculateAndUpdateCart = (cartItems) => {
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setCartCount(count);
    setTotalPrice(total);
  };

  const handleCartUpdate = (count, total, updatedProducts) => {
    setCartCount(count);
    setTotalPrice(total);
    
    if (updatedProducts) {
      const updatedCart = {};
      updatedProducts.forEach(item => {
        updatedCart[item.productId._id] = item.quantity;
      });
      setCart(updatedCart);
    }
  };

  const handleCartChange = async (productId, change) => {
    const token = localStorage.getItem("token");
    const currentQty = cart[productId] || 0;
    const newQty = currentQty + change;

    if (newQty < 0) return;

    try {
      if (!token) {
        // Handle guest cart update
        let guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
        const product = products.find(p => p._id === productId);
        
        if (!product) return;

        const index = guestCart.findIndex(item => item.productId === productId);

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
        calculateAndUpdateCart(guestCart);
      } else {
        // Handle logged-in user cart update
        const res = await axios.post("http://localhost:5000/api/cart/add", 
          { productId, quantity: newQty },
          {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (res.data.products) {
          const count = res.data.products.reduce((sum, item) => sum + item.quantity, 0);
          const total = res.data.products.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0);
          handleCartUpdate(count, total, res.data.products);
        }
      }
    } catch (err) {
      console.error("Error updating cart", err);
    }
  };

  return (
    <div>
      <PublicNavbar cartCount={cartCount} totalPrice={totalPrice} />
      {role !== 'admin' && (
        <>
          <BannerComponent />
          <CategoryLinks />
          <CategoryGrid />
          <RelatedProducts 
            products={products} 
            onCartUpdate={handleCartUpdate}
            cart={cart}
            loading={loading}
          />
          <ProductComponent 
            products={products} 
            onCartUpdate={handleCartUpdate}
            cart={cart}
            loading={loading}
            onCartChange={handleCartChange}
          />
        </>
      )}
    </div>
  );
};

export default Home;