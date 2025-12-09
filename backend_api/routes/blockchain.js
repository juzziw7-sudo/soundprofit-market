const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/authMiddleware');

// Record blockchain transaction
router.post('/record', auth, async (req, res) => {
    try {
        const { tx_hash, song_id, amount_eth, amount_usd, buyer_address } = req.body;

        // Get song and artist info
        const songResult = await db.query(
            'SELECT * FROM songs WHERE id = $1',
            [song_id]
        );

        if (songResult.rows.length === 0) {
            return res.status(404).json({ error: 'Song not found' });
        }

        const song = songResult.rows[0];

        // Calculate commission (2%)
        const platformCommission = parseFloat(amount_usd) * 0.02;
        const artistShare = parseFloat(amount_usd) * 0.98;

        // Create transaction record
        const txResult = await db.query(`
            INSERT INTO transactions 
            (buyer_id, artist_id, song_id, amount_total, amount_artist, amount_platform, 
             status, payment_method, blockchain_tx_hash, completed_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
            RETURNING *
        `, [
            req.user.id,
            song.artist_id,
            song_id,
            amount_usd,
            artistShare,
            platformCommission,
            'verified_completed',
            'crypto',
            tx_hash
        ]);

        // Record blockchain transaction
        await db.query(`
            INSERT INTO blockchain_transactions 
            (transaction_id, tx_hash, from_address, to_address, amount_eth, amount_wei, status, is_commission)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            txResult.rows[0].id,
            tx_hash,
            buyer_address,
            song.artist_id, // This should be artist's wallet address
            amount_eth,
            (parseFloat(amount_eth) * 1e18).toString(),
            'confirmed',
            false
        ]);

        // Update song purchase count
        await db.query(
            'UPDATE songs SET purchase_count = purchase_count + 1 WHERE id = $1',
            [song_id]
        );

        res.json({
            success: true,
            transaction: txResult.rows[0]
        });

    } catch (error) {
        console.error('Blockchain transaction recording failed:', error);
        res.status(500).json({ error: 'Failed to record transaction' });
    }
});

// Get admin wallet balance and commission stats
router.get('/admin/stats', auth, async (req, res) => {
    try {
        // Verify admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // Get admin wallet address from config
        const configResult = await db.query(
            "SELECT config_value FROM admin_config WHERE config_key = 'admin_wallet_address'"
        );

        const adminWallet = configResult.rows[0]?.config_value;

        // Get total commissions earned
        const commissionsResult = await db.query(`
            SELECT 
                SUM(amount_platform) as total_commissions_usd,
                COUNT(*) as total_transactions,
                SUM(CASE WHEN status = 'verified_completed' THEN 1 ELSE 0 END) as completed_transactions
            FROM transactions
            WHERE payment_method = 'crypto'
        `);

        // Get blockchain transaction stats
        const blockchainResult = await db.query(`
            SELECT 
                SUM(amount_eth) as total_eth_volume,
                COUNT(*) as blockchain_tx_count
            FROM blockchain_transactions
            WHERE status = 'confirmed'
        `);

        res.json({
            admin_wallet: adminWallet,
            commissions: commissionsResult.rows[0],
            blockchain: blockchainResult.rows[0]
        });

    } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Verify blockchain transaction
router.post('/verify/:txHash', async (req, res) => {
    try {
        const { txHash } = req.params;

        // Check if transaction exists in database
        const result = await db.query(
            'SELECT * FROM blockchain_transactions WHERE tx_hash = $1',
            [txHash]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        const tx = result.rows[0];

        // In production, verify on blockchain using Web3
        // For now, return database record
        res.json({
            verified: tx.status === 'confirmed',
            transaction: tx
        });

    } catch (error) {
        console.error('Transaction verification failed:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Get commission history
router.get('/commissions', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const result = await db.query(`
            SELECT 
                t.id,
                t.amount_total,
                t.amount_platform as commission,
                t.created_at,
                t.blockchain_tx_hash,
                s.title as song_title,
                u.username as buyer_username
            FROM transactions t
            JOIN songs s ON t.song_id = s.id
            JOIN users u ON t.buyer_id = u.id
            WHERE t.payment_method = 'crypto' AND t.status = 'verified_completed'
            ORDER BY t.created_at DESC
            LIMIT 100
        `);

        res.json(result.rows);

    } catch (error) {
        console.error('Failed to fetch commission history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

module.exports = router;
