const Report = require('../models/Report');

/**
 * CREATE a new report
 */
const createReport = async ({ type, description, lat, lng, reportedBy }) => {
  return await Report.create({
    type,
    description,
    location: {
      type: 'Point',
      coordinates: [lng, lat] // IMPORTANT: [lng, lat]
    },
    reportedBy,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // auto-expire in 24h
  });
};

/**
 * READ all reports (latest first)
 */
const getAllReports = async () => {
  return await Report.find()
    .sort({ createdAt: -1 });
};

/**
 * READ nearby reports (geo-based)
 */
const getNearbyReports = async ({ lat, lng, radius = 5000 }) => {
  return await Report.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: radius
      }
    }
  }).sort({ createdAt: -1 });
};

/**
 * READ single report by ID
 */
const getReportById = async (id) => {
  return await Report.findById(id);
};

/**
 * UPVOTE a report
 */
const upvoteReport = async (id) => {
  return await Report.findByIdAndUpdate(
    id,
    { $inc: { upvotes: 1 } },
    { new: true }
  );
};

/**
 * VERIFY report (Admin)
 */
const verifyReport = async (id) => {
  return await Report.findByIdAndUpdate(
    id,
    { verified: true },
    { new: true }
  );
};

/**
 * DELETE report (manual removal)
 */
const deleteReport = async (id) => {
  return await Report.findByIdAndDelete(id);
};

module.exports = {
  createReport,
  getAllReports,
  getNearbyReports,
  getReportById,
  upvoteReport,
  verifyReport,
  deleteReport
};
