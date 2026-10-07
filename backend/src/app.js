const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler } = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');
const abandonedRoutes = require('./routes/abandonedRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const couponRoutes = require('./routes/couponRoutes');
const settingRoutes = require('./routes/settingRoutes');

const app = express();
app.disable('x-powered-by');

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logs incoming requests

// CORS configuration - Allow Next.js frontend
const allowedOrigins = [
  'http://localhost:3000',
  'https://shop.aviar.wearm3s.com',
  ...(process.env.FRONTEND_URL || '').split(',').map((u) => u.trim()),
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false); // refuse quietly instead of throwing a 500
    }
  },
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/abandoned', abandonedRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

// Root & Health check routes
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Aviar Backend API is running',
    version: '1.0.0',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running',
    data: null
  });
});

// Centralized Error Handler (must be last middleware)
app.use(errorHandler);

module.exports = app;
