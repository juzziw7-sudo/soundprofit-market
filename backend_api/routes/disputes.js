const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/authMiddleware');

// Get Disputes (Admin or User's own)
router.get('/', auth, async (req, res) => {
    try {
        let query = 'SELECT d.*, t.amount_total, u.username as initiator_name FROM disputes d JOIN transactions t ON d.transaction_id = t.id JOIN users u ON d.initiator_id = u.id';
        let params = [];

        if (req.user.role !== 'admin') {
            query += ' WHERE d.initiator_id = $1';
            params.push(req.user.id);
        }

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch disputes' });
    }
});

// Create Dispute
router.post('/', auth, async (req, res) => {
    try {
        const { transactionId, reason } = req.body;
        const initiatorId = req.user.id; // Corrected variable name

        // Verify transaction relationship
        const tx = await db.query('SELECT * FROM transactions WHERE id = $1', [transactionId]);
        if (tx.rows.length === 0) return res.status(404).json({ error: 'Transaction not found' });

        if (tx.rows[0].buyer_id !== initiatorId && tx.rows[0].artist_id !== initiatorId) {
            return res.status(403).json({ error: 'Not authorized for this transaction' });
        }

        const result = await db.query(
            'INSERT INTO disputes (transaction_id, initiator_id, reason) VALUES ($1, $2, $3) RETURNING *',
            [transactionId, initiatorId, reason]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create dispute' });
    }
});

// Resolve Dispute (Admin Only)
router.put('/:id/resolve', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

        const { resolution, notes } = req.body; // resolution: 'resolved_refund' or 'resolved_release'
        const disputeId = req.params.id;

        await db.query('BEGIN');

        // Update Dispute
        const dispute = await db.query(
            'UPDATE disputes SET status = $1, admin_notes = $2 WHERE id = $3 RETURNING transaction_id',
            [resolution, notes, disputeId]
        );

        if (dispute.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ error: 'Dispute not found' });
        }

        const txId = dispute.rows[0].transaction_id;

        // Update Transaction based on resolution
        if (resolution === 'resolved_refund') {
            await db.query("UPDATE transactions SET status = 'reversed' WHERE id = $1", [txId]);
        } else if (resolution === 'resolved_release') {
            const tx = await db.query('SELECT * FROM transactions WHERE id = $1', [txId]);
            // Generate token if not exists
            const token = "dl_" + Math.random().toString(36).substring(7);
            // In real app, release funds to artist here
            await db.query("UPDATE transactions SET status = 'verified_completed', download_token = $1 WHERE id = $2", [token, txId]);
        }

        await db.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await db.query('ROLLBACK');
        res.status(500).json({ error: 'Resolution failed' });
    }
});

module.exports = router;
