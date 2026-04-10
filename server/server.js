require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Middleware
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const citizenRoutes = require('./routes/citizenRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const policeRoutes = require('./routes/policeRoutes');
const firRoutes = require('./routes/firRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sharedRoutes = require('./routes/sharedRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Core Middleware ──
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true 
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static Files ──
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/citizen', citizenRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/police', policeRoutes);
app.use('/api/fir', firRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', sharedRoutes);

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FIR & Complaint Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler ──
app.use(errorHandler);

// ── Database Connection & Server Start ──
const startServer = async () => {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`\n═══════════════════════════════════════════════`);
      console.log(`  🚀 Server running on http://localhost:${PORT}`);
      console.log(`  📁 Uploads served at /uploads`);
      console.log(`  🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  🔑 OTP Mode: ${process.env.OTP_MODE || 'dev'}`);
      console.log(`═══════════════════════════════════════════════\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});

startServer();
