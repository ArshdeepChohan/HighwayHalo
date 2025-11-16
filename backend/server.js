const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
console.log('🗄️ Initializing SQLite database...');
initializeDatabase()
  .then(() => {
    console.log('✅ Database initialized successfully');
  })
  .catch((error) => {
    console.error('❌ Database initialization failed:', error);
  });

// Routes
app.use('/api/points', require('./routes/points'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Sample data is loaded via fallback in routes

app.listen(PORT,'0.0.0.0', () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log('📱 Mobile app can connect to this server');
  console.log('🗄️ Using SQLite database for persistent storage');
});