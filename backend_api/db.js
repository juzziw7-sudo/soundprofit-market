require('dotenv').config();
const { Pool } = require('pg');

const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
};

const pool = new Pool(poolConfig);

// Robust connection handler
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    // Don't exit process, just log it. Pool will try to reconnect new clients.
});

// Simple query helper with logging
module.exports = {
    query: async (text, params) => {
        const start = Date.now();
        try {
            const res = await pool.query(text, params);
            const duration = Date.now() - start;
            if (duration > 1000) {
                console.log('Slow query executed', { text, duration, rows: res.rowCount });
            }
            return res;
        } catch (error) {
            console.error('Database Query Error:', { text, error });
            throw error;
        }
    },
    pool // Export pool for transaction support if needed
};
