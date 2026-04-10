const IPCSection = require('../models/IPCSection');
const PoliceStation = require('../models/PoliceStation');

/**
 * GET /api/ipc-sections?search=query
 * Autocomplete search for IPC sections
 */
const searchIPCSections = async (req, res, next) => {
  try {
    const { search } = req.query;

    let query = {};
    if (search) {
      query = {
        $or: [
          { code: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const sections = await IPCSection.find(query).limit(20).sort({ code: 1 });

    res.json({
      success: true,
      data: sections,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/police-stations?district=&state=
 * Get police stations for dropdowns
 */
const getPoliceStations = async (req, res, next) => {
  try {
    const { district, state } = req.query;

    const filter = {};
    if (district) filter.district = district;
    if (state) filter.state = state;

    const stations = await PoliceStation.find(filter)
      .populate('inChargeOfficer', 'name rank badgeNumber')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: stations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { searchIPCSections, getPoliceStations };
