const express = require('express');
const router = express.Router();

// In-memory storage for reports (in production, use database)
let reports = [];

// POST /reports - Submit a new report
router.post('/', async (req, res) => {
  try {
    const report = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      verified: false,
      upvotes: 0,
    };
    
    reports.push(report);
    
    // Keep only last 1000 reports
    if (reports.length > 1000) {
      reports = reports.slice(-1000);
    }
    
    res.status(201).json({ success: true, report });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ success: false, message: 'Failed to create report' });
  }
});

// GET /reports - Get all reports
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;
    
    let filteredReports = reports;
    
    // Filter by location if provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const radiusMeters = parseFloat(radius);
      
      filteredReports = reports.filter(report => {
        const distance = calculateDistance(
          userLat, userLng,
          report.lat, report.lng
        );
        return distance <= radiusMeters;
      });
    }
    
    // Sort by most recent
    filteredReports.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    res.json(filteredReports);
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({ success: false, message: 'Failed to get reports' });
  }
});

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = router;

