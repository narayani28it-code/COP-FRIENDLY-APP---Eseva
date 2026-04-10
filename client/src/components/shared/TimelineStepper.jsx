import React from 'react';
import { format } from 'date-fns';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import './TimelineStepper.css';

const TimelineStepper = ({ history = [] }) => {
  return (
    <div className="timeline">
      {history.map((item, index) => {
        const isLast = index === history.length - 1;
        
        return (
          <div key={index} className={`timeline-item ${isLast ? 'active' : ''}`}>
            <div className="timeline-icon-wrapper">
              {isLast ? (
                <CheckCircle size={20} className="timeline-icon active-icon" />
              ) : (
                <Circle size={16} className="timeline-icon" />
              )}
              {!isLast && <div className="timeline-connector"></div>}
            </div>
            
            <div className={`timeline-content ${isLast ? 'active-content' : ''}`}>
              <div className="timeline-header">
                <h4 className="timeline-status">{item.status}</h4>
                <span className="timeline-date">
                  <Clock size={12} />
                  {format(new Date(item.timestamp), 'dd MMM yyyy, p')}
                </span>
              </div>
              
              {item.note && (
                <div className="timeline-note">
                  <p>{item.note}</p>
                </div>
              )}
              
              <div className="timeline-meta">
                <span>Updated by {item.updatedByRole}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TimelineStepper;
