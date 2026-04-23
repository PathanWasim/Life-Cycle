const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/auth/me
 * @desc    Get current user data
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update eligibility status for donors
    if (user.role === 'Donor') {
      user.eligibilityStatus = user.checkEligibility();
      await user.save();
    }

    // Return user data
    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      ...(user.role === 'Donor' && {
        name: user.name,
        bloodGroup: user.bloodGroup,
        eligibilityStatus: user.eligibilityStatus,
        city: user.city
      }),
      ...(user.role === 'Hospital' && {
        hospitalName: user.hospitalName,
        isVerified: user.isVerified,
        city: user.city
      }),
      ...(user.role === 'Admin' && {
        name: 'Admin'
      })
    };

    res.status(200).json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Donor or Hospital)
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, walletAddress, ...otherFields } = req.body;

    // Validate required fields
    if (!email || !password || !role || !walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, role, and wallet address'
      });
    }

    // Validate role
    if (!['Donor', 'Hospital'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either Donor or Hospital'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate role-specific fields
    if (role === 'Donor') {
      const { name, bloodGroup, dateOfBirth, weight, city, pincode } = otherFields;
      if (!name || !bloodGroup || !dateOfBirth || !weight || !city || !pincode) {
        return res.status(400).json({
          success: false,
          message: 'Donors must provide: name, bloodGroup, dateOfBirth, weight, city, pincode'
        });
      }
    }

    if (role === 'Hospital') {
      const { hospitalName, city, pincode } = otherFields;
      if (!hospitalName || !city || !pincode) {
        return res.status(400).json({
          success: false,
          message: 'Hospitals must provide: hospitalName, city, pincode'
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userData = {
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      walletAddress,
      ...otherFields
    };

    const user = await User.create(userData);

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    // Return user data (excluding password)
    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      ...(role === 'Donor' && {
        name: user.name,
        bloodGroup: user.bloodGroup,
        eligibilityStatus: user.eligibilityStatus
      }),
      ...(role === 'Hospital' && {
        hospitalName: user.hospitalName,
        isVerified: user.isVerified
      })
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update eligibility status for donors
    if (user.role === 'Donor') {
      user.eligibilityStatus = user.checkEligibility();
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    // Return user data (excluding password)
    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      ...(user.role === 'Donor' && {
        name: user.name,
        bloodGroup: user.bloodGroup,
        eligibilityStatus: user.eligibilityStatus,
        city: user.city
      }),
      ...(user.role === 'Hospital' && {
        hospitalName: user.hospitalName,
        isVerified: user.isVerified,
        city: user.city
      }),
      ...(user.role === 'Admin' && {
        name: 'Admin'
      })
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

module.exports = router;
