const router = require('express').Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const path = require('path');
const db = require('../db');
const auth = require('../middleware/authMiddleware');

// Storage Configuration
let upload;

if (process.env.AWS_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID) {
    // S3 Storage for Production
    aws.config.update({
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        region: process.env.AWS_REGION || 'us-east-1'
    });

    const s3 = new aws.S3();

    upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: process.env.AWS_BUCKET_NAME,
            acl: 'public-read',
            metadata: function (req, file, cb) {
                cb(null, { fieldName: file.fieldname });
            },
            key: function (req, file, cb) {
                cb(null, Date.now().toString() + '-' + file.originalname);
            }
        })
    });
} else {
    // Disk Storage for Development
    const diskStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/')
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, uniqueSuffix + '-' + file.originalname)
        }
    });
    upload = multer({ storage: diskStorage });
}

// Get all songs
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT s.*, u.username as artist_name 
            FROM songs s 
            JOIN users u ON s.artist_id = u.id 
            ORDER BY s.upload_timestamp DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Upload a song (Protected)
router.post('/', auth, upload.single('audioFile'), async (req, res) => {
    try {
        const { title, genre, price, isrc } = req.body;
        const artist_id = req.user.id;

        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        // Determine File URL based on storage
        let fileUrl;
        if (req.file.location) {
            fileUrl = req.file.location; // S3 URL
        } else {
            fileUrl = `/uploads/${req.file.filename}`; // Local URL
        }

        // Generate Mock Hash (In real app, calculate actual hash)
        const fileHash = "sha256_mock_" + Date.now();

        const result = await db.query(
            `INSERT INTO songs (artist_id, title, genre, price_amount, file_url_secure, file_hash_sha256, isrc_code) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [artist_id, title, genre, price, fileUrl, fileHash, isrc]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Upload failed' });
    }
});

module.exports = router;
