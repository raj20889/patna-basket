const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      default: 'Premium grocery store with quality products'
    },
    banner: {
      type: String,
      default: ''
    },
    logo: {
      type: String,
      default: ''
    },
    address: {
      street: String,
      city: String,
      postalCode: String,
      state: String,
      fullAddress: String // Combined address
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    distance: {
      type: String,
      default: '2.3 km'
    },
    contact: {
      phone: String,
      email: String
    },
    rating: {
      average: {
        type: Number,
        default: 4.5,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    isOpen: {
      type: Boolean,
      default: true
    },
    openingHours: {
      monday: { open: '09:00', close: '22:00' },
      tuesday: { open: '09:00', close: '22:00' },
      wednesday: { open: '09:00', close: '22:00' },
      thursday: { open: '09:00', close: '22:00' },
      friday: { open: '09:00', close: '22:00' },
      saturday: { open: '09:00', close: '22:00' },
      sunday: { open: '09:00', close: '22:00' }
    },
    delivery: {
      available: {
        type: Boolean,
        default: true
      },
      minTime: {
        type: Number,
        default: 30 // minutes
      },
      maxTime: {
        type: Number,
        default: 45 // minutes
      },
      minOrderValue: {
        type: Number,
        default: 0
      },
      chargePerKm: {
        type: Number,
        default: 5
      }
    },
    categories: [
      {
        name: String,
        icon: String,
        description: String,
        color: String
      }
    ],
    sections: [
      {
        title: String,
        type: {
          type: String,
          enum: ['shelf', 'grid', 'carousel'],
          default: 'shelf'
        },
        position: Number,
        products: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
          }
        ],
        isActive: {
          type: Boolean,
          default: true
        }
      }
    ],
    facilities: [String], // WiFi, Parking, ATM, etc.
    about: String,
    famousFor: [String],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for geospatial queries (if using coordinates)
storeSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

// Index for search
storeSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Store', storeSchema);
