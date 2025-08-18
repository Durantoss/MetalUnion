import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, index, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for authentication with enhanced social features
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stagename: varchar("stagename").unique(),
  bio: text("bio"),
  location: varchar("location"),
  favoriteGenres: text("favorite_genres").array(),
  // Gamification fields
  reputationPoints: integer("reputation_points").default(0),
  badges: text("badges").array(),
  // Social features
  isOnline: boolean("is_online").default(false),
  lastActive: timestamp("last_active").defaultNow(),
  loginStreak: integer("login_streak").default(0),
  totalReviews: integer("total_reviews").default(0),
  totalPhotos: integer("total_photos").default(0),
  totalLikes: integer("total_likes").default(0),
  // Preferences
  notificationSettings: jsonb("notification_settings"),
  theme: varchar("theme").default("dark"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bands = pgTable("bands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  genre: text("genre").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  founded: integer("founded"),
  members: text("members").array(),
  albums: text("albums").array(),
  website: text("website"),
  instagram: text("instagram"),
  ownerId: varchar("owner_id").references(() => users.id),
  status: text("status").default("pending"), // 'pending', 'approved', 'rejected'
  submittedAt: timestamp("submitted_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bandId: varchar("band_id").notNull().references(() => bands.id),
  stagename: text("stagename").notNull(),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  reviewType: text("review_type").notNull(), // 'band', 'album', 'concert'
  targetName: text("target_name"), // album name or concert venue
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const photos = pgTable("photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bandId: varchar("band_id").references(() => bands.id),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(), // 'live', 'promo', 'backstage', 'equipment'
  uploadedBy: text("uploaded_by").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tours = pgTable("tours", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bandId: varchar("band_id").notNull().references(() => bands.id),
  tourName: text("tour_name").notNull(),
  venue: text("venue").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  date: timestamp("date").notNull(),
  ticketUrl: text("ticket_url"),
  ticketmasterUrl: text("ticketmaster_url"),
  seatgeekUrl: text("seatgeek_url"),
  price: text("price"),
  status: text("status").default("upcoming"), // 'upcoming', 'sold_out', 'cancelled'
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  authorStagename: text("author_stagename").notNull(),
  category: text("category").default("general"), // 'general', 'band_discussion', 'gear', 'events'
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comments system for reviews, bands, and other content
export const comments: any = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  authorStagename: text("author_stagename").notNull(),
  // Polymorphic relationships - comment can be on different types of content
  targetType: text("target_type").notNull(), // 'review', 'band', 'photo', 'tour', 'message'
  targetId: varchar("target_id").notNull(), // ID of the target (review ID, band ID, etc.)
  // Thread support for nested comments
  parentCommentId: varchar("parent_comment_id").references((): any => comments.id),
  // Engagement metrics
  likes: integer("likes").default(0),
  dislikes: integer("dislikes").default(0),
  // Status and moderation
  isEdited: boolean("is_edited").default(false),
  isDeleted: boolean("is_deleted").default(false),
  deletedReason: text("deleted_reason"),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Comment reactions for more detailed engagement
export const commentReactions = pgTable("comment_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commentId: varchar("comment_id").notNull().references(() => comments.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  reactionType: text("reaction_type").notNull(), // 'like', 'dislike', 'love', 'angry', 'laugh'
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedBands: many(bands),
  messages: many(messages),
  // Comments system
  comments: many(comments),
  commentReactions: many(commentReactions),
  // Following system
  following: many(userFollows, { relationName: "follower" }),
  followers: many(userFollows, { relationName: "following" }),
  // Social features
  reactions: many(reactions),
  achievements: many(userAchievements),
  notifications: many(notifications, { relationName: "recipient" }),
  sentNotifications: many(notifications, { relationName: "sender" }),
  activities: many(activityFeed),
  // Content
  createdPolls: many(polls),
  pollVotes: many(pollVotes),
  organizedEvents: many(events),
  eventAttendances: many(eventAttendees),
  savedItems: many(savedContent),
  photoAlbums: many(photoAlbums),
  // Messaging
  conversationsAsParticipant1: many(conversations, { relationName: "participant1" }),
  conversationsAsParticipant2: many(conversations, { relationName: "participant2" }),
  sentMessages: many(directMessages),
  encryptionKeys: many(messageEncryptionKeys),
  deliveryReceipts: many(messageDeliveryReceipts),
}));

export const bandsRelations = relations(bands, ({ one, many }) => ({
  owner: one(users, {
    fields: [bands.ownerId],
    references: [users.id],
  }),
  reviews: many(reviews),
  photos: many(photos),
  tours: many(tours),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  band: one(bands, {
    fields: [reviews.bandId],
    references: [bands.id],
  }),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  band: one(bands, {
    fields: [photos.bandId],
    references: [bands.id],
  }),
}));

export const toursRelations = relations(tours, ({ one }) => ({
  band: one(bands, {
    fields: [tours.bandId],
    references: [bands.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  author: one(users, {
    fields: [messages.authorId],
    references: [users.id],
  }),
}));

// Comment relations
export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  parentComment: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: "parentChild",
  }),
  replies: many(comments, { relationName: "parentChild" }),
  reactions: many(commentReactions),
}));

export const commentReactionsRelations = relations(commentReactions, ({ one }) => ({
  comment: one(comments, {
    fields: [commentReactions.commentId],
    references: [comments.id],
  }),
  user: one(users, {
    fields: [commentReactions.userId],
    references: [users.id],
  }),
}));

export const insertBandSchema = createInsertSchema(bands).omit({
  id: true,
  ownerId: true,
  status: true,
  submittedAt: true,
  approvedAt: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  likes: true,
  createdAt: true,
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  createdAt: true,
});

export const insertTourSchema = createInsertSchema(tours).omit({
  id: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  likes: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  likes: true,
  dislikes: true,
  isEdited: true,
  isDeleted: true,
  deletedReason: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommentReactionSchema = createInsertSchema(commentReactions).omit({
  id: true,
  createdAt: true,
});



export type Band = typeof bands.$inferSelect;
export type InsertBand = z.infer<typeof insertBandSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Tour = typeof tours.$inferSelect;
export type InsertTour = z.infer<typeof insertTourSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type CommentReaction = typeof commentReactions.$inferSelect;
export type InsertCommentReaction = z.infer<typeof insertCommentReactionSchema>;



export const upsertUserSchema = createInsertSchema(users);
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Message Board (The Pit) Tables
export const pitMessages = pgTable("pit_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorName: varchar("author_name").notNull(),
  title: varchar("title").notNull(),
  content: varchar("content", { length: 2000 }).notNull(),
  category: varchar("category", { enum: ["general", "bands", "tours", "gear", "news"] }).default("general"),
  likes: integer("likes").default(0),
  replies: integer("replies").default(0),
  isPinned: integer("is_pinned").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pitReplies = pgTable("pit_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").references(() => pitMessages.id, { onDelete: "cascade" }),
  authorName: varchar("author_name").notNull(),
  content: varchar("content", { length: 1000 }).notNull(),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// User following/followers system
export const userFollows = pgTable("user_follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull().references(() => users.id),
  followingId: varchar("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced reactions system
export const reactions = pgTable("reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  targetType: varchar("target_type").notNull(), // 'review', 'pitMessage', 'pitReply', 'photo'
  targetId: varchar("target_id").notNull(),
  reactionType: varchar("reaction_type").notNull(), // 'like', 'fire', 'rock', 'mind_blown', 'heart'
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievements/badges system
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  icon: varchar("icon").notNull(),
  category: varchar("category").notNull(), // 'social', 'content', 'engagement', 'time'
  criteria: jsonb("criteria").notNull(), // Conditions to earn the badge
  pointsValue: integer("points_value").default(0),
  rarity: varchar("rarity").default("common"), // 'common', 'rare', 'epic', 'legendary'
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id),
  earnedAt: timestamp("earned_at").defaultNow(),
  progress: integer("progress").default(0),
});

// Notification system
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'follow', 'like', 'reply', 'mention', 'achievement'
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  actionUrl: varchar("action_url"),
  fromUserId: varchar("from_user_id").references(() => users.id),
  metadata: jsonb("metadata"), // Additional data like targetId, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// User activity feed
export const activityFeed = pgTable("activity_feed", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  activityType: varchar("activity_type").notNull(), // 'review_posted', 'photo_uploaded', 'band_followed'
  title: varchar("title").notNull(),
  description: text("description"),
  targetType: varchar("target_type"), // 'band', 'review', 'photo', 'user'
  targetId: varchar("target_id"),
  metadata: jsonb("metadata"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community polls and voting
export const polls = pgTable("polls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  options: jsonb("options").notNull(), // Array of poll options
  votingEndDate: timestamp("voting_end_date"),
  isActive: boolean("is_active").default(true),
  totalVotes: integer("total_votes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pollVotes = pgTable("poll_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pollId: varchar("poll_id").notNull().references(() => polls.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  optionIndex: integer("option_index").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});



// Events and meetups
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  eventType: varchar("event_type").notNull(), // 'meetup', 'listening_party', 'concert_group'
  location: varchar("location"),
  virtualLink: varchar("virtual_link"),
  dateTime: timestamp("date_time").notNull(),
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  isActive: boolean("is_active").default(true),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventAttendees = pgTable("event_attendees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status").default("attending"), // 'attending', 'interested', 'declined'
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Enhanced reviews with detailed ratings
export const reviewRatings = pgTable("review_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewId: varchar("review_id").notNull().references(() => reviews.id),
  soundQuality: integer("sound_quality"),
  stagePresence: integer("stage_presence"),
  crowdEnergy: integer("crowd_energy"),
  setlist: integer("setlist"),
  venue: integer("venue"),
  overall: integer("overall").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Secure Direct Messaging System with End-to-End Encryption
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participant1Id: varchar("participant1_id").notNull().references(() => users.id),
  participant2Id: varchar("participant2_id").notNull().references(() => users.id),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  isArchived: boolean("is_archived").default(false),
  isEncrypted: boolean("is_encrypted").default(true),
  participant1PublicKey: text("participant1_public_key"), // For end-to-end encryption
  participant2PublicKey: text("participant2_public_key"), // For end-to-end encryption
  createdAt: timestamp("created_at").defaultNow(),
});

export const directMessages = pgTable("direct_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  messageType: varchar("message_type", { enum: ['text', 'image', 'video', 'file'] }).notNull(),
  
  // Encrypted content fields
  encryptedContent: text("encrypted_content"), // Encrypted message text
  encryptedMediaUrl: text("encrypted_media_url"), // Encrypted media URL for images/videos
  mediaMetadata: jsonb("media_metadata"), // File size, type, duration, etc.
  thumbnailUrl: text("thumbnail_url"), // For video previews
  
  // Encryption metadata
  encryptionKeyId: varchar("encryption_key_id"), // For key rotation
  initializationVector: varchar("initialization_vector"), // For AES encryption
  
  // Message status and security
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: timestamp("deleted_at"),
  expiresAt: timestamp("expires_at"), // For disappearing messages
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const messageEncryptionKeys = pgTable("message_encryption_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  publicKey: text("public_key").notNull(),
  privateKeyEncrypted: text("private_key_encrypted").notNull(), // User's encrypted private key
  keyType: varchar("key_type", { enum: ['rsa', 'ecc'] }).default('rsa'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const messageDeliveryReceipts = pgTable("message_delivery_receipts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull().references(() => directMessages.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status", { enum: ['sent', 'delivered', 'read'] }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// User Groups & Communities
export const userGroups = pgTable("user_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // 'genre', 'location', 'interest'
  isPrivate: boolean("is_private").default(false),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  memberCount: integer("member_count").default(0),
  avatarUrl: varchar("avatar_url"),
  tags: text("tags").array(),
  rules: text("rules"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groupMembers = pgTable("group_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => userGroups.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role").default("member"), // 'admin', 'moderator', 'member'
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const groupPosts = pgTable("group_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => userGroups.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  title: varchar("title"),
  content: text("content").notNull(),
  postType: varchar("post_type").default("text"), // 'text', 'poll', 'event', 'photo'
  isPinned: boolean("is_pinned").default(false),
  likes: integer("likes").default(0),
  commentsCount: integer("comments_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mentorship System
export const mentorProfiles = pgTable("mentor_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  bio: text("bio").notNull(),
  expertise: text("expertise").array(), // 'concert_photography', 'band_discovery', 'venue_knowledge'
  experience: varchar("experience").notNull(), // 'beginner', 'intermediate', 'expert'
  languages: text("languages").array(),
  availability: varchar("availability").default("flexible"), // 'flexible', 'weekends', 'evenings'
  maxMentees: integer("max_mentees").default(3),
  currentMentees: integer("current_mentees").default(0),
  rating: real("rating").default(0),
  totalSessions: integer("total_sessions").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mentorships = pgTable("mentorships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mentorId: varchar("mentor_id").notNull().references(() => users.id),
  menteeId: varchar("mentee_id").notNull().references(() => users.id),
  status: varchar("status").default("pending"), // 'pending', 'active', 'completed', 'cancelled'
  focus: text("focus").array(), // What areas they're working on
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  totalSessions: integer("total_sessions").default(0),
  lastSessionDate: timestamp("last_session_date"),
  notes: text("notes"),
  menteeRating: integer("mentee_rating"), // 1-5 stars from mentee
  mentorRating: integer("mentor_rating"), // 1-5 stars from mentor
  createdAt: timestamp("created_at").defaultNow(),
});

// Social Media Integration
export const socialConnections = pgTable("social_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  platform: varchar("platform").notNull(), // 'instagram', 'twitter', 'youtube', 'spotify'
  username: varchar("username").notNull(),
  profileUrl: varchar("profile_url"),
  isVerified: boolean("is_verified").default(false),
  isPublic: boolean("is_public").default(true),
  followerCount: integer("follower_count"),
  connectedAt: timestamp("connected_at").defaultNow(),
});

// Enhanced Reactions System
export const reactionTypes = pgTable("reaction_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  emoji: varchar("emoji").notNull(),
  category: varchar("category").notNull(), // 'emotion', 'music', 'approval'
  isActive: boolean("is_active").default(true),
});

export const contentReactions = pgTable("content_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  targetType: varchar("target_type").notNull(), // 'review', 'photo', 'post', 'comment'
  targetId: varchar("target_id").notNull(),
  reactionTypeId: varchar("reaction_type_id").notNull().references(() => reactionTypes.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Live Chat Rooms
export const chatRooms = pgTable("chat_rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  topic: varchar("topic"), // 'general', 'concert_live', 'band_discussion'
  description: text("description"),
  isActive: boolean("is_active").default(true),
  maxUsers: integer("max_users").default(100),
  currentUsers: integer("current_users").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull().references(() => chatRooms.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  messageType: varchar("message_type").default("text"), // 'text', 'emoji', 'system'
  replyToId: varchar("reply_to_id").references(() => chatMessages.id),
  isEdited: boolean("is_edited").default(false),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatParticipants = pgTable("chat_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull().references(() => chatRooms.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role").default("member"), // 'admin', 'moderator', 'member'
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen").defaultNow(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// User Connections & Friends
export const friendRequests = pgTable("friend_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  status: varchar("status").default("pending"), // 'pending', 'accepted', 'rejected'
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

export const userConnections = pgTable("user_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId1: varchar("user_id1").notNull().references(() => users.id),
  userId2: varchar("user_id2").notNull().references(() => users.id),
  connectionType: varchar("connection_type").default("friend"), // 'friend', 'close_friend', 'favorite'
  createdAt: timestamp("created_at").defaultNow(),
});

// User saved content
export const savedContent = pgTable("saved_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  contentType: varchar("content_type").notNull(), // 'review', 'photo', 'pitMessage', 'band'
  contentId: varchar("content_id").notNull(),
  savedAt: timestamp("saved_at").defaultNow(),
});

// Photo galleries/albums
export const photoAlbums = pgTable("photo_albums", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(true),
  coverPhotoId: varchar("cover_photo_id"),
  photoCount: integer("photo_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const albumPhotos = pgTable("album_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  albumId: varchar("album_id").notNull().references(() => photoAlbums.id),
  photoId: varchar("photo_id").notNull().references(() => photos.id),
  orderIndex: integer("order_index").default(0),
  addedAt: timestamp("added_at").defaultNow(),
});

// Relations for message board
export const pitMessagesRelations = relations(pitMessages, ({ many }) => ({
  replies: many(pitReplies),
}));

export const pitRepliesRelations = relations(pitReplies, ({ one }) => ({
  message: one(pitMessages, {
    fields: [pitReplies.messageId],
    references: [pitMessages.id],
  }),
}));

// Additional relations for new tables
export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [userFollows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, {
    fields: [reactions.userId],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
    relationName: "recipient",
  }),
  fromUser: one(users, {
    fields: [notifications.fromUserId],
    references: [users.id],
    relationName: "sender",
  }),
}));

export const activityFeedRelations = relations(activityFeed, ({ one }) => ({
  user: one(users, {
    fields: [activityFeed.userId],
    references: [users.id],
  }),
}));

export const pollsRelations = relations(polls, ({ one, many }) => ({
  creator: one(users, {
    fields: [polls.creatorId],
    references: [users.id],
  }),
  votes: many(pollVotes),
}));

export const pollVotesRelations = relations(pollVotes, ({ one }) => ({
  poll: one(polls, {
    fields: [pollVotes.pollId],
    references: [polls.id],
  }),
  user: one(users, {
    fields: [pollVotes.userId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  attendees: many(eventAttendees),
}));

export const eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
  event: one(events, {
    fields: [eventAttendees.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventAttendees.userId],
    references: [users.id],
  }),
}));

export const reviewRatingsRelations = relations(reviewRatings, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewRatings.reviewId],
    references: [reviews.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  participant1: one(users, {
    fields: [conversations.participant1Id],
    references: [users.id],
    relationName: "participant1",
  }),
  participant2: one(users, {
    fields: [conversations.participant2Id],
    references: [users.id],
    relationName: "participant2",
  }),
  messages: many(directMessages),
}));

export const directMessagesRelations = relations(directMessages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [directMessages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [directMessages.senderId],
    references: [users.id],
  }),
}));

export const savedContentRelations = relations(savedContent, ({ one }) => ({
  user: one(users, {
    fields: [savedContent.userId],
    references: [users.id],
  }),
}));

export const photoAlbumsRelations = relations(photoAlbums, ({ one, many }) => ({
  user: one(users, {
    fields: [photoAlbums.userId],
    references: [users.id],
  }),
  albumPhotos: many(albumPhotos),
}));

export const albumPhotosRelations = relations(albumPhotos, ({ one }) => ({
  album: one(photoAlbums, {
    fields: [albumPhotos.albumId],
    references: [photoAlbums.id],
  }),
  photo: one(photos, {
    fields: [albumPhotos.photoId],
    references: [photos.id],
  }),
}));

// Relations for new social features
export const userGroupsRelations = relations(userGroups, ({ one, many }) => ({
  creator: one(users, {
    fields: [userGroups.creatorId],
    references: [users.id],
  }),
  members: many(groupMembers),
  posts: many(groupPosts),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(userGroups, {
    fields: [groupMembers.groupId],
    references: [userGroups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

export const groupPostsRelations = relations(groupPosts, ({ one }) => ({
  group: one(userGroups, {
    fields: [groupPosts.groupId],
    references: [userGroups.id],
  }),
  author: one(users, {
    fields: [groupPosts.authorId],
    references: [users.id],
  }),
}));

export const mentorProfilesRelations = relations(mentorProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [mentorProfiles.userId],
    references: [users.id],
  }),
  mentorships: many(mentorships, { relationName: "mentor" }),
}));

export const mentorshipsRelations = relations(mentorships, ({ one }) => ({
  mentor: one(users, {
    fields: [mentorships.mentorId],
    references: [users.id],
    relationName: "mentor",
  }),
  mentee: one(users, {
    fields: [mentorships.menteeId],
    references: [users.id],
    relationName: "mentee",
  }),
}));

export const socialConnectionsRelations = relations(socialConnections, ({ one }) => ({
  user: one(users, {
    fields: [socialConnections.userId],
    references: [users.id],
  }),
}));

export const contentReactionsRelations = relations(contentReactions, ({ one }) => ({
  user: one(users, {
    fields: [contentReactions.userId],
    references: [users.id],
  }),
  reactionType: one(reactionTypes, {
    fields: [contentReactions.reactionTypeId],
    references: [reactionTypes.id],
  }),
}));

export const chatRoomsRelations = relations(chatRooms, ({ many }) => ({
  messages: many(chatMessages),
  participants: many(chatParticipants),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  room: one(chatRooms, {
    fields: [chatMessages.roomId],
    references: [chatRooms.id],
  }),
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
  replyTo: one(chatMessages, {
    fields: [chatMessages.replyToId],
    references: [chatMessages.id],
    relationName: "reply",
  }),
}));

export const chatParticipantsRelations = relations(chatParticipants, ({ one }) => ({
  room: one(chatRooms, {
    fields: [chatParticipants.roomId],
    references: [chatRooms.id],
  }),
  user: one(users, {
    fields: [chatParticipants.userId],
    references: [users.id],
  }),
}));

export const friendRequestsRelations = relations(friendRequests, ({ one }) => ({
  sender: one(users, {
    fields: [friendRequests.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [friendRequests.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

export const userConnectionsRelations = relations(userConnections, ({ one }) => ({
  user1: one(users, {
    fields: [userConnections.userId1],
    references: [users.id],
    relationName: "user1",
  }),
  user2: one(users, {
    fields: [userConnections.userId2],
    references: [users.id],
    relationName: "user2",
  }),
}));

// Insert schemas for message board
export const insertPitMessageSchema = createInsertSchema(pitMessages).omit({
  id: true,
  likes: true,
  replies: true,
  isPinned: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPitReplySchema = createInsertSchema(pitReplies).omit({
  id: true,
  likes: true,
  createdAt: true,
});

// Types for message board
export type PitMessage = typeof pitMessages.$inferSelect;
export type InsertPitMessage = z.infer<typeof insertPitMessageSchema>;
export type PitReply = typeof pitReplies.$inferSelect;
export type InsertPitReply = z.infer<typeof insertPitReplySchema>;

// Insert schemas for all new tables
export const insertUserFollowSchema = createInsertSchema(userFollows).omit({ id: true, createdAt: true });
export const insertReactionSchema = createInsertSchema(reactions).omit({ id: true, createdAt: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true, createdAt: true });
export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ id: true, earnedAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, isRead: true });
export const insertActivityFeedSchema = createInsertSchema(activityFeed).omit({ id: true, createdAt: true });
export const insertPollSchema = createInsertSchema(polls).omit({ id: true, createdAt: true, totalVotes: true });
export const insertPollVoteSchema = createInsertSchema(pollVotes).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true, currentAttendees: true });
export const insertEventAttendeeSchema = createInsertSchema(eventAttendees).omit({ id: true, joinedAt: true });
export const insertReviewRatingSchema = createInsertSchema(reviewRatings).omit({ id: true, createdAt: true });
// Messaging schemas
export const insertConversationSchema = createInsertSchema(conversations).omit({ 
  id: true, 
  createdAt: true, 
  lastMessageAt: true 
});

export const insertDirectMessageSchema = createInsertSchema(directMessages).omit({ 
  id: true, 
  createdAt: true, 
  deliveredAt: true, 
  readAt: true, 
  isDeleted: true, 
  deletedAt: true 
});

export const insertMessageEncryptionKeySchema = createInsertSchema(messageEncryptionKeys).omit({ 
  id: true, 
  createdAt: true 
});

export const insertMessageDeliveryReceiptSchema = createInsertSchema(messageDeliveryReceipts).omit({ 
  id: true, 
  timestamp: true 
});
export const insertSavedContentSchema = createInsertSchema(savedContent).omit({ id: true, savedAt: true });
export const insertPhotoAlbumSchema = createInsertSchema(photoAlbums).omit({ id: true, createdAt: true, photoCount: true });
export const insertAlbumPhotoSchema = createInsertSchema(albumPhotos).omit({ id: true, addedAt: true });

// Insert schemas for new social features
export const insertUserGroupSchema = createInsertSchema(userGroups).omit({ id: true, createdAt: true, memberCount: true });
export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({ id: true, joinedAt: true });
export const insertGroupPostSchema = createInsertSchema(groupPosts).omit({ id: true, createdAt: true, likes: true, commentsCount: true });
export const insertMentorProfileSchema = createInsertSchema(mentorProfiles).omit({ id: true, createdAt: true, currentMentees: true, rating: true, totalSessions: true });
export const insertMentorshipSchema = createInsertSchema(mentorships).omit({ id: true, createdAt: true, totalSessions: true });
export const insertSocialConnectionSchema = createInsertSchema(socialConnections).omit({ id: true, connectedAt: true, isVerified: true });
export const insertReactionTypeSchema = createInsertSchema(reactionTypes).omit({ id: true });
export const insertContentReactionSchema = createInsertSchema(contentReactions).omit({ id: true, createdAt: true });
export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({ id: true, createdAt: true, currentUsers: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true, isEdited: true, isDeleted: true });
export const insertChatParticipantSchema = createInsertSchema(chatParticipants).omit({ id: true, joinedAt: true, lastSeen: true });
export const insertFriendRequestSchema = createInsertSchema(friendRequests).omit({ id: true, createdAt: true, respondedAt: true });
export const insertUserConnectionSchema = createInsertSchema(userConnections).omit({ id: true, createdAt: true });

// Types for all new tables
export type UserFollow = typeof userFollows.$inferSelect;
export type InsertUserFollow = z.infer<typeof insertUserFollowSchema>;
export type Reaction = typeof reactions.$inferSelect;
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type ActivityFeedItem = typeof activityFeed.$inferSelect;
export type InsertActivityFeedItem = z.infer<typeof insertActivityFeedSchema>;
export type Poll = typeof polls.$inferSelect;
export type InsertPoll = z.infer<typeof insertPollSchema>;
export type PollVote = typeof pollVotes.$inferSelect;
export type InsertPollVote = z.infer<typeof insertPollVoteSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventAttendee = typeof eventAttendees.$inferSelect;
export type InsertEventAttendee = z.infer<typeof insertEventAttendeeSchema>;

// Types for new social features
export type UserGroup = typeof userGroups.$inferSelect;
export type InsertUserGroup = z.infer<typeof insertUserGroupSchema>;
export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type GroupPost = typeof groupPosts.$inferSelect;
export type InsertGroupPost = z.infer<typeof insertGroupPostSchema>;
export type MentorProfile = typeof mentorProfiles.$inferSelect;
export type InsertMentorProfile = z.infer<typeof insertMentorProfileSchema>;
export type Mentorship = typeof mentorships.$inferSelect;
export type InsertMentorship = z.infer<typeof insertMentorshipSchema>;
export type SocialConnection = typeof socialConnections.$inferSelect;
export type InsertSocialConnection = z.infer<typeof insertSocialConnectionSchema>;
export type ReactionType = typeof reactionTypes.$inferSelect;
export type InsertReactionType = z.infer<typeof insertReactionTypeSchema>;
export type ContentReaction = typeof contentReactions.$inferSelect;
export type InsertContentReaction = z.infer<typeof insertContentReactionSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatParticipant = typeof chatParticipants.$inferSelect;
export type InsertChatParticipant = z.infer<typeof insertChatParticipantSchema>;
export type FriendRequest = typeof friendRequests.$inferSelect;
export type InsertFriendRequest = z.infer<typeof insertFriendRequestSchema>;
export type UserConnection = typeof userConnections.$inferSelect;
export type InsertUserConnection = z.infer<typeof insertUserConnectionSchema>;
export type ReviewRating = typeof reviewRatings.$inferSelect;
export type InsertReviewRating = z.infer<typeof insertReviewRatingSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type DirectMessage = typeof directMessages.$inferSelect;
export type InsertDirectMessage = z.infer<typeof insertDirectMessageSchema>;
export type MessageEncryptionKey = typeof messageEncryptionKeys.$inferSelect;
export type InsertMessageEncryptionKey = z.infer<typeof insertMessageEncryptionKeySchema>;
export type MessageDeliveryReceipt = typeof messageDeliveryReceipts.$inferSelect;
export type InsertMessageDeliveryReceipt = z.infer<typeof insertMessageDeliveryReceiptSchema>;
export type SavedContent = typeof savedContent.$inferSelect;
export type InsertSavedContent = z.infer<typeof insertSavedContentSchema>;
export type PhotoAlbum = typeof photoAlbums.$inferSelect;
export type InsertPhotoAlbum = z.infer<typeof insertPhotoAlbumSchema>;
export type AlbumPhoto = typeof albumPhotos.$inferSelect;
export type InsertAlbumPhoto = z.infer<typeof insertAlbumPhotoSchema>;
