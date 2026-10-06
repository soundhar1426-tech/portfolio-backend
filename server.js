require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { seedInitialData } = require('./utils/seedData');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const certificateRoutes = require('./routes/certificateRoutes');

const app = express();

// Connect to MongoDB
connectDB().then(() => {
  seedInitialData();
});

// Middlewares
app.use(cors({
  origin: true, // Mirrors the requesting origin to fully comply with browser credentials security
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// URL cleanup middleware: handles accidental duplicate prefixes like /api/api/...
app.use((req, res, next) => {
  if (req.url.startsWith('/api/api/')) {
    req.url = req.url.replace('/api/api/', '/api/');
  }
  next();
});

// Routes (supports both /api/auth and /auth)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/projects', projectRoutes);
app.use('/projects', projectRoutes);

app.use('/api/certificates', certificateRoutes);
app.use('/certificates', certificateRoutes);

// Root status endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Soundhar Portfolio Backend API is running successfully.',
    portfolioOwner: 'Soundhar D M',
    role: 'MERN Stack Developer',
    healthCheck: '/api/health'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    portfolioOwner: 'Soundhar D M',
    role: 'MERN Stack Developer',
    time: new Date().toISOString()
  });
});

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Soundhar Portfolio API running on http://localhost:${PORT}`);
});
