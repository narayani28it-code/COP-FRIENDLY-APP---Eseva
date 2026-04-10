const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadEvidence } = require('../middleware/upload');
const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
} = require('../controllers/complaintController');

const router = express.Router();

// All complaint routes (citizen) require authentication
router.use(authenticate, authorize('citizen'));

/**
 * POST /api/complaints
 * File a new complaint with evidence (multipart/form-data)
 */
router.post(
  '/',
  uploadEvidence.array('evidence', 5),
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title must be under 200 characters'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 5000 })
      .withMessage('Description must be under 5000 characters'),
    body('category')
      .notEmpty()
      .withMessage('Category is required')
      .isIn(['Theft', 'Assault', 'Cybercrime', 'Missing Person', 'Fraud', 'Harassment', 'Road Accident', 'Other'])
      .withMessage('Invalid category'),
    body('incidentDate')
      .notEmpty()
      .withMessage('Incident date is required')
      .isISO8601()
      .withMessage('Invalid date format'),
    body('incidentDistrict')
      .trim()
      .notEmpty()
      .withMessage('Incident district is required'),
    body('incidentState')
      .trim()
      .notEmpty()
      .withMessage('Incident state is required'),
  ],
  validate,
  createComplaint
);

/**
 * GET /api/complaints/my
 * Paginated list of citizen's own complaints
 */
router.get('/my', getMyComplaints);

/**
 * GET /api/complaints/:id
 * Full complaint detail with status timeline
 */
router.get('/:id', getComplaintById);

module.exports = router;
