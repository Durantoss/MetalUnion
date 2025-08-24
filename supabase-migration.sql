-- MetalUnion Database Migration Script for Supabase
-- This script creates all tables from your Drizzle schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Session storage table for authentication
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- User storage table for authentication with enhanced social features
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    stagename VARCHAR UNIQUE,
    safeword VARCHAR, -- Password field (hashed)
    bio TEXT,
    location VARCHAR,
    favorite_genres TEXT[],
    -- Gamification fields
    reputation_points INTEGER DEFAULT 0,
    badges TEXT[],
    concert_attendance_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    -- Social features
    is_online BOOLEAN DEFAULT false,
    last_active TIMESTAMP DEFAULT NOW(),
    login_streak INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    total_photos INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    -- Session preferences
    remember_me BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    -- Preferences
    notification_settings JSONB,
    theme VARCHAR DEFAULT 'dark',
    -- Proximity matching settings
    proximity_enabled BOOLEAN DEFAULT false,
    proximity_radius INTEGER DEFAULT 500, -- meters
    share_location_at_concerts BOOLEAN DEFAULT false,
    -- Admin and role management
    role VARCHAR DEFAULT 'user', -- user, moderator, admin
    is_admin BOOLEAN DEFAULT false,
    permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Badges system for gamification
CREATE TABLE IF NOT EXISTS badges (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon VARCHAR NOT NULL, -- Icon name or URL
    category VARCHAR NOT NULL, -- 'engagement', 'content', 'social', 'achievement'
    requirement JSONB NOT NULL, -- { type: 'count', action: 'comment', threshold: 10 }
    rarity VARCHAR DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    points INTEGER DEFAULT 0, -- Reputation points awarded
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User badge awards tracking
CREATE TABLE IF NOT EXISTS user_badges (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id VARCHAR NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP DEFAULT NOW(),
    progress JSONB -- Current progress towards badge requirements
);

-- Bands table
CREATE TABLE IF NOT EXISTS bands (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    genre TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    founded INTEGER,
    members TEXT[],
    albums TEXT[],
    website TEXT,
    instagram TEXT,
    owner_id VARCHAR REFERENCES users(id),
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    submitted_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tours table
CREATE TABLE IF NOT EXISTS tours (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    band_id VARCHAR NOT NULL REFERENCES bands(id),
    tour_name TEXT NOT NULL,
    venue TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    ticket_url TEXT,
    ticketmaster_url TEXT,
    seatgeek_url TEXT,
    price TEXT,
    status TEXT DEFAULT 'upcoming', -- 'upcoming', 'sold_out', 'cancelled'
    -- Venue capacity and crowd energy fields
    venue_capacity INTEGER, -- Maximum venue capacity
    current_attendance INTEGER DEFAULT 0, -- Current ticket sales/attendance
    crowd_energy_level REAL DEFAULT 0.0, -- 0.0 to 1.0 crowd energy score
    last_energy_update TIMESTAMP DEFAULT NOW(),
    attendee_count INTEGER DEFAULT 0, -- Real-time attendee count
    energy_metrics JSONB DEFAULT '{}'::jsonb -- Social media buzz, reviews, etc.
);

-- Concert attendance tracking for badges
CREATE TABLE IF NOT EXISTS concert_attendance (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tour_id VARCHAR REFERENCES tours(id),
    venue_name VARCHAR NOT NULL,
    band_name VARCHAR NOT NULL,
    attendance_date TIMESTAMP NOT NULL,
    verification_method VARCHAR, -- 'manual', 'location', 'ticket'
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Community posts table
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type VARCHAR DEFAULT 'text', -- 'text', 'image', 'link', 'poll'
    image_url TEXT,
    link_url TEXT,
    tags TEXT[],
    is_public BOOLEAN DEFAULT true,
    is_pinned BOOLEAN DEFAULT false,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Post comments table  
CREATE TABLE IF NOT EXISTS post_comments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id VARCHAR NOT NULL REFERENCES posts(id),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    parent_id VARCHAR, -- For nested comments - self reference
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id VARCHAR NOT NULL REFERENCES posts(id),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Post comment likes table
CREATE TABLE IF NOT EXISTS post_comment_likes (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id VARCHAR NOT NULL REFERENCES post_comments(id),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    band_id VARCHAR NOT NULL REFERENCES bands(id),
    stagename TEXT NOT NULL,
    rating INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    review_type TEXT NOT NULL, -- 'band', 'album', 'concert'
    target_name TEXT, -- album name or concert venue
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    band_id VARCHAR REFERENCES bands(id),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL, -- 'live', 'promo', 'backstage', 'equipment'
    uploaded_by TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id VARCHAR NOT NULL REFERENCES users(id),
    author_stagename TEXT NOT NULL,
    category TEXT DEFAULT 'general', -- 'general', 'band_discussion', 'gear', 'events'
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Comments system for reviews, bands, and other content
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    author_id VARCHAR NOT NULL REFERENCES users(id),
    author_stagename TEXT NOT NULL,
    -- Polymorphic relationships - comment can be on different types of content
    target_type TEXT NOT NULL, -- 'review', 'band', 'photo', 'tour', 'message'
    target_id VARCHAR NOT NULL, -- ID of the target (review ID, band ID, etc.)
    -- Thread support for nested comments
    parent_comment_id VARCHAR REFERENCES comments(id),
    -- Engagement metrics
    likes INTEGER DEFAULT 0,
    dislikes INTEGER DEFAULT 0,
    -- Status and moderation
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    deleted_reason TEXT,
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Comment reactions for more detailed engagement
CREATE TABLE IF NOT EXISTS comment_reactions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id VARCHAR NOT NULL REFERENCES comments(id),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    reaction_type TEXT NOT NULL, -- 'like', 'dislike', 'love', 'angry', 'laugh'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Message Board (The Pit) Tables
CREATE TABLE IF NOT EXISTS pit_messages (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    author_name VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    content VARCHAR(2000) NOT NULL,
    category VARCHAR DEFAULT 'general', -- 'general', 'bands', 'tours', 'gear', 'news'
    likes INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    is_pinned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User location data for proximity matching
CREATE TABLE IF NOT EXISTS user_locations (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    accuracy REAL, -- GPS accuracy in meters
    venue_name VARCHAR, -- Concert venue name if at event
    event_name VARCHAR, -- Concert/event name
    is_at_concert BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true, -- User can toggle visibility
    expires_at TIMESTAMP, -- Location expires after certain time
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Concert proximity matches for connecting users at same venues
CREATE TABLE IF NOT EXISTS proximity_matches (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    user_id_2 VARCHAR REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    distance REAL, -- Distance in meters
    venue_name VARCHAR,
    event_name VARCHAR,
    match_type VARCHAR DEFAULT 'concert', -- 'concert', 'venue', 'general'
    is_active BOOLEAN DEFAULT true,
    last_seen TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Pit replies table
CREATE TABLE IF NOT EXISTS pit_replies (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id VARCHAR REFERENCES pit_messages(id) ON DELETE CASCADE,
    author_name VARCHAR NOT NULL,
    content VARCHAR(1000) NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User following/followers system
CREATE TABLE IF NOT EXISTS user_follows (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id VARCHAR NOT NULL REFERENCES users(id),
    following_id VARCHAR NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced reactions system
CREATE TABLE IF NOT EXISTS reactions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    target_type VARCHAR NOT NULL, -- 'review', 'pitMessage', 'pitReply', 'photo'
    target_id VARCHAR NOT NULL,
    reaction_type VARCHAR NOT NULL, -- 'like', 'fire', 'rock', 'mind_blown', 'heart'
    created_at TIMESTAMP DEFAULT NOW()
);

-- User achievements/badges system
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR NOT NULL,
    category VARCHAR NOT NULL, -- 'social', 'content', 'engagement', 'time'
    criteria JSONB NOT NULL, -- Conditions to earn the badge
    points_value INTEGER DEFAULT 0,
    rarity VARCHAR DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    created_at TIMESTAMP DEFAULT NOW()
);

-- User achievements tracking
CREATE TABLE IF NOT EXISTS user_achievements (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    achievement_id VARCHAR NOT NULL REFERENCES achievements(id),
    earned_at TIMESTAMP DEFAULT NOW(),
    progress INTEGER DEFAULT 0
);

-- Notification system
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    type VARCHAR NOT NULL, -- 'follow', 'like', 'reply', 'mention', 'achievement'
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    action_url VARCHAR,
    from_user_id VARCHAR REFERENCES users(id),
    metadata JSONB, -- Additional data like targetId, etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- User activity feed
CREATE TABLE IF NOT EXISTS activity_feed (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    activity_type VARCHAR NOT NULL, -- 'review_posted', 'photo_uploaded', 'band_followed'
    title VARCHAR NOT NULL,
    description TEXT,
    target_type VARCHAR, -- 'band', 'review', 'photo', 'user'
    target_id VARCHAR,
    metadata JSONB,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Community polls and voting
CREATE TABLE IF NOT EXISTS polls (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id VARCHAR NOT NULL REFERENCES users(id),
    title VARCHAR NOT NULL,
    description TEXT,
    options JSONB NOT NULL, -- Array of poll options
    voting_end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    total_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Poll votes
CREATE TABLE IF NOT EXISTS poll_votes (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id VARCHAR NOT NULL REFERENCES polls(id),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    option_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Events and meetups
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id VARCHAR NOT NULL REFERENCES users(id),
    title VARCHAR NOT NULL,
    description TEXT,
    event_type VARCHAR NOT NULL, -- 'meetup', 'listening_party', 'concert_group'
    location VARCHAR,
    virtual_link VARCHAR,
    date_time TIMESTAMP NOT NULL,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- Event attendees
CREATE TABLE IF NOT EXISTS event_attendees (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR NOT NULL REFERENCES events(id),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    status VARCHAR DEFAULT 'attending', -- 'attending', 'interested', 'declined'
    joined_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced reviews with detailed ratings
CREATE TABLE IF NOT EXISTS review_ratings (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id VARCHAR NOT NULL REFERENCES reviews(id),
    sound_quality INTEGER,
    stage_presence INTEGER,
    crowd_energy INTEGER,
    setlist INTEGER,
    venue INTEGER,
    overall INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Secure Direct Messaging System with End-to-End Encryption
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    participant1_id VARCHAR NOT NULL REFERENCES users(id),
    participant2_id VARCHAR NOT NULL REFERENCES users(id),
    last_message_at TIMESTAMP DEFAULT NOW(),
    is_archived BOOLEAN DEFAULT false,
    is_encrypted BOOLEAN DEFAULT true,
    participant1_public_key TEXT, -- For end-to-end encryption
    participant2_public_key TEXT, -- For end-to-end encryption
    created_at TIMESTAMP DEFAULT NOW()
);

-- Direct messages
CREATE TABLE IF NOT EXISTS direct_messages (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id VARCHAR NOT NULL REFERENCES conversations(id),
    sender_id VARCHAR NOT NULL REFERENCES users(id),
    message_type VARCHAR NOT NULL DEFAULT 'text', -- 'text', 'image', 'video', 'file'
    
    -- Encrypted content fields
    encrypted_content TEXT, -- Encrypted message text
    encrypted_media_url TEXT, -- Encrypted media URL for images/videos
    media_metadata JSONB, -- File size, type, duration, etc.
    thumbnail_url TEXT, -- For video previews
    
    -- Encryption metadata
    encryption_key_id VARCHAR, -- For key rotation
    initialization_vector VARCHAR, -- For AES encryption
    
    -- Message status and security
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    expires_at TIMESTAMP, -- For disappearing messages
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Message encryption keys
CREATE TABLE IF NOT EXISTS message_encryption_keys (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    public_key TEXT NOT NULL,
    private_key_encrypted TEXT NOT NULL, -- User's encrypted private key
    key_type VARCHAR DEFAULT 'rsa', -- 'rsa', 'ecc'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Message delivery receipts
CREATE TABLE IF NOT EXISTS message_delivery_receipts (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id VARCHAR NOT NULL REFERENCES direct_messages(id),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    status VARCHAR NOT NULL, -- 'sent', 'delivered', 'read'
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_stagename ON users(stagename);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_bands_name ON bands(name);
CREATE INDEX IF NOT EXISTS idx_bands_genre ON bands(genre);
CREATE INDEX IF NOT EXISTS idx_tours_date ON tours(date);
CREATE INDEX IF NOT EXISTS idx_tours_band_id ON tours(band_id);
CREATE INDEX IF NOT EXISTS idx_reviews_band_id ON reviews(band_id);
CREATE INDEX IF NOT EXISTS idx_photos_band_id ON photos(band_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_target_type_id ON comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_proximity_matches_users ON proximity_matches(user_id_1, user_id_2);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant1_id, participant2_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation ON direct_messages(conversation_id);

-- Enable Row Level Security (RLS) for sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you may want to customize these based on your auth system)
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id);

-- Direct messages - users can only see messages in their conversations
CREATE POLICY "Users can view own messages" ON direct_messages FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM conversations 
        WHERE conversations.id = direct_messages.conversation_id 
        AND (conversations.participant1_id = auth.uid()::text OR conversations.participant2_id = auth.uid()::text)
    )
);

-- Conversations - users can only see their own conversations
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT 
USING (participant1_id = auth.uid()::text OR participant2_id = auth.uid()::text);

-- Notifications - users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT 
USING (user_id = auth.uid()::text);

-- User locations - users can only see their own location data
CREATE POLICY "Users can view own location" ON user_locations FOR SELECT 
USING (user_id = auth.uid()::text);

-- Message encryption keys - users can only see their own keys
CREATE POLICY "Users can view own encryption keys" ON message_encryption_keys FOR SELECT 
USING (user_id = auth.uid()::text);

-- Insert some initial data
INSERT INTO badges (name, description, icon, category, requirement, rarity, points) VALUES
('First Review', 'Posted your first review', '⭐', 'content', '{"type": "count", "action": "review", "threshold": 1}', 'common', 10),
('Concert Goer', 'Attended your first concert', '🎵', 'engagement', '{"type": "count", "action": "concert_attendance", "threshold": 1}', 'common', 15),
('Social Butterfly', 'Made 10 friends', '🦋', 'social', '{"type": "count", "action": "friends", "threshold": 10}', 'rare', 25),
('Metal Head', 'Posted 50 reviews', '🤘', 'content', '{"type": "count", "action": "review", "threshold": 50}', 'epic', 100);

-- Success message
SELECT 'MetalUnion database schema created successfully!' as status;
