/**
 * Seed data for admin and police officer accounts
 */

const admin = {
  name: 'System Administrator',
  email: 'admin@firms.gov.in',
  password: 'admin123456',
};

/**
 * Police officers — mapped to station codes from policeStations seed
 * Passwords will be hashed by the model pre-save hook
 */
const policeOfficers = [
  {
    name: 'Inspector Rajesh Kumar',
    badgeNumber: 'MH-001',
    rank: 'Inspector',
    stationCode: 'MH-MUM-001',
    mobile: '9876543210',
    email: 'rajesh.kumar@police.gov.in',
    password: 'police123456',
  },
  {
    name: 'Sub Inspector Priya Sharma',
    badgeNumber: 'MH-002',
    rank: 'Sub Inspector',
    stationCode: 'MH-PUN-001',
    mobile: '9876543211',
    email: 'priya.sharma@police.gov.in',
    password: 'police123456',
  },
  {
    name: 'Inspector Anil Deshmukh',
    badgeNumber: 'KA-001',
    rank: 'Inspector',
    stationCode: 'KA-BLR-001',
    mobile: '9876543212',
    email: 'anil.deshmukh@police.gov.in',
    password: 'police123456',
  },
  {
    name: 'DSP Meenakshi Sundaram',
    badgeNumber: 'TN-001',
    rank: 'DSP',
    stationCode: 'TN-CHN-001',
    mobile: '9876543213',
    email: 'meenakshi.s@police.gov.in',
    password: 'police123456',
  },
  {
    name: 'Head Constable Vijay Patil',
    badgeNumber: 'MH-003',
    rank: 'Head Constable',
    stationCode: 'MH-NAG-001',
    mobile: '9876543214',
    email: 'vijay.patil@police.gov.in',
    password: 'police123456',
  },
];

module.exports = { admin, policeOfficers };
