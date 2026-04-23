// LifeChain Backend Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const blockchainService = require('./services/blockchainService');
const cacheService = require('./services/cacheService');
const retryService = require('./services/retryService');
const { initializeExpiryAlertScheduler } = require('./jobs/expiryAlerts');

const app = express();

// Connect to MongoDB then seed admin user
connectDB().then(async () => {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    const existing = await User.findOne({ role: 'Admin' });
    if (!existing) {
      const hash = await bcrypt.hash('Admin@123456', 12);
      await User.create({
        name: 'System Admin',
        email: 'admin@lifechain.com',
        password: hash,
        role: 'Admin',
        isVerified: true,
        walletAddress: '0x0000000000000000000000000000000000000000'
      });
      console.log('✅ Admin user created: admin@lifechain.com / Admin@123456');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
  } catch (err) {
    console.error('⚠️  Admin seed error:', err.message);
  }
});

// Initialize blockchain service
blockchainService.initialize().catch(err => {
  console.error('⚠️  Blockchain service initialization failed:', err.message);
  console.log('⚠️  Server will continue, but blockchain features may not work');
});

// Initialize cache service
cacheService.initialize().catch(err => {
  console.error('⚠️  Cache service initialization failed:', err.message);
  console.log('⚠️  Server will continue, but caching features may not work');
});

// Start blockchain retry queue processor (runs every 5 minutes)
retryService.startRetryProcessor();

// Initialize expiry alert scheduler (runs daily at 08:00 UTC)
initializeExpiryAlertScheduler();

// Rate limiting middleware - 500 requests per 15 minutes per IP (increased for testing)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs (increased for testing)
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all requests
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
}

// Health check route - Comprehensive system health monitoring
const startTime = Date.now();

app.get('/api/health', async (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000), // seconds
    components: {}
  };

  let allHealthy = true;

  // Check MongoDB
  try {
    const mongoose = require('mongoose');
    const startMongo = Date.now();
    await mongoose.connection.db.admin().ping();
    const mongoTime = Date.now() - startMongo;

    healthStatus.components.mongodb = {
      status: 'healthy',
      responseTime: `${mongoTime}ms`,
      database: mongoose.connection.name
    };
  } catch (error) {
    allHealthy = false;
    healthStatus.components.mongodb = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // Check Blockchain RPC
  try {
    const startBlockchain = Date.now();
    const blockNumber = await blockchainService.provider.getBlockNumber();
    const blockchainTime = Date.now() - startBlockchain;

    healthStatus.components.blockchain = {
      status: 'healthy',
      responseTime: `${blockchainTime}ms`,
      network: 'Polygon Amoy',
      latestBlock: blockNumber,
      contractAddress: process.env.CONTRACT_ADDRESS
    };
  } catch (error) {
    allHealthy = false;
    healthStatus.components.blockchain = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // Check AI Microservice
  try {
    const axios = require('axios');
    const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';
    const startAI = Date.now();
    const aiResponse = await axios.get(`${AI_URL}/api/health`, { timeout: 5000 });
    const aiTime = Date.now() - startAI;

    healthStatus.components.aiService = {
      status: 'healthy',
      responseTime: `${aiTime}ms`,
      modelsAvailable: aiResponse.data.models_available || false,
      url: AI_URL
    };
  } catch (error) {
    allHealthy = false;
    healthStatus.components.aiService = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // Check Redis Cache (optional - not critical)\r\n  try {\r\n    const cacheHealth = await cacheService.healthCheck();\r\n    healthStatus.components.redis = cacheHealth;\r\n    // Redis being unavailable is non-critical - app works without it\r\n  } catch (error) {\r\n    healthStatus.components.redis = {\r\n      status: 'unavailable',\r\n      message: 'Redis not configured - running without cache'\r\n    };\r\n  }

  // Set overall status
  healthStatus.status = allHealthy ? 'healthy' : 'degraded';

  // Return appropriate status code
  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json({
    success: allHealthy,
    message: allHealthy ? 'All systems operational' : 'Some components are unhealthy',
    data: healthStatus
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to LifeChain API',
    version: '1.0.0',
    status: 'Server is running',
    documentation: '/api/health'
  });
});

// Routes
const authRoutes = require('./routes/auth');
const donorRoutes = require('./routes/donor');
const hospitalRoutes = require('./routes/hospital');
const adminRoutes = require('./routes/admin');
const blockchainRoutes = require('./routes/blockchain');
const campaignRoutes = require('./routes/campaigns');
const publicRoutes = require('./routes/public');

app.use('/api/auth', authRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/public', publicRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ LifeChain Backend Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Rate limiting: 100 requests per 15 minutes`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');

  server.close(async () => {
    console.log('🔌 HTTP server closed');

    // Disconnect cache service
    await cacheService.disconnect();

    // Close database connection
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');

    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');

  server.close(async () => {
    console.log('🔌 HTTP server closed');

    // Disconnect cache service
    await cacheService.disconnect();

    // Close database connection
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');

    process.exit(0);
  });
});
