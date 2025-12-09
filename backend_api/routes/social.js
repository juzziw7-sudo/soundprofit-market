const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/authMiddleware');

// Get Feed
router.get('/feed', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT p.*, u.username, u.avatar_url 
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC LIMIT 50
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Post
router.post('/posts', auth, async (req, res) => {
    try {
        const { content } = req.body;
        const user_id = req.user.id;

        const result = await db.query(
            'INSERT INTO posts (user_id, content_text, post_type) VALUES ($1, $2, $3) RETURNING *',
            [user_id, content, 'text']
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Post failed' });
    }
});

// Get Messages (Inbox)
router.get('/messages', auth, async (req, res) => {
    try {
        const user_id = req.user.id;
        const result = await db.query(`
            SELECT m.*, u.username as sender_name 
            FROM messages m 
            JOIN users u ON m.sender_id = u.id 
            WHERE m.receiver_id = $1 
            ORDER BY m.created_at DESC
        `, [user_id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Send Message
router.post('/messages', auth, async (req, res) => {
    try {
        const { receiver_id, content } = req.body;
        const sender_id = req.user.id;

        const result = await db.query(
            'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
            [sender_id, receiver_id, content]
        );

        // Emit real-time event
        if (req.io) {
            req.io.emit('new_message', result.rows[0]);
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Message failed' });
    }
});

module.exports = router;
