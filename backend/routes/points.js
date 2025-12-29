const express = require('express');
const router = express.Router();

const {
  createPoint,
  getAllPoints,
  getNearbyPoints,
  getPointById,
  updatePoint,
  deletePoint,
  hardDeletePoint
} = require('../services/alertPoint.service');

/**
 * GET /api/points
 * - If lat & lng provided → nearby alert points
 * - Else → all active alert points
 */
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;
    let points;

    if (lat && lng) {
      points = await getNearbyPoints({
        lat: Number(lat),
        lng: Number(lng),
        radius: Number(radius),
      });
    } else {
      points = await getAllPoints();
    }

    // 🔁 newest first (same behavior as reports)
    points.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(points);
  } catch (error) {
    console.error('Error getting points:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert points',
    });
  }
});


/**
 * GET /api/points/:id
 * Get alert point by ID
 */
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching alert point with ID:', req.params.id);
    const point = await getPointById(req.params.id);
    if (!point) {
      return res.status(404).json({ message: 'Alert point not found' });
    }
    res.json(point);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * POST /api/points
 * Create new alert point (Admin)
 */
router.post('/', async (req, res) => {
  try {
    const point = await createPoint(req.body);
    res.status(201).json({
      success: true,
      point
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * PUT /api/points/:id
 * Update alert point
 */
router.put('/:id', async (req, res) => {
  try {
    const updated = await updatePoint(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Alert point not found' });
    }
    res.json({
      success: true,
      point: updated
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * DELETE /api/points/:id
 * Soft delete (disable alert point)
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deletePoint(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Alert point not found' });
    }
    res.json({
      success: true,
      message: 'Alert point disabled successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * DELETE /api/points/hard/:id
 * Hard delete (permanent – admin only)
 */
router.delete('/hard/:id', async (req, res) => {
  try {
    await hardDeletePoint(req.params.id);
    res.json({
      success: true,
      message: 'Alert point permanently deleted'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
