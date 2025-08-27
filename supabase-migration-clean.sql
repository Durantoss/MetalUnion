-- MetalUnion Database Migration Script for Supabase (Clean Version)
-- This script creates all tables with proper UUID types and handles sessions table migration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User storage table for authentication with enhanced social features (MUST BE FIRST)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Session storage table for authentication (with user_id reference) - RENAMED TO user_sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS IDX_user_session_expire ON user_sessions(expire);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- Badges system for gamification
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    requirement JSONB NOT NULL,
    rarity VARCHAR DEFAULT 'common',
    points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User badge awards tracking
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP DEFAULT NOW(),
    progress JSONB
);

-- Bands table
CREATE TABLE IF NOT EXISTS bands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    genre TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    founded INTEGER,
    members TEXT[],
    albums TEXT[],
    website TEXT,
    instagram TEXT,
    owner_id UUID REFERENCES users(id),
    status TEXT DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tours table
CREATE TABLE IF NOT EXISTS tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    band_id UUID NOT NULL REFERENCES bands(id),
    tour_name TEXT NOT NULL,
    venue TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    ticket_url TEXT,
    ticketmaster_url TEXT,
    seatgeek_url TEXT,
    price TEXT,
    status TEXT DEFAULT 'upcoming',
    venue_capacity INTEGER,
    current_attendance INTEGER DEFAULT 0,
    crowd_energy_level REAL DEFAULT 0.0,
    last_energy_update TIMESTAMP DEFAULT NOW(),
    attendee_count INTEGER DEFAULT 0,
    energy_metrics JSONB DEFAULT '{}'::jsonb
);

-- Concert attendance tracking for badges
CREATE TABLE IF NOT EXISTS concert_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tour_id UUID REFERENCES tours(id),
    venue_name VARCHAR NOT NULL,
    band_name VARCHAR NOT NULL,
    attendance_date TIMESTAMP NOT NULL,
    verification_method VARCHAR,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Community posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type VARCHAR DEFAULT 'text',
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id),
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    parent_id UUID,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id),
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Post comment likes table
CREATE TABLE IF NOT EXISTS post_comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES post_comments(id),
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    band_id UUID NOT NULL REFERENCES bands(id),
    stagename TEXT NOT NULL,
    rating INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    review_type TEXT NOT NULL,
    target_name TEXT,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    band_id UUID REFERENCES bands(id),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id),
    author_stagename TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Comments system for reviews, bands, and other content
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id),
    author_stagename TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    parent_comment_id UUID REFERENCES comments(id),
    likes INTEGER DEFAULT 0,
    dislikes INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    deleted_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Comment reactions for more detailed engagement
CREATE TABLE IF NOT EXISTS comment_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES comments(id),
    user_id UUID NOT NULL REFERENCES users(id),
    reaction_type TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Message Board (The Pit) Tables
CREATE TABLE IF NOT EXISTS pit_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_name VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    content VARCHAR(2000) NOT NULL,
    category VARCHAR DEFAULT 'general',
    likes INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    is_pinned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User location data for proximity matching
CREATE TABLE IF NOT EXISTS user_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    accuracy REAL,
    venue_name VARCHAR,
    event_name VARCHAR,
    is_at_concert BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Concert proximity matches for connecting users at same venues
CREATE TABLE IF NOT EXISTS proximity_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    user_id_2 UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    distance REAL,
    venue_name VARCHAR,
    event_name VARCHAR,
    match_type VARCHAR DEFAULT 'concert',
    is_active BOOLEAN DEFAULT true,
    last_seen TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Pit replies table
CREATE TABLE IF NOT EXISTS pit_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES pit_messages(id) ON DELETE CASCADE,
    author_name VARCHAR NOT NULL,
    content VARCHAR(1000) NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User following/followers system
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id),
    following_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced reactions system
CREATE TABLE IF NOT EXISTS reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    target_type VARCHAR NOT NULL,
    target_id UUID NOT NULL,
    reaction_type VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User achievements/badges system
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    criteria JSONB NOT NULL,
    points_value INTEGER DEFAULT 0,
    rarity VARCHAR DEFAULT 'common',
    created_at TIMESTAMP DEFAULT NOW()
);

-- User achievements tracking
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    achievement_id UUID NOT NULL REFERENCES achievements(id),
    earned_at TIMESTAMP DEFAULT NOW(),
    progress INTEGER DEFAULT 0
);

-- Notification system
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    action_url VARCHAR,
    from_user_id UUID REFERENCES users(id),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User activity feed
CREATE TABLE IF NOT EXISTS activity_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    activity_type VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    target_type VARCHAR,
    target_id UUID,
    metadata JSONB,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Community polls and voting
CREATE TABLE IF NOT EXISTS polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR NOT NULL,
    description TEXT,
    options JSONB NOT NULL,
    voting_end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    total_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Poll votes
CREATE TABLE IF NOT EXISTS poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id),
    user_id UUID NOT NULL REFERENCES users(id),
    option_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Events and meetups
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR NOT NULL,
    description TEXT,
    event_type VARCHAR NOT NULL,
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id),
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR DEFAULT 'attending',
    joined_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced reviews with detailed ratings
CREATE TABLE IF NOT EXISTS review_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant1_id UUID NOT NULL REFERENCES users(id),
    participant2_id UUID NOT NULL REFERENCES users(id),
    last_message_at TIMESTAMP DEFAULT NOW(),
    is_archived BOOLEAN DEFAULT false,
    is_encrypted BOOLEAN DEFAULT true,
    participant1_public_key TEXT,
    participant2_public_key TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Direct messages
CREATE TABLE IF NOT EXISTS direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    message_type VARCHAR NOT NULL DEFAULT 'text',
    encrypted_content TEXT,
    encrypted_media_url TEXT,
    media_metadata JSONB,
    thumbnail_url TEXT,
    encryption_key_id VARCHAR,
    initialization_vector VARCHAR,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Message encryption keys
CREATE TABLE IF NOT EXISTS message_encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    public_key TEXT NOT NULL,
    private_key_encrypted TEXT NOT NULL,
    key_type VARCHAR DEFAULT 'rsa',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Message delivery receipts
CREATE TABLE IF NOT EXISTS message_delivery_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES direct_messages(id),
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR NOT NULL,
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

-- Enable Row Level Security (RLS) for all tables that need it
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE concert_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pit_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pit_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE proximity_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_delivery_receipts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "user_sessions_select_self" ON user_sessions;
DROP POLICY IF EXISTS "user_sessions_insert_self" ON user_sessions;
DROP POLICY IF EXISTS "user_sessions_update_self" ON user_sessions;
DROP POLICY IF EXISTS "user_sessions_delete_self" ON user_sessions;
DROP POLICY IF EXISTS "admin_full_access_user_sessions" ON user_sessions;

-- User Sessions table RLS policies
CREATE POLICY "user_sessions_select_self" ON user_sessions 
FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "user_sessions_insert_self" ON user_sessions 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_sessions_update_self" ON user_sessions 
FOR UPDATE TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_sessions_delete_self" ON user_sessions 
FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "admin_full_access_user_sessions" ON user_sessions 
FOR ALL TO service_role 
USING (true);

-- Users table policies
CREATE POLICY "Users can view own profile" ON users 
FOR SELECT TO authenticated 
USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON users 
FOR UPDATE TO authenticated 
USING (id = auth.uid());

-- Public read access for bands, tours, reviews, photos (community content)
CREATE POLICY "bands_public_read" ON bands FOR SELECT TO authenticated USING (true);
CREATE POLICY "bands_owner_write" ON bands FOR ALL TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "tours_public_read" ON tours FOR SELECT TO authenticated USING (true);
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "photos_public_read" ON photos FOR SELECT TO authenticated USING (true);

-- User-specific content policies
CREATE POLICY "posts_owner_full" ON posts FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "posts_public_read" ON posts FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY "comments_owner_full" ON comments FOR ALL TO authenticated USING (author_id = auth.uid());
CREATE POLICY "comments_public_read" ON comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "messages_owner_full" ON messages FOR ALL TO authenticated USING (author_id = auth.uid());
CREATE POLICY "messages_public_read" ON messages FOR SELECT TO authenticated USING (true);

-- User badges and achievements
CREATE POLICY "user_badges_owner" ON user_badges FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_achievements_owner" ON user_achievements FOR ALL TO authenticated USING (user_id = auth.uid());

-- Activity feed and social features
CREATE POLICY "activity_feed_owner" ON activity_feed FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "activity_feed_public_read" ON activity_feed FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY "user_follows_participant" ON user_follows FOR ALL TO authenticated 
USING (follower_id = auth.uid() OR following_id = auth.uid());

-- Reactions and engagement
CREATE POLICY "reactions_owner" ON reactions FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "comment_reactions_owner" ON comment_reactions FOR ALL TO authenticated USING (user_id = auth.uid());

-- Post interactions
CREATE POLICY "post_likes_owner" ON post_likes FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "post_comments_owner" ON post_comments FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "post_comments_public_read" ON post_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "post_comment_likes_owner" ON post_comment_likes FOR ALL TO authenticated USING (user_id = auth.uid());

-- Events and attendance
CREATE POLICY "events_owner_full" ON events FOR ALL TO authenticated USING (organizer_id = auth.uid());
CREATE POLICY "events_public_read" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "event_attendees_participant" ON event_attendees FOR ALL TO authenticated USING (user_id = auth.uid());

-- Polls and voting
CREATE POLICY "polls_owner_full" ON polls FOR ALL TO authenticated USING (creator_id = auth.uid());
CREATE POLICY "polls_public_read" ON polls FOR SELECT TO authenticated USING (true);
CREATE POLICY "poll_votes_owner" ON poll_votes FOR ALL TO authenticated USING (user_id = auth.uid());

-- Concert attendance and proximity
CREATE POLICY "concert_attendance_owner" ON concert_attendance FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "proximity_matches_participant" ON proximity_matches FOR ALL TO authenticated 
USING (user_id_1 = auth.uid() OR user_id_2 = auth.uid());

-- Pit messages (public forum)
CREATE POLICY "pit_messages_public" ON pit_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "pit_messages_authenticated_write" ON pit_messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "pit_replies_public" ON pit_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "pit_replies_authenticated_write" ON pit_replies FOR INSERT TO authenticated WITH CHECK (true);

-- Review ratings
CREATE POLICY "review_ratings_public_read" ON review_ratings FOR SELECT TO authenticated USING (true);

-- Notifications - users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications 
FOR SELECT TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert notifications" ON notifications 
FOR INSERT TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON notifications 
FOR UPDATE TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- User locations - users can only see their own location data
CREATE POLICY "Users can view own location" ON user_locations 
FOR SELECT TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own location" ON user_locations 
FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own location" ON user_locations 
FOR UPDATE TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own location" ON user_locations 
FOR DELETE TO authenticated 
USING (user_id = auth.uid());

-- Message encryption keys - users can only see their own keys
CREATE POLICY "Users can view own encryption keys" ON message_encryption_keys 
FOR SELECT TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own encryption keys" ON message_encryption_keys 
FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own encryption keys" ON message_encryption_keys 
FOR UPDATE TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Conversations - users can only see their own conversations
CREATE POLICY "Users can view own conversations" ON conversations 
FOR SELECT TO authenticated 
USING (participant1_id = auth.uid() OR participant2_id = auth.uid());

CREATE POLICY "Users can insert conversations" ON conversations 
FOR INSERT TO authenticated 
WITH CHECK (participant1_id = auth.uid() OR participant2_id = auth.uid());

CREATE POLICY "Users can update own conversations" ON conversations 
FOR UPDATE TO authenticated 
USING (participant1_id = auth.uid() OR participant2_id = auth.uid())
WITH CHECK (participant1_id = auth.uid() OR participant2_id = auth.uid());

-- Direct messages - users can only see messages in their conversations
CREATE POLICY "Users can view own messages" ON direct_messages 
FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1
        FROM   conversations
        WHERE  conversations.id = direct_messages.conversation_id
          AND (conversations.participant1_id = auth.uid()
               OR conversations.participant2_id = auth.uid())
    )
);

CREATE POLICY "Users can insert messages in own conversations" ON direct_messages
FOR INSERT
TO authenticated
WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
        SELECT 1
        FROM   conversations
        WHERE  conversations.id = direct_messages.conversation_id
          AND (conversations.participant1_id = auth.uid()
               OR conversations.participant2_id = auth.uid())
    )
);

CREATE POLICY "Users can update own messages" ON direct_messages 
FOR UPDATE TO authenticated 
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- Message delivery receipts
CREATE POLICY "message_delivery_receipts_participant" ON message_delivery_receipts 
FOR ALL TO authenticated 
USING (user_id = auth.uid());

-- Insert some initial data with conflict resolution
INSERT INTO badges (name, description, icon, category, requirement, rarity, points)
VALUES 
('First Review', 'Posted your first review', '⭐', 'content', '{"type": "count", "action": "review", "threshold": 1}', 'common', 10),
('Concert Goer', 'Attended your first concert', '🎵', 'engagement', '{"type": "count", "action": "concert_attendance", "threshold": 1}', 'common', 15),
('Social Butterfly', 'Made 10 friends', '🦋', 'social', '{"type": "count", "action": "friends", "threshold": 10}', 'rare', 25),
('Metal Head', 'Posted 50 reviews', '🤘', 'content', '{"type": "count", "action": "review", "threshold": 50}', 'epic', 100)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    requirement = EXCLUDED.requirement,
    rarity = EXCLUDED.rarity,
    points = EXCLUDED.points;

-- Success message
SELECT 'MetalUnion database schema created successfully with user_sessions table and all RLS policies!' as status;
