const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const campaignValidation = [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be 5-100 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be 10-500 characters'),
  body('campaignDate').isISO8601().withMessage('Invalid campaign date'),
  body('venue.name').trim().isLength({ min: 3, max: 100 }).withMessage('Venue name must be 3-100 characters'),
  body('venue.address').trim().isLength({ min: 10, max: 200 }).withMessage('Address must be 10-200 characters'),
  body('venue.city').trim().isLength({ min: 2, max: 50 }).withMessage('City must be 2-50 characters'),
  body('venue.pincode').matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),
  body('bloodGroupsNeeded').isArray({ min: 1 }).withMessage('At least one blood group required'),
  body('targetDonors').isInt({ min: 1, max: 1000 }).withMessage('Target donors must be 1-1000'),
  handleValidationErrors
];

const registrationValidation = [
  param('id').isMongoId().withMessage('Invalid campaign ID'),
  handleValidationErrors
];

const bloodAvailabilityValidation = [
  query('city').optional().trim().isLength({ min: 2, max: 50 }).withMessage('City must be 2-50 characters'),
  query('pincode').optional().matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),
  query('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  handleValidationErrors
];

module.exports = {
  campaignValidation,
  registrationValidation,
  bloodAvailabilityValidation,
  handleValidationErrors
};