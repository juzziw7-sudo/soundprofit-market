const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/authMiddleware');

// Create Transaction
router.post('/', auth, async (req, res) => {
    try {
        const { song_id, amount } = req.body;
        const buyer_id = req.user.id;

        // Get artist ID
        const song = await db.query('SELECT artist_id FROM songs WHERE id = $1', [song_id]);
        if (song.rows.length === 0) return res.status(404).json({ error: 'Song not found' });

        const artist_id = song.rows[0].artist_id;

        const result = await db.query(
            `INSERT INTO transactions (buyer_id, artist_id, song_id, amount_total, amount_artist, status) 
             VALUES ($1, $2, $3, $4, $4, 'pending_payment') RETURNING id`,
            [buyer_id, artist_id, song_id, amount]
        );

        res.json({ transactionId: result.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: 'Transaction creation failed' });
    }
});

// Update Status (e.g., Upload Evidence)
router.put('/:id/evidence', auth, async (req, res) => {
    try {
        const { id } = req.params;
        // In real app, upload evidence image to S3
        const mockEvidenceUrl = "https://evidence.soundprofit.com/proof.jpg";

        await db.query(
            `UPDATE transactions SET status = 'paid_verifying', buyer_evidence_url = $1 WHERE id = $2`,
            [mockEvidenceUrl, id]
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// Verify Payment (Artist Only)
router.put('/:id/verify', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const artist_id = req.user.id;

        // Verify ownership
        const tx = await db.query('SELECT * FROM transactions WHERE id = $1', [id]);
        if (tx.rows[0].artist_id !== artist_id) return res.status(403).json({ error: 'Unauthorized' });

        // Generate Download Token
        const token = "dl_" + Math.random().toString(36).substring(7);

        await db.query(
            `UPDATE transactions SET status = 'verified_completed', download_token = $1, artist_verification_timestamp = NOW() WHERE id = $2`,
            [token, id]
        );

        res.json({ success: true, downloadToken: token });
    } catch (err) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

module.exports = router;
