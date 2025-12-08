import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductComponent from '../components/ProductComponent';
import PublicNavbar from '../components/Navbar/PublicNavbar';
import CategoryLinks from '../components/CategoryLinks';
import CategoryGrid from '../components/CategoryGrid';

const SubcategoryWithProducts = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState({});
  const [subcategoryName, setSubcategoryName] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/category/${category}`);
        setProducts(res.data);

        // Format the category name for display
        const formattedName = category.replace(/-/g, ' ')
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
      <PublicNavbar cartCount={cartCount} totalPrice={totalPrice} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">{subcategoryName}</h1>
        
    
        
        {products.length > 0 ? (
       
            <ProductComponent 
              products={products} 
            />
    
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