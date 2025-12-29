const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// 🔥 New User Service (Mongoose)
const {
  createUser,
  findUserByIdentifier,
  findUserById,
  comparePassword,
  updateUserPreferences,
  updateVehicleType,
  updateLastLogin
} = require('../services/user.service');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'highway-halo-secret-key';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await findUserById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

router.post('/register', async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    // Validation
    if (!username || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await findUserByIdentifier(email);
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email, username, or phone'
      });
    }

    // Create user (password auto-hashed)
    const user = await createUser({ username, email, phone, password });

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password
    const { password: _, ...userResponse } = user.toObject();

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: 'Identifier and password are required'
      });
    }

    const user = await findUserByIdentifier(identifier);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 🔐 Secure password check
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await updateLastLogin(user._id);

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userResponse } = user.toObject();

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { password: _, ...userResponse } = req.user.toObject();
    res.json({ user: userResponse });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { vehicleType, preferences } = req.body;

    // Merge preferences safely
    const updatedPreferences = {
      ...(req.user.preferences || {}),
      ...(preferences || {})
    };

    if (vehicleType) {
      await updateVehicleType(req.user._id, vehicleType);
    }

    await updateUserPreferences(req.user._id, updatedPreferences);

    const updatedUser = await findUserById(req.user._id);
    const { password: _, ...userResponse } = updatedUser.toObject();

    res.json({
      message: 'Preferences updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({
      message: error.message
    });
  }
});

router.get('/verify', authenticateToken, (req, res) => {
  const { password: _, ...userResponse } = req.user.toObject();
  res.json({ valid: true, user: userResponse });
});

module.exports = router;
