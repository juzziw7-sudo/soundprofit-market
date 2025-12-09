-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'buyer', -- 'buyer', 'artist', 'admin'
    avatar_url TEXT,
    eth_wallet_address VARCHAR(42),
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Songs Table
CREATE TABLE IF NOT EXISTS songs (
    id SERIAL PRIMARY KEY,
    artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    genre VARCHAR(50),
    price_amount DECIMAL(10, 2) NOT NULL,
    file_url_secure TEXT NOT NULL,
    file_hash_sha256 TEXT,
    isrc_code VARCHAR(50),
    cover_art_url TEXT,
    duration_seconds INTEGER,
    play_count INTEGER DEFAULT 0,
    purchase_count INTEGER DEFAULT 0,
    upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER REFERENCES users(id),
    artist_id INTEGER REFERENCES users(id),
    song_id INTEGER REFERENCES songs(id),
    amount_total DECIMAL(10, 2) NOT NULL,
    amount_artist DECIMAL(10, 2) NOT NULL,
    amount_platform DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending_payment', -- 'pending_payment', 'paid_verifying', 'verified_completed', 'failed'
    payment_method VARCHAR(20) DEFAULT 'crypto', -- 'crypto', 'traditional'
    blockchain_tx_hash VARCHAR(66),
    buyer_evidence_url TEXT,
    download_token TEXT,
    artist_verification_timestamp TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Blockchain Transactions Table (for commission tracking)
CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id),
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    amount_wei VARCHAR(100) NOT NULL,
    amount_eth DECIMAL(18, 8) NOT NULL,
    gas_used INTEGER,
    block_number INTEGER,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
    is_commission BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP
);

-- Posts Table (Social)
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content_text TEXT NOT NULL,
    post_type VARCHAR(20) DEFAULT 'text',
    media_url TEXT,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table (Direct Messaging)
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Affiliates Table
CREATE TABLE IF NOT EXISTS affiliates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    total_earnings DECIMAL(10, 2) DEFAULT 0.00,
    total_referrals INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Affiliate Referrals Table
CREATE TABLE IF NOT EXISTS affiliate_referrals (
    id SERIAL PRIMARY KEY,
    affiliate_id INTEGER REFERENCES affiliates(id),
    referred_user_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disputes Table
CREATE TABLE IF NOT EXISTS disputes (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id),
    initiator_id INTEGER REFERENCES users(id),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'resolved_refund', 'resolved_release', 'closed'
    admin_notes TEXT,
    resolution_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Configuration Table
CREATE TABLE IF NOT EXISTS admin_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(50) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist_id);
CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs(genre);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_artist ON transactions(artist_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_hash ON blockchain_transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);

-- Insert Admin Configuration (Platform Commission Wallet)
INSERT INTO admin_config (config_key, config_value, description) 
VALUES 
    ('admin_wallet_address', '0x0bf3a35573dbb8a8062aa8d4536c16c8e4d9f402', 'Ethereum wallet address for platform commissions'),
    ('commission_percentage', '2', 'Platform commission percentage (2% = 0.02)'),
    ('platform_name', 'SoundProfit Market', 'Platform display name'),
    ('support_email', 'support@soundprofit.market', 'Support contact email')
ON CONFLICT (config_key) DO NOTHING;
