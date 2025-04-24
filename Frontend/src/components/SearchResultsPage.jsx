import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductComponent from './ProductComponent';
import PublicNavBar from './Navbar/PublicNavbar'; // Adjust the import path as necessary

const SearchResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [cartTotal, setCartTotal] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // This function will be called by ProductComponent
    const handleCartUpdate = async (productId, change) => {
        try {
            if (token) {
                // For logged-in users - update server cart
                const response = await axios.put(
                    'http://localhost:5000/api/cart/update',
                    { productId, change },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    // Update local cart counts based on server response
                    setCartCount(response.data.count || 0);
                    setCartTotal(response.data.total || 0);
                }
            } else {
                // For guest users - ProductComponent handles localStorage directly
                // We'll just update our local counts based on what ProductComponent reports
                // This part will be handled by the handleCartCountUpdate function
            }
        } catch (err) {
            console.error('Cart update error:', err);
        }
    };

    // This function handles the count/total updates from ProductComponent
    const handleCartCountUpdate = (count, total) => {
        setCartCount(count);
        setCartTotal(total);
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const query = searchParams.get('q');

        const fetchResults = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!query || query.trim() === '') {
                    setResults([]);
                    setLoading(false);
                    return;
                }

                const config = token 
                    ? { headers: { Authorization: `Bearer ${token}` } } 
                    : {};

                const response = await axios.get('http://localhost:5000/api/products/search', {
                    params: { q: query },
                    ...config
                });

                if (response.data.success) {
                    setResults(response.data.products || []);
                } else {
                    setError(response.data.message || 'No results found');
                    setResults([]);
                }
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to fetch search results');
                setResults([]);
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();

        // If user is logged in, fetch their cart data
        if (token) {
            const fetchCart = async () => {
                try {
                    const response = await axios.get('http://localhost:5000/api/cart', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data.success) {
                        setCartCount(response.data.count || 0);
                        setCartTotal(response.data.total || 0);
                    }
                } catch (err) {
                    console.error('Error fetching cart:', err);
                }
            };
            fetchCart();
        }
    }, [location.search, token]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Return to Home
                </button>
            </div>
        );
    }

    const queryText = new URLSearchParams(location.search).get('q');

    return (
        <>
        <PublicNavBar cartCount={cartCount} cartTotal={cartTotal} /> {/* Assuming you have a PublicNavBar component */}
        <div className="container mx-auto  px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">
                {results.length > 0
                    ? `Search Results for "${queryText}"`
                    : `No products found matching "${queryText}"`}
            </h1>

            <div >
                {results.map(product => (
                    <ProductComponent
                        key={product._id}
                        products={[product]}
                        onCartUpdate={handleCartUpdate}  // For logged-in users
                        onCartChange={handleCartCountUpdate}  // For guest users
                        isAuthenticated={!!token}
                    />
                ))}
            </div>
        </div>
        </>
    );
};

export default SearchResults;