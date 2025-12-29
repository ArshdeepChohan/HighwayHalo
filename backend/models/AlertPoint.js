const mongoose = require('mongoose');

const alertPointSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    // 🔹 required for geo queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },

    speedLimit: {
      type: Number
    },
    alertDistance: {
      type: Number,
      default: 100
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    description: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// 🚨 REQUIRED
alertPointSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('AlertPoint', alertPointSchema);
