const express = require('express');
const router = express.Router();

const {
  createReport,
  getAllReports,
  getNearbyReports,
  getReportById,
  upvoteReport,
  verifyReport,
  deleteReport
} = require('../services/report.service');

/**
 * POST /api/reports
 * Same as before: submit a report
 */
router.post('/', async (req, res) => {
  try {
    const { type, description, lat, lng, reportedBy } = req.body;

    if (!type || lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: 'type, lat and lng are required'
      });
    }

    const report = await createReport({
      type,
      description,
      lat: Number(lat),
      lng: Number(lng),
      reportedBy
    });

    // 🔁 same response shape as before
    res.status(201).json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create report'
    });
  }
});

/**
 * GET /api/reports
 * Backward compatible:
 * - no params → all reports
 * - lat + lng → nearby reports
 * - radius optional (default 5000)
 */
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;
    let reports;

    if (lat && lng) {
      reports = await getNearbyReports({
        lat: Number(lat),
        lng: Number(lng),
        radius: Number(radius)
      });
    } else {
      reports = await getAllReports();
    }

    // 🔁 same as old: most recent first
    reports.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(reports);
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reports'
    });
  }
});

/**
 * GET /api/reports/:id
 * (new but harmless)
 */
router.get('/:id', async (req, res) => {
  try {
    const report = await getReportById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * POST /api/reports/:id/upvote
 * (new functionality)
 */
router.post('/:id/upvote', async (req, res) => {
  try {
    const report = await upvoteReport(req.params.id);
    res.json({ success: true, report });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * POST /api/reports/:id/verify
 * (admin feature – optional)
 */
router.post('/:id/verify', async (req, res) => {
  try {
    const report = await verifyReport(req.params.id);
    res.json({ success: true, report });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * DELETE /api/reports/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    await deleteReport(req.params.id);
    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

// Helper function to calculate distance
// function calculateDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371000; // Earth's radius in meters
//   const dLat = (lat2 - lat1) * Math.PI / 180;
//   const dLon = (lon2 - lon1) * Math.PI / 180;
//   const a = Math.sin(dLat / 2) ** 2 +
//     Math.cos(lat1 * Math.PI / 180) *
//     Math.cos(lat2 * Math.PI / 180) *
//     Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// }

