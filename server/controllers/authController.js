const jwt = require('jsonwebtoken');
const OTPRecord = require('../models/OTPRecord');
const Citizen = require('../models/Citizen');
const PoliceOfficer = require('../models/PoliceOfficer');
const Admin = require('../models/Admin');

/**
 * Generate JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * POST /api/auth/citizen/register
 * Register citizen with username and password
 */
const citizenRegister = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if username exists
    const existing = await Citizen.findOne({ username });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists',
      });
    }

    const citizen = await Citizen.create({
      username,
      password,
      isVerified: true,
    });

    const token = generateToken(citizen._id, 'citizen');

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: citizen,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/citizen/login
 * Login citizen with username and password
 */
const citizenLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const citizen = await Citizen.findOne({ username });
    if (!citizen) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const isMatch = await citizen.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const token = generateToken(citizen._id, 'citizen');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: citizen,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/police/register
 * Self-register a police officer with badge number, name, and password
 */
const policeRegister = async (req, res, next) => {
  try {
    const { name, badgeNumber, rank, password } = req.body;

    // Check if badge number already exists
    const existing = await PoliceOfficer.findOne({ badgeNumber });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Badge number already registered',
      });
    }

    const officer = await PoliceOfficer.create({
      name,
      badgeNumber,
      rank: rank || 'Constable',
      password,
    });

    const token = generateToken(officer._id, 'police');

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please update your station details in your profile.',
      token,
      user: officer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/police/login
 * Police login with badge number + password
 */
const policeLogin = async (req, res, next) => {
  try {
    const { badgeNumber, password } = req.body;

    const officer = await PoliceOfficer.findOne({ badgeNumber });
    if (!officer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid badge number or password',
      });
    }

    const isMatch = await officer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid badge number or password',
      });
    }

    const token = generateToken(officer._id, 'police');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: officer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/admin/login
 * Admin login with email + password
 */
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(admin._id, 'admin');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: admin,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { citizenRegister, citizenLogin, policeRegister, policeLogin, adminLogin };
