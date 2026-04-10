import React, { useEffect, useState } from 'react';
import { Shield, FileText, User, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Colors for Recharts
  const COLORS = ['#0A2463', '#2D9B5A', '#D62828', '#F4A261', '#9333ea', '#6b7280'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.data);
      } catch (error) {
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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
    </div>
  );
};

export default AdminDashboard;
