import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, index, boolean } from "drizzle-orm/pg-core";
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
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  authorStagename: text("author_stagename").notNull(),
  // Polymorphic relationships - comment can be on different types of content
  targetType: text("target_type").notNull(), // 'review', 'band', 'photo', 'tour', 'message'
  targetId: varchar("target_id").notNull(), // ID of the target (review ID, band ID, etc.)
  // Thread support for nested comments
  parentCommentId: varchar("parent_comment_id").references(() => comments.id),
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

// Direct messaging system
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participant1Id: varchar("participant1_id").notNull().references(() => users.id),
  participant2Id: varchar("participant2_id").notNull().references(() => users.id),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const directMessages = pgTable("direct_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  messageType: varchar("message_type").default("text"), // 'text', 'image', 'link'
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
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true, lastMessageAt: true });
export const insertDirectMessageSchema = createInsertSchema(directMessages).omit({ id: true, createdAt: true, isRead: true });
export const insertSavedContentSchema = createInsertSchema(savedContent).omit({ id: true, savedAt: true });
export const insertPhotoAlbumSchema = createInsertSchema(photoAlbums).omit({ id: true, createdAt: true, photoCount: true });
export const insertAlbumPhotoSchema = createInsertSchema(albumPhotos).omit({ id: true, addedAt: true });

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
export type ReviewRating = typeof reviewRatings.$inferSelect;
export type InsertReviewRating = z.infer<typeof insertReviewRatingSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type DirectMessage = typeof directMessages.$inferSelect;
export type InsertDirectMessage = z.infer<typeof insertDirectMessageSchema>;
export type SavedContent = typeof savedContent.$inferSelect;
export type InsertSavedContent = z.infer<typeof insertSavedContentSchema>;
export type PhotoAlbum = typeof photoAlbums.$inferSelect;
export type InsertPhotoAlbum = z.infer<typeof insertPhotoAlbumSchema>;
export type AlbumPhoto = typeof albumPhotos.$inferSelect;
export type InsertAlbumPhoto = z.infer<typeof insertAlbumPhotoSchema>;
