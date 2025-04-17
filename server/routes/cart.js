const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// Add or update product in cart
router.post('/add', verifyToken, async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || quantity === undefined) {
    return res.status(400).json({ msg: 'Product ID and quantity required' });
  }

  try {
    let cart = await Cart.findOne({ userId: req.user.id });

    // If cart exists
    if (cart) {
      const itemIndex = cart.products.findIndex(p => p.productId.toString() === productId);

      if (itemIndex > -1) {
        if (quantity <= 0) {
          // Remove the item if quantity is 0 or less
          cart.products.splice(itemIndex, 1);
        } else {
          // Update quantity
          cart.products[itemIndex].quantity = quantity;
        }
      } else {
        // Add new product if quantity > 0
        if (quantity > 0) {
          cart.products.push({ productId, quantity });
        }
      }

      await cart.save();
      return res.status(200).json({ msg: 'Cart updated successfully', cart });
    } else {
      // Create new cart
      const newCart = new Cart({
        userId: req.user.id,
        products: quantity > 0 ? [{ productId, quantity }] : [],
      });
      await newCart.save();
      return res.status(201).json({ msg: 'Cart created', cart: newCart });
    }
  } catch (error) {
    console.error('Cart Add Error:', error);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// Get cart with populated product details
router.get('/', verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('products.productId');
    if (!cart) {
      return res.status(200).json({ products: [] });
    }

    return res.status(200).json(cart);
  } catch (error) {
    console.error('Cart Fetch Error:', error);
    return res.status(500).json({ msg: 'Server error' });
  }
});



// Clear cart - now using DELETE /api/cart
router.delete('/', verifyToken, async (req, res) => {
  try {
    const result = await Cart.findOneAndDelete({ userId: req.user.id });
    
    if (!result) {
      return res.status(200).json({ 
        success: true, 
        message: 'Cart was already empty' 
      });
    }
    
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


module.exports = router;
