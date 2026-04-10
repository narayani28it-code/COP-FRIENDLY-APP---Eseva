import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const CitizenMgmt = () => {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCitizens = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/citizens?page=${page}&limit=10`);
        setCitizens(res.data.data);
        setTotalPages(res.data.totalPages);
      } catch (error) {
        toast.error('Failed to load citizens');
      } finally {
        setLoading(false);
      }
    };
    fetchCitizens();
  }, [page]);

  return (
    <div className="container page-wrapper">
      <div className="mb-6">
        <h2>Citizen Directory</h2>
        <p className="text-muted">Directory of all verified citizens registered on the portal</p>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>State</th>
                <th>District</th>
                <th>Aadhaar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">Loading...</td></tr>
              ) : citizens.map(c => (
                <tr key={c._id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.mobile}</td>
                  <td>{c.email || '-'}</td>
                  <td>{c.state}</td>
                  <td>{c.district}</td>
                  <td><span className="text-muted">{c.aadhaarMasked || 'Not provided'}</span></td>
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
    </div>
  );
};

export default CitizenMgmt;
