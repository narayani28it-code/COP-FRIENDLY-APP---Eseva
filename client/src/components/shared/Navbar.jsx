import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, User, LogOut, LayoutDashboard, FileText, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, role, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getLinks = () => {
    if (!isAuthenticated) {
      return [
        { label: 'Login to Portal', path: '/login' }
      ];
    }

    if (role === 'citizen') {
      return [
        { label: 'Dashboard', path: '/citizen/dashboard', icon: <LayoutDashboard size={18} /> },
        { label: 'File Complaint', path: '/citizen/complaint/new', icon: <FileText size={18} /> },
      ];
    } else if (role === 'police') {
      return [
        { label: 'Dashboard', path: '/police/dashboard', icon: <LayoutDashboard size={18} /> },
        { label: 'My FIRs', path: '/police/firs', icon: <FileText size={18} /> },
      ];
    } else if (role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
        { label: 'Complaints', path: '/admin/complaints', icon: <FileText size={18} /> },
        { label: 'FIRs', path: '/admin/firs', icon: <FileText size={18} /> },
        { label: 'Police Officers', path: '/admin/police', icon: <Shield size={18} /> },
        { label: 'Citizens', path: '/admin/citizens', icon: <User size={18} /> }
      ];
    }
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to={isAuthenticated ? `/${role}/dashboard` : '/'} className="nav-logo">
          <Shield size={28} className="logo-icon" />
          <span className="logo-text">FIRMS</span>
        </Link>

        {/* Desktop Menu */}
        <div className="nav-links desktop-menu">
          {getLinks().map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          
          {isAuthenticated && (
            <div className="user-menu">
              <span className="user-greeting">Hi, {user?.name?.split(' ')[0]}</span>
              <button className="btn-logout" onClick={handleLogout} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {getLinks().map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <button className="nav-link btn-logout-mobile" onClick={handleLogout}>
              <LogOut size={18} /> Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
