const express = require('express');
const { alertPointsOperations } = require('../database');
const router = express.Router();

// Fallback data when MongoDB is not available
const fallbackPoints = [
  {
    name: "Speed Camera",
    type: "Speed Camera",
    lat: 30.8600959,
    lng: 75.8610409,
    speedLimit: 40,
    alertDistance: 150,
    severity: "High",
    description: "Speed camera enforcement zone"
  },
  {
    name: "Speed Breaker",
    type: "Speed Breaker",
    lat: 30.8611150,
    lng: 75.8610131,
    speedLimit: 20,
    alertDistance: 100,
    severity: "High",
    description: "High accident zone with speed breaker"
  },
  {
    name: "Red Light",
    type: "Red Light",
    lat: 30.8630000,
    lng: 75.8600000,
    speedLimit: 0,
    alertDistance: 200,
    severity: "Critical",
    description: "Traffic signal intersection"
  },
  {
    name: "School Zone",
    type: "School Zone",
    lat: 30.8615000,
    lng: 75.8615000,
    speedLimit: 20,
    alertDistance: 150,
    severity: "High",
    description: "School zone with reduced speed limit"
  }
];

// GET /points - Get all campus points
router.get('/', async (req, res) => {
  try {
    // Get points from database
    const points = await alertPointsOperations.getAllPoints();
    res.json(points);
  } catch (error) {
    console.log('Error getting points:', error.message);
    // Fallback to static data if database fails
    res.json(fallbackPoints);
  }
});

module.exports = router;