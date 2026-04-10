import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, FileCheck, ArrowLeft, Send, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/shared/StatusBadge';
import TimelineStepper from '../../components/shared/TimelineStepper';
import './PoliceComplaintDetail.css';

const PoliceComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status update
  const [newStatus, setNewStatus] = useState('');
  const [updateNote, setUpdateNote] = useState('');
  const [updating, setUpdating] = useState(false);

  // FIR Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [firData, setFirData] = useState({
    accusedDetails: [{ name: '', age: '', address: '', description: '' }],
    ipcSections: [],
    witnesses: [{ name: '', contact: '', statement: '' }],
    narrative: '',
  });
  const [ipcSearch, setIpcSearch] = useState('');
  const [ipcResults, setIpcResults] = useState([]);
  const [submittingFIR, setSubmittingFIR] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/police/complaints/${id}`);
      setComplaint(res.data.data);
      setNewStatus(res.data.data.status);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load complaint');
      navigate('/police/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleSelfAssign = async () => {
    try {
      await api.put(`/police/complaints/${id}/assign`);
      toast.success('Complaint assigned to you');
      fetchDetail();
    } catch (error) {
      toast.error('Assignment failed');
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.put(`/police/complaints/${id}/status`, { status: newStatus, note: updateNote });
      toast.success('Status updated');
      setUpdateNote('');
      fetchDetail();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  // IPC autocomplete
  const searchIPC = async (query) => {
    setIpcSearch(query);
    if (query.length > 1) {
      try {
        const res = await api.get(`/ipc-sections?search=${query}`);
        setIpcResults(res.data.data || []);
      } catch {
        setIpcResults([]);
      }
    } else {
      setIpcResults([]);
    }
  };

  const addIPC = (section) => {
    const fullText = `${section.code} - ${section.title}`;
    if (!firData.ipcSections.includes(fullText)) {
      setFirData({ ...firData, ipcSections: [...firData.ipcSections, fullText] });
    }
    setIpcSearch('');
    setIpcResults([]);
  };

  const removeIPC = (index) => {
    const updated = [...firData.ipcSections];
    updated.splice(index, 1);
    setFirData({ ...firData, ipcSections: updated });
  };

  const handleAccusedChange = (index, field, value) => {
    const updated = [...firData.accusedDetails];
    updated[index][field] = value;
    setFirData({ ...firData, accusedDetails: updated });
  };

  const handleWitnessChange = (index, field, value) => {
    const updated = [...firData.witnesses];
    updated[index][field] = value;
    setFirData({ ...firData, witnesses: updated });
  };

  const handleSubmitFIR = async () => {
    if (!firData.narrative.trim()) return toast.error('Narrative is required');
    setSubmittingFIR(true);
    try {
      await api.post('/fir', {
        linkedComplaint: id,
        accusedDetails: firData.accusedDetails.filter(a => a.name),
        witnesses: firData.witnesses.filter(w => w.name),
        ipcSections: firData.ipcSections,
        narrative: firData.narrative,
      });
      toast.success('FIR successfully registered');
      setIsDrawerOpen(false);
      fetchDetail();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register FIR');
    } finally {
      setSubmittingFIR(false);
    }
  };

  if (loading) return <div className="container page-wrapper" style={{textAlign:'center', paddingTop:'4rem'}}>Loading...</div>;
  if (!complaint) return null;

  const isAssignedToMe = complaint.assignedTo?._id === user?._id;
  const citizenName = complaint.filedBy?.name || complaint.filedBy?.username || 'Unknown';

  return (
    <div className="container page-wrapper">
      <button className="btn-link flex items-center gap-2 mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back to Queue
      </button>

      <div className="police-detail-layout">
        {/* ── Left: Complaint Details ── */}
        <div className="main-content">
          <div className="card mb-6">
            <div className="flex justify-between items-start border-b pb-4 mb-4">
              <div>
                <div className="flex gap-2 mb-2 items-center">
                  <span className="id-badge">{complaint.complaintId}</span>
                  <StatusBadge status={complaint.status} />
                </div>
                <h2>{complaint.title}</h2>
              </div>
              {!isAssignedToMe && (
                <button className="btn btn-secondary" onClick={handleSelfAssign}>
                  Self-Assign Case
                </button>
              )}
            </div>

            <div className="grid-2 gap-4 mb-6" style={{fontSize: '0.9rem'}}>
              <div><strong>Citizen:</strong> {citizenName} {complaint.filedBy?.mobile ? `(${complaint.filedBy.mobile})` : ''}</div>
              <div><strong>Category:</strong> {complaint.category}</div>
              <div><strong>Incident Date:</strong> {new Date(complaint.incidentDate).toLocaleString()}</div>
              <div><strong>Location:</strong> {complaint.incidentLocation?.district}, {complaint.incidentLocation?.state}</div>
            </div>

            <h4>Description</h4>
            <p style={{
              background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-input)',
              border: '1px solid var(--border-color)', marginTop: '0.5rem', lineHeight: 1.6,
              whiteSpace: 'pre-wrap', color: 'var(--gray-700)'
            }}>
              {complaint.description}
            </p>
          </div>

          <div className="card">
            <h3 className="mb-4">Status Timeline</h3>
            <TimelineStepper history={complaint.statusHistory} />
          </div>
        </div>

        {/* ── Right: Actions ── */}
        <div className="sidebar">
          {isAssignedToMe ? (
            <>
              <div className="card mb-6 update-panel">
                <h3 className="mb-4 border-b pb-2">Update Status</h3>
                <form onSubmit={handleStatusUpdate}>
                  <div className="form-group">
                    <label className="label">New Status</label>
                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)} required>
                      <option value="Under Review">Under Review</option>
                      <option value="Investigation Ongoing">Investigation Ongoing</option>
                      <option value="Closed">Closed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Officer Note</label>
                    <textarea value={updateNote} onChange={e => setUpdateNote(e.target.value)}
                      rows="3" placeholder="Add investigation details..."></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary w-full" disabled={updating}>
                    {updating ? 'Updating...' : 'Push Update'} <Send size={16} />
                  </button>
                </form>
              </div>

              {complaint.status !== 'FIR Registered' && (
                <div className="card fir-action-card">
                  <ShieldCheck size={32} style={{color: 'var(--police-red)', marginBottom: '0.75rem'}} />
                  <h3 style={{color: 'var(--police-red)'}} className="mb-2">Register FIR</h3>
                  <p className="text-sm text-muted mb-4">
                    If preliminary investigation confirms a cognizable offence, register an FIR.
                  </p>
                  <button className="btn btn-danger w-full" onClick={() => setIsDrawerOpen(true)}>
                    <FileCheck size={18} /> Open FIR Form
                  </button>
                </div>
              )}

              {complaint.status === 'FIR Registered' && (
                <div className="card" style={{textAlign:'center', padding:'2rem'}}>
                  <ShieldCheck size={40} style={{color: 'var(--success)', marginBottom:'0.75rem'}} />
                  <h3 style={{color:'var(--success)'}}>FIR Registered</h3>
                  <p className="text-muted text-sm mt-2">An FIR has been successfully filed for this complaint.</p>
                </div>
              )}
            </>
          ) : (
            <div className="card text-center" style={{padding:'2rem'}}>
              <User size={48} style={{color: 'var(--text-muted)', margin: '0 auto 1rem'}} />
              <p className="text-muted mb-4">Assign this complaint to yourself to take action.</p>
              <button className="btn btn-primary w-full" onClick={handleSelfAssign}>
                Assign to Me
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── FIR Drawer ── */}
      <div className={`fir-drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}>
        <div className="fir-drawer card" onClick={e => e.stopPropagation()}>
          <div className="drawer-header border-b pb-4 mb-4">
            <h2>First Information Report</h2>
            <p className="text-muted text-sm">Linked to {complaint.complaintId}</p>
          </div>

          <div className="drawer-content">
            {/* Accused */}
            <div className="drawer-section">
              <h4 className="mb-3">Accused Details</h4>
              {firData.accusedDetails.map((acc, idx) => (
                <div key={idx} style={{background:'var(--surface)', padding:'1rem', borderRadius:'var(--radius-input)', marginBottom:'0.75rem'}}>
                  <div className="grid-2 gap-4 mb-3">
                    <input type="text" placeholder="Name" value={acc.name} onChange={e => handleAccusedChange(idx, 'name', e.target.value)} />
                    <input type="number" placeholder="Age" value={acc.age} onChange={e => handleAccusedChange(idx, 'age', e.target.value)} />
                  </div>
                  <input type="text" style={{marginBottom:'0.75rem'}} placeholder="Address" value={acc.address} onChange={e => handleAccusedChange(idx, 'address', e.target.value)} />
                  <textarea placeholder="Physical description" rows="2" value={acc.description} onChange={e => handleAccusedChange(idx, 'description', e.target.value)}></textarea>
                </div>
              ))}
              <button className="btn-link text-sm" onClick={() => setFirData({...firData, accusedDetails: [...firData.accusedDetails, { name:'', age:'', address:'', description:'' }]})}>
                + Add another accused
              </button>
            </div>

            {/* IPC Sections */}
            <div className="drawer-section mt-6">
              <h4 className="mb-3">IPC Sections</h4>
              <div className="ipc-tags mb-2">
                {firData.ipcSections.map((sec, idx) => (
                  <span key={idx} className="ipc-tag">{sec} <button onClick={() => removeIPC(idx)}>&times;</button></span>
                ))}
              </div>
              <div className="autocomplete-wrapper">
                <input type="text" placeholder="Search IPC (e.g. 420, theft...)" value={ipcSearch} onChange={e => searchIPC(e.target.value)} />
                {ipcResults.length > 0 && (
                  <div className="autocomplete-dropdown">
                    {ipcResults.map(r => (
                      <div key={r._id} className="autocomplete-item" onClick={() => addIPC(r)}>
                        <strong>{r.code}</strong>: {r.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Witnesses */}
            <div className="drawer-section mt-6">
              <h4 className="mb-3">Witness Information</h4>
              {firData.witnesses.map((wit, idx) => (
                <div key={idx} style={{background:'var(--surface)', padding:'1rem', borderRadius:'var(--radius-input)', marginBottom:'0.75rem'}}>
                  <div className="grid-2 gap-4 mb-3">
                    <input type="text" placeholder="Witness Name" value={wit.name} onChange={e => handleWitnessChange(idx, 'name', e.target.value)} />
                    <input type="text" placeholder="Contact" value={wit.contact} onChange={e => handleWitnessChange(idx, 'contact', e.target.value)} />
                  </div>
                  <textarea placeholder="Statement summary" rows="2" value={wit.statement} onChange={e => handleWitnessChange(idx, 'statement', e.target.value)}></textarea>
                </div>
              ))}
              <button className="btn-link text-sm" onClick={() => setFirData({...firData, witnesses: [...firData.witnesses, { name:'', contact:'', statement:'' }]})}>
                + Add another witness
              </button>
            </div>

            {/* Narrative */}
            <div className="drawer-section mt-6">
              <h4 className="mb-3">Officer Narrative <span style={{color:'var(--danger)'}}>*</span></h4>
              <textarea style={{width:'100%'}} rows="6"
                placeholder="Detailed formal write-up of the investigation..."
                value={firData.narrative}
                onChange={e => setFirData({...firData, narrative: e.target.value})}
              ></textarea>
            </div>
          </div>

          <div className="drawer-footer pt-4 border-t flex justify-between">
            <button className="btn btn-secondary" onClick={() => setIsDrawerOpen(false)}>Cancel</button>
            <button className="btn btn-danger" disabled={submittingFIR || !firData.narrative.trim()} onClick={handleSubmitFIR}>
              {submittingFIR ? 'Submitting...' : 'Register Official FIR'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliceComplaintDetail;
