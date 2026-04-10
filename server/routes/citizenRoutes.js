const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadProfilePhoto } = require('../middleware/upload');
const { getProfile, updateProfile } = require('../controllers/citizenController');

const router = express.Router();

// All citizen routes require authentication + citizen role
router.use(authenticate, authorize('citizen'));

/**
 * GET /api/citizen/profile
 */
router.get('/profile', getProfile);

/**
 * PUT /api/citizen/profile
 */
router.put(
  '/profile',
  uploadProfilePhoto.single('profilePhoto'),
  [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').optional().isEmail().withMessage('Valid email required').normalizeEmail(),
    body('aadhaar').optional().matches(/^\d{12}$/).withMessage('Aadhaar must be 12 digits'),
    body('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
    body('district').optional().trim().notEmpty().withMessage('District cannot be empty'),
  ],
  validate,
  updateProfile
);

module.exports = router;
