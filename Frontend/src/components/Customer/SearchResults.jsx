import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductComponent from './ProductCard';
import CustomerNavbar from '../Navbar/CustomerNavbar';
import { useDispatch } from 'react-redux';
import { setCart } from '../../redux/cartSlice';

const SearchResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [cartTotal, setCartTotal] = useState(0);
    const [cartItems, setCartItems] = useState([]);
    const [cartUpdated, setCartUpdated] = useState(false);
    const [productLoadingStates, setProductLoadingStates] = useState({});
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const dispatch = useDispatch();

    // Fetch cart data
    const fetchCart = async () => {
        try {
            if (token) {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/cart`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (response.data) {
                    const products = response.data.products || [];
                    setCartCount(products.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0);
                    setCartTotal(response.data.itemsTotal || 0);
                    setCartItems(products);

                    // Update Redux so ProductCard (which reads from Redux) stays in sync
                    const mapped = products.map(item => ({
                        productId: item.productId?._id || item.productId,
                        name: item.productId?.name || item.name,
                        price: item.productId?.price || item.price,
                        quantity: item.quantity,
                        image: item.productId?.image || item.image,
                        variant: item.productId?.variant || item.variant
                    }));
                    dispatch(setCart({ cartItems: mapped }));
                }
            } else {
                // Guest cart handling
                const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
                setCartItems(guestCart);
                const count = guestCart.reduce((sum, item) => sum + item.quantity, 0);
                const total = guestCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                setCartCount(count);
                setCartTotal(total);
                // Update Redux for guest as well so ProductCard shows correct qty
                const mappedGuest = guestCart.map(item => ({
                    productId: item._id || item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                }));
                dispatch(setCart({ cartItems: mappedGuest }));
            }
        } catch (err) {
            console.error('Error fetching cart:', err);
        }
    };

    // Handle initial add to cart
    const handleAddToCart = async (productOrId) => {
        const productId = typeof productOrId === 'string' ? productOrId : (productOrId?._id || productOrId?.productId?._id);
        if (!productId) return;
        await handleCartChange(productId, 1); // Add 1 quantity
    };

    // Handle quantity changes (+/-) by accepting product object or id
    const handleChange = async (productOrId, change) => {
        const productId = typeof productOrId === 'string' ? productOrId : (productOrId?._id || productOrId?.productId?._id);
        if (!productId) return;
        await handleCartChange(productId, change);
    };

    // Unified cart update function
    const handleCartChange = async (productId, change) => {
        setProductLoadingStates(prev => ({ ...prev, [productId]: true }));
        try {
            if (token) {
                // Calculate new quantity
                const currentItem = cartItems.find(item => 
                    item.productId?._id === productId || item._id === productId
                );
                const currentQuantity = currentItem?.quantity || 0;
                const newQuantity = currentQuantity + change;

                // Use the existing /add endpoint
                const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/cart/add`,
                    { productId, quantity: newQuantity },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.msg === 'Cart updated successfully') {
                    await fetchCart();
                }
            } else {
                // Guest cart handling
                const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
                const existingItemIndex = guestCart.findIndex(item => item._id === productId);
                
                if (existingItemIndex >= 0) {
                    const newQuantity = guestCart[existingItemIndex].quantity + change;
                    if (newQuantity <= 0) {
                        guestCart.splice(existingItemIndex, 1);
                    } else {
                        guestCart[existingItemIndex].quantity = newQuantity;
                    }
                } else if (change > 0) {
                    const productToAdd = results.find(p => p._id === productId);
                    if (productToAdd) {
                        guestCart.push({
                            ...productToAdd,
                            quantity: 1
                        });
                    }
                }
                
                localStorage.setItem('guestCart', JSON.stringify(guestCart));
                await fetchCart();
                setCartUpdated(prev => !prev);
            }
        } catch (err) {
            console.error('Cart update error:', err);
            alert('Failed to update cart. Please try again.');
        } finally {
            setProductLoadingStates(prev => ({ ...prev, [productId]: false }));
        }
    };

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
        fetchCart();
    }, [location.search, token]);

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    // Error state
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
            <CustomerNavbar 
                cartUpdated={cartUpdated}
                cartCount={cartCount}
                totalPrice={cartTotal}
            />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">
                    {results.length > 0
                        ? `Search Results for "${queryText}"`
                        : `No products found matching "${queryText}"`}
                </h1>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {results.map(product => (
                        <ProductComponent
                            key={product._id}
                            product={product}
                            quantity={cartItems.find(item => 
                                item.productId?._id === product._id || item._id === product._id
                            )?.quantity || 0}
                            handleAddToCart={() => handleAddToCart(product)}
                            handleIncrease={() => handleChange(product, 1)}
                            handleDecrease={() => handleChange(product, -1)}
                            isProductLoading={productLoadingStates[product._id] || false}
                            isAuthenticated={!!token}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default SearchResults;