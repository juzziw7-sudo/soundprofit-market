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
        const fs = require('fs');
        const path = require('path');
        const schemaPath = path.join(__dirname, '../schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('⚡ Force Initializing Database...');
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

