const Citizen = require('../models/Citizen');

/**
 * GET /api/citizen/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const citizen = await Citizen.findById(req.user._id);
    if (!citizen) {
      return res.status(404).json({ success: false, message: 'Citizen not found' });
    }
    res.json({ success: true, data: citizen });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/citizen/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'email', 'address', 'state', 'district', 'aadhaar'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle profile photo upload
    if (req.file) {
      updates.profilePhoto = `/uploads/${req.file.filename}`;
    }

    // If aadhaar is being updated, also update the masked version
    if (updates.aadhaar) {
      updates.aadhaarMasked = 'XXXX-XXXX-' + updates.aadhaar.slice(-4);
    }

    const citizen = await Citizen.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!citizen) {
      return res.status(404).json({ success: false, message: 'Citizen not found' });
    }

    res.json({ success: true, data: citizen, message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile };
