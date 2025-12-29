const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    vehicleType: {
      type: String,
      enum: ['Car', 'Bike', 'Truck', 'Bus']
    },
    preferences: {
      speedUnit: { type: String, default: 'km/h' },
      alertDistance: { type: Number, default: 100 },
      enableSpeedAlerts: { type: Boolean, default: true },
      enableProximityAlerts: { type: Boolean, default: true }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
