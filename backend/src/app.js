const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
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

// Trust reverse proxy (Nginx / Cloudflare / PM2)
app.set('trust proxy', 1);

// HTTP Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
);

// Response compression
app.use(compression());

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS configuration - Allow Next.js frontend
const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((u) => u.trim().replace(/\/$/, ''))
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:3000',
  'https://shop.aviar.wearm3s.com',
  'https://aviarbd.com',
  'https://www.aviarbd.com',
];

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(cleanOrigin)) {
      callback(null, true);
    } else {
      callback(null, false); // refuse quietly instead of throwing a 500
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 login/register attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts from this IP, please try again after 15 minutes.',
  },
});

// Apply general limiter to all API routes
app.use('/api', generalLimiter);

// Apply strict rate limiting to auth endpoints
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/admin/login', authLimiter);

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
    environment: process.env.NODE_ENV || 'production',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    data: null,
  });
});

// Centralized Error Handler (must be last middleware)
app.use(errorHandler);

module.exports = app;

