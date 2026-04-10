const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { citizenRegister, citizenLogin, policeRegister, policeLogin, adminLogin } = require('../controllers/authController');

const router = express.Router();

/**
 * POST /api/auth/citizen/register
 */
router.post(
  '/citizen/register',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  citizenRegister
);

/**
 * POST /api/auth/citizen/login
 */
router.post(
  '/citizen/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  citizenLogin
);

/**
 * POST /api/auth/police/register
 */
router.post(
  '/police/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('badgeNumber').notEmpty().withMessage('Badge number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  policeRegister
);

/**
 * POST /api/auth/police/login
 */
router.post(
  '/police/login',
  [
    body('badgeNumber').notEmpty().withMessage('Badge number is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  policeLogin
);

/**
 * POST /api/auth/admin/login
 */
router.post(
  '/admin/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  adminLogin
);

module.exports = router;
