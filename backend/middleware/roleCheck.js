/**
 * Role-based access control middleware
 * Checks if authenticated user has one of the required roles
 * Must be used after auth middleware
 * 
 * @param {Array} allowedRoles - Array of roles that are allowed to access the route
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.get('/admin-only', auth, roleCheck(['Admin']), controller);
 * router.post('/hospital-action', auth, roleCheck(['Hospital', 'Admin']), controller);
 */
const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is attached to request (should be done by auth middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required. Please login first'
        });
      }

      // Check if user has a role
      if (!req.user.role) {
        return res.status(403).json({
          success: false,
          message: 'User role not found'
        });
      }

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`
        });
      }

      // User has required role, proceed
      next();

    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

/**
 * Middleware to check if hospital is verified
 * Must be used after auth middleware and roleCheck(['Hospital'])
 */
const checkHospitalVerified = async (req, res, next) => {
  try {
    if (req.user.role !== 'Hospital') {
      return next(); // Not a hospital, skip this check
    }

    // Get full user object from database to check isVerified
    const User = require('../models/User');
    const hospital = await User.findById(req.user.id);
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    if (!hospital.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Hospital not verified. Please wait for admin approval'
      });
    }

    next();
  } catch (error) {
    console.error('Hospital verification check error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification check error'
    });
  }
};

module.exports = { roleCheck, checkHospitalVerified };
