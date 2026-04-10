import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import StatusBadge from '../../components/shared/StatusBadge';

const FIRsMgmt = () => {
  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchFIRs = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/firs?page=${page}&limit=10`);
        setFirs(res.data.data);
        setTotalPages(res.data.totalPages);
      } catch (error) {
        toast.error('Failed to load FIRs');
      } finally {
        setLoading(false);
      }
    };
    fetchFIRs();
  }, [page]);

  const handleDownload = async (id, firNumber) => {
    try {
      const toastId = toast.loading('Generating PDF...');
      const res = await api.get(`/fir/${id}/pdf`);
      toast.dismiss(toastId);
      window.open(`http://localhost:5000${res.data.data.pdfUrl}`, '_blank');
      toast.success('Downloaded ' + firNumber);
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="container page-wrapper">
      <div className="mb-6">
        <h2>Registered FIRs Management</h2>
        <p className="text-muted">Global directory of all First Information Reports</p>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>FIR No.</th>
                <th>Complaint ID</th>
                <th>Filing Officer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">Loading...</td></tr>
              ) : firs.map(fir => (
                <tr key={fir._id}>
                  <td><span className="id-text">{fir.firNumber}</span></td>
                  <td>{fir.linkedComplaint?.complaintId}</td>
                  <td>{fir.filedByOfficer?.name} ({fir.filedByOfficer?.badgeNumber})</td>
                  <td>{new Date(fir.firDate).toLocaleDateString()}</td>
                  <td><StatusBadge status={fir.status} /></td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleDownload(fir._id, fir.firNumber)}>
                      <Download size={14} /> PDF
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
    </div>
  );
};

export default FIRsMgmt;
