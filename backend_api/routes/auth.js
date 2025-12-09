const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const db = require('../db');
const { validate, schemas } = require('../middleware/validate');

// Storage logic (Simplified: Local for now, but scalable)
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/') },
    filename: function (req, file, cb) { cb(null, 'avatar-' + Date.now() + '-' + file.originalname) }
});
const upload = multer({ storage: storage });

// Register
router.post('/register', validate(schemas.register), async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if user exists
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) return res.status(400).json({ error: 'Email already exists' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const newUser = await db.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, role',
            [username, email, hashedPassword, role || 'buyer']
        );

        res.json(newUser.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Upload Avatar
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        // Determine File URL (S3 or Local)
        let fileUrl;
        if (req.file.location) {
            fileUrl = req.file.location;
        } else {
            fileUrl = `/uploads/${req.file.filename}`;
        }

        // Update User Profile
        await db.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [fileUrl, req.user.id]);

        res.json({ avatar_url: fileUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Avatar upload failed' });
    }
});

// Login
router.post('/login', validate(schemas.login), async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) return res.status(400).json({ error: 'User not found' });

        const validPass = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPass) return res.status(400).json({ error: 'Invalid password' });

        // Create Token
        const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, process.env.JWT_SECRET);

        res.json({
            token,
            user: {
                id: user.rows[0].id,
                username: user.rows[0].username,
                role: user.rows[0].role,
                avatar: user.rows[0].avatar_url
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
