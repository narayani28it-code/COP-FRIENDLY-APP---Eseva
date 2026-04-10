import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import StatusBadge from '../../components/shared/StatusBadge';

const ComplaintsMgmt = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [officers, setOfficers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/complaints?page=${page}&limit=10`);
      setComplaints(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const res = await api.get('/admin/police?limit=100'); // fetch all for generic assignment (ideally should be paginated/searchable)
      setOfficers(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchOfficers();
  }, [page]);

  const handleAssign = async (complaintId, officerId) => {
    if (!officerId) return;
    try {
      await api.put(`/admin/complaints/${complaintId}/assign`, { officerId });
      toast.success('Complaint assigned successfully');
      fetchComplaints();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Assignment failed');
    }
  };

  return (
    <div className="container page-wrapper">
      <div className="mb-6">
        <h2>Complaints Management</h2>
        <p className="text-muted">Central directory of all filed complaints across the system</p>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
                <th>Assign Officer</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">Loading...</td></tr>
              ) : complaints.map(c => (
                <tr key={c._id}>
                  <td><span className="id-text">{c.complaintId}</span></td>
                  <td>{c.category}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>{new Date(c.incidentDate).toLocaleDateString()}</td>
                  <td>
                    <select 
                      className="filter-select"
                      style={{fontSize: '0.8rem', padding: '0.25rem', maxWidth: '180px'}}
                      value={c.assignedTo ? c.assignedTo._id : ""}
                      onChange={(e) => handleAssign(c._id, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {officers.map(o => (
                        <option key={o._id} value={o._id}>{o.name} ({o.badgeNumber})</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Basic Pagination Controls */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <button 
            className="btn btn-secondary btn-sm" 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <button 
            className="btn btn-secondary btn-sm" 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsMgmt;
