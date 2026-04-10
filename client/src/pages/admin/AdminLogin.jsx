import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/admin/login', { email, password });
      login(res.data.user, res.data.token, 'admin');
      toast.success('Admin login successful');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ borderTop: '4px solid #9333ea' }}> {/* Purple theme for admin */}
        <div className="auth-header">
          <div className="auth-icon bg-purple-100" style={{color: '#9333ea'}}>
            <Shield size={28} />
          </div>
          <h2 style={{color: '#9333ea'}}>System Admin</h2>
          <p className="text-muted">Centralized monitoring & management</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="label">Admin Email</label>
            <div className="input-with-prefix">
              <span className="prefix" style={{backgroundColor: '#fff'}}><Mail size={18} /></span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gov.in"
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

          <button type="submit" className="btn w-full mt-4" style={{backgroundColor: '#9333ea', color: '#fff'}} disabled={loading}>
            {loading ? 'Authenticating...' : 'Admin Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
