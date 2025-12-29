const AlertPoint = require('../../models/AlertPoint');

const samplePoints = [
  {
    name: "Hostel Camera-1",
    type: "Speed Camera",
    lat: 30.8627650,
    lng: 75.8607660,
    location: {
      type: "Point",
      coordinates: [75.8607660, 30.8627650], // [lng, lat]
    },
    speedLimit: 40,
    alertDistance: 150,
    severity: "High",
    description: "CCTV speed monitoring near hostel area"
  },

  {
    name: "Accidental Prone Area",
    type: "Speed Breaker",
    lat: 30.8611150,
    lng: 75.8610131,
    location: {
      type: "Point",
      coordinates: [75.8610131, 30.8611150],
    },
    speedLimit: 20,
    alertDistance: 100,
    severity: "High",
    description: "Accident-prone zone with speed breaker"
  },

  {
    name: "Lipton Camera-2",
    type: "Speed Camera",
    lat: 30.8600959,
    lng: 75.8610409,
    location: {
      type: "Point",
      coordinates: [75.8610409, 30.8600959],
    },
    speedLimit: 40,
    alertDistance: 150,
    severity: "High",
    description: "CCTV speed enforcement near Lipton area"
  },

  {
    name: "MBA Block Construction Area",
    type: "Speed Breaker",
    lat: 30.8601031,
    lng: 75.8603610,
    location: {
      type: "Point",
      coordinates: [75.8603610, 30.8601031],
    },
    speedLimit: 15,
    alertDistance: 120,
    severity: "Medium",
    description: "Construction area near MBA block"
  }
];

const seedAlertPoints = async () => {
  const count = await AlertPoint.countDocuments();
  if (count === 0) {
    await AlertPoint.insertMany(samplePoints);
    console.log('✅ Sample alert points inserted');
  } else {
    console.log('📊 Alert points already exist');
  }
};

module.exports = seedAlertPoints;
