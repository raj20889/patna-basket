const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// Helper function to calculate cart totals
const calculateCartTotals = async (products) => {
    console.log("calculateCartTotals: Incoming products:", products);
    let itemsTotal = 0;
    const populatedProducts = [];
    
    for (const item of products) {
        const product = await Product.findById(item.productId);
        if (product) {
            itemsTotal += product.price * item.quantity;
            populatedProducts.push({
                ...item.toObject(),
                productId: product
            });
        } else {
            console.warn("calculateCartTotals: Product not found for ID:", item.productId);
        }
    }
    console.log("calculateCartTotals: Populated products:", populatedProducts);
    return { itemsTotal, populatedProducts };
};

// Add or update product in cart
router.post('/add', verifyToken, async (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
        return res.status(400).json({ msg: 'Product ID and quantity required' });
    }

    try {
        let cart = await Cart.findOne({ userId: req.user.id });

        if (cart) {
            console.log("POST /cart/add: Cart found for user:", cart.userId);
            console.log("POST /cart/add: Current cart products before update:", cart.products);
            const itemIndex = cart.products.findIndex(p => p.productId.toString() === productId);

            if (itemIndex > -1) {
                // Do not remove item when quantity is 0, just set the quantity to 0
                // The frontend ProductDetails component will handle displaying the "Add to Cart" button when quantity is 0
                cart.products[itemIndex].quantity = quantity;
            } else if (quantity > 0) {
                cart.products.push({ productId, quantity });
                console.log("POST /cart/add: New product added to cart. New products:", cart.products);
            }

            // Calculate totals with populated products
            const { itemsTotal, populatedProducts } = await calculateCartTotals(cart.products);
            
            cart.grandTotal = itemsTotal + cart.deliveryCharge + cart.handlingCharge + cart.tipAmount + cart.donationAmount;
            
            await cart.save();
            console.log("POST /cart/add: Cart saved. Final cart products:", cart.products);
            
            return res.status(200).json({ 
                msg: 'Cart updated successfully',
                products: populatedProducts,
                itemsTotal,
                deliveryCharge: cart.deliveryCharge,
                handlingCharge: cart.handlingCharge,
                tipAmount: cart.tipAmount,
                donationAmount: cart.donationAmount,
                grandTotal: cart.grandTotal
            });
        } else {
            console.log("POST /cart/add: No cart found for user. Creating new cart.");
            const newCart = new Cart({
                userId: req.user.id,
                products: quantity > 0 ? [{ productId, quantity }] : [],
                deliveryCharge: 0,
                handlingCharge: 2,
                tipAmount: 0,
                donationAmount: 0
            });

            const { itemsTotal } = await calculateCartTotals(newCart.products);
            newCart.grandTotal = itemsTotal + newCart.deliveryCharge + newCart.handlingCharge;
            
            await newCart.save();
            console.log("POST /cart/add: New cart created and saved. Products:", newCart.products);
            
            return res.status(201).json({ 
                msg: 'Cart created',
                products: [],
                itemsTotal: 0,
                deliveryCharge: 0,
                handlingCharge: 2,
                tipAmount: 0,
                donationAmount: 0,
                grandTotal: 0
            });
        }
    } catch (error) {
        console.error('Cart Add Error:', error);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// Update cart charges
router.post('/update-charges', verifyToken, async (req, res) => {
    const { deliveryCharge, handlingCharge, tipAmount, donationAmount } = req.body;

    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.status(404).json({ msg: 'Cart not found' });
        }

        // Update charges
        if (deliveryCharge !== undefined) cart.deliveryCharge = deliveryCharge;
        if (handlingCharge !== undefined) cart.handlingCharge = handlingCharge;
        if (tipAmount !== undefined) cart.tipAmount = tipAmount;
        if (donationAmount !== undefined) cart.donationAmount = donationAmount;

        // Recalculate totals with populated products
        const { itemsTotal, populatedProducts } = await calculateCartTotals(cart.products);
        cart.grandTotal = itemsTotal + cart.deliveryCharge + cart.handlingCharge + cart.tipAmount + cart.donationAmount;

        await cart.save();
        
        return res.status(200).json({
            msg: 'Cart charges updated',
            products: populatedProducts,
            itemsTotal,
            deliveryCharge: cart.deliveryCharge,
            handlingCharge: cart.handlingCharge,
            tipAmount: cart.tipAmount,
            donationAmount: cart.donationAmount,
            grandTotal: cart.grandTotal
        });
    } catch (error) {
        console.error('Update Charges Error:', error);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// Get cart with populated product details and proper totals
router.get('/', verifyToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        
        if (!cart) {
            return res.status(200).json({ 
                products: [],
                itemsTotal: 0,
                deliveryCharge: 0,
                handlingCharge: 2,
                tipAmount: 0,
                donationAmount: 0,
                grandTotal: 0
            });
        }

        // Calculate totals with populated products
        const { itemsTotal, populatedProducts } = await calculateCartTotals(cart.products);
        
        // Ensure grand total is correct
        const grandTotal = itemsTotal + cart.deliveryCharge + cart.handlingCharge + cart.tipAmount + cart.donationAmount;

        return res.status(200).json({
            products: populatedProducts,
            itemsTotal,
            deliveryCharge: cart.deliveryCharge,
            handlingCharge: cart.handlingCharge,
            tipAmount: cart.tipAmount,
            donationAmount: cart.donationAmount,
            grandTotal
        });
    } catch (error) {
        console.error('Cart Fetch Error:', error);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// Remove item from cart
router.delete('/remove/:productId', verifyToken, async (req, res) => {
    try {
        const { productId } = req.params;
        let cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) {
            return res.status(404).json({ msg: 'Cart not found' });
        }

        const initialProductCount = cart.products.length;
        cart.products = cart.products.filter(item => item.productId.toString() !== productId);

        if (cart.products.length === initialProductCount) {
            return res.status(404).json({ msg: 'Product not found in cart' });
        }

        // Recalculate totals with populated products
        const { itemsTotal, populatedProducts } = await calculateCartTotals(cart.products);
        cart.grandTotal = itemsTotal + cart.deliveryCharge + cart.handlingCharge + cart.tipAmount + cart.donationAmount;

        await cart.save();

        return res.status(200).json({
            msg: 'Item removed from cart successfully',
            products: populatedProducts,
            itemsTotal,
            deliveryCharge: cart.deliveryCharge,
            handlingCharge: cart.handlingCharge,
            tipAmount: cart.tipAmount,
            donationAmount: cart.donationAmount,
            grandTotal: cart.grandTotal
        });
    } catch (error) {
        console.error('Remove Item from Cart Error:', error);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// Clear cart
router.delete('/', verifyToken, async (req, res) => {
    try {
        console.log("DELETE /cart: Clear cart request received for user:", req.user.id);
        const result = await Cart.findOneAndDelete({ userId: req.user.id });
        
        if (!result) {
            console.log("DELETE /cart: Cart was already empty for user:", req.user.id);
            return res.status(200).json({ 
                success: true, 
                message: 'Cart was already empty' 
            });
        }
        
        console.log("DELETE /cart: Cart cleared successfully for user:", req.user.id);
        res.json({ 
            success: true, 
            message: 'Cart cleared successfully' 
        });
    } catch (err) {
        console.error('Cart clear error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error clearing cart' 
        });
    }
});

// Merge guest cart with user cart
router.post('/merge', verifyToken, async (req, res) => {
    const { guestCart } = req.body;

    if (!guestCart || !Array.isArray(guestCart)) {
        return res.status(400).json({ msg: 'Invalid guest cart data' });
    }

    try {
        let cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) {
            // If user has no cart, create one from guest cart
            cart = new Cart({
                userId: req.user.id,
                products: [],
                deliveryCharge: 0,
                handlingCharge: 2,
                tipAmount: 0,
                donationAmount: 0
            });
        }

        for (const guestItem of guestCart) {
            const { productId, quantity } = guestItem;
            if (!productId || quantity === undefined) continue; // Skip invalid items

            const itemIndex = cart.products.findIndex(p => p.productId.toString() === productId);

            if (itemIndex > -1) {
                // Update quantity if product already in cart
                cart.products[itemIndex].quantity += quantity;
            } else {
                // Add new product to cart
                cart.products.push({ productId, quantity });
            }
        }

        // Recalculate totals with populated products
        const { itemsTotal, populatedProducts } = await calculateCartTotals(cart.products);
        cart.grandTotal = itemsTotal + cart.deliveryCharge + cart.handlingCharge + cart.tipAmount + cart.donationAmount;

        await cart.save();

        return res.status(200).json({
            msg: 'Guest cart merged successfully',
            products: populatedProducts,
            itemsTotal,
            deliveryCharge: cart.deliveryCharge,
            handlingCharge: cart.handlingCharge,
            tipAmount: cart.tipAmount,
            donationAmount: cart.donationAmount,
            grandTotal: cart.grandTotal
        });

    } catch (error) {
        console.error('Cart Merge Error:', error);
        return res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;