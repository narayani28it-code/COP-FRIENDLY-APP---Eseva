const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createFIR,
  getMyFIRs,
  getFIRById,
  updateFIR,
  getFIRPdf,
} = require('../controllers/policeController');

const router = express.Router();

/**
 * POST /api/fir
 * Create FIR (police only)
 */
router.post(
  '/',
  authenticate,
  authorize('police'),
  [
    body('linkedComplaint')
      .notEmpty()
      .withMessage('Linked complaint ID is required')
      .isMongoId()
      .withMessage('Invalid complaint ID'),
    body('accusedDetails')
      .optional()
      .isArray()
      .withMessage('Accused details must be an array'),
    body('ipcSections')
      .optional()
      .isArray()
      .withMessage('IPC sections must be an array'),
    body('narrative')
      .optional()
      .trim()
      .isLength({ max: 10000 })
      .withMessage('Narrative must be under 10000 characters'),
    body('witnesses')
      .optional()
      .isArray()
      .withMessage('Witnesses must be an array'),
  ],
  validate,
  createFIR
);

/**
 * GET /api/fir/my
 * Get FIRs filed by the logged-in officer (paginated)
 */
router.get('/my', authenticate, authorize('police'), getMyFIRs);

/**
 * GET /api/fir/:id/pdf
 * Generate and return FIR as PDF
 */
router.get('/:id/pdf', authenticate, authorize('police', 'admin'), getFIRPdf);

/**
 * GET /api/fir/:id
 * Get single FIR detail
 */
router.get('/:id', authenticate, authorize('police', 'admin'), getFIRById);

/**
 * PUT /api/fir/:id
 * Update FIR (police only)
 */
router.put(
  '/:id',
  authenticate,
  authorize('police'),
  [
    body('accusedDetails')
      .optional()
      .isArray()
      .withMessage('Accused details must be an array'),
    body('ipcSections')
      .optional()
      .isArray()
      .withMessage('IPC sections must be an array'),
    body('narrative')
      .optional()
      .trim(),
    body('witnesses')
      .optional()
      .isArray()
      .withMessage('Witnesses must be an array'),
    body('status')
      .optional()
      .isIn(['Draft', 'Submitted', 'Under Investigation', 'Chargesheet Filed', 'Closed'])
      .withMessage('Invalid FIR status'),
  ],
  validate,
  updateFIR
);

module.exports = router;
