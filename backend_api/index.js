const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

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
app.use((req, res, next) => {
    req.io = io;
    next();
});
app.use(express.static(path.join(__dirname, '../'))); // Serve frontend files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// Routes
const authRoutes = require('./routes/auth');
const songRoutes = require('./routes/songs');
const transactionRoutes = require('./routes/transactions');
const socialRoutes = require('./routes/social');
const blockchainRoutes = require('./routes/blockchain');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/affiliates', require('./routes/affiliates'));
app.use('/api/disputes', require('./routes/disputes'));
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/admin', adminRoutes);

// Fallback for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
