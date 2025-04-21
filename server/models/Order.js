const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  address: {
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
      required: [true, 'Address ID is required'],
      
    },
    details: {
      type: String,
      required: [true, 'Address details are required']
    },
  
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required']
    },
    name: {
      type: String,
      required: [true, 'Product name is required']
    },
    image: String,
    variant: {
      type: String,
      default: '1 unit'
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    }
  }],
  paymentMethod: {
    type: String,
    enum: {
      values: ['COD', 'CARD', 'UPI', 'NETBANKING'],
      message: '{VALUE} is not a valid payment method'
    },
    required: [true, 'Payment method is required']
  },
  itemsTotal: {
    type: Number,
    required: [true, 'Items total is required'],
    min: [0, 'Items total cannot be negative']
  },
  deliveryCharge: {
    type: Number,
    default: 0,
    min: [0, 'Delivery charge cannot be negative']
  },
  handlingCharge: {
    type: Number,
    default: 2,
    min: [0, 'Handling charge cannot be negative']
  },
  tipAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tip amount cannot be negative']
  },
  donationAmount: {
    type: Number,
    default: 0,
    min: [0, 'Donation amount cannot be negative']
  },
  grandTotal: {
    type: Number,
    required: [true, 'Grand total is required'],
    min: [0, 'Grand total cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['pending_payment', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'],
      message: '{VALUE} is not a valid order status'
    },
    default: 'pending_payment'
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'completed', 'failed', 'refunded'],
      message: '{VALUE} is not a valid payment status'
    },
    default: 'pending'
  },
  orderNotes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  estimatedDelivery: {
    type: Date,
    default: function() {
      // Default to 3 days from order creation
      const deliveryDate = new Date(this.createdAt || Date.now());
      deliveryDate.setDate(deliveryDate.getDate() + 3);
      return deliveryDate;
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual for formatted order date
OrderSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
});

module.exports = mongoose.model('Order', OrderSchema);