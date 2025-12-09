const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initializeDatabase() {
    console.log('🚀 Starting database initialization...\n');

    try {
        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('📋 Creating tables and indexes...');
        await pool.query(schema);
        console.log('✅ Database schema created successfully!\n');

        // Create default admin user
        console.log('👤 Creating default admin user...');
        const bcrypt = require('bcrypt');
        const adminPassword = await bcrypt.hash('admin123', 10);

        await pool.query(`
            INSERT INTO users (username, email, password_hash, role, is_verified)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (email) DO NOTHING
            RETURNING id
        `, ['admin', 'admin@soundprofit.market', adminPassword, 'admin', true]);

        console.log('✅ Admin user created (email: admin@soundprofit.market, password: admin123)\n');

        // Verify admin configuration
        const configResult = await pool.query(`
            SELECT * FROM admin_config WHERE config_key = 'admin_wallet_address'
        `);

        if (configResult.rows.length > 0) {
            console.log('💰 Admin Wallet Configuration:');
            console.log(`   Address: ${configResult.rows[0].config_value}`);
            console.log(`   Commission: 2% of all sales\n`);
        }

        console.log('🎉 Database initialization complete!\n');
        console.log('Next steps:');
        console.log('1. Start the server: npm start');
        console.log('2. Access the platform at http://localhost:3000');
        console.log('3. Login as admin to configure settings\n');

    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Ensure PostgreSQL is running');
        console.error('2. Check DATABASE_URL in .env file');
        console.error('3. Verify database credentials\n');
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run initialization
initializeDatabase();
