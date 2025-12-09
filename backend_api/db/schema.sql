-- SoundProfit Market - Database Schema
-- Target: PostgreSQL
-- Module A & B: Core Data & Security

-- 1. Users (Artists & Buyers)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('artist', 'buyer', 'admin')),
    full_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Encrypted Payment Data (AES-256 encrypted strings)
    payment_data_encrypted TEXT, 
    payment_iv VARCHAR(255)
);

-- 2. Songs (Assets)
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(50),
    duration_seconds INTEGER,
    price_amount DECIMAL(10, 2) NOT NULL,
    price_currency VARCHAR(3) DEFAULT 'USD',
    
    -- File Metadata
    file_url_secure TEXT NOT NULL, -- S3/Cloud Storage Path
    file_hash_sha256 VARCHAR(64) NOT NULL, -- Integrity check
    sample_url TEXT, -- 60s preview
    
    -- Rights Management
    isrc_code VARCHAR(12),
    iswc_code VARCHAR(11),
    allow_affiliates BOOLEAN DEFAULT FALSE,
    affiliate_commission_percent DECIMAL(5, 2) DEFAULT 0.00,
    
    upload_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Social Graph (Followers)
CREATE TABLE follows (
    follower_id UUID REFERENCES users(id),
    following_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id)
);

-- 4. Social Posts (Activity Wall)
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    content_text TEXT,
    media_url TEXT,
    post_type VARCHAR(20) CHECK (post_type IN ('text', 'image', 'video', 'announcement')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Comments & Likes
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id),
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE likes (
    user_id UUID REFERENCES users(id),
    target_id UUID NOT NULL, -- Can be post_id or song_id
    target_type VARCHAR(10) CHECK (target_type IN ('post', 'song')),
    PRIMARY KEY (user_id, target_id, target_type)
);

-- 6. P2P Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES users(id),
    artist_id UUID REFERENCES users(id),
    song_id UUID REFERENCES songs(id),
    affiliate_id UUID REFERENCES users(id), -- Optional
    
    amount_total DECIMAL(10, 2) NOT NULL,
    amount_affiliate DECIMAL(10, 2) DEFAULT 0,
    amount_platform DECIMAL(10, 2) DEFAULT 0,
    amount_artist DECIMAL(10, 2) NOT NULL,
    
    status VARCHAR(20) CHECK (status IN ('pending_payment', 'paid_verifying', 'verified_completed', 'dispute', 'cancelled')),
    
    -- Evidence
    buyer_evidence_url TEXT,
    artist_verification_timestamp TIMESTAMP WITH TIME ZONE,
    
    download_token VARCHAR(255),
    download_attempts_left INTEGER DEFAULT 3,
    download_expiry TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Disputes
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    initiator_id UUID REFERENCES users(id),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    admin_resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Affiliates
CREATE TABLE affiliate_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES users(id),
    song_id UUID REFERENCES songs(id),
    unique_code VARCHAR(50) UNIQUE NOT NULL,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_songs_artist ON songs(artist_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_posts_user ON posts(user_id);
