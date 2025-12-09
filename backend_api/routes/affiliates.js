const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/authMiddleware');

// Get Affiliate Status/Dashboard
router.get('/me', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const affiliate = await db.query('SELECT * FROM affiliates WHERE user_id = $1', [userId]);

        if (affiliate.rows.length === 0) {
            return res.json({ isAffiliate: false });
        }

        const stats = await db.query(
            'SELECT COUNT(*) as referrals FROM affiliate_referrals WHERE affiliate_id = $1',
            [affiliate.rows[0].id]
        );

        res.json({
            isAffiliate: true,
            ...affiliate.rows[0],
            referralCount: parseInt(stats.rows[0].referrals)
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Affiliate Code
router.post('/register', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const code = req.user.username + '_' + Math.random().toString(36).substring(7);

        const result = await db.query(
            'INSERT INTO affiliates (user_id, referral_code) VALUES ($1, $2) RETURNING *',
            [userId, code]
        );

        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Already an affiliate' });
        res.status(500).json({ error: 'Registration failed' });
    }
});

module.exports = router;
