const Complaint = require('../models/Complaint');
const FIR = require('../models/FIR');
const Citizen = require('../models/Citizen');
const PoliceOfficer = require('../models/PoliceOfficer');
const PoliceStation = require('../models/PoliceStation');
const { paginatedResponse, parsePagination } = require('../utils/pagination');

/**
 * GET /api/admin/stats
 * Dashboard statistics
 */
const getStats = async (req, res, next) => {
  try {
    // Total counts
    const [totalComplaints, totalFIRs, totalCitizens, totalPolice] = await Promise.all([
      Complaint.countDocuments(),
      FIR.countDocuments(),
      Citizen.countDocuments(),
      PoliceOfficer.countDocuments(),
    ]);

    // Complaints by status
    const complaintsByStatus = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Complaints by category
    const complaintsByCategory = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Complaints by district
    const complaintsByDistrict = await Complaint.aggregate([
      { $group: { _id: '$district', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Complaints by state
    const complaintsByState = await Complaint.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // FIRs by status
    const firsByStatus = await FIR.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        totals: {
          complaints: totalComplaints,
          firs: totalFIRs,
          citizens: totalCitizens,
          policeOfficers: totalPolice,
        },
        complaintsByStatus,
        complaintsByCategory,
        complaintsByDistrict,
        complaintsByState,
        firsByStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/complaints
 * All complaints with filters (paginated)
 */
const getAllComplaints = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status, district, state, category, startDate, endDate } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (district) filter.district = district;
    if (state) filter.state = state;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate('filedBy', 'name mobile email')
        .populate('assignedTo', 'name rank badgeNumber')
        .populate('assignedPoliceStation', 'name stationCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Complaint.countDocuments(filter),
    ]);

    res.json(paginatedResponse(complaints, page, limit, total));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/firs
 * All FIRs (paginated)
 */
const getAllFIRs = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const [firs, total] = await Promise.all([
      FIR.find(filter)
        .populate('linkedComplaint', 'complaintId title category')
        .populate('filedByOfficer', 'name rank badgeNumber')
        .populate('policeStation', 'name stationCode district state')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      FIR.countDocuments(filter),
    ]);

    res.json(paginatedResponse(firs, page, limit, total));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/citizens
 * All citizens (paginated)
 */
const getAllCitizens = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { state, district, search } = req.query;

    const filter = {};
    if (state) filter.state = state;
    if (district) filter.district = district;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [citizens, total] = await Promise.all([
      Citizen.find(filter)
        .select('-password -aadhaar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Citizen.countDocuments(filter),
    ]);

    res.json(paginatedResponse(citizens, page, limit, total));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/police
 * All police officers (paginated)
 */
const getAllPolice = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { state, district, rank } = req.query;

    const filter = {};
    if (state) filter.state = state;
    if (district) filter.district = district;
    if (rank) filter.rank = rank;

    const [officers, total] = await Promise.all([
      PoliceOfficer.find(filter)
        .select('-password')
        .populate('assignedPoliceStation', 'name stationCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PoliceOfficer.countDocuments(filter),
    ]);

    res.json(paginatedResponse(officers, page, limit, total));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/police
 * Create a new police officer account
 */
const createPoliceOfficer = async (req, res, next) => {
  try {
    const {
      name,
      badgeNumber,
      rank,
      assignedPoliceStation,
      mobile,
      email,
      password,
    } = req.body;

    // Verify police station exists
    const station = await PoliceStation.findById(assignedPoliceStation);
    if (!station) {
      return res.status(400).json({ success: false, message: 'Police station not found' });
    }

    const officer = await PoliceOfficer.create({
      name,
      badgeNumber,
      rank,
      assignedPoliceStation,
      policeStationCode: station.stationCode,
      district: station.district,
      state: station.state,
      mobile,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: 'Police officer account created',
      data: officer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/police/:id
 * Update police officer
 */
const updatePoliceOfficer = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'rank', 'assignedPoliceStation', 'mobile', 'email'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // If station is being changed, update related fields
    if (updates.assignedPoliceStation) {
      const station = await PoliceStation.findById(updates.assignedPoliceStation);
      if (!station) {
        return res.status(400).json({ success: false, message: 'Police station not found' });
      }
      updates.policeStationCode = station.stationCode;
      updates.district = station.district;
      updates.state = station.state;
    }

    const officer = await PoliceOfficer.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!officer) {
      return res.status(404).json({ success: false, message: 'Police officer not found' });
    }

    res.json({
      success: true,
      message: 'Police officer updated',
      data: officer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/police/:id
 * Delete police officer
 */
const deletePoliceOfficer = async (req, res, next) => {
  try {
    const officer = await PoliceOfficer.findByIdAndDelete(req.params.id);
    if (!officer) {
      return res.status(404).json({ success: false, message: 'Police officer not found' });
    }

    res.json({ success: true, message: 'Police officer deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/complaints/:id/assign
 * Assign complaint to an officer
 */
const assignComplaint = async (req, res, next) => {
  try {
    const { officerId } = req.body;

    const officer = await PoliceOfficer.findById(officerId);
    if (!officer) {
      return res.status(400).json({ success: false, message: 'Officer not found' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.assignedTo = officer._id;
    complaint.assignedPoliceStation = officer.assignedPoliceStation;

    complaint.statusHistory.push({
      status: complaint.status,
      updatedBy: req.user._id,
      updatedByModel: 'Admin',
      updatedByRole: 'admin',
      note: `Assigned to ${officer.name} (${officer.badgeNumber}) by admin`,
    });

    await complaint.save();

    res.json({
      success: true,
      message: `Complaint assigned to ${officer.name}`,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getAllComplaints,
  getAllFIRs,
  getAllCitizens,
  getAllPolice,
  createPoliceOfficer,
  updatePoliceOfficer,
  deletePoliceOfficer,
  assignComplaint,
};
