import React from 'react';
import { format } from 'date-fns';
import { MapPin, Calendar, FileText } from 'lucide-react';
import StatusBadge from './StatusBadge';
import './ComplaintCard.css';

const ComplaintCard = ({ complaint, onClick }) => {
  return (
    <div className="complaint-card card" onClick={onClick}>
      <div className="card-header">
        <div className="id-badge">
          <FileText size={14} />
          {complaint.complaintId}
        </div>
        <StatusBadge status={complaint.status} />
      </div>
      
      <h3 className="card-title">{complaint.title}</h3>
      
      <div className="card-meta">
        <div className="meta-item">
          <span className="meta-label">Category:</span>
          <span className="meta-value">{complaint.category}</span>
        </div>
        
        <div className="meta-row">
          <div className="meta-item flex items-center gap-2">
            <Calendar size={14} className="text-muted" />
            <span className="meta-value text-sm text-muted">
              {format(new Date(complaint.incidentDate), 'MMM dd, yyyy')}
            </span>
          </div>
          
          <div className="meta-item flex items-center gap-2">
            <MapPin size={14} className="text-muted" />
            <span className="meta-value text-sm text-muted">
              {complaint.district}, {complaint.state}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;
