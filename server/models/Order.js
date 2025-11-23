const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: [true, 'Address is required']
  },
  items: {
    type: Array,
    required: [true, 'Items are required']
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'CARD', 'UPI', 'NETBANKING', 'RAZORPAY'],
    required: [true, 'Payment method is required']
  },
  // Supporting both field names
  subtotal: {
    type: Number,
    min: [0, 'Subtotal cannot be negative']
  },
  itemsTotal: {
    type: Number,
    min: [0, 'Items total cannot be negative']
  },
  deliveryFee: {
    type: Number,
    min: [0, 'Delivery fee cannot be negative']
  },
  deliveryCharge: {
    type: Number,
    min: [0, 'Delivery charge cannot be negative']
  },
  total: {
    type: Number,
    min: [0, 'Total cannot be negative']
  },
  grandTotal: {
    type: Number,
    min: [0, 'Grand total cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending_payment', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending_payment'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  carrier: {
    type: String,
    trim: true
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  orderNotes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware to handle field name differences
OrderSchema.pre('save', function(next) {
  // Ensure all total fields are consistent
  if (this.subtotal && !this.itemsTotal) this.itemsTotal = this.subtotal;
  if (this.deliveryFee && !this.deliveryCharge) this.deliveryCharge = this.deliveryFee;
  if (this.total && !this.grandTotal) this.grandTotal = this.total;
  next();
});

OrderSchema.post('find', function(docs) {
  docs.forEach(doc => {
    doc.itemsTotal = doc.subtotal || doc.itemsTotal;
    doc.deliveryCharge = doc.deliveryFee || doc.deliveryCharge;
    doc.grandTotal = doc.total || doc.grandTotal || 0; // Fallback to 0 if both are missing
  });
});

OrderSchema.post('findOne', function(doc) {
  if (doc) {
    doc.itemsTotal = doc.subtotal || doc.itemsTotal;
    doc.deliveryCharge = doc.deliveryFee || doc.deliveryCharge;
    doc.grandTotal = doc.total || doc.grandTotal;
  }
});

module.exports = mongoose.model('Order', OrderSchema);