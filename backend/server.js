const express = require('express');
const cors = require('cors');
require('dotenv').config();

// MongoDB connection
const connectDB = require('./config/db');

// Optional: seed data
const seedAlertPoints = require('./config/seed/alertPoints.seed');
const seedUsers = require('./config/seed/users.seed');

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// Middleware
// =====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});


// =====================
// Database Connection
// =====================
console.log('🗄️ Connecting to MongoDB...');

(async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connected successfully');

    // Seed sample alert points (runs only if empty)
    await seedAlertPoints();
    await seedUsers();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
})();

// =====================
// Routes
// =====================
app.use('/api/points', require('./routes/points'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));

// =====================
// Test Route
// =====================
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working with MongoDB!' });
});

// =====================
// Server Start
// =====================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log('📱 Mobile app can connect to this server');
  console.log('🗄️ Using MongoDB (Mongoose) for persistent storage');
});
