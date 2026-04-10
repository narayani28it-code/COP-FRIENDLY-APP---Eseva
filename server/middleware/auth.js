const jwt = require('jsonwebtoken');
const Citizen = require('../models/Citizen');
const PoliceOfficer = require('../models/PoliceOfficer');
const Admin = require('../models/Admin');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = null;
    switch (decoded.role) {
      case 'citizen':
        user = await Citizen.findById(decoded.id).select('-password');
        break;
      case 'police':
        user = await PoliceOfficer.findById(decoded.id).select('-password');
        break;
      case 'admin':
        user = await Admin.findById(decoded.id).select('-password');
        break;
      default:
        return res.status(401).json({ success: false, message: 'Invalid token role.' });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    req.user = user;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    next(error);
  }
};

/**
 * Role-based authorization middleware factory
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
