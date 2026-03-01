import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../Product/ProductCard';
import PublicNavBar from '../Navbar/PublicNavbar';
import CustomerNavbar from '../Navbar/CustomerNavbar';
import { io } from 'socket.io-client'; // Import socket.io-client

const SearchResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user')) || null;

    // Fetch search results
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
    }, [location.search, token]);

    // Add socket.io listener for live stock updates
    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000');

        socket.on('connect', () => {
            console.log('WebSocket connected:', socket.id);
        });

        socket.on('stockUpdate', (updatedProduct) => {
            console.log('Stock update received:', updatedProduct);
            setResults((prevResults) =>
                prevResults.map((product) =>
                    product._id === updatedProduct.productId
                        ? { ...product, stock: updatedProduct.stock }
                        : product
                )
            );
        });

        return () => {
            socket.disconnect();
        };
    }, []);

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
            {user ? <CustomerNavbar /> : <PublicNavBar />}
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">
                    {results.length > 0
                        ? `Search Results for "${queryText}"`
                        : `No products found matching "${queryText}"`}
                </h1>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {results.map(product => (
                        <ProductCard
                            key={product._id}
                            product={product}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default SearchResults;
