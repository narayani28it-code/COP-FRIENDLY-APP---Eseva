import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import './NewComplaint.css';

const CATEGORIES = [
  'Theft', 'Assault', 'Cybercrime', 'Missing Person', 
  'Fraud', 'Harassment', 'Road Accident', 'Other'
];

const NewComplaint = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    incidentDate: '',
    incidentState: '',
    incidentDistrict: '',
    incidentPoliceStation: '',
    incidentAddress: ''
  });

  const [files, setFiles] = useState([]);

  // Fetch police stations when state/district changes
  useEffect(() => {
    if (formData.incidentState && formData.incidentDistrict) {
      api.get(`/police-stations?state=${formData.incidentState}&district=${formData.incidentDistrict}`)
        .then(res => setStations(res.data.data))
        .catch(err => console.error(err));
    }
  }, [formData.incidentState, formData.incidentDistrict]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 5) {
        toast.error('Maximum 5 files allowed');
        return;
      }
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      files.forEach(file => {
        submitData.append('evidence', file);
      });

      const res = await api.post('/complaints', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Complaint filed successfully');
      navigate(`/citizen/complaint/${res.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.title || !formData.category || !formData.description || !formData.incidentDate) {
        return toast.error('Please fill all required fields');
      }
    } else if (step === 2) {
      if (!formData.incidentState || !formData.incidentDistrict || !formData.incidentAddress) {
        return toast.error('Please fill all required location fields');
      }
    }
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="container page-wrapper new-complaint-page">
      <div className="stepper-header card mb-6">
        <div className="stepper-item">
          <div className={`step-circle ${step >= 1 ? 'active' : ''}`}>1</div>
          <span>Incident Info</span>
        </div>
        <div className={`stepper-line ${step >= 2 ? 'active' : ''}`}></div>
        <div className="stepper-item">
          <div className={`step-circle ${step >= 2 ? 'active' : ''}`}>2</div>
          <span>Location</span>
        </div>
        <div className={`stepper-line ${step >= 3 ? 'active' : ''}`}></div>
        <div className="stepper-item">
          <div className={`step-circle ${step >= 3 ? 'active' : ''}`}>3</div>
          <span>Evidence</span>
        </div>
        <div className={`stepper-line ${step >= 4 ? 'active' : ''}`}></div>
        <div className="stepper-item">
          <div className={`step-circle ${step >= 4 ? 'active' : ''}`}>4</div>
          <span>Review</span>
        </div>
      </div>

      <div className="form-card card">
        {step === 1 && (
          <div className="step-content">
            <h3>Incident Details</h3>
            
            <div className="form-group mt-4">
              <label className="label">Complaint Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Brief summary of the incident" />
            </div>

            <div className="form-group">
              <label className="label">Category *</label>
              <div className="category-grid">
                {CATEGORIES.map(cat => (
                  <div 
                    key={cat} 
                    className={`category-item ${formData.category === cat ? 'selected' : ''}`}
                    onClick={() => setFormData({...formData, category: cat})}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="label">Incident Date *</label>
              <input type="datetime-local" name="incidentDate" value={formData.incidentDate} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label className="label">Detailed Description *</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="6" placeholder="Describe what happened in detail..."></textarea>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h3>Location of Incident</h3>
            
            <div className="grid-2 mt-4">
              <div className="form-group">
                <label className="label">State *</label>
                <input type="text" name="incidentState" value={formData.incidentState} onChange={handleInputChange} placeholder="E.g., Maharashtra" />
              </div>
              
              <div className="form-group">
                <label className="label">District *</label>
                <input type="text" name="incidentDistrict" value={formData.incidentDistrict} onChange={handleInputChange} placeholder="E.g., Mumbai" />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Preferred Police Station (Optional)</label>
              <select name="incidentPoliceStation" value={formData.incidentPoliceStation} onChange={handleInputChange}>
                <option value="">-- Select Station --</option>
                {stations.map(st => (
                  <option key={st._id} value={st.name}>{st.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Exact Address / Landmark *</label>
              <textarea name="incidentAddress" value={formData.incidentAddress} onChange={handleInputChange} rows="3" placeholder="Where exactly did this happen?"></textarea>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h3>Upload Evidence</h3>
            <p className="text-muted mb-4">Attach any photos, videos, or documents (PDF) related to the incident. Maximum 5 files, up to 10MB each.</p>
            
            <div className="upload-zone">
              <input 
                type="file" 
                id="evidence-upload"
                multiple 
                accept="image/*,video/mp4,video/webm,application/pdf"
                onChange={handleFileChange}
                className="hidden-input"
              />
              <label htmlFor="evidence-upload" className="upload-label">
                <Upload size={32} className="text-muted mb-2" />
                <span className="upload-text">Click to browse or drag drops files here</span>
                <span className="upload-hint">Images, Videos, PDFs supported (Max 5)</span>
              </label>
            </div>

            {files.length > 0 && (
              <div className="file-preview-list">
                {files.map((file, index) => (
                  <div key={index} className="file-preview-item">
                    <div className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <button type="button" className="btn-remove" onClick={() => removeFile(index)}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="step-content review-step">
            <h3>Review Information</h3>
            <p className="text-muted mb-4">Please verify all details before submitting. False complaints are punishable by law.</p>

            <div className="review-section">
              <h4>Incident</h4>
              <div className="review-row"><span>Title:</span> <strong>{formData.title}</strong></div>
              <div className="review-row"><span>Category:</span> <strong>{formData.category}</strong></div>
              <div className="review-row"><span>Date:</span> <strong>{new Date(formData.incidentDate).toLocaleString()}</strong></div>
              <div className="review-row desc"><span>Description:</span> <p>{formData.description}</p></div>
            </div>

            <div className="review-section mt-4">
              <h4>Location</h4>
              <div className="review-row"><span>State/District:</span> <strong>{formData.incidentState}, {formData.incidentDistrict}</strong></div>
              <div className="review-row"><span>Address:</span> <strong>{formData.incidentAddress}</strong></div>
              {formData.incidentPoliceStation && (
                <div className="review-row"><span>Station:</span> <strong>{formData.incidentPoliceStation}</strong></div>
              )}
            </div>

            <div className="review-section mt-4">
              <h4>Evidence Attached</h4>
              <div className="review-row">
                <span>Files:</span> 
                <strong>{files.length > 0 ? `${files.length} file(s) attached` : 'None'}</strong>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions mt-6">
          {step > 1 ? (
            <button type="button" className="btn btn-secondary" onClick={prevStep}>
              <ChevronLeft size={18} /> Back
            </button>
          ) : (
            <div></div>
          )}
          
          {step < 4 ? (
            <button type="button" className="btn btn-primary" onClick={nextStep}>
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button type="button" className="btn btn-primary bg-green-600" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Confirm & Submit File'} <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewComplaint;
