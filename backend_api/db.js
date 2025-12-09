require('dotenv').config();
const { Pool } = require('pg');

const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
};

// Lazy initialization of Pool to prevent import-time crashes
let pool;
try {
    if (!process.env.DATABASE_URL) {
        console.warn("⚠️ DATABASE_URL is not defined. DB dependent routes will fail.");
    } else {
        pool = new Pool(poolConfig);

        // Robust connection handler
        pool.on('error', (err, client) => {
            console.error('Unexpected error on idle client', err);
        });
    }
} catch (e) {
    console.error("Failed to initialize DB pool:", e);
}

// Robust connection handler
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    // Don't exit process, just log it. Pool will try to reconnect new clients.
});

// Simple query helper with logging
module.exports = {
    query: async (text, params) => {
        if (!pool) {
            console.error("Attempted DB query with no active pool.");
            throw new Error("Database not connected. Check DATABASE_URL.");
        }
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
