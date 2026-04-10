import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const PoliceMgmt = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stations, setStations] = useState([]);
  const [formData, setFormData] = useState({
    name: '', badgeNumber: '', rank: 'Constable', assignedPoliceStation: '', mobile: '', password: ''
  });

  const fetchOfficers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/police?page=${page}&limit=10`);
      setOfficers(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to load officers');
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      const res = await api.get('/police-stations');
      setStations(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOfficers();
    fetchStations();
  }, [page]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddOfficer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/police', formData);
      toast.success('Officer added successfully');
      setIsModalOpen(false);
      setFormData({ name: '', badgeNumber: '', rank: 'Constable', assignedPoliceStation: '', mobile: '', password: '' });
      fetchOfficers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add officer');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to deactivate officer ${name}?`)) {
      try {
        await api.delete(`/admin/police/${id}`);
        toast.success('Officer deactivated');
        fetchOfficers();
      } catch (error) {
        toast.error('Failed to delete officer');
      }
    }
  };

  return (
    <div className="container page-wrapper relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2>Police Service Management</h2>
          <p className="text-muted">Manage active police officers and station assignments</p>
        </div>
        <button className="btn btn-primary bg-purple-600" style={{backgroundColor: '#9333ea'}} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add Officer
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Officer Name</th>
                <th>Rank</th>
                <th>Badge No.</th>
                <th>Station</th>
                <th>District</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">Loading...</td></tr>
              ) : officers.map(o => (
                <tr key={o._id}>
                  <td><strong>{o.name}</strong></td>
                  <td>{o.rank}</td>
                  <td><span className="id-text" style={{color: 'var(--police-red)'}}>{o.badgeNumber}</span></td>
                  <td>{o.assignedPoliceStation?.name}</td>
                  <td>{o.district}</td>
                  <td>
                    <button className="btn-link text-sm text-danger" onClick={() => handleDelete(o._id, o.name)}>
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      </div>

      {/* Add Officer Modal Overlay */}
      {isModalOpen && (
        <div className="fir-drawer-overlay open" onClick={() => setIsModalOpen(false)}>
          <div className="fir-drawer card p-6" style={{maxWidth: '500px'}} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3>Create Officer Account</h3>
              <button className="btn-link text-muted" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>

            <form onSubmit={handleAddOfficer} className="flex-col gap-4">
              <div className="form-group">
                <label className="label">Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="label">Badge Number *</label>
                  <input type="text" name="badgeNumber" value={formData.badgeNumber} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label className="label">Rank *</label>
                  <select name="rank" value={formData.rank} onChange={handleInputChange}>
                    {['Constable', 'Head Constable', 'ASI', 'Sub Inspector', 'Inspector', 'DSP', 'SP'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="label">Police Station Assignment *</label>
                <select name="assignedPoliceStation" value={formData.assignedPoliceStation} onChange={handleInputChange} required>
                  <option value="">-- Select Station --</option>
                  {stations.map(st => (
                    <option key={st._id} value={st._id}>{st.name} ({st.district})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Mobile Number *</label>
                <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="label">Temporary Password *</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
              </div>
              
              <button type="submit" className="btn btn-primary w-full mt-4" style={{backgroundColor: '#9333ea'}}>
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoliceMgmt;
