import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, User, MenuSquare, FileText, Activity, CheckCircle } from 'lucide-react';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-pattern"></div>
        <div className="container hero-content">
          <div className="hero-text">
            <h1 className="hero-title">File. Track. Resolve.</h1>
            <p className="hero-subtitle">
              India's modern complaint & FIR management platform. Empowering citizens with transparency and police with efficiency.
            </p>
          </div>

          <div className="role-cards">
            {/* Citizen Card */}
            <div className="role-card glass-panel">
              <div className="role-icon-wrapper citizen-icon">
                <User size={32} />
              </div>
              <h3>For Citizens</h3>
              <p>File complaints online, track status in real-time, and download FIRs without visiting the station.</p>
              <Link to="/login" className="btn btn-primary w-full">Access Portal</Link>
            </div>

            {/* Police Card */}
            <div className="role-card glass-panel">
              <div className="role-icon-wrapper police-icon">
                <Shield size={32} />
              </div>
              <h3>For Police</h3>
              <p>Manage assigned cases, update investigation status, and register e-FIRs with streamlined workflows.</p>
              <Link to="/login" className="btn btn-primary w-full">Officer Login</Link>
            </div>

            {/* Admin Card */}
            <div className="role-card glass-panel">
              <div className="role-icon-wrapper admin-icon">
                <MenuSquare size={32} />
              </div>
              <h3>For Admin</h3>
              <p>Monitor state-wide crime statistics, manage officer assignments, and ensure rapid resolution.</p>
              <Link to="/login" className="btn btn-primary w-full">Admin Login</Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works container">
        <h2 className="section-title">How it works</h2>
        
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <FileText size={40} className="step-icon" />
            <h3>File Complaint</h3>
            <p>Submit your complaint online with evidence (images, videos, or documents) using your Aadhar and mobile number.</p>
          </div>
          
          <div className="step-card">
            <div className="step-number">2</div>
            <Activity size={40} className="step-icon" />
            <h3>Track Progress</h3>
            <p>Receive real-time SMS updates and track your complaint status from preliminary review to FIR registration.</p>
          </div>
          
          <div className="step-card">
            <div className="step-number">3</div>
            <CheckCircle size={40} className="step-icon" />
            <h3>Resolution</h3>
            <p>Download the digitally signed FIR and follow up on the investigation until the case is officially closed.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="tricolor-strip">
          <div className="saffron"></div>
          <div className="white"></div>
          <div className="green"></div>
        </div>
        <div className="footer-content">
          <div className="footer-logo">
            <Shield size={24} className="text-white" />
            <span>FIRMS Initiative</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Government of India. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
