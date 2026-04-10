import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, Image as ImageIcon, MapPin, Calendar, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import StatusBadge from '../../components/shared/StatusBadge';
import TimelineStepper from '../../components/shared/TimelineStepper';
import './ComplaintDetail.css';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/complaints/${id}`);
        setComplaint(res.data.data);
      } catch (error) {
        toast.error('Failed to load complaint details');
        navigate('/citizen/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, navigate]);

  if (loading) {
    return <div className="container page-wrapper"><div className="loader">Loading details...</div></div>;
  }

  if (!complaint) return null;

  const handleDownloadFIR = async () => {
    // Determine FIR id or endpoint based on complaint linked FIR
    // In this basic version, if we don't have the FIR ID in the complaint object,
    // we would ideally need a separate endpoint to fetch FIR by Complaint ID
    toast('FIR PDF download not fully integrated without FIR entity ID in this view.', { icon: 'ℹ️' });
  };

  return (
    <div className="container page-wrapper">
      <button className="btn-link flex items-center gap-2 mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="detail-layout">
        <div className="main-content">
          <div className="card mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="id-badge bg-blue-100">{complaint.complaintId}</span>
                  <StatusBadge status={complaint.status} />
                </div>
                <h2 className="title-large">{complaint.title}</h2>
              </div>
            </div>

            <div className="info-strip flex gap-6 mt-4 pb-4 border-b">
              <div className="flex items-center gap-2 text-muted">
                <FileText size={16} /> <span>{complaint.category}</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <Calendar size={16} /> <span>{new Date(complaint.incidentDate).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <MapPin size={16} /> <span>{complaint.district}, {complaint.state}</span>
              </div>
            </div>

            <div className="mt-6">
              <h4>Description</h4>
              <p className="description-text mt-2">{complaint.description}</p>
            </div>

            {complaint.evidenceFiles && complaint.evidenceFiles.length > 0 && (
              <div className="mt-8">
                <h4>Evidence Files</h4>
                <div className="evidence-grid mt-4">
                  {complaint.evidenceFiles.map((file, idx) => (
                    <div key={idx} className="evidence-item">
                      {file.type === 'image' ? (
                        <div className="img-thumbnail" style={{backgroundImage: `url(http://localhost:5000${file.url})`}}></div>
                      ) : (
                        <div className="file-thumbnail">
                          <ImageIcon size={32} />
                          <span className="text-sm mt-2">{file.filename}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {complaint.status === 'FIR Registered' && (
            <div className="card fir-card mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="flex items-center gap-2 text-primary-blue"><ShieldCheck size={20} /> FIR Registered</h3>
                  <p className="text-sm text-muted mt-1">An official FIR has been associated with this complaint.</p>
                </div>
                <button className="btn btn-primary" onClick={handleDownloadFIR}>
                  <Download size={18} /> Download FIR
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="sidebar">
          <div className="card">
            <h3 className="mb-4">Status Timeline</h3>
            <TimelineStepper history={complaint.statusHistory} />
          </div>

          <div className="card mt-6">
            <h3 className="mb-4">Location Info</h3>
            <div className="meta-list">
              <div className="meta-list-item">
                <span className="label">Exact Address</span>
                <p>{complaint.incidentLocation?.address}</p>
              </div>
              <div className="meta-list-item mt-3">
                <span className="label">Police Station</span>
                <p>{complaint.assignedPoliceStation?.name || complaint.incidentLocation?.policeStation || 'Pending Assignment'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
