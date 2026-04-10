import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './CitizenLogin.css';

const CitizenLogin = () => {
  const [step, setStep] = useState(1);
  const [isRegistering, setIsRegistering] = useState(false);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  
  // Registration fields
  const [formData, setFormData] = useState({
    name: '', email: '', aadhaar: '', address: '', state: '', district: ''
  });

  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/send-otp', { mobile });
      toast.success(res.data.message);
      if (res.data.otp) {
        // For development, pre-fill OTP
        console.log('DEV OTP:', res.data.otp);
        toast(`DEV OTP: ${res.data.otp}`, { icon: '👨‍💻', duration: 4000 });
      }
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Auto-focus prev on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter a complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        mobile,
        otp: otpValue,
        ...(isRegistering && formData)
      };

      const res = await api.post('/auth/verify-otp', payload);
      login(res.data.user, res.data.token, 'citizen');
      toast.success(res.data.message);
      navigate('/citizen/dashboard');
    } catch (error) {
      if (error.response?.data?.message.includes('Name is required')) {
        // User doesn't exist, switch to registration view while staying on step 2
        toast.error('Number not registered. Please provide your details.');
        setIsRegistering(true);
        // We keep step=2 and show registration fields below OTP
      } else {
        toast.error(error.response?.data?.message || 'Verification failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon bg-blue-100 text-primary-balance">
            <User size={24} />
          </div>
          <h2>Citizen Portal</h2>
          <p className="text-muted">Login or register to file complaints</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label className="label" htmlFor="mobile">Mobile Number (10 digits)</label>
              <div className="input-with-prefix">
                <span className="prefix">+91</span>
                <input
                  type="tel"
                  id="mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter your mobile number"
                  autoFocus
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary w-full" disabled={loading || mobile.length !== 10}>
              {loading ? 'Sending...' : 'Get OTP'} <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div className="form-group text-center">
              <label className="label">Enter 6-digit OTP sent to {mobile}</label>
              <div className="otp-container">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={otpRefs[index]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="otp-input"
                  />
                ))}
              </div>
              <button 
                type="button" 
                className="btn-link text-sm mt-2" 
                onClick={() => setStep(1)}
              >
                Change Number
              </button>
            </div>

            {isRegistering && (
              <div className="registration-fields slide-down">
                <hr className="divider" />
                <h4 className="mb-4 text-center">Complete Registration</h4>
                
                <div className="form-group">
                  <label className="label">Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                
                <div className="form-group">
                  <label className="label">Aadhaar Number (12 digits)</label>
                  <input type="text" name="aadhaar" value={formData.aadhaar} onChange={(e) => handleInputChange({target: {name: 'aadhaar', value: e.target.value.replace(/\D/g, '').slice(0, 12)}})} />
                </div>
                
                <div className="grid-2">
                  <div className="form-group">
                    <label className="label">State *</label>
                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label className="label">District *</label>
                    <input type="text" name="district" value={formData.district} onChange={handleInputChange} required />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading || otp.join('').length !== 6}>
              {loading ? 'Verifying...' : (isRegistering ? 'Register & Verify' : 'Verify & Login')} <ShieldCheck size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CitizenLogin;
