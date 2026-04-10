const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getStats,
  getAllComplaints,
  getAllFIRs,
  getAllCitizens,
  getAllPolice,
  createPoliceOfficer,
  updatePoliceOfficer,
  deletePoliceOfficer,
  assignComplaint,
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

/**
 * GET /api/admin/stats
 */
router.get('/stats', getStats);

/**
 * GET /api/admin/complaints
 */
router.get('/complaints', getAllComplaints);

/**
 * GET /api/admin/firs
 */
router.get('/firs', getAllFIRs);

/**
 * GET /api/admin/citizens
 */
router.get('/citizens', getAllCitizens);

/**
 * GET /api/admin/police
 */
router.get('/police', getAllPolice);

/**
 * POST /api/admin/police
 * Create new police officer account
 */
router.post(
  '/police',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('badgeNumber').trim().notEmpty().withMessage('Badge number is required'),
    body('rank')
      .notEmpty()
      .withMessage('Rank is required')
      .isIn([
        'Constable', 'Head Constable', 'ASI', 'Sub Inspector',
        'Inspector', 'DSP', 'SP', 'SSP', 'DIG', 'IG', 'DGP',
      ])
      .withMessage('Invalid rank'),
    body('assignedPoliceStation')
      .notEmpty()
      .withMessage('Police station is required')
      .isMongoId()
      .withMessage('Invalid police station ID'),
    body('mobile')
      .notEmpty()
      .withMessage('Mobile is required')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Invalid mobile number'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  createPoliceOfficer
);

/**
 * PUT /api/admin/police/:id
 */
router.put(
  '/police/:id',
  [
    param('id').isMongoId().withMessage('Invalid officer ID'),
    body('name').optional().trim().notEmpty(),
    body('rank')
      .optional()
      .isIn([
        'Constable', 'Head Constable', 'ASI', 'Sub Inspector',
        'Inspector', 'DSP', 'SP', 'SSP', 'DIG', 'IG', 'DGP',
      ])
      .withMessage('Invalid rank'),
    body('assignedPoliceStation')
      .optional()
      .isMongoId()
      .withMessage('Invalid police station ID'),
  ],
  validate,
  updatePoliceOfficer
);

/**
 * DELETE /api/admin/police/:id
 */
router.delete(
  '/police/:id',
  [param('id').isMongoId().withMessage('Invalid officer ID')],
  validate,
  deletePoliceOfficer
);

/**
 * PUT /api/admin/complaints/:id/assign
 */
router.put(
  '/complaints/:id/assign',
  [
    param('id').isMongoId().withMessage('Invalid complaint ID'),
    body('officerId')
      .notEmpty()
      .withMessage('Officer ID is required')
      .isMongoId()
      .withMessage('Invalid officer ID'),
  ],
  validate,
  assignComplaint
);

module.exports = router;
