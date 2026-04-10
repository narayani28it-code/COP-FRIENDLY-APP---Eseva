import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { FileText, PlusCircle, AlertCircle } from 'lucide-react';
import ComplaintCard from '../../components/shared/ComplaintCard';
import EmptyState from '../../components/shared/EmptyState';
import './CitizenDashboard.css';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, firRegistered: 0, closed: 0 });

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/complaints/my');
        const data = res.data.data;
        setComplaints(data);
        
        // Calculate basic stats
        const pending = data.filter(c => ['Filed', 'Under Review', 'Investigation Ongoing'].includes(c.status)).length;
        const firRegistered = data.filter(c => c.status === 'FIR Registered').length;
        const closed = data.filter(c => ['Closed', 'Resolved'].includes(c.status)).length;
        
        setStats({ total: data.length, pending, firRegistered, closed });
      } catch (error) {
        console.error('Failed to fetch complaints', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <div className="container page-wrapper dashboard-page">
      {/* Welcome & Profile Summary */}
      <div className="dashboard-header flex justify-between items-center mb-6">
        <div>
          <h2>Dashboard</h2>
          <p className="text-muted">Welcome back, {user?.name}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/citizen/complaint/new')}>
          <PlusCircle size={18} /> File Complaint
        </button>
      </div>

      {/* Stats Row */}
      <div className="stats-grid mb-8">
        <div className="stat-card">
          <div className="stat-icon bg-blue-100 text-primary-balance"><FileText size={20} /></div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Complaints</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-yellow-100 text-warning"><AlertCircle size={20} /></div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending / Ongoing</div>
        </div>
        <div className="stat-card border-purple">
          <div className="stat-icon bg-purple-100 text-purple-700"><FileText size={20} /></div>
          <div className="stat-value">{stats.firRegistered}</div>
          <div className="stat-label">FIR Registered</div>
        </div>
        <div className="stat-card border-green">
          <div className="stat-icon bg-green-100 text-success"><FileText size={20} /></div>
          <div className="stat-value">{stats.closed}</div>
          <div className="stat-label">Closed / Resolved</div>
        </div>
      </div>

      <div className="section-header mb-4">
        <h3>My Complaints</h3>
      </div>

      {/* Complaints List */}
      <div className="complaints-list">
        {loading ? (
          <div className="loader">Loading your complaints...</div>
        ) : complaints.length > 0 ? (
          <div className="grid-3">
            {complaints.map(complaint => (
              <ComplaintCard 
                key={complaint._id} 
                complaint={complaint} 
                onClick={() => navigate(`/citizen/complaint/${complaint._id}`)} 
              />
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={<FileText size={48} />}
            title="No complaints filed yet"
            message="You haven't filed any complaints. If you have an issue to report, you can file a new complaint."
            action={
              <button className="btn btn-primary" onClick={() => navigate('/citizen/complaint/new')}>
                File New Complaint
              </button>
            }
          />
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
