import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Lock, ArrowRight, ShieldCheck, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './UnifiedLogin.css';

const RANKS = ['Constable', 'Head Constable', 'ASI', 'Sub Inspector', 'Inspector', 'DSP', 'SP'];

const UnifiedLogin = () => {
  const [activeTab, setActiveTab] = useState('citizen');
  const [citizenIsSignup, setCitizenIsSignup] = useState(false);
  const [policeIsSignup, setPoliceIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showCitizenPass, setShowCitizenPass] = useState(false);
  const [showPolicePass, setShowPolicePass] = useState(false);

  // Citizen form
  const [citizenUsername, setCitizenUsername] = useState('');
  const [citizenPassword, setCitizenPassword] = useState('');

  // Police form
  const [policeName, setPoliceName] = useState('');
  const [policeRank, setPoliceRank] = useState('Constable');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [policePassword, setPolicePassword] = useState('');

  // Admin form
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowAdmin(false);
  };

  // ── Citizen auth ──
  const handleCitizenAuth = async (e) => {
    e.preventDefault();
    if (citizenPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const endpoint = citizenIsSignup ? '/auth/citizen/register' : '/auth/citizen/login';
      const res = await api.post(endpoint, { username: citizenUsername, password: citizenPassword });
      login(res.data.user, res.data.token, 'citizen');
      toast.success(res.data.message);
      navigate('/citizen/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Police auth ──
  const handlePoliceAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (policeIsSignup) {
        const res = await api.post('/auth/police/register', {
          name: policeName,
          badgeNumber,
          rank: policeRank,
          password: policePassword,
        });
        login(res.data.user, res.data.token, 'police');
        toast.success(res.data.message);
        navigate('/police/dashboard');
      } else {
        const res = await api.post('/auth/police/login', { badgeNumber, password: policePassword });
        login(res.data.user, res.data.token, 'police');
        toast.success('Login successful');
        navigate('/police/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // ── Admin auth ──
  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/admin/login', { email: adminEmail, password: adminPassword });
      login(res.data.user, res.data.token, 'admin');
      toast.success('Admin login successful');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // ── Admin Panel ──
  if (showAdmin) {
    return (
      <div className="auth-container">
        <div className="auth-card admin-card">
          <button className="back-btn" onClick={() => setShowAdmin(false)}>
            <ArrowLeft size={16} /> Back to login
          </button>

          <div className="admin-card-header">
            <div className="admin-badge">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="admin-title">System Administrator</h2>
              <p className="text-muted text-sm">Restricted access — authorized personnel only</p>
            </div>
          </div>

          <form onSubmit={handleAdminAuth} className="admin-form">
            <div className="form-group">
              <label className="label"><Mail size={14} /> Admin Email</label>
              <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="admin@firms.gov.in" required autoFocus />
            </div>
            <div className="form-group">
              <label className="label"><Lock size={14} /> Password</label>
              <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Enter admin password" required />
            </div>
            <button type="submit" className="btn w-full admin-login-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Login as Administrator'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card login-card">

        {/* Tab Strip */}
        <div className="auth-tabs">
          <button className={`auth-tab ${activeTab === 'citizen' ? 'active' : ''}`} onClick={() => handleTabChange('citizen')}>
            <User size={16} /> Citizen
          </button>
          <button className={`auth-tab police-tab ${activeTab === 'police' ? 'active' : ''}`} onClick={() => handleTabChange('police')}>
            <Shield size={16} /> Police Officer
          </button>
        </div>

        {/* ─── CITIZEN PANEL ─── */}
        {activeTab === 'citizen' && (
          <div className="panel-body" key={citizenIsSignup ? 'c-signup' : 'c-login'}>
            <div className="panel-header">
              <div className="panel-icon citizen-icon"><User size={26} /></div>
              <h2>{citizenIsSignup ? 'Create Account' : 'Welcome Back'}</h2>
              <p className="text-muted">{citizenIsSignup ? 'Register to file or track complaints' : 'Sign in to your citizen account'}</p>
            </div>

            <form onSubmit={handleCitizenAuth}>
              <div className="form-group">
                <label className="label">Username</label>
                <input type="text" value={citizenUsername} onChange={e => setCitizenUsername(e.target.value)}
                  placeholder={citizenIsSignup ? 'Choose a unique username' : 'Enter your username'} required autoFocus />
              </div>
              <div className="form-group">
                <label className="label">Password</label>
                <div className="password-wrapper">
                  <input type={showCitizenPass ? 'text' : 'password'} value={citizenPassword}
                    onChange={e => setCitizenPassword(e.target.value)}
                    placeholder={citizenIsSignup ? 'Min. 6 characters' : 'Enter your password'} required />
                  <button type="button" className="eye-btn" onClick={() => setShowCitizenPass(!showCitizenPass)} tabIndex={-1}>
                    {showCitizenPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full submit-btn" disabled={loading}>
                {loading ? (citizenIsSignup ? 'Creating...' : 'Signing in...') : (citizenIsSignup ? 'Create Account' : 'Sign In')}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="toggle-strip">
              <span className="text-muted text-sm">{citizenIsSignup ? 'Already have an account?' : "Don't have an account?"}</span>
              <button type="button" className="toggle-btn" onClick={() => { setCitizenIsSignup(!citizenIsSignup); setShowCitizenPass(false); }}>
                {citizenIsSignup ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </div>
        )}

        {/* ─── POLICE PANEL ─── */}
        {activeTab === 'police' && (
          <div className="panel-body" key={policeIsSignup ? 'p-signup' : 'p-login'}>
            <div className="panel-header">
              <div className="panel-icon police-icon"><Shield size={26} /></div>
              <h2 className="police-title">{policeIsSignup ? 'Officer Registration' : 'Officer Sign In'}</h2>
              <p className="text-muted">{policeIsSignup ? 'Create your officer account' : 'Secure login for authorized personnel'}</p>
            </div>

            <form onSubmit={handlePoliceAuth}>
              {policeIsSignup && (
                <>
                  <div className="form-group">
                    <label className="label">Full Name</label>
                    <input type="text" value={policeName} onChange={e => setPoliceName(e.target.value)} placeholder="e.g. Inspector Ramesh Kumar" required autoFocus />
                  </div>
                  <div className="form-group">
                    <label className="label">Rank</label>
                    <select value={policeRank} onChange={e => setPoliceRank(e.target.value)}>
                      {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="label">Badge Number</label>
                <input type="text" value={badgeNumber} onChange={e => setBadgeNumber(e.target.value)}
                  placeholder="e.g. MH-001" required autoFocus={!policeIsSignup} />
              </div>
              <div className="form-group">
                <label className="label">Password</label>
                <div className="password-wrapper">
                  <input type={showPolicePass ? 'text' : 'password'} value={policePassword}
                    onChange={e => setPolicePassword(e.target.value)}
                    placeholder={policeIsSignup ? 'Min. 6 characters' : 'Enter your password'} required />
                  <button type="button" className="eye-btn" onClick={() => setShowPolicePass(!showPolicePass)} tabIndex={-1}>
                    {showPolicePass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-danger w-full submit-btn" disabled={loading}>
                {loading ? (policeIsSignup ? 'Registering...' : 'Authenticating...') : (policeIsSignup ? 'Register' : 'Secure Login')}
                {!loading && <ShieldCheck size={18} />}
              </button>
            </form>

            <div className="toggle-strip">
              <span className="text-muted text-sm">{policeIsSignup ? 'Already registered?' : 'New officer?'}</span>
              <button type="button" className="toggle-btn police-toggle" onClick={() => { setPoliceIsSignup(!policeIsSignup); setShowPolicePass(false); }}>
                {policeIsSignup ? 'Sign In' : 'Register'}
              </button>
            </div>
          </div>
        )}

        {/* Admin footer link */}
        <div className="admin-footer">
          <span className="admin-divider-text">System Admin?</span>
          <button type="button" className="admin-link" onClick={() => setShowAdmin(true)}>
            Access Admin Panel →
          </button>
        </div>

      </div>
    </div>
  );
};

export default UnifiedLogin;
