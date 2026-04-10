import React from 'react';
import './StatusBadge.css';

const statusConfig = {
  'Filed': { color: 'gray' },
  'Under Review': { color: 'blue' },
  'FIR Registered': { color: 'purple' },
  'Investigation Ongoing': { color: 'orange' },
  'Chargesheet Filed': { color: 'orange' },
  'Closed': { color: 'green' },
  'Resolved': { color: 'green' },
  'Rejected': { color: 'red' },
  // FIR Statuses
  'Draft': { color: 'gray' },
  'Submitted': { color: 'blue' }
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || { color: 'gray' };
  
  return (
    <span className={`status-badge badge-${config.color}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
