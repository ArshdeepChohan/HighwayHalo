const AlertPoint = require('../models/AlertPoint');

/**
 * CREATE a new alert point
 */
const createPoint = async (data) => {
  return await AlertPoint.create({
    ...data,
    location: {
      type: 'Point',
      coordinates: [data.lng, data.lat],
    }
  });
};


const getNearbyPoints = async ({ lat, lng, radius = 5000 }) => {
  return await AlertPoint.find({
    isActive: true,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        $maxDistance: radius,
      },
    },
  }).sort({ createdAt: -1 });
};


/**
 * READ all active alert points
 */
const getAllPoints = async () => {
  return await AlertPoint.find({ isActive: true }).sort({ createdAt: -1 });
};

/**
 * READ single alert point by ID
 */
const getPointById = async (id) => {
  return await AlertPoint.findById(id);
};

/**
 * UPDATE alert point by ID
 */
const updatePoint = async (id, updates) => {
  return await AlertPoint.findByIdAndUpdate(
    id,
    updates,
    { new: true, runValidators: true }
  );
};

/**
 * SOFT DELETE alert point (disable)
 */
const deletePoint = async (id) => {
  return await AlertPoint.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
};

/**
 * HARD DELETE alert point (permanent)
 */
const hardDeletePoint = async (id) => {
  return await AlertPoint.findByIdAndDelete(id);
};

module.exports = {
  createPoint,
  getAllPoints,
  getPointById,
  updatePoint,
  deletePoint,
  hardDeletePoint,
  getNearbyPoints
};
