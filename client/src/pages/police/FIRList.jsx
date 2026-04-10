import React, { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import StatusBadge from '../../components/shared/StatusBadge';

const FIRList = () => {
  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFirs = async () => {
      try {
        const res = await api.get('/fir/my');
        setFirs(res.data.data);
      } catch (error) {
        toast.error('Failed to load FIRs');
      } finally {
        setLoading(false);
      }
    };
    fetchFirs();
  }, []);

  const handleDownload = async (id, firNumber) => {
    try {
      const toastId = toast.loading('Generating PDF...');
      const res = await api.get(`/fir/${id}/pdf`);
      toast.dismiss(toastId);
      
      const pdfUrl = res.data.data.pdfUrl;
      // In a real app we'd trigger a download.
      // Here we can open it in a new tab if URL is accessible
      window.open(`http://localhost:5000${pdfUrl}`, '_blank');
      toast.success('Downloaded ' + firNumber);
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="container page-wrapper">
      <div className="mb-6">
        <h2>My Registered FIRs</h2>
        <p className="text-muted">History of all official First Information Reports filed by you.</p>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>FIR No.</th>
                <th>Linked Complaint</th>
                <th>Date</th>
                <th>Accused Count</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">Loading FIRs...</td></tr>
              ) : firs.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">No FIRs registered yet.</td></tr>
              ) : (
                firs.map(fir => (
                  <tr key={fir._id}>
                    <td><span className="id-text">{fir.firNumber}</span></td>
                    <td>{fir.linkedComplaint?.complaintId}</td>
                    <td>{new Date(fir.firDate).toLocaleDateString()}</td>
                    <td>{fir.accusedDetails?.length || 0}</td>
                    <td><StatusBadge status={fir.status} /></td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDownload(fir._id, fir.firNumber)}
                      >
                        <Download size={14} /> PDF
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

export default FIRList;
