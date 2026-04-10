const Complaint = require('../models/Complaint');
const FIR = require('../models/FIR');
const PoliceOfficer = require('../models/PoliceOfficer');
const { paginatedResponse, parsePagination } = require('../utils/pagination');
const { generateFIRPdf } = require('../utils/pdfGenerator');

/**
 * GET /api/police/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const officer = await PoliceOfficer.findById(req.user._id)
      .populate('assignedPoliceStation', 'name stationCode district state');
    res.json({ success: true, data: officer });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/police/complaints
 * Get complaints for police officer's station/district (paginated + filters)
 */
const getComplaints = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status, district, state, category } = req.query;

    const filter = {};

    // Filter by district only if explicitly provided in query,
    // OR if the officer has a district assigned. Otherwise show all.
    const targetDistrict = district || req.user.district;
    if (targetDistrict) {
      filter.$or = [
        { district: targetDistrict },
        { assignedTo: req.user._id }
      ];
    }

    if (state) filter.state = state;
    if (status) filter.status = status;
    if (category) filter.category = category;

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate('filedBy', 'name mobile email username')
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
 * PUT /api/police/complaints/:id/status
 * Update complaint status
 */
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const validStatuses = ['Under Review', 'FIR Registered', 'Investigation Ongoing', 'Closed', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = status;
    complaint.statusHistory.push({
      status,
      updatedBy: req.user._id,
      updatedByModel: 'PoliceOfficer',
      updatedByRole: 'police',
      note: note || `Status updated to ${status}`,
    });

    await complaint.save();

    res.json({
      success: true,
      message: 'Complaint status updated',
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/police/complaints/:id/assign
 * Self-assign a complaint
 */
const selfAssignComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('filedBy', 'name mobile email username')
      .populate('assignedTo', 'name rank badgeNumber')
      .populate('assignedPoliceStation', 'name stationCode');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.assignedTo = req.user._id;
    complaint.assignedPoliceStation = req.user.assignedPoliceStation;

    complaint.statusHistory.push({
      status: complaint.status,
      updatedBy: req.user._id,
      updatedByModel: 'PoliceOfficer',
      updatedByRole: 'police',
      note: `Complaint self-assigned by ${req.user.name || 'Officer'} (${req.user.badgeNumber})`,
    });

    await complaint.save();

    res.json({
      success: true,
      message: 'Complaint assigned to you',
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/police/complaints/:id
 * Get single complaint detail (police access)
 */
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('filedBy', 'name mobile email username')
      .populate('assignedTo', 'name rank badgeNumber')
      .populate('assignedPoliceStation', 'name stationCode district state');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/fir
 * Create a new FIR
 */
const createFIR = async (req, res, next) => {
  try {
    const {
      linkedComplaint,
      accusedDetails,
      ipcSections,
      narrative,
      witnesses,
    } = req.body;

    // Verify the complaint exists
    const complaint = await Complaint.findById(linkedComplaint);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Linked complaint not found' });
    }

    const fir = await FIR.create({
      linkedComplaint,
      filedByOfficer: req.user._id,
      policeStation: req.user.assignedPoliceStation,
      accusedDetails: accusedDetails || [],
      ipcSections: ipcSections || [],
      narrative,
      witnesses: witnesses || [],
    });

    // Update complaint status to "FIR Registered"
    complaint.status = 'FIR Registered';
    complaint.statusHistory.push({
      status: 'FIR Registered',
      updatedBy: req.user._id,
      updatedByModel: 'PoliceOfficer',
      updatedByRole: 'police',
      note: `FIR ${fir.firNumber} registered`,
    });
    await complaint.save();

    res.status(201).json({
      success: true,
      message: 'FIR created successfully',
      data: fir,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/fir/my
 * Get FIRs filed by this officer (paginated)
 */
const getMyFIRs = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const filter = { filedByOfficer: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const [firs, total] = await Promise.all([
      FIR.find(filter)
        .populate('linkedComplaint', 'complaintId title category status')
        .populate('policeStation', 'name stationCode')
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
 * GET /api/fir/:id
 * Get single FIR detail
 */
const getFIRById = async (req, res, next) => {
  try {
    const fir = await FIR.findById(req.params.id)
      .populate('linkedComplaint')
      .populate('filedByOfficer', 'name rank badgeNumber mobile')
      .populate('policeStation', 'name stationCode district state');

    if (!fir) {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }

    res.json({ success: true, data: fir });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/fir/:id
 * Update FIR
 */
const updateFIR = async (req, res, next) => {
  try {
    const allowedFields = ['accusedDetails', 'ipcSections', 'narrative', 'witnesses', 'status'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const fir = await FIR.findOne({
      _id: req.params.id,
      filedByOfficer: req.user._id,
    });

    if (!fir) {
      return res.status(404).json({ success: false, message: 'FIR not found or unauthorized' });
    }

    Object.assign(fir, updates);

    // Generate PDF if status is being set to Submitted
    if (updates.status === 'Submitted' && !fir.pdfUrl) {
      const populatedFIR = await FIR.findById(fir._id)
        .populate('linkedComplaint')
        .populate('filedByOfficer', 'name rank badgeNumber')
        .populate('policeStation', 'name stationCode district state');

      // Merge updated fields for PDF generation
      Object.assign(populatedFIR, updates);
      const pdfUrl = await generateFIRPdf(populatedFIR);
      fir.pdfUrl = pdfUrl;
    }

    await fir.save();

    res.json({
      success: true,
      message: 'FIR updated successfully',
      data: fir,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/fir/:id/pdf
 * Generate and return FIR PDF
 */
const getFIRPdf = async (req, res, next) => {
  try {
    const fir = await FIR.findById(req.params.id)
      .populate('linkedComplaint')
      .populate('filedByOfficer', 'name rank badgeNumber')
      .populate('policeStation', 'name stationCode district state');

    if (!fir) {
      return res.status(404).json({ success: false, message: 'FIR not found' });
    }

    const pdfUrl = await generateFIRPdf(fir);

    // Update FIR with PDF URL
    fir.pdfUrl = pdfUrl;
    await fir.save();

    res.json({
      success: true,
      message: 'PDF generated successfully',
      data: { pdfUrl },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  selfAssignComplaint,
  createFIR,
  getMyFIRs,
  getFIRById,
  updateFIR,
  getFIRPdf,
};
