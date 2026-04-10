import React, { useEffect, useState } from 'react';
import { Shield, FileText, User, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/shared/StatusBadge';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [recentFirs, setRecentFirs] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Colors for Recharts
  const COLORS = ['#0A2463', '#2D9B5A', '#D62828', '#F4A261', '#9333ea', '#6b7280'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, complaintsRes, firsRes, officersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/complaints?page=1&limit=5'),
          api.get('/admin/firs?page=1&limit=5'),
          api.get('/admin/police?limit=100')
        ]);
        setStats(statsRes.data.data);
        setRecentComplaints(complaintsRes.data.data);
        setRecentFirs(firsRes.data.data);
        setOfficers(officersRes.data.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleAssign = async (complaintId, officerId) => {
    if (!officerId) return;
    try {
      await api.put(`/admin/complaints/${complaintId}/assign`, { officerId });
      toast.success('Complaint assigned successfully');
      
      // Refresh complaints directly
      const complaintsRes = await api.get('/admin/complaints?page=1&limit=5');
      setRecentComplaints(complaintsRes.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Assignment failed');
    }
  };

  if (loading) return <div className="container p-8 text-center text-muted">Loading analytics...</div>;
  if (!stats) return null;

  // Formatting chart data
  const categoryData = stats.complaintsByCategory.map(item => ({
    name: item._id,
    Count: item.count
  }));

  const statusData = stats.complaintsByStatus.map(item => ({
    name: item._id,
    value: item.count
  }));

  return (
    <div className="container page-wrapper">
      <div className="mb-6">
        <h2>System Overview</h2>
        <p className="text-muted">Real-time state jurisdiction statistics</p>
      </div>

      {/* Top Counters */}
      <div className="stats-grid mb-8">
        <div className="stat-card" style={{borderLeftColor: '#0A2463'}}>
          <div className="stat-icon bg-blue-100 text-primary-balance"><FileText size={20} /></div>
          <div className="stat-value">{stats.totals.complaints}</div>
          <div className="stat-label">Total Complaints</div>
        </div>
        <div className="stat-card" style={{borderLeftColor: '#D62828'}}>
          <div className="stat-icon bg-red-100 text-police-red"><Shield size={20} /></div>
          <div className="stat-value">{stats.totals.firs}</div>
          <div className="stat-label">Total FIRs Filed</div>
        </div>
        <div className="stat-card" style={{borderLeftColor: '#9333ea'}}>
          <div className="stat-icon bg-purple-100" style={{color: '#9333ea'}}><UserCheck size={20} /></div>
          <div className="stat-value">{stats.totals.policeOfficers}</div>
          <div className="stat-label">Police Officers</div>
        </div>
        <div className="stat-card" style={{borderLeftColor: '#2D9B5A'}}>
          <div className="stat-icon bg-green-100 text-success"><User size={20} /></div>
          <div className="stat-value">{stats.totals.citizens}</div>
          <div className="stat-label">Registered Citizens</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2 gap-6 mb-8">
        <div className="card">
          <h3 className="mb-4">Complaints by Category</h3>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 40, right: 20 }}>
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: '#f4f6fb'}} />
                <Bar dataKey="Count" fill="var(--primary-blue)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="mb-4">Complaint Status Distribution</h3>
          <div style={{ height: 300, width: '100%' }} className="flex justify-center items-center">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className="flex-col gap-2 p-4 max-h-[300px] overflow-y-auto">
              {statusData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <div style={{width: 12, height: 12, backgroundColor: COLORS[idx % COLORS.length], borderRadius: '50%'}}></div>
                  <span>{entry.name}: <strong>{entry.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* District/State Breakdowns */}
      <div className="grid-2 gap-6">
        <div className="card">
          <h3 className="mb-4">Top Districts</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>District</th>
                <th>Complaints</th>
              </tr>
            </thead>
            <tbody>
              {stats.complaintsByDistrict.slice(0, 5).map((d, i) => (
                <tr key={i}>
                  <td>{d._id}</td>
                  <td><strong>{d.count}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 className="mb-4">State Wise Volume</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>State</th>
                <th>Complaints</th>
              </tr>
            </thead>
            <tbody>
              {stats.complaintsByState.map((s, i) => (
                <tr key={i}>
                  <td>{s._id}</td>
                  <td><strong>{s.count}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Records */}
      <div className="grid-2 gap-6 mt-8 mb-8">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="mb-0">Recent Complaints</h3>
            <Link to="/admin/complaints" className="btn btn-secondary btn-sm no-underline text-xs">View All</Link>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Assignment</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map(c => (
                  <tr key={c._id}>
                    <td><span className="id-text" style={{fontSize:'0.8rem'}}>{c.complaintId}</span></td>
                    <td>{c.category}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>{new Date(c.incidentDate).toLocaleDateString()}</td>
                    <td>
                      <select 
                        className="filter-select"
                        style={{fontSize: '0.75rem', padding: '0.1rem', maxWidth: '120px'}}
                        value={c.assignedTo ? c.assignedTo._id : ""}
                        onChange={(e) => handleAssign(c._id, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {officers.map(o => (
                          <option key={o._id} value={o._id}>{o.name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {recentComplaints.length === 0 && (
                  <tr><td colSpan="5" className="text-center py-4 text-muted">No complaints found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="mb-0">Recent FIRs</h3>
            <Link to="/admin/firs" className="btn btn-secondary btn-sm no-underline text-xs">View All</Link>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>FIR No.</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentFirs.map(fir => (
                  <tr key={fir._id}>
                    <td><span className="id-text" style={{fontSize:'0.8rem'}}>{fir.firNumber}</span></td>
                    <td><StatusBadge status={fir.status} /></td>
                    <td>{new Date(fir.firDate).toLocaleDateString()}</td>
                  </tr>
                ))}
                {recentFirs.length === 0 && (
                  <tr><td colSpan="3" className="text-center py-4 text-muted">No FIRs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
