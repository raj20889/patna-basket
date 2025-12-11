// SubcategoryWithProducts.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CustomerNavbar from '../Navbar/CustomerNavbar';
import PublicNavbar from '../Navbar/PublicNavbar';
import ProductCard from './ProductCard'; // ✅ use the same ProductCard

const SubcategoryWithProducts = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [subcategoryName, setSubcategoryName] = useState('');
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);

  // Check auth status on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    setUserIsLoggedIn(!!token);
  }, []);

  // 🔹 Fetch products by category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/category/${category}`);
        setProducts(res.data);
        const formattedName = category
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        setSubcategoryName(formattedName);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, [category]);

  return (
    <div>
      {userIsLoggedIn ? (
        <CustomerNavbar />
      ) : (
        <PublicNavbar />
      )}

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">{subcategoryName}</h1>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg">No products found in this category.</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubcategoryWithProducts;
