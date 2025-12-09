const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3000;

// Security & Logging Middleware
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Rate Limiter: Max 100 requests per 15 mins per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(helmet({
    contentSecurityPolicy: false, // Disabled for simple dev (inline scripts/styles)
}));
app.use(morgan('dev')); // Logging
app.use('/api', limiter); // Apply rate limiting to API routes
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../'))); // Serve frontend files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files


// Routes
// Routes Loading with Error Isolation
const safeRequire = (path, name) => {
    try {
        return require(path);
    } catch (err) {
        console.error(`❌ Failed to load route: ${name}`, err);
        return (req, res) => res.status(500).json({ error: `Route ${name} unavailable`, details: err.message });
    }
}

const authRoutes = safeRequire('./routes/auth', 'auth');
const songRoutes = safeRequire('./routes/songs', 'songs');
const transactionRoutes = safeRequire('./routes/transactions', 'transactions');
const socialRoutes = safeRequire('./routes/social', 'social');
const blockchainRoutes = safeRequire('./routes/blockchain', 'blockchain');
const adminRoutes = safeRequire('./routes/admin', 'admin');
const affiliatesRoutes = safeRequire('./routes/affiliates', 'affiliates');
const disputesRoutes = safeRequire('./routes/disputes', 'disputes');

app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/affiliates', affiliatesRoutes);
app.use('/api/disputes', disputesRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/admin', adminRoutes);

// Health Check Route (Simple)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        db_url_set: !!process.env.DATABASE_URL
    });
});

// Fallback for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    });
});

// Start server (Railway/Traditional hosting)
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'NOT CONFIGURED'}`);
});

module.exports = app;

