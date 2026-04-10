/**
 * Seed data: 3 states × 3 districts × 2 police stations = 18 stations
 */
const policeStations = [
  // Maharashtra
  { name: 'Colaba Police Station', stationCode: 'MH-MUM-001', district: 'Mumbai', state: 'Maharashtra' },
  { name: 'Bandra Police Station', stationCode: 'MH-MUM-002', district: 'Mumbai', state: 'Maharashtra' },
  { name: 'Shivajinagar Police Station', stationCode: 'MH-PUN-001', district: 'Pune', state: 'Maharashtra' },
  { name: 'Deccan Police Station', stationCode: 'MH-PUN-002', district: 'Pune', state: 'Maharashtra' },
  { name: 'Sadar Bazaar Police Station', stationCode: 'MH-NAG-001', district: 'Nagpur', state: 'Maharashtra' },
  { name: 'Sitabuldi Police Station', stationCode: 'MH-NAG-002', district: 'Nagpur', state: 'Maharashtra' },

  // Karnataka
  { name: 'Cubbon Park Police Station', stationCode: 'KA-BLR-001', district: 'Bengaluru', state: 'Karnataka' },
  { name: 'Whitefield Police Station', stationCode: 'KA-BLR-002', district: 'Bengaluru', state: 'Karnataka' },
  { name: 'Vijayanagar Police Station', stationCode: 'KA-MYS-001', district: 'Mysuru', state: 'Karnataka' },
  { name: 'Devaraja Police Station', stationCode: 'KA-MYS-002', district: 'Mysuru', state: 'Karnataka' },
  { name: 'Dharwad Town Police Station', stationCode: 'KA-DHW-001', district: 'Dharwad', state: 'Karnataka' },
  { name: 'Hubli Police Station', stationCode: 'KA-DHW-002', district: 'Dharwad', state: 'Karnataka' },

  // Tamil Nadu
  { name: 'Mylapore Police Station', stationCode: 'TN-CHN-001', district: 'Chennai', state: 'Tamil Nadu' },
  { name: 'T Nagar Police Station', stationCode: 'TN-CHN-002', district: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Town Hall Police Station', stationCode: 'TN-CBE-001', district: 'Coimbatore', state: 'Tamil Nadu' },
  { name: 'RS Puram Police Station', stationCode: 'TN-CBE-002', district: 'Coimbatore', state: 'Tamil Nadu' },
  { name: 'Srirangam Police Station', stationCode: 'TN-TRC-001', district: 'Tiruchirappalli', state: 'Tamil Nadu' },
  { name: 'Cantonment Police Station', stationCode: 'TN-TRC-002', district: 'Tiruchirappalli', state: 'Tamil Nadu' },
];

module.exports = policeStations;
