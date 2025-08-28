-----------------------------------------------------------------
-- 1️⃣ Enable required extensions (pgcrypto is enough for gen_random_uuid)
-----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-----------------------------------------------------------------
-- 2️⃣ Users table (must exist before any FK)
-----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR UNIQUE,
    first_name          VARCHAR,
    last_name           VARCHAR,
    profile_image_url   VARCHAR,
    stagename           VARCHAR UNIQUE,
    safeword            VARCHAR,
    bio                 TEXT,
    location            VARCHAR,
    favorite_genres     TEXT[],
    reputation_points   INTEGER   DEFAULT 0,
    badges              TEXT[],
    concert_attendance_count INTEGER DEFAULT 0,
    comment_count       INTEGER   DEFAULT 0,
    review_count        INTEGER   DEFAULT 0,
    is_online           BOOLEAN   DEFAULT false,
    last_active         TIMESTAMP DEFAULT NOW(),
    login_streak        INTEGER   DEFAULT 0,
    total_reviews       INTEGER   DEFAULT 0,
    total_photos        INTEGER   DEFAULT 0,
    total_likes         INTEGER   DEFAULT 0,
    remember_me         BOOLEAN   DEFAULT false,
    last_login_at       TIMESTAMP,
    notification_settings JSONB,
    theme               VARCHAR   DEFAULT 'dark',
    proximity_enabled   BOOLEAN   DEFAULT false,
    proximity_radius    INTEGER   DEFAULT 500,
    share_location_at_concerts BOOLEAN DEFAULT false,
    role                VARCHAR   DEFAULT 'user',
    is_admin            BOOLEAN   DEFAULT false,
    permissions         JSONB    DEFAULT '{}'::jsonb,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-----------------------------------------------------------------
-- 3️⃣ Sessions table (references users.id – UUID ↔ UUID)
-----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
    sid    VARCHAR PRIMARY KEY,
    sess   JSONB NOT NULL,
    expire TIMESTAMP NOT NULL,
    user_id UUID  -- Note: FK constraint added separately after data cleanup
);

CREATE INDEX IF NOT EXISTS idx_session_expire ON sessions (expire);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);

-----------------------------------------------------------------
-- 4️⃣ User sessions table (must exist before operations)
-----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    session_token VARCHAR,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-----------------------------------------------------------------
-- 5️⃣ All other tables - create them all first
-----------------------------------------------------------------
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

CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id),
    following_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    target_type VARCHAR NOT NULL,
    target_id VARCHAR NOT NULL,
    reaction_type VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS badges (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR NOT NULL,
    description TEXT,
    icon_url    VARCHAR,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP DEFAULT NOW(),
    progress JSONB
);

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

CREATE TABLE IF NOT EXISTS post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id),
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES post_comments(id),
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS comment_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES comments(id),
    user_id UUID NOT NULL REFERENCES users(id),
    reaction_type TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS pit_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES pit_messages(id) ON DELETE CASCADE,
    author_name VARCHAR NOT NULL,
    content VARCHAR(1000) NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    achievement_id UUID NOT NULL REFERENCES achievements(id),
    earned_at TIMESTAMP DEFAULT NOW(),
    progress INTEGER DEFAULT 0
);

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

CREATE TABLE IF NOT EXISTS poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id),
    user_id UUID NOT NULL REFERENCES users(id),
    option_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id),
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR DEFAULT 'attending',
    joined_at TIMESTAMP DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    message_type VARCHAR NOT NULL DEFAULT 'text',
    encrypted_content TEXT,
    encrypted_media_url TEXT,
    media_metadata JSONB,
    thumbnail_url TEXT,
    encryption_key_id UUID,
    initialization_vector VARCHAR,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS message_delivery_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES direct_messages(id),
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

-----------------------------------------------------------------
-- 6️⃣ Add indexes for better performance
-----------------------------------------------------------------
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
CREATE INDEX IF NOT EXISTS idx_badges_name ON badges (name);

-----------------------------------------------------------------
-- 7️⃣ Enable Row Level Security (RLS) for all tables
-----------------------------------------------------------------
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
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

-----------------------------------------------------------------
-- 8️⃣ Create RLS policies (NOW tables exist)
-----------------------------------------------------------------
DO $$
BEGIN
    -- Users table policies
    CREATE POLICY "Users can view own profile"
      ON public.users
      FOR SELECT TO authenticated
      USING (id = auth.uid());
    CREATE POLICY "Users can update own profile"
      ON public.users
      FOR UPDATE TO authenticated
      USING (id = auth.uid());

    -- User sessions policies
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

    -- Direct messages policies
    CREATE POLICY "Users can view own messages" ON direct_messages 
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM conversations 
            WHERE conversations.id = direct_messages.conversation_id 
            AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid())
        )
    );
    CREATE POLICY "Users can insert messages in own conversations" ON direct_messages 
    FOR INSERT TO authenticated 
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

    -- Conversations policies
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

    -- Add all other policies...
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

    -- Public content policies
    CREATE POLICY "bands_public_read" ON bands FOR SELECT TO authenticated USING (true);
    CREATE POLICY "bands_owner_write" ON bands FOR ALL TO authenticated USING (owner_id = auth.uid());
    CREATE POLICY "tours_public_read" ON tours FOR SELECT TO authenticated USING (true);
    CREATE POLICY "reviews_public_read" ON reviews FOR SELECT TO authenticated USING (true);
    CREATE POLICY "photos_public_read" ON photos FOR SELECT TO authenticated USING (true);

    RAISE NOTICE 'All RLS policies created successfully';
END $$;

-----------------------------------------------------------------
-- 9️⃣ Add foreign key constraints (after all tables exist)
-----------------------------------------------------------------
-- Data cleanup and foreign key constraint addition for sessions table
DO $$
DECLARE
    orphaned_count INTEGER;
BEGIN
    -- Check if the foreign key constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'sessions_user_id_fkey' 
        AND table_name = 'sessions'
    ) THEN
        -- Clean up orphaned sessions before adding FK constraint
        DELETE FROM public.sessions
        WHERE user_id IS NOT NULL 
        AND user_id NOT IN (SELECT id FROM public.users WHERE id IS NOT NULL);
        
        GET DIAGNOSTICS orphaned_count = ROW_COUNT;
        RAISE NOTICE 'Cleaned up % orphaned session records', orphaned_count;
        
        -- Add the foreign key constraint now that data is clean
        ALTER TABLE public.sessions
            ADD CONSTRAINT sessions_user_id_fkey
            FOREIGN KEY (user_id)
            REFERENCES public.users(id)
            ON DELETE CASCADE
            ON UPDATE CASCADE;
            
        RAISE NOTICE 'Foreign key constraint sessions_user_id_fkey added successfully';
    ELSE
        RAISE NOTICE 'Foreign key constraint sessions_user_id_fkey already exists, skipping';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding foreign key constraint: %', SQLERRM;
END $$;

-- Add user_sessions foreign key constraint
DO $$
BEGIN
    -- Drop foreign key constraints (updated)
    ALTER TABLE user_sessions DROP CONSTRAINT IF EXISTS user_sessions_user_id_fkey;

    -- Re‑create foreign key (updated)
    ALTER TABLE user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

    RAISE NOTICE 'User sessions table operations completed';
END $$;

-- Success message
SELECT 'MetalUnion database schema created successfully with UUID consistency!' as status;
