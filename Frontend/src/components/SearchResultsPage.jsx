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
                // Instead of relying on a non-existing /cart/update endpoint,
                // fetch current cart from server after ProductComponent changes it.
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/cart`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const products = res.data.products || [];
                const count = products.reduce((s, p) => s + (p.quantity || 0), 0);
                const total = res.data.itemsTotal || products.reduce((s, p) => s + (p.productId?.price || 0) * (p.quantity || 0), 0);
                setCartCount(count);
                setCartTotal(total);
            } else {
                // Guest users: ProductComponent will call onCartChange with updated counts
            }
        } catch (err) {
            console.error('Cart update error:', err);
        }
    };

    // Listen for global cartUpdated events (emitted by components after server ops)
    useEffect(() => {
        if (!token) return;
        const handler = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/cart`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const products = res.data.products || [];
                const count = products.reduce((s, p) => s + (p.quantity || 0), 0);
                const total = res.data.itemsTotal || products.reduce((s, p) => s + (p.productId?.price || 0) * (p.quantity || 0), 0);
                setCartCount(count);
                setCartTotal(total);
            } catch (err) {
                console.error('Error fetching cart on cartUpdated event:', err);
            }
        };

        window.addEventListener('cartUpdated', handler);
        return () => window.removeEventListener('cartUpdated', handler);
    }, [token]);

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

                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/search`, {
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
                    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/cart`, {
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

            <div className='flex flex-row p-10' >
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