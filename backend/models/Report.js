const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    // ==========================
    // REPORT TYPE
    // ==========================
    type: {
      type: String,
      required: true,
      enum: [
        'Speed-Camera',
        'Speed-Breaker',
        'Red-Light',
        'Accident',
        'Traffic',
        'Road Block',
        'Police Check',
        'Flood',
        'Construction',
        'Broken Signal',
        'Hazard',
        'Other'
      ]
    },

    // ==========================
    // DESCRIPTION
    // ==========================
    description: {
      type: String,
      trim: true,
      maxlength: 300
    },

    // ==========================
    // GEO LOCATION (GeoJSON)
    // ==========================
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },

    // ==========================
    // USER INFO (Optional)
    // ==========================
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },

    // ==========================
    // TRUST & VERIFICATION
    // ==========================
    verified: {
      type: Boolean,
      default: false
    },

    upvotes: {
      type: Number,
      default: 0
    },

    // ==========================
    // EXPIRY (TTL)
    // ==========================
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// ==========================
// INDEXES
// ==========================

// Geo index for nearby search
reportSchema.index({ location: '2dsphere' });

// TTL index (auto delete expired reports)
reportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Report', reportSchema);
