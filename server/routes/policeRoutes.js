const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getProfile,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  selfAssignComplaint,
} = require('../controllers/policeController');

const router = express.Router();

// All police routes require authentication + police role
router.use(authenticate, authorize('police'));

/**
 * GET /api/police/profile
 */
router.get('/profile', getProfile);

/**
 * GET /api/police/complaints
 */
router.get('/complaints', getComplaints);

/**
 * GET /api/police/complaints/:id
 */
router.get('/complaints/:id', getComplaintById);

/**
 * PUT /api/police/complaints/:id/status
 */
router.put(
  '/complaints/:id/status',
  [
    body('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['Under Review', 'FIR Registered', 'Investigation Ongoing', 'Closed', 'Rejected'])
      .withMessage('Invalid status'),
    body('note').optional().trim(),
  ],
  validate,
  updateComplaintStatus
);

/**
 * PUT /api/police/complaints/:id/assign
 */
router.put('/complaints/:id/assign', selfAssignComplaint);

module.exports = router;
