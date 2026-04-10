const express = require('express');
const { searchIPCSections, getPoliceStations } = require('../controllers/sharedController');

const router = express.Router();

/**
 * GET /api/ipc-sections?search=query
 * Autocomplete search for IPC sections
 */
router.get('/ipc-sections', searchIPCSections);

/**
 * GET /api/police-stations?district=&state=
 * Get police stations for dropdowns
 */
router.get('/police-stations', getPoliceStations);

module.exports = router;
