const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Create user
const createUser = async (userData) => {
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return await User.create({
      ...userData,
      password: hashedPassword
    });
  } catch (error) {
    throw new Error(`Create User Failed: ${error.message}`);
  }
};

// Find user by username / email / phone
const findUserByIdentifier = async (identifier) => {
  try {
    return await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier },
        { phone: identifier }
      ]
    });
  } catch (error) {
    throw new Error(`Find User Failed: ${error.message}`);
  }
};

// Update user preferences
const updateUserPreferences = async (id, preferences) => {
  try {
    return await User.findByIdAndUpdate(
      id,
      { preferences },
      { new: true }
    );
  } catch (error) {
    throw new Error(`Update Preferences Failed: ${error.message}`);
  }
};

// Update last login time
const updateLastLogin = async (id) => {
  try {
    return await User.findByIdAndUpdate(
      id,
      { lastLogin: new Date() }
    );
  } catch (error) {
    throw new Error(`Update Last Login Failed: ${error.message}`);
  }
};

// Find user by ID
const findUserById = async (id) => {
  try {
    return await User.findById(id);
  } catch (error) {
    throw new Error(`Find User By ID Failed: ${error.message}`);
  }
};

// Compare password (secure login)
const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new Error(`Password Comparison Failed: ${error.message}`);
  }
};

// Update vehicle type
const updateVehicleType = async (id, vehicleType) => {
  try {
    return await User.findByIdAndUpdate(
      id,
      { vehicleType },
      { new: true }
    );
  } catch (error) {
    throw new Error(`Update Vehicle Type Failed: ${error.message}`);
  }
};

// Deactivate user (soft delete)
const deactivateUser = async (id) => {
  try {
    return await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  } catch (error) {
    throw new Error(`Deactivate User Failed: ${error.message}`);
  }
};

// Reactivate user
const activateUser = async (id) => {
  try {
    return await User.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );
  } catch (error) {
    throw new Error(`Activate User Failed: ${error.message}`);
  }
};

module.exports = {
  createUser,
  findUserByIdentifier,
  updateUserPreferences,
  updateLastLogin,
  findUserById,
  comparePassword,
  updateVehicleType,
  deactivateUser,
  activateUser
};