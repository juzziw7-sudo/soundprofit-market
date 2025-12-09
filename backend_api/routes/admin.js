const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/authMiddleware');

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Get platform statistics
router.get('/stats', auth, requireAdmin, async (req, res) => {
    try {
        // User statistics
        const usersResult = await db.query(`
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN role = 'artist' THEN 1 ELSE 0 END) as total_artists,
                SUM(CASE WHEN role = 'buyer' THEN 1 ELSE 0 END) as total_buyers,
                SUM(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as new_users_30d
            FROM users
        `);

        // Song statistics
        const songsResult = await db.query(`
            SELECT 
                COUNT(*) as total_songs,
                SUM(purchase_count) as total_purchases,
                SUM(play_count) as total_plays
            FROM songs
        `);

        // Transaction statistics
        const transactionsResult = await db.query(`
            SELECT 
                COUNT(*) as total_transactions,
                SUM(amount_total) as total_revenue,
                SUM(amount_platform) as total_commissions,
                AVG(amount_total) as avg_transaction_value
            FROM transactions
            WHERE status = 'verified_completed'
        `);

        // Recent activity
        const recentActivity = await db.query(`
            SELECT 
                'transaction' as type,
                t.id,
                t.created_at,
                u.username as user,
                s.title as song,
                t.amount_total as amount
            FROM transactions t
            JOIN users u ON t.buyer_id = u.id
            JOIN songs s ON t.song_id = s.id
            ORDER BY t.created_at DESC
            LIMIT 10
        `);

        res.json({
            users: usersResult.rows[0],
            songs: songsResult.rows[0],
            transactions: transactionsResult.rows[0],
            recent_activity: recentActivity.rows
        });

    } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Get all users
router.get('/users', auth, requireAdmin, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                id, username, email, role, is_verified, created_at, last_login,
                eth_wallet_address
            FROM users
            ORDER BY created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Update user role or verification status
router.put('/users/:id', auth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { role, is_verified } = req.body;

        const updates = [];
        const values = [];
        let paramCount = 1;

        if (role) {
            updates.push(`role = $${paramCount++}`);
            values.push(role);
        }

        if (is_verified !== undefined) {
            updates.push(`is_verified = $${paramCount++}`);
            values.push(is_verified);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No updates provided' });
        }

        values.push(id);

        const result = await db.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Failed to update user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user
router.delete('/users/:id', auth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        await db.query('DELETE FROM users WHERE id = $1', [id]);

        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        console.error('Failed to delete user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get all songs with moderation info
router.get('/songs', auth, requireAdmin, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                s.*,
                u.username as artist_name,
                u.email as artist_email
            FROM songs s
            JOIN users u ON s.artist_id = u.id
            ORDER BY s.upload_timestamp DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Failed to fetch songs:', error);
        res.status(500).json({ error: 'Failed to fetch songs' });
    }
});

// Delete song (content moderation)
router.delete('/songs/:id', auth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        await db.query('DELETE FROM songs WHERE id = $1', [id]);

        res.json({ success: true, message: 'Song deleted' });
    } catch (error) {
        console.error('Failed to delete song:', error);
        res.status(500).json({ error: 'Failed to delete song' });
    }
});

// Get platform configuration
router.get('/config', auth, requireAdmin, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM admin_config ORDER BY config_key');

        res.json(result.rows);
    } catch (error) {
        console.error('Failed to fetch config:', error);
        res.status(500).json({ error: 'Failed to fetch configuration' });
    }
});

// Update platform configuration
router.put('/config/:key', auth, requireAdmin, async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        const result = await db.query(
            `UPDATE admin_config SET config_value = $1, updated_at = NOW() 
             WHERE config_key = $2 RETURNING *`,
            [value, key]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Configuration key not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Failed to update config:', error);
        res.status(500).json({ error: 'Failed to update configuration' });
    }
});

// Resolve dispute
router.put('/disputes/:id/resolve', auth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_notes } = req.body;

        const result = await db.query(
            `UPDATE disputes 
             SET status = $1, admin_notes = $2, resolution_date = NOW()
             WHERE id = $3 RETURNING *`,
            [status, admin_notes, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Dispute not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Failed to resolve dispute:', error);
        res.status(500).json({ error: 'Failed to resolve dispute' });
    }
});

// FORCE INIT DB (For Vercel Initial Setup)
// WARNING: Remove or secure this in production after first use!
router.get('/init-db-force', async (req, res) => {
    try {
        console.log('⚡ Force Initializing Database...');

        const schema = `
-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'buyer', -- 'buyer', 'artist', 'admin'
    avatar_url TEXT,
    eth_wallet_address VARCHAR(42),
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Songs Table
CREATE TABLE IF NOT EXISTS songs (
    id SERIAL PRIMARY KEY,
    artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    genre VARCHAR(50),
    price_amount DECIMAL(10, 2) NOT NULL,
    file_url_secure TEXT NOT NULL,
    file_hash_sha256 TEXT,
    isrc_code VARCHAR(50),
    cover_art_url TEXT,
    duration_seconds INTEGER,
    play_count INTEGER DEFAULT 0,
    purchase_count INTEGER DEFAULT 0,
    upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER REFERENCES users(id),
    artist_id INTEGER REFERENCES users(id),
    song_id INTEGER REFERENCES songs(id),
    amount_total DECIMAL(10, 2) NOT NULL,
    amount_artist DECIMAL(10, 2) NOT NULL,
    amount_platform DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending_payment', -- 'pending_payment', 'paid_verifying', 'verified_completed', 'failed'
    payment_method VARCHAR(20) DEFAULT 'crypto', -- 'crypto', 'traditional'
    blockchain_tx_hash VARCHAR(66),
    buyer_evidence_url TEXT,
    download_token TEXT,
    artist_verification_timestamp TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Blockchain Transactions Table (for commission tracking)
CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id),
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    amount_wei VARCHAR(100) NOT NULL,
    amount_eth DECIMAL(18, 8) NOT NULL,
    gas_used INTEGER,
    block_number INTEGER,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
    is_commission BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP
);

-- Posts Table (Social)
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content_text TEXT NOT NULL,
    post_type VARCHAR(20) DEFAULT 'text',
    media_url TEXT,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table (Direct Messaging)
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Affiliates Table
CREATE TABLE IF NOT EXISTS affiliates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    total_earnings DECIMAL(10, 2) DEFAULT 0.00,
    total_referrals INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Affiliate Referrals Table
CREATE TABLE IF NOT EXISTS affiliate_referrals (
    id SERIAL PRIMARY KEY,
    affiliate_id INTEGER REFERENCES affiliates(id),
    referred_user_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disputes Table
CREATE TABLE IF NOT EXISTS disputes (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id),
    initiator_id INTEGER REFERENCES users(id),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'resolved_refund', 'resolved_release', 'closed'
    admin_notes TEXT,
    resolution_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Configuration Table
CREATE TABLE IF NOT EXISTS admin_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(50) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist_id);
CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs(genre);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_artist ON transactions(artist_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_hash ON blockchain_transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);

-- Insert Admin Configuration (Platform Commission Wallet)
INSERT INTO admin_config (config_key, config_value, description) 
VALUES 
    ('admin_wallet_address', '0x0bf3a35573dbb8a8062aa8d4536c16c8e4d9f402', 'Ethereum wallet address for platform commissions'),
    ('commission_percentage', '2', 'Platform commission percentage (2% = 0.02)'),
    ('platform_name', 'SoundProfit Market', 'Platform display name'),
    ('support_email', 'support@soundprofit.market', 'Support contact email')
ON CONFLICT (config_key) DO NOTHING;
`;

        await db.query(schema);

        // Create Admin
        const bcrypt = require('bcrypt');
        const adminPassword = await bcrypt.hash('admin123', 10);
        await db.query(`
            INSERT INTO users (username, email, password_hash, role, is_verified)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (email) DO NOTHING
        `, ['admin', 'admin@soundprofit.market', adminPassword, 'admin', true]);

        res.json({ success: true, message: 'Database initialized successfully!' });
    } catch (error) {
        console.error('Init DB Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

