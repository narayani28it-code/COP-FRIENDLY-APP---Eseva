import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Command } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const PoliceLogin = () => {
  const [badgeNumber, setBadgeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/police/login', { badgeNumber, password });
      login(res.data.user, res.data.token, 'police');
      toast.success('Login successful');
      navigate('/police/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ borderTop: '4px solid var(--police-red)' }}>
        <div className="auth-header">
          <div className="auth-icon bg-red-100">
            <Shield size={28} />
          </div>
          <h2 style={{color: 'var(--police-red)'}}>Officer Portal</h2>
          <p className="text-muted">Secure login for authorized personnel</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="label">Badge Number</label>
            <div className="input-with-prefix">
              <span className="prefix" style={{backgroundColor: '#fff'}}><Command size={18} /></span>
              <input 
                type="text" 
                value={badgeNumber}
                onChange={(e) => setBadgeNumber(e.target.value)}
                placeholder="e.g. MH-001"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <div className="input-with-prefix">
              <span className="prefix" style={{backgroundColor: '#fff'}}><Lock size={18} /></span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-danger w-full mt-4" disabled={loading}>
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PoliceLogin;
