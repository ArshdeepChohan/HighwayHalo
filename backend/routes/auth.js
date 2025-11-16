const express = require('express');
const jwt = require('jsonwebtoken');
const { userOperations } = require('../database');
const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'highway-halo-secret-key';

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await userOperations.findUserById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    // Validation
    if (!username || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await userOperations.findUserByIdentifier(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email, username, or phone' });
    }

    // Create new user
    const user = await userOperations.createUser({ username, email, phone, password });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be username, email, or phone

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Identifier and password are required' });
    }

    // Find user by username, email, or phone
    const user = await userOperations.findUserByIdentifier(identifier);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password (in production, use proper password hashing)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await userOperations.updateLastLogin(user.id);

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { password: _, ...userResponse } = req.user;
    res.json({ user: userResponse });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { vehicleType, preferences } = req.body;
    
    const updatedPreferences = {
      ...JSON.parse(req.user.preferences || '{}'),
      ...preferences
    };

    if (vehicleType) {
      // Update vehicle type in database
      const db = require('../database').db;
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE users SET vehicleType = ? WHERE id = ?`,
          [vehicleType, req.user.id],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    await userOperations.updateUserPreferences(req.user.id, updatedPreferences);

    // Get updated user
    const updatedUser = await userOperations.findUserById(req.user.id);
    const { password: _, ...userResponse } = updatedUser;

    res.json({
      message: 'Preferences updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ message: 'Server error updating preferences' });
  }
});

// Verify token endpoint
router.get('/verify', authenticateToken, (req, res) => {
  const { password: _, ...userResponse } = req.user;
  res.json({ valid: true, user: userResponse });
});

module.exports = router;