import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { ShieldAlert, FileSearch, UserCheck, AlertOctagon } from 'lucide-react';
import StatusBadge from '../../components/shared/StatusBadge';
import './PoliceDashboard.css';

const PoliceDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/police/complaints');
        setComplaints(res.data.data);
      } catch (error) {
        console.error('Failed to fetch assigned complaints', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const filteredComplaints = filter === 'All' 
    ? complaints 
    : complaints.filter(c => c.status === filter);

  return (
    <div className="container page-wrapper dashboard-page">
      <div className="police-header card glass-panel mb-6">
        <div className="flex items-center gap-4">
          <div className="police-avatar">
            {(user?.name || user?.badgeNumber || 'O').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{color: 'var(--police-red)'}}>
              {user?.rank ? `${user.rank} ` : ''}{user?.name || 'Officer Account'}
            </h2>
            <p className="text-muted flex items-center gap-2 mt-1">
              Badge: <strong className="text-main">{user?.badgeNumber}</strong>
              {user?.assignedPoliceStation?.name && (
                <> | Station: <strong className="text-main">{user.assignedPoliceStation.name}</strong></>
              )}
              {user?.district && ` (${user.district})`}
            </p>
          </div>
        </div>
      </div>

      <div className="stats-grid mb-8">
        <div className="stat-card">
          <div className="stat-icon bg-red-100 text-danger"><ShieldAlert size={20} /></div>
          <div className="stat-value">{complaints.length}</div>
          <div className="stat-label">Total Station Complaints</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-yellow-100 text-warning"><AlertOctagon size={20} /></div>
          <div className="stat-value">{complaints.filter(c => c.status === 'Filed').length}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-blue-100 text-primary-blue"><UserCheck size={20} /></div>
          <div className="stat-value">{complaints.filter(c => c.assignedTo?._id === user?._id).length}</div>
          <div className="stat-label">Assigned to Me</div>
        </div>
        <div className="stat-card border-green">
          <div className="stat-icon bg-green-100 text-success"><FileSearch size={20} /></div>
          <div className="stat-value">{complaints.filter(c => c.status === 'FIR Registered').length}</div>
          <div className="stat-label">FIRs Registered</div>
        </div>
      </div>

      <div className="card list-card">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3>Complaints Queue</h3>
          <div className="filter-group">
            <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Filed">Pending Review</option>
              <option value="Under Review">Under Review</option>
              <option value="FIR Registered">FIR Registered</option>
              <option value="Investigation Ongoing">Investigation Ongoing</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category</th>
                <th>Citizen</th>
                <th>Date</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">Loading queue...</td></tr>
              ) : filteredComplaints.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">No complaints found.</td></tr>
              ) : (
                filteredComplaints.map(c => (
                  <tr key={c._id}>
                    <td><span className="id-text">{c.complaintId}</span></td>
                    <td>{c.category}</td>
                    <td>{c.filedBy?.name || c.filedBy?.username || 'Unknown'}</td>
                    <td>{new Date(c.incidentDate).toLocaleDateString()}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>{c.assignedTo ? c.assignedTo.name : <span className="text-muted">Unassigned</span>}</td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/police/complaint/${c._id}`)}
                      >
                        View & Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PoliceDashboard;
