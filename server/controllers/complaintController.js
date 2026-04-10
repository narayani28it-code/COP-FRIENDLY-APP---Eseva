const Complaint = require('../models/Complaint');
const { getFileType } = require('../middleware/upload');
const { paginatedResponse, parsePagination } = require('../utils/pagination');

/**
 * POST /api/complaints
 * File a new complaint (Citizen)
 */
const createComplaint = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      incidentDate,
      incidentAddress,
      incidentDistrict,
      incidentState,
      incidentPoliceStation,
    } = req.body;

    // Build evidence files from uploaded files
    const evidenceFiles = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        evidenceFiles.push({
          url: `/uploads/${file.filename}`,
          type: getFileType(file.mimetype),
          filename: file.originalname,
        });
      });
    }

    const complaint = await Complaint.create({
      filedBy: req.user._id,
      title,
      description,
      category,
      incidentDate,
      incidentLocation: {
        address: incidentAddress,
        district: incidentDistrict,
        state: incidentState,
        policeStation: incidentPoliceStation,
      },
      evidenceFiles,
      district: incidentDistrict,
      state: incidentState,
      status: 'Filed',
      statusHistory: [
        {
          status: 'Filed',
          updatedBy: req.user._id,
          updatedByModel: 'Citizen',
          updatedByRole: 'citizen',
          note: 'Complaint filed by citizen',
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Complaint filed successfully',
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/complaints/my
 * Get citizen's own complaints (paginated)
 */
const getMyComplaints = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status, category } = req.query;

    const filter = { filedBy: req.user._id };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
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
 * GET /api/complaints/:id
 * Get complaint full detail (Citizen — own only)
 */
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      filedBy: req.user._id,
    })
      .populate('filedBy', 'name mobile')
      .populate('assignedTo', 'name rank badgeNumber mobile')
      .populate('assignedPoliceStation', 'name stationCode district state');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

module.exports = { createComplaint, getMyComplaints, getComplaintById };
