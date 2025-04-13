import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ProductComponent from '../components/ProductComponent';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const role = localStorage.getItem("role"); // Get role from localStorage

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/products');
                setProducts(res.data);
            } catch (err) {
                console.error('Error fetching products:', err);
            }
        };
        if (role !== 'admin') fetchProducts(); // Only fetch if not admin
    }, [role]);

    useEffect(() => {
        const fetchCartCount = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/cart', {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });
                setCartCount(res.data.products.length);
            } catch (err) {
                console.error("Error fetching cart count:", err);
            }
        };
        if (role !== 'admin') fetchCartCount(); // No cart for admin
    }, [role]);

    return (
        <div>
            <Navbar cartCount={cartCount} />
            {role !== 'admin' && (
                <ProductComponent products={products} />
            )}
        </div>
    );
};

export default Home;
