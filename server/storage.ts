import { 
  type Band, type InsertBand, 
  type Review, type InsertReview, 
  type Photo, type InsertPhoto, 
  type Tour, type InsertTour, 
  type Message, type InsertMessage, 
  type User, type UpsertUser, type CreateUser, type LoginRequest,
  type UserLocation, type InsertUserLocation,
  type ProximityMatch, type InsertProximityMatch,
  type PitMessage, type InsertPitMessage,
  type PitReply, type InsertPitReply,
  type PostComment, type InsertPostComment,
  type ContentReaction, type InsertContentReaction,
  type Post, type InsertPost,
  type PostLike, type PostCommentLike,
  type Conversation, type InsertConversation,
  type DirectMessage, type InsertDirectMessage,
  type MessageEncryptionKey, type InsertMessageEncryptionKey,
  type MessageDeliveryReceipt, type InsertMessageDeliveryReceipt,
  type Badge, type InsertBadge, type CreateBadge,
  type UserBadge, type InsertUserBadge,
  type ConcertAttendance, type InsertConcertAttendance,
  // Group Chat Types
  type GroupChat, type InsertGroupChat,
  type GroupChatMember, type InsertGroupChatMember,
  type GroupMessage, type InsertGroupMessage,
  type GroupMessageReaction, type InsertGroupMessageReaction,
  type GroupEncryptionKey, type InsertGroupEncryptionKey,
  type MediaUpload, type InsertMediaUpload,
  users, bands, reviews, photos, tours, messages, pitMessages, pitReplies, postComments, contentReactions,
  posts, postLikes, postCommentLikes,
  conversations, directMessages, messageEncryptionKeys, messageDeliveryReceipts,
  userLocations, proximityMatches, badges, userBadges, concertAttendance,
  groupChats, groupChatMembers, groupMessages, groupMessageReactions, groupEncryptionKeys, mediaUploads
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, gt, desc, asc, and, or, like, isNull, not, lt, gte, lte, count } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations (required for authentication)
  getUser(id: string): Promise<User | undefined>;
  getUserByStagename(stagename: string): Promise<User | undefined>;
  createUser(user: CreateUser): Promise<User>;
  authenticateUser(loginData: LoginRequest): Promise<User | null>;
  updateUserLastLogin(id: string, rememberMe: boolean): Promise<void>;
  checkStagenameAvailable(stagename: string): Promise<boolean>;
  updateUserStagename(id: string, stagename: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Badge system
  getBadges(): Promise<Badge[]>;
  createBadge(badge: CreateBadge): Promise<Badge>;
  getUserBadges(userId: string): Promise<UserBadge[]>;
  awardBadge(userId: string, badgeId: string): Promise<UserBadge>;
  checkBadgeEligibility(userId: string): Promise<Badge[]>;
  
  // Concert attendance tracking
  recordConcertAttendance(attendance: InsertConcertAttendance): Promise<ConcertAttendance>;
  getUserConcertAttendances(userId: string): Promise<ConcertAttendance[]>;
  updateUserActivityCounts(userId: string): Promise<void>;
  
  // Bands
  getBands(): Promise<Band[]>;
  getBand(id: string): Promise<Band | undefined>;
  createBand(band: InsertBand): Promise<Band>;
  createBandSubmission(band: InsertBand & { ownerId: string }): Promise<Band>;
  getBandsByOwner(ownerId: string): Promise<Band[]>;
  updateBand(id: string, band: Partial<InsertBand>): Promise<Band | undefined>;
  deleteBand(id: string): Promise<boolean>;
  searchBands(query: string): Promise<Band[]>;
  searchAll(query: string, filters?: {
    genre?: string;
    photoCategory?: string;
    reviewType?: string;
    country?: string;
    dateRange?: string;
  }): Promise<{
    bands: Band[];
    tours: Tour[];
    reviews: Review[];
    photos: Photo[];
  }>;

  // Reviews
  getReviews(): Promise<Review[]>;
  getReview(id: string): Promise<Review | undefined>;
  getReviewsByBand(bandId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, review: Partial<InsertReview>): Promise<Review | undefined>;
  deleteReview(id: string): Promise<boolean>;
  likeReview(id: string): Promise<Review | undefined>;

  // Photos
  getPhotos(): Promise<Photo[]>;
  getPhoto(id: string): Promise<Photo | undefined>;
  getPhotosByBand(bandId: string): Promise<Photo[]>;
  getPhotosByCategory(category: string): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  updatePhoto(id: string, photo: Partial<InsertPhoto>): Promise<Photo | undefined>;
  deletePhoto(id: string): Promise<boolean>;

  // Tours
  getTours(): Promise<Tour[]>;
  getTour(id: string): Promise<Tour | undefined>;
  getToursByBand(bandId: string): Promise<Tour[]>;
  getUpcomingTours(): Promise<Tour[]>;
  createTour(tour: InsertTour): Promise<Tour>;
  updateTour(id: string, tour: Partial<InsertTour>): Promise<Tour | undefined>;
  deleteTour(id: string): Promise<boolean>;

  // Messages
  getMessages(): Promise<Message[]>;
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByCategory(category: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: string, message: Partial<InsertMessage>): Promise<Message | undefined>;
  deleteMessage(id: string): Promise<boolean>;
  likeMessage(id: string): Promise<Message | undefined>;

  // Analytics for background AI
  getUserActivity(userId: string): Promise<any[]>;

  // Pit message board operations
  getPitMessages(): Promise<PitMessage[]>;
  getPitMessage(id: string): Promise<PitMessage | undefined>;
  createPitMessage(message: InsertPitMessage): Promise<PitMessage>;
  incrementPitMessageLikes(id: string): Promise<void>;
  incrementPitMessageReplies(id: string): Promise<void>;
  
  getPitReplies(messageId: string): Promise<PitReply[]>;
  createPitReply(reply: InsertPitReply): Promise<PitReply>;
  incrementPitReplyLikes(id: string): Promise<void>;

  // Comments system
  getComments(targetType: string, targetId: string): Promise<PostComment[]>;
  createComment(comment: InsertPostComment): Promise<PostComment>;
  updateComment(id: string, content: string): Promise<PostComment>;
  deleteComment(id: string, reason: string): Promise<void>;
  createCommentReaction(reaction: InsertContentReaction): Promise<ContentReaction>;

  // Real-time messaging system
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation | undefined>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  updateConversationLastMessage(conversationId: string): Promise<void>;
  
  createDirectMessage(message: InsertDirectMessage): Promise<DirectMessage>;
  getDirectMessage(id: string): Promise<DirectMessage | undefined>;
  getConversationMessages(conversationId: string, limit?: number, offset?: number): Promise<DirectMessage[]>;
  markMessageAsRead(messageId: string, userId: string): Promise<void>;
  markMessageAsDelivered(messageId: string, userId: string): Promise<void>;
  
  createUserEncryptionKeys(keys: InsertMessageEncryptionKey): Promise<MessageEncryptionKey>;
  getUserEncryptionKeys(userId: string): Promise<MessageEncryptionKey | undefined>;
  updateUserEncryptionKeys(userId: string, keys: Partial<InsertMessageEncryptionKey>): Promise<MessageEncryptionKey | undefined>;
  
  createDeliveryReceipt(receipt: InsertMessageDeliveryReceipt): Promise<MessageDeliveryReceipt>;
  getMessageDeliveryReceipts(messageId: string): Promise<MessageDeliveryReceipt[]>;

  // Enhanced Social Features Methods
  
  // User Groups & Communities
  getUserGroups(): Promise<any[]>;
  createUserGroup(group: any): Promise<any>;
  joinGroup(groupId: string, userId: string): Promise<any>;
  getGroupPosts(groupId: string): Promise<any[]>;
  createGroupPost(post: any): Promise<any>;

  // Mentorship System
  getMentorProfiles(): Promise<any[]>;
  createMentorProfile(profile: any): Promise<any>;
  requestMentorship(mentorship: any): Promise<any>;

  // Live Chat System
  getChatRooms(): Promise<any[]>;
  getChatRoom(roomId: string): Promise<any>;
  getChatMessages(roomId: string): Promise<any[]>;
  createChatMessage(message: any): Promise<any>;
  joinChatRoom(roomId: string, userId: string): Promise<any>;
  getChatRoomUsers(roomId: string): Promise<any[]>;

  // Enhanced Reactions System
  getReactionTypes(): Promise<any[]>;
  addReaction(messageId: string, userId: string, emoji: string): Promise<any>;

  // Friend System
  getFriendRequests(userId: string): Promise<any[]>;
  sendFriendRequest(request: any): Promise<any>;
  updateFriendRequest(requestId: string, status: string): Promise<any>;

  // Social Media Connections
  getSocialConnections(userId: string): Promise<any[]>;
  createSocialConnection(connection: any): Promise<any>;

  // Online Users
  getOnlineUsers(): Promise<any[]>;

  // Encryption key management
  getEncryptionKeys(userId: string): Promise<MessageEncryptionKey[]>;
  createEncryptionKey(key: any): Promise<any>;

  // Group Chat Operations
  createGroupChat(groupData: InsertGroupChat): Promise<GroupChat>;
  getGroupChat(groupId: string): Promise<GroupChat | undefined>;
  getUserGroupChats(userId: string): Promise<(GroupChat & { memberRole: string, lastReadAt: Date | null })[]>;
  addGroupMember(memberData: InsertGroupChatMember): Promise<GroupChatMember>;
  removeGroupMember(groupId: string, userId: string): Promise<boolean>;
  getGroupMembers(groupId: string): Promise<(GroupChatMember & { user: User })[]>;
  updateGroupMemberRole(groupId: string, userId: string, role: string, permissions: any): Promise<boolean>;
  createGroupMessage(messageData: InsertGroupMessage): Promise<GroupMessage>;
  getGroupMessages(groupId: string, limit?: number, before?: string): Promise<(GroupMessage & { sender: User, replyTo?: GroupMessage })[]>;
  addGroupMessageReaction(reactionData: InsertGroupMessageReaction): Promise<GroupMessageReaction>;
  removeGroupMessageReaction(messageId: string, userId: string, emoji: string): Promise<boolean>;
  createMediaUpload(uploadData: InsertMediaUpload): Promise<MediaUpload>;
  getMediaUpload(uploadId: string): Promise<MediaUpload | undefined>;
  updateMediaUploadStatus(uploadId: string, status: string, thumbnailUrl?: string): Promise<boolean>;
  updateGroupMemberLastRead(groupId: string, userId: string): Promise<void>;
  checkGroupAdminPermissions(groupId: string, userId: string): Promise<{ isAdmin: boolean, permissions: any }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for authentication)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByStagename(stagename: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stagename, stagename));
    return user;
  }

  async createUser(userData: CreateUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: randomUUID(),
        stagename: userData.stagename,
        safeword: userData.safeword,
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        bio: userData.bio || null,
        location: userData.location || null,
        favoriteGenres: userData.favoriteGenres || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async authenticateUser(loginData: LoginRequest): Promise<User | null> {
    const user = await this.getUserByStagename(loginData.stagename);
    if (!user || !user.safeword) {
      return null;
    }

    const bcrypt = await import('bcrypt');
    const isValid = await bcrypt.compare(loginData.safeword, user.safeword);
    return isValid ? user : null;
  }

  async updateUserLastLogin(id: string, rememberMe: boolean): Promise<void> {
    await db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        rememberMe,
        loginStreak: sql`${users.loginStreak} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  async checkStagenameAvailable(stagename: string): Promise<boolean> {
    const user = await this.getUserByStagename(stagename);
    return !user;
  }

  async updateUserStagename(id: string, stagename: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ stagename, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Badge system
  async getBadges(): Promise<Badge[]> {
    return await db.select().from(badges).where(eq(badges.isActive, true));
  }

  async createBadge(badgeData: CreateBadge): Promise<Badge> {
    const [badge] = await db
      .insert(badges)
      .values({
        id: randomUUID(),
        ...badgeData,
        createdAt: new Date(),
      })
      .returning();
    return badge;
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return await db
      .select()
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const [userBadge] = await db
      .insert(userBadges)
      .values({
        id: randomUUID(),
        userId,
        badgeId,
        awardedAt: new Date(),
      })
      .returning();
    return userBadge;
  }

  async checkBadgeEligibility(userId: string): Promise<Badge[]> {
    const user = await this.getUser(userId);
    if (!user) return [];

    const allBadges = await this.getBadges();
    const userCurrentBadges = await this.getUserBadges(userId);
    const userBadgeIds = userCurrentBadges.map(ub => ub.badgeId);
    
    const eligibleBadges: Badge[] = [];

    for (const badge of allBadges) {
      if (userBadgeIds.includes(badge.id)) continue;

      const requirement = badge.requirement as any;
      let isEligible = false;

      switch (requirement.type) {
        case 'count':
          switch (requirement.action) {
            case 'comment':
              isEligible = user.commentCount >= requirement.threshold;
              break;
            case 'review':
              isEligible = user.reviewCount >= requirement.threshold;
              break;
            case 'concert':
              isEligible = user.concertAttendanceCount >= requirement.threshold;
              break;
            case 'login_streak':
              isEligible = user.loginStreak >= requirement.threshold;
              break;
          }
          break;
      }

      if (isEligible) {
        await this.awardBadge(userId, badge.id);
        eligibleBadges.push(badge);
      }
    }

    return eligibleBadges;
  }

  // Concert attendance tracking
  async recordConcertAttendance(attendanceData: InsertConcertAttendance): Promise<ConcertAttendance> {
    const [attendance] = await db
      .insert(concertAttendance)
      .values({
        id: randomUUID(),
        ...attendanceData,
        createdAt: new Date(),
      })
      .returning();

    // Update user's concert attendance count
    await db
      .update(users)
      .set({
        concertAttendanceCount: sql`${users.concertAttendanceCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, attendanceData.userId));

    return attendance;
  }

  async getUserConcertAttendances(userId: string): Promise<ConcertAttendance[]> {
    return await db
      .select()
      .from(concertAttendance)
      .where(eq(concertAttendance.userId, userId))
      .orderBy(sql`${concertAttendance.attendanceDate} DESC`);
  }

  async updateUserActivityCounts(userId: string): Promise<void> {
    // Update comment count
    const commentCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(postComments)
      .where(eq(postComments.userId, userId));

    // Update review count  
    const reviewCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(eq(reviews.stagename, userId)); // Assuming reviews use stagename

    await db
      .update(users)
      .set({
        commentCount: commentCount[0]?.count || 0,
        reviewCount: reviewCount[0]?.count || 0,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Initialize default badges
  async initializeDefaultBadges(): Promise<void> {
    const defaultBadges = [
      {
        name: "First Steps",
        description: "Welcome to MoshUnion! Your metalhead journey begins.",
        icon: "👋",
        category: "engagement",
        requirement: { type: "count", action: "login_streak", threshold: 1 },
        rarity: "common",
        points: 10,
      },
      {
        name: "Commentator",
        description: "Share your thoughts with 10 comments",
        icon: "💬",
        category: "content",
        requirement: { type: "count", action: "comment", threshold: 10 },
        rarity: "common",
        points: 25,
      },
      {
        name: "Critic",
        description: "Write your first band review",
        icon: "⭐",
        category: "content",
        requirement: { type: "count", action: "review", threshold: 1 },
        rarity: "common",
        points: 50,
      },
      {
        name: "Concert Goer",
        description: "Attend your first metal concert",
        icon: "🎸",
        category: "achievement",
        requirement: { type: "count", action: "concert", threshold: 1 },
        rarity: "rare",
        points: 100,
      },
      {
        name: "Metal Veteran",
        description: "Attend 10 metal concerts",
        icon: "🤘",
        category: "achievement",
        requirement: { type: "count", action: "concert", threshold: 10 },
        rarity: "epic",
        points: 500,
      },
      {
        name: "Dedicated Fan",
        description: "Login for 7 consecutive days",
        icon: "🔥",
        category: "engagement",
        requirement: { type: "count", action: "login_streak", threshold: 7 },
        rarity: "rare",
        points: 150,
      },
    ];

    for (const badgeData of defaultBadges) {
      try {
        await this.createBadge(badgeData);
      } catch (error) {
        // Badge might already exist, continue
        console.log(`Badge ${badgeData.name} might already exist`);
      }
    }
  }

  // Placeholder implementations for the remaining interface methods
  async getBands(): Promise<Band[]> {
    return await db.select().from(bands).orderBy(bands.name);
  }

  async getBand(id: string): Promise<Band | undefined> {
    const [band] = await db.select().from(bands).where(eq(bands.id, id));
    return band;
  }

  async createBand(insertBand: InsertBand): Promise<Band> {
    const [band] = await db.insert(bands).values(insertBand).returning();
    return band;
  }

  async getReviews(): Promise<Review[]> {
    return [];
  }

  async getReview(id: string): Promise<Review | undefined> {
    return undefined;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  async getPhotos(): Promise<Photo[]> {
    return [];
  }

  async getPhoto(id: string): Promise<Photo | undefined> {
    return undefined;
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const [photo] = await db.insert(photos).values(insertPhoto).returning();
    return photo;
  }

  async getTours(): Promise<Tour[]> {
    return await db.select().from(tours).orderBy(tours.date);
  }

  async getUpcomingTours(): Promise<Tour[]> {
    const now = new Date();
    return await db
      .select()
      .from(tours)
      .where(gt(tours.date, now))
      .orderBy(tours.date);
  }

  async getTour(id: string): Promise<Tour | undefined> {
    const [tour] = await db.select().from(tours).where(eq(tours.id, id));
    return tour;
  }

  async createTour(insertTour: InsertTour): Promise<Tour> {
    const [tour] = await db.insert(tours).values(insertTour).returning();
    return tour;
  }

  async getMessages(): Promise<Message[]> {
    return [];
  }

  async getMessage(id: string): Promise<Message | undefined> {
    return undefined;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  // Stub implementations for other required methods
  async createBandSubmission(bandData: any): Promise<Band> {
    return this.createBand(bandData);
  }

  async getBandsByOwner(ownerId: string): Promise<Band[]> {
    return [];
  }

  async updateBand(id: string, bandUpdate: any): Promise<Band | undefined> {
    return undefined;
  }

  async deleteBand(id: string): Promise<boolean> {
    return false;
  }

  async searchBands(query: string): Promise<Band[]> {
    return [];
  }

  async searchAll(query: string, filters: any = {}): Promise<any> {
    return { bands: [], tours: [], reviews: [], photos: [] };
  }

  async getReviewsByBand(bandId: string): Promise<Review[]> {
    return [];
  }

  async updateReview(id: string, reviewUpdate: any): Promise<Review | undefined> {
    return undefined;
  }

  async deleteReview(id: string): Promise<boolean> {
    return false;
  }

  async likeReview(id: string): Promise<Review | undefined> {
    return undefined;
  }

  async getPhotosByBand(bandId: string): Promise<Photo[]> {
    return [];
  }

  async getPhotosByCategory(category: string): Promise<Photo[]> {
    return [];
  }

  async updatePhoto(id: string, photoUpdate: any): Promise<Photo | undefined> {
    return undefined;
  }

  async deletePhoto(id: string): Promise<boolean> {
    return false;
  }

  async getToursByBand(bandId: string): Promise<Tour[]> {
    return await db
      .select()
      .from(tours)
      .where(eq(tours.bandId, bandId))
      .orderBy(tours.date);
  }

  async getToursByLocation(location: string): Promise<Tour[]> {
    return [];
  }

  async updateTour(id: string, tourUpdate: any): Promise<Tour | undefined> {
    return undefined;
  }

  async deleteTour(id: string): Promise<boolean> {
    return false;
  }

  async getUserLocations(): Promise<UserLocation[]> {
    return [];
  }

  async createUserLocation(locationData: any): Promise<UserLocation> {
    return { id: randomUUID(), ...locationData, createdAt: new Date() };
  }

  async updateUserLocation(id: string, locationUpdate: any): Promise<UserLocation | undefined> {
    return undefined;
  }

  async deleteUserLocation(id: string): Promise<boolean> {
    return false;
  }

  async findNearbyUsers(userId: string, radiusKm: number = 5): Promise<ProximityMatch[]> {
    return [];
  }

  async createProximityMatch(matchData: any): Promise<ProximityMatch> {
    return { id: randomUUID(), ...matchData, createdAt: new Date() };
  }

  async getProximityMatches(userId: string): Promise<ProximityMatch[]> {
    return [];
  }

  async updateProximityMatch(id: string, matchUpdate: any): Promise<ProximityMatch | undefined> {
    return undefined;
  }

  async deleteProximityMatch(id: string): Promise<boolean> {
    return false;
  }

  // Stub implementations for all other interface methods
  async getPitMessages(): Promise<any[]> { return []; }
  async getPitMessage(id: string): Promise<any> { return undefined; }
  async createPitMessage(messageData: any): Promise<any> { return { id: randomUUID(), ...messageData }; }
  async incrementPitMessageLikes(id: string): Promise<void> {}
  async incrementPitMessageReplies(id: string): Promise<void> {}
  async getPitReplies(messageId: string): Promise<any[]> { return []; }
  async createPitReply(replyData: any): Promise<any> { return { id: randomUUID(), ...replyData }; }
  async getComments(): Promise<any[]> { return []; }
  async getComment(id: string): Promise<any> { return undefined; }
  async createComment(commentData: any): Promise<any> { return { id: randomUUID(), ...commentData }; }
  async updateComment(id: string, commentUpdate: any): Promise<any> { return undefined; }
  async deleteComment(id: string): Promise<boolean> { return false; }
  async getCommentsByTarget(targetId: string, targetType: string): Promise<any[]> { return []; }
  async getCommentReactions(commentId: string): Promise<any[]> { return []; }
  async addCommentReaction(reactionData: any): Promise<any> { return { id: randomUUID(), ...reactionData }; }
  async removeCommentReaction(id: string): Promise<boolean> { return false; }
  async getPosts(): Promise<any[]> { return []; }
  async getPost(id: string): Promise<any> { return undefined; }
  async createPost(postData: any): Promise<any> { return { id: randomUUID(), ...postData }; }
  async updatePost(id: string, postUpdate: any): Promise<any> { return undefined; }
  async deletePost(id: string): Promise<boolean> { return false; }
  async getPostComments(postId: string): Promise<any[]> { return []; }
  async createPostComment(commentData: any): Promise<any> { return { id: randomUUID(), ...commentData }; }
  async getPostLikes(postId: string): Promise<any[]> { return []; }
  async addPostLike(likeData: any): Promise<any> { return { id: randomUUID(), ...likeData }; }
  async removePostLike(id: string): Promise<boolean> { return false; }
  async getPostCommentLikes(commentId: string): Promise<any[]> { return []; }
  async addPostCommentLike(likeData: any): Promise<any> { return { id: randomUUID(), ...likeData }; }
  async removePostCommentLike(id: string): Promise<boolean> { return false; }
  async getUserGroups(): Promise<any[]> { return []; }
  async createUserGroup(group: any): Promise<any> { return { id: randomUUID(), ...group }; }
  async joinGroup(groupId: string, userId: string): Promise<any> { return { groupId, userId }; }
  async getGroupPosts(groupId: string): Promise<any[]> { return []; }
  async createGroupPost(post: any): Promise<any> { return { id: randomUUID(), ...post }; }
  async getMentorProfiles(): Promise<any[]> { return []; }
  async createMentorProfile(profile: any): Promise<any> { return { id: randomUUID(), ...profile }; }
  async requestMentorship(mentorship: any): Promise<any> { return { id: randomUUID(), ...mentorship }; }
  async getChatRooms(): Promise<any[]> { return []; }
  async getChatRoom(roomId: string): Promise<any> { return undefined; }
  async getChatMessages(roomId: string): Promise<any[]> { return []; }
  async createChatMessage(message: any): Promise<any> { return { id: randomUUID(), ...message }; }
  async joinChatRoom(roomId: string, userId: string): Promise<any> { return { roomId, userId }; }
  async getChatRoomUsers(roomId: string): Promise<any[]> { return []; }
  async getReactionTypes(): Promise<any[]> { return []; }
  async addReaction(messageId: string, userId: string, emoji: string): Promise<any> { return { id: randomUUID(), messageId, userId, emoji }; }
  async getFriendRequests(userId: string): Promise<any[]> { return []; }
  async sendFriendRequest(request: any): Promise<any> { return { id: randomUUID(), ...request }; }
  async updateFriendRequest(requestId: string, status: string): Promise<any> { return { id: requestId, status }; }
  async getSocialConnections(userId: string): Promise<any[]> { return []; }
  async createSocialConnection(connection: any): Promise<any> { return { id: randomUUID(), ...connection }; }
  async getOnlineUsers(): Promise<any[]> { return []; }
  async getConversations(userId: string): Promise<any[]> { return []; }
  async getConversation(conversationId: string): Promise<any> { return undefined; }
  async createConversation(conversation: any): Promise<any> { return { id: randomUUID(), ...conversation }; }
  async getMessages(conversationId: string): Promise<any[]> { return []; }
  async markMessageAsRead(messageId: string, userId: string): Promise<void> {}
  async getEncryptionKeys(userId: string): Promise<any[]> { return []; }
  async createEncryptionKey(key: any): Promise<any> { return { id: randomUUID(), ...key }; }
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private bands: Map<string, Band> = new Map();
  private reviews: Map<string, Review> = new Map();
  private photos: Map<string, Photo> = new Map();
  private tours: Map<string, Tour> = new Map();

  constructor() {
    this.seedData();
  }

  // User operations (required for authentication)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByStagename(stagename: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.stagename === stagename) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData: CreateUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...userData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      reputationPoints: 0,
      badges: null,
      concertAttendanceCount: 0,
      commentCount: 0,
      reviewCount: 0,
      isOnline: false,
      lastActive: new Date(),
      loginStreak: 0,
      totalReviews: 0,
      totalPhotos: 0,
      totalLikes: 0,
      rememberMe: false,
      lastLoginAt: null,
      notificationSettings: null,
      theme: "dark",
      proximityEnabled: false,
      proximityRadius: 500,
      shareLocationAtConcerts: false,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      bio: userData.bio || null,
      location: userData.location || null,
      favoriteGenres: userData.favoriteGenres || null,
      email: userData.email || null,
    };
    
    this.users.set(id, user);
    return user;
  }

  async authenticateUser(loginData: LoginRequest): Promise<User | null> {
    const user = await this.getUserByStagename(loginData.stagename);
    if (!user || !user.safeword) {
      return null;
    }

    const bcrypt = await import('bcrypt');
    const isValid = await bcrypt.compare(loginData.safeword, user.safeword);
    return isValid ? user : null;
  }

  async updateUserLastLogin(id: string, rememberMe: boolean): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLoginAt = new Date();
      user.rememberMe = rememberMe;
      user.loginStreak = (user.loginStreak || 0) + 1;
      user.updatedAt = new Date();
      this.users.set(id, user);
    }
  }

  async checkStagenameAvailable(stagename: string): Promise<boolean> {
    const user = await this.getUserByStagename(stagename);
    return !user;
  }

  async updateUserStagename(id: string, stagename: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      user.stagename = stagename;
      user.updatedAt = new Date();
      this.users.set(id, user);
      return user;
    }
    return undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id || randomUUID();
    const existingUser = this.users.get(id);
    
    const user: User = {
      ...userData,
      id,
      stagename: userData.stagename || null,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
    };
    
    this.users.set(id, user);
    return user;
  }

  // Badge system (stub implementations for memory storage)
  async getBadges(): Promise<Badge[]> {
    return [];
  }

  async createBadge(badge: CreateBadge): Promise<Badge> {
    return {
      id: randomUUID(),
      ...badge,
      createdAt: new Date(),
      isActive: true,
    };
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return [];
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    return {
      id: randomUUID(),
      userId,
      badgeId,
      awardedAt: new Date(),
      progress: null,
    };
  }

  async checkBadgeEligibility(userId: string): Promise<Badge[]> {
    return [];
  }

  async recordConcertAttendance(attendance: InsertConcertAttendance): Promise<ConcertAttendance> {
    return {
      id: randomUUID(),
      ...attendance,
      createdAt: new Date(),
    };
  }

  async getUserConcertAttendances(userId: string): Promise<ConcertAttendance[]> {
    return [];
  }

  async updateUserActivityCounts(userId: string): Promise<void> {
    // Stub implementation
  }

  private seedData() {
    // Seed some initial bands
    const metallica: Band = {
      id: randomUUID(),
      name: "METALLICA",
      genre: "Thrash Metal",
      description: "Legendary thrash metal pioneers from San Francisco, known for their aggressive sound and powerful live performances.",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      founded: 1981,
      members: ["James Hetfield", "Lars Ulrich", "Kirk Hammett", "Robert Trujillo"],
      albums: ["Kill 'Em All", "Ride the Lightning", "Master of Puppets", "...And Justice for All", "Metallica (Black Album)"],
      website: "https://metallica.com",
      instagram: null,
      ownerId: null,
      status: "approved",
      submittedAt: null,
      approvedAt: null,
      createdAt: new Date(),
    };

    const ironMaiden: Band = {
      id: randomUUID(),
      name: "IRON MAIDEN",
      genre: "Heavy Metal",
      description: "British heavy metal legends with epic storytelling and theatrical live shows that have defined metal for decades.",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      founded: 1975,
      members: ["Bruce Dickinson", "Steve Harris", "Dave Murray", "Adrian Smith", "Janick Gers", "Nicko McBrain"],
      albums: ["Iron Maiden", "The Number of the Beast", "Piece of Mind", "Powerslave", "Somewhere in Time"],
      website: "https://ironmaiden.com",
      instagram: null,
      ownerId: null,
      status: "approved",
      submittedAt: null,
      approvedAt: null,
      createdAt: new Date(),
    };

    const blackSabbath: Band = {
      id: randomUUID(),
      name: "BLACK SABBATH",
      genre: "Doom Metal",
      description: "The godfathers of heavy metal, creating the blueprint for dark, heavy music that influenced generations.",
      imageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      founded: 1968,
      members: ["Ozzy Osbourne", "Tony Iommi", "Geezer Butler", "Bill Ward"],
      albums: ["Black Sabbath", "Paranoid", "Master of Reality", "Vol. 4", "Sabbath Bloody Sabbath"],
      website: "https://blacksabbath.com",
      instagram: null,
      ownerId: null,
      status: "approved",
      submittedAt: null,
      approvedAt: null,
      createdAt: new Date(),
    };

    this.bands.set(metallica.id, metallica);
    this.bands.set(ironMaiden.id, ironMaiden);
    this.bands.set(blackSabbath.id, blackSabbath);
  }

  // Bands
  async getBands(): Promise<Band[]> {
    const bands = Array.from(this.bands.values());
    
    // Deduplicate by band name, keeping the most recent entry
    const uniqueBands = new Map<string, Band>();
    bands.forEach(band => {
      const key = band.name.toLowerCase();
      const existing = uniqueBands.get(key);
      if (!existing || (band.createdAt && existing.createdAt && band.createdAt > existing.createdAt)) {
        uniqueBands.set(key, band);
      }
    });
    
    return Array.from(uniqueBands.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getBand(id: string): Promise<Band | undefined> {
    return this.bands.get(id);
  }

  async createBand(insertBand: InsertBand): Promise<Band> {
    const id = randomUUID();
    const band: Band = { 
      ...insertBand, 
      id, 
      createdAt: new Date(),
      imageUrl: insertBand.imageUrl || null,
      founded: insertBand.founded || null,
      members: insertBand.members || null,
      albums: insertBand.albums || null,
      website: insertBand.website || null,
      instagram: insertBand.instagram || null,
      ownerId: null,
      status: "approved",
      submittedAt: null,
      approvedAt: null
    };
    this.bands.set(id, band);
    return band;
  }

  async updateBand(id: string, bandUpdate: Partial<InsertBand>): Promise<Band | undefined> {
    const band = this.bands.get(id);
    if (!band) return undefined;
    const updatedBand = { ...band, ...bandUpdate };
    this.bands.set(id, updatedBand);
    return updatedBand;
  }

  async deleteBand(id: string): Promise<boolean> {
    return this.bands.delete(id);
  }

  async searchBands(query: string): Promise<Band[]> {
    const bands = Array.from(this.bands.values());
    const searchTerm = query.toLowerCase();
    
    // Filter and deduplicate by band name
    const filtered = bands.filter(band => 
      band.name.toLowerCase().includes(searchTerm) ||
      band.genre.toLowerCase().includes(searchTerm) ||
      band.description.toLowerCase().includes(searchTerm)
    );
    
    // Deduplicate by band name, keeping the most recent entry
    const uniqueBands = new Map<string, Band>();
    filtered.forEach(band => {
      const key = band.name.toLowerCase();
      const existing = uniqueBands.get(key);
      if (!existing || (band.createdAt && existing.createdAt && band.createdAt > existing.createdAt)) {
        uniqueBands.set(key, band);
      }
    });
    
    return Array.from(uniqueBands.values()).sort((a, b) => a.name.localeCompare(b.name));
  }


  // Reviews
  async getReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values()).sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getReview(id: string): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByBand(bandId: string): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.bandId === bandId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = { 
      ...insertReview, 
      id, 
      likes: 0, 
      createdAt: new Date(),
      targetName: insertReview.targetName || null
    };
    this.reviews.set(id, review);
    return review;
  }

  async updateReview(id: string, reviewUpdate: Partial<InsertReview>): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    const updatedReview = { ...review, ...reviewUpdate };
    this.reviews.set(id, updatedReview);
    return updatedReview;
  }

  async deleteReview(id: string): Promise<boolean> {
    return this.reviews.delete(id);
  }

  async likeReview(id: string): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    const updatedReview = { ...review, likes: (review.likes || 0) + 1 };
    this.reviews.set(id, updatedReview);
    return updatedReview;
  }

  // Photos
  async getPhotos(): Promise<Photo[]> {
    return Array.from(this.photos.values()).sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getPhoto(id: string): Promise<Photo | undefined> {
    return this.photos.get(id);
  }

  async getPhotosByBand(bandId: string): Promise<Photo[]> {
    return Array.from(this.photos.values())
      .filter(photo => photo.bandId === bandId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getPhotosByCategory(category: string): Promise<Photo[]> {
    return Array.from(this.photos.values())
      .filter(photo => photo.category === category)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = randomUUID();
    const photo: Photo = { 
      ...insertPhoto, 
      id, 
      createdAt: new Date(),
      bandId: insertPhoto.bandId || null,
      description: insertPhoto.description || null
    };
    this.photos.set(id, photo);
    return photo;
  }

  async updatePhoto(id: string, photoUpdate: Partial<InsertPhoto>): Promise<Photo | undefined> {
    const photo = this.photos.get(id);
    if (!photo) return undefined;
    const updatedPhoto = { ...photo, ...photoUpdate };
    this.photos.set(id, updatedPhoto);
    return updatedPhoto;
  }

  async deletePhoto(id: string): Promise<boolean> {
    return this.photos.delete(id);
  }

  // Tours
  async getTours(): Promise<Tour[]> {
    return Array.from(this.tours.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async getTour(id: string): Promise<Tour | undefined> {
    return this.tours.get(id);
  }

  async getToursByBand(bandId: string): Promise<Tour[]> {
    return Array.from(this.tours.values())
      .filter(tour => tour.bandId === bandId)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async getUpcomingTours(): Promise<Tour[]> {
    const now = new Date();
    return Array.from(this.tours.values())
      .filter(tour => tour.date > now)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async createTour(insertTour: InsertTour): Promise<Tour> {
    const id = randomUUID();
    const tour: Tour = { 
      ...insertTour, 
      id,
      status: insertTour.status || null,
      ticketUrl: insertTour.ticketUrl || null,
      ticketmasterUrl: insertTour.ticketmasterUrl || null,
      seatgeekUrl: insertTour.seatgeekUrl || null,
      price: insertTour.price || null
    };
    this.tours.set(id, tour);
    return tour;
  }

  async updateTour(id: string, tourUpdate: Partial<InsertTour>): Promise<Tour | undefined> {
    const tour = this.tours.get(id);
    if (!tour) return undefined;
    const updatedTour = { ...tour, ...tourUpdate };
    this.tours.set(id, updatedTour);
    return updatedTour;
  }

  async deleteTour(id: string): Promise<boolean> {
    return this.tours.delete(id);
  }

  async searchAll(query: string, filters: {
    genre?: string;
    photoCategory?: string;
    reviewType?: string;
    country?: string;
    dateRange?: string;
  } = {}): Promise<{
    bands: Band[];
    tours: Tour[];
    reviews: Review[];
    photos: Photo[];
  }> {
    const searchTerm = query.toLowerCase();
    const now = new Date();
    
    // Filter bands
    let filteredBands = Array.from(this.bands.values()).filter(band => 
      band.name.toLowerCase().includes(searchTerm) ||
      band.genre.toLowerCase().includes(searchTerm) ||
      band.description.toLowerCase().includes(searchTerm)
    );
    
    if (filters.genre && filters.genre !== 'all') {
      filteredBands = filteredBands.filter(band => band.genre === filters.genre);
    }
    
    // Filter tours
    let filteredTours = Array.from(this.tours.values()).filter(tour => 
      tour.tourName.toLowerCase().includes(searchTerm) ||
      tour.venue.toLowerCase().includes(searchTerm) ||
      tour.city.toLowerCase().includes(searchTerm) ||
      tour.country.toLowerCase().includes(searchTerm)
    );
    
    if (filters.country && filters.country !== 'all') {
      filteredTours = filteredTours.filter(tour => 
        tour.country.toLowerCase().includes(filters.country!.toLowerCase())
      );
    }
    
    if (filters.dateRange && filters.dateRange !== 'all') {
      switch (filters.dateRange) {
        case 'upcoming':
          filteredTours = filteredTours.filter(tour => tour.date > now);
          break;
        case 'thisWeek':
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          filteredTours = filteredTours.filter(tour => tour.date >= now && tour.date <= weekFromNow);
          break;
        case 'thisMonth':
          const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
          filteredTours = filteredTours.filter(tour => tour.date >= now && tour.date <= monthFromNow);
          break;
        case 'thisYear':
          const yearEnd = new Date(now.getFullYear(), 11, 31);
          filteredTours = filteredTours.filter(tour => tour.date >= now && tour.date <= yearEnd);
          break;
      }
    }
    
    // Filter reviews
    let filteredReviews = Array.from(this.reviews.values()).filter(review => 
      review.title.toLowerCase().includes(searchTerm) ||
      review.content.toLowerCase().includes(searchTerm) ||
      (review.targetName && review.targetName.toLowerCase().includes(searchTerm)) ||
      review.stagename.toLowerCase().includes(searchTerm)
    );
    
    if (filters.reviewType && filters.reviewType !== 'all') {
      filteredReviews = filteredReviews.filter(review => review.reviewType === filters.reviewType);
    }
    
    // Filter photos
    let filteredPhotos = Array.from(this.photos.values()).filter(photo => 
      photo.title.toLowerCase().includes(searchTerm) ||
      (photo.description && photo.description.toLowerCase().includes(searchTerm)) ||
      photo.uploadedBy.toLowerCase().includes(searchTerm)
    );
    
    if (filters.photoCategory && filters.photoCategory !== 'all') {
      filteredPhotos = filteredPhotos.filter(photo => photo.category === filters.photoCategory);
    }
    
    return {
      bands: filteredBands.sort((a, b) => a.name.localeCompare(b.name)),
      tours: filteredTours.sort((a, b) => a.date.getTime() - b.date.getTime()),
      reviews: filteredReviews.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime()),
      photos: filteredPhotos.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
    };
  }

  // User operations (stub implementations)
  async getUserByStagename(stagename: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.stagename === stagename);
  }

  async checkStagenameAvailable(stagename: string): Promise<boolean> {
    const user = await this.getUserByStagename(stagename);
    return !user;
  }

  async updateUserStagename(id: string, stagename: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, stagename, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createBandSubmission(bandData: InsertBand & { ownerId: string }): Promise<Band> {
    const id = randomUUID();
    const band: Band = {
      ...bandData,
      id,
      status: "pending",
      submittedAt: new Date(),
      approvedAt: null,
      createdAt: new Date(),
      imageUrl: bandData.imageUrl || null,
      founded: bandData.founded || null,
      members: bandData.members || null,
      albums: bandData.albums || null,
      website: bandData.website || null,
      instagram: bandData.instagram || null,
    };
    this.bands.set(id, band);
    return band;
  }

  async getBandsByOwner(ownerId: string): Promise<Band[]> {
    return Array.from(this.bands.values())
      .filter(band => band.ownerId === ownerId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  // Analytics for background AI
  async getUserActivity(userId: string): Promise<any[]> {
    const userBands = Array.from(this.bands.values()).filter(band => band.ownerId === userId);
    const allReviews = Array.from(this.reviews.values());
    const userReviews = allReviews.filter(review => 
      userBands.some(band => band.name === review.stagename)
    );
    
    // Create activity timeline
    const activity = [
      ...userBands.map(band => ({
        type: 'band_submission',
        timestamp: band.createdAt || new Date(),
        genre: band.genre,
        item: band.name
      })),
      ...userReviews.map(review => ({
        type: 'review',
        timestamp: review.createdAt || new Date(),
        genre: review.reviewType,
        item: review.stagename,
        rating: review.rating
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return activity.slice(0, 50); // Last 50 activities
  }

  // Messages (stub implementations - not used since we use DatabaseStorage)
  async getMessage(id: string): Promise<Message | undefined> { return undefined; }
  async getMessagesByCategory(category: string): Promise<Message[]> { return []; }
  async updateMessage(id: string, message: Partial<InsertMessage>): Promise<Message | undefined> { return undefined; }
  async deleteMessage(id: string): Promise<boolean> { return false; }
  async likeMessage(id: string): Promise<Message | undefined> { return undefined; }

  // Enhanced Social Features Implementation
  
  // User Groups & Communities
  async getUserGroups(): Promise<any[]> {
    return [
      {
        id: '1',
        name: 'Metal Heads United',
        description: 'A community for metal music enthusiasts',
        category: 'Music Discussion',
        memberCount: 1247,
        isPrivate: false,
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200',
        createdAt: new Date('2024-01-15'),
        tags: ['metal', 'community', 'discussion']
      },
      {
        id: '2',
        name: 'Concert Photography',
        description: 'Share your best concert photos and tips',
        category: 'Photography',
        memberCount: 823,
        isPrivate: false,
        imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=200',
        createdAt: new Date('2024-02-10'),
        tags: ['photography', 'concerts', 'sharing']
      },
      {
        id: '3',
        name: 'Local Venue Reviews',
        description: 'Review and discover local metal venues',
        category: 'Venues',
        memberCount: 456,
        isPrivate: false,
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200',
        createdAt: new Date('2024-03-05'),
        tags: ['venues', 'reviews', 'local']
      }
    ];
  }

  async createUserGroup(group: any): Promise<any> {
    return {
      id: randomUUID(),
      ...group,
      memberCount: 1,
      createdAt: new Date(),
      tags: group.tags || []
    };
  }

  async joinGroup(groupId: string, userId: string): Promise<any> {
    return {
      groupId,
      userId,
      joinedAt: new Date(),
      role: 'member'
    };
  }

  async getGroupPosts(groupId: string): Promise<any[]> {
    return [
      {
        id: '1',
        groupId,
        authorId: 'user1',
        authorName: 'MetalFan',
        content: 'Just discovered this amazing underground band!',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300',
        likes: 15,
        comments: 8,
        createdAt: new Date('2024-08-17'),
        tags: ['discovery', 'underground']
      },
      {
        id: '2',
        groupId,
        authorId: 'user2',
        authorName: 'ConcertGoer',
        content: 'Amazing show last night! The energy was incredible.',
        likes: 23,
        comments: 12,
        createdAt: new Date('2024-08-16'),
        tags: ['concert', 'review']
      }
    ];
  }

  async createGroupPost(post: any): Promise<any> {
    return {
      id: randomUUID(),
      ...post,
      likes: 0,
      comments: 0,
      createdAt: new Date()
    };
  }

  // Mentorship System
  async getMentorProfiles(): Promise<any[]> {
    return [
      {
        id: '1',
        userId: 'mentor1',
        stagename: 'VeteranMetalhead',
        expertise: ['Concert Photography', 'Band Management', 'Music Production'],
        bio: '20+ years in the metal scene. Helped launch several local bands.',
        availability: 'weekends',
        rating: 4.8,
        totalMentees: 15,
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150',
        badges: ['Top Mentor', 'Photography Expert'],
        specializations: ['Technical Skills', 'Industry Connections']
      },
      {
        id: '2',
        userId: 'mentor2',
        stagename: 'StageVeteran',
        expertise: ['Live Performance', 'Stage Presence', 'Audience Engagement'],
        bio: 'Former touring musician with 30+ years of stage experience.',
        availability: 'evenings',
        rating: 4.9,
        totalMentees: 22,
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150',
        badges: ['Legend', 'Performance Coach'],
        specializations: ['Performance', 'Career Guidance']
      }
    ];
  }

  async createMentorProfile(profile: any): Promise<any> {
    return {
      id: randomUUID(),
      ...profile,
      rating: 0,
      totalMentees: 0,
      createdAt: new Date()
    };
  }

  async requestMentorship(mentorship: any): Promise<any> {
    return {
      id: randomUUID(),
      ...mentorship,
      status: 'pending',
      requestedAt: new Date()
    };
  }

  // Live Chat System
  async getChatRooms(): Promise<any[]> {
    return [
      {
        id: 'general',
        name: 'General Discussion',
        description: 'Main chat for all metal fans',
        memberCount: 342,
        isActive: true,
        category: 'general',
        lastActivity: new Date(),
        tags: ['general', 'discussion']
      },
      {
        id: 'concerts',
        name: 'Concert Updates',
        description: 'Live updates from concerts and festivals',
        memberCount: 156,
        isActive: true,
        category: 'events',
        lastActivity: new Date(),
        tags: ['concerts', 'live', 'updates']
      },
      {
        id: 'gear',
        name: 'Gear Talk',
        description: 'Discuss instruments, amps, and equipment',
        memberCount: 89,
        isActive: true,
        category: 'equipment',
        lastActivity: new Date(),
        tags: ['gear', 'equipment', 'instruments']
      }
    ];
  }

  async getChatRoom(roomId: string): Promise<any> {
    const rooms = await this.getChatRooms();
    return rooms.find(room => room.id === roomId);
  }

  async getChatMessages(roomId: string): Promise<any[]> {
    return [
      {
        id: '1',
        roomId,
        userId: 'user1',
        username: 'MetalFan',
        message: 'Anyone going to the Metallica concert next month?',
        timestamp: new Date('2024-08-18T11:30:00'),
        reactions: [{ emoji: '🤘', count: 5 }, { emoji: '🔥', count: 3 }],
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40'
      },
      {
        id: '2',
        roomId,
        userId: 'user2',
        username: 'ConcertGoer',
        message: 'Yes! Already got my tickets. Can\'t wait!',
        timestamp: new Date('2024-08-18T11:32:00'),
        reactions: [{ emoji: '🎸', count: 2 }],
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40'
      },
      {
        id: '3',
        roomId,
        userId: 'user3',
        username: 'MetalQueen',
        message: 'The setlist for this tour looks amazing!',
        timestamp: new Date('2024-08-18T11:35:00'),
        reactions: [{ emoji: '🤘', count: 4 }, { emoji: '🔥', count: 6 }],
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b169?w=40&h=40'
      }
    ];
  }

  async createChatMessage(message: any): Promise<any> {
    return {
      id: randomUUID(),
      ...message,
      timestamp: new Date(),
      reactions: []
    };
  }

  async joinChatRoom(roomId: string, userId: string): Promise<any> {
    return {
      roomId,
      userId,
      joinedAt: new Date(),
      role: 'member'
    };
  }

  async getChatRoomUsers(roomId: string): Promise<any[]> {
    return [
      {
        id: 'user1',
        username: 'MetalFan',
        isOnline: true,
        role: 'member',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40'
      },
      {
        id: 'user2',
        username: 'ConcertGoer',
        isOnline: true,
        role: 'member',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40'
      },
      {
        id: 'user3',
        username: 'MetalQueen',
        isOnline: false,
        role: 'member',
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b169?w=40&h=40'
      }
    ];
  }

  // Enhanced Reactions System
  async getReactionTypes(): Promise<any[]> {
    return [
      { emoji: '🤘', name: 'rock_on', category: 'metal' },
      { emoji: '🔥', name: 'fire', category: 'general' },
      { emoji: '🎸', name: 'guitar', category: 'instruments' },
      { emoji: '🥁', name: 'drums', category: 'instruments' },
      { emoji: '🎤', name: 'mic', category: 'vocals' },
      { emoji: '⚡', name: 'lightning', category: 'energy' },
      { emoji: '🖤', name: 'black_heart', category: 'metal' },
      { emoji: '💀', name: 'skull', category: 'metal' }
    ];
  }

  async addReaction(messageId: string, userId: string, emoji: string): Promise<any> {
    return {
      id: randomUUID(),
      messageId,
      userId,
      emoji,
      createdAt: new Date()
    };
  }

  // Friend System
  async getFriendRequests(userId: string): Promise<any[]> {
    return [
      {
        id: '1',
        senderId: 'user2',
        senderName: 'ConcertGoer',
        senderImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50',
        receiverId: userId,
        status: 'pending',
        sentAt: new Date('2024-08-17'),
        mutualFriends: 3
      },
      {
        id: '2',
        senderId: 'user3',
        senderName: 'MetalQueen',
        senderImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b169?w=50&h=50',
        receiverId: userId,
        status: 'pending',
        sentAt: new Date('2024-08-16'),
        mutualFriends: 1
      }
    ];
  }

  async sendFriendRequest(request: any): Promise<any> {
    return {
      id: randomUUID(),
      ...request,
      status: 'pending',
      sentAt: new Date()
    };
  }

  async updateFriendRequest(requestId: string, status: string): Promise<any> {
    return {
      id: requestId,
      status,
      updatedAt: new Date()
    };
  }

  // Social Media Connections
  async getSocialConnections(userId: string): Promise<any[]> {
    return [
      {
        id: '1',
        userId,
        platform: 'instagram',
        username: 'metalfan_official',
        isConnected: true,
        followers: 1234,
        connectedAt: new Date('2024-08-01')
      },
      {
        id: '2',
        userId,
        platform: 'spotify',
        username: 'metalfan2024',
        isConnected: true,
        playlists: 15,
        connectedAt: new Date('2024-07-15')
      },
      {
        id: '3',
        userId,
        platform: 'youtube',
        username: 'MetalFanChannel',
        isConnected: false,
        subscribers: 567,
        connectedAt: null
      }
    ];
  }

  async createSocialConnection(connection: any): Promise<any> {
    return {
      id: randomUUID(),
      ...connection,
      isConnected: true,
      connectedAt: new Date()
    };
  }

  // Online Users
  async getOnlineUsers(): Promise<any[]> {
    return [
      {
        id: 'user1',
        username: 'MetalFan',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40',
        status: 'online',
        lastSeen: new Date(),
        activity: 'Browsing concerts'
      },
      {
        id: 'user2',
        username: 'ConcertGoer',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40',
        status: 'online',
        lastSeen: new Date(),
        activity: 'In chat room'
      },
      {
        id: 'user3',
        username: 'MetalQueen',
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b169?w=40&h=40',
        status: 'away',
        lastSeen: new Date(Date.now() - 300000),
        activity: 'Away'
      }
    ];
  }

  // Secure Direct Messaging Implementation
  async getConversations(userId: string): Promise<any[]> {
    return [
      {
        id: 'conv1',
        participant1Id: userId,
        participant2Id: 'user2',
        participant1Name: 'You',
        participant2Name: 'ConcertGoer',
        lastMessageAt: new Date('2024-08-18T14:30:00'),
        isEncrypted: true,
        unreadCount: 2
      },
      {
        id: 'conv2',
        participant1Id: userId,
        participant2Id: 'user3',
        participant1Name: 'You',
        participant2Name: 'MetalQueen',
        lastMessageAt: new Date('2024-08-18T12:15:00'),
        isEncrypted: true,
        unreadCount: 0
      },
      {
        id: 'conv3',
        participant1Id: userId,
        participant2Id: 'user4',
        participant1Name: 'You',
        participant2Name: 'RockVeteran',
        lastMessageAt: new Date('2024-08-17T18:45:00'),
        isEncrypted: true,
        unreadCount: 1
      }
    ];
  }

  async getConversation(conversationId: string): Promise<any> {
    const conversations = await this.getConversations('demo-user');
    return conversations.find(conv => conv.id === conversationId);
  }

  async createConversation(conversation: any): Promise<any> {
    return {
      id: randomUUID(),
      ...conversation,
      isEncrypted: true,
      lastMessageAt: new Date(),
      createdAt: new Date()
    };
  }

  async getMessages(conversationId: string): Promise<any[]> {
    // Mock encrypted messages - in reality these would be properly encrypted
    const mockMessages = {
      'conv1': [
        {
          id: '1',
          conversationId,
          senderId: 'user2',
          senderName: 'ConcertGoer',
          messageType: 'text',
          encryptedContent: '{"encryptedContent":[72,101,108,108,111],"encryptedKey":[...],"iv":[...]}', // Mock encrypted "Hello!"
          deliveredAt: new Date('2024-08-18T14:25:00'),
          readAt: new Date('2024-08-18T14:26:00'),
          createdAt: new Date('2024-08-18T14:25:00')
        },
        {
          id: '2',
          conversationId,
          senderId: 'demo-user',
          senderName: 'You',
          messageType: 'text',
          encryptedContent: '{"encryptedContent":[72,101,121],"encryptedKey":[...],"iv":[...]}', // Mock encrypted "Hey!"
          deliveredAt: new Date('2024-08-18T14:27:00'),
          readAt: new Date('2024-08-18T14:27:00'),
          createdAt: new Date('2024-08-18T14:27:00')
        },
        {
          id: '3',
          conversationId,
          senderId: 'user2',
          senderName: 'ConcertGoer',
          messageType: 'image',
          encryptedMediaUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300',
          mediaMetadata: { fileName: 'concert.jpg', fileSize: 245760 },
          deliveredAt: new Date('2024-08-18T14:30:00'),
          createdAt: new Date('2024-08-18T14:30:00')
        }
      ],
      'conv2': [
        {
          id: '4',
          conversationId,
          senderId: 'user3',
          senderName: 'MetalQueen',
          messageType: 'text',
          encryptedContent: '{"encryptedContent":[65,109,97,122,105,110,103],"encryptedKey":[...],"iv":[...]}', // Mock encrypted "Amazing show!"
          deliveredAt: new Date('2024-08-18T12:10:00'),
          readAt: new Date('2024-08-18T12:11:00'),
          createdAt: new Date('2024-08-18T12:10:00')
        },
        {
          id: '5',
          conversationId,
          senderId: 'demo-user',
          senderName: 'You',
          messageType: 'video',
          encryptedMediaUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          mediaMetadata: { 
            fileName: 'mosh_pit.mp4', 
            fileSize: 1048576, 
            duration: 30,
            thumbnailUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=200&h=150'
          },
          deliveredAt: new Date('2024-08-18T12:15:00'),
          readAt: new Date('2024-08-18T12:16:00'),
          createdAt: new Date('2024-08-18T12:15:00')
        }
      ]
    };

    return mockMessages[conversationId as keyof typeof mockMessages] || [];
  }

  async createMessage(message: any): Promise<any> {
    return {
      id: randomUUID(),
      ...message,
      deliveredAt: new Date(),
      createdAt: new Date()
    };
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    // Mark message as read
    console.log(`Message ${messageId} marked as read by user ${userId}`);
  }

  async getEncryptionKeys(userId: string): Promise<any[]> {
    return [
      {
        id: randomUUID(),
        userId,
        publicKey: 'mock-public-key-data',
        keyType: 'rsa',
        isActive: true,
        createdAt: new Date()
      }
    ];
  }

  async createEncryptionKey(key: any): Promise<any> {
    return {
      id: randomUUID(),
      ...key,
      isActive: true,
      createdAt: new Date()
    };
  }

  // Missing PitMessage methods
  async getPitMessages(): Promise<any[]> {
    return [];
  }

  async getPitMessage(id: string): Promise<any> {
    return undefined;
  }

  async createPitMessage(messageData: any): Promise<any> {
    return { id: randomUUID(), ...messageData, createdAt: new Date() };
  }

  async incrementPitMessageLikes(id: string): Promise<void> {
    console.log(`Pit message ${id} likes incremented`);
  }

  async incrementPitMessageReplies(id: string): Promise<void> {
    console.log(`Pit message ${id} replies incremented`);
  }

  // Missing User Groups methods
  async getUserGroups(): Promise<any[]> {
    return [];
  }

  async createUserGroup(group: any): Promise<any> {
    return { id: randomUUID(), ...group, createdAt: new Date() };
  }

  async joinGroup(groupId: string, userId: string): Promise<any> {
    return { groupId, userId, joinedAt: new Date() };
  }

  async getGroupPosts(groupId: string): Promise<any[]> {
    return [];
  }

  async createGroupPost(post: any): Promise<any> {
    return { id: randomUUID(), ...post, createdAt: new Date() };
  }

  async getMentorProfiles(): Promise<any[]> {
    return [];
  }

  async createMentorProfile(profile: any): Promise<any> {
    return { id: randomUUID(), ...profile, createdAt: new Date() };
  }

  async requestMentorship(mentorship: any): Promise<any> {
    return { id: randomUUID(), ...mentorship, createdAt: new Date() };
  }

  // Group Chat Operations Implementation
  async createGroupChat(groupData: InsertGroupChat): Promise<GroupChat> {
    const [newGroup] = await db.insert(groupChats).values(groupData).returning();
    
    // Add creator as group admin
    await db.insert(groupChatMembers).values({
      groupId: newGroup.id,
      userId: groupData.createdBy,
      role: 'creator',
      canAddMembers: true,
      canRemoveMembers: true,
      canEditGroup: true,
      canDeleteMessages: true,
    });
    
    return newGroup;
  }

  async getGroupChat(groupId: string): Promise<GroupChat | undefined> {
    const [group] = await db.select().from(groupChats).where(eq(groupChats.id, groupId));
    return group;
  }

  async getUserGroupChats(userId: string): Promise<(GroupChat & { memberRole: string, lastReadAt: Date | null })[]> {
    const result = await db
      .select({
        id: groupChats.id,
        name: groupChats.name,
        description: groupChats.description,
        iconUrl: groupChats.iconUrl,
        createdBy: groupChats.createdBy,
        isPrivate: groupChats.isPrivate,
        maxMembers: groupChats.maxMembers,
        memberCount: groupChats.memberCount,
        lastMessageAt: groupChats.lastMessageAt,
        encryptionEnabled: groupChats.encryptionEnabled,
        groupKeyVersion: groupChats.groupKeyVersion,
        allowMemberInvites: groupChats.allowMemberInvites,
        allowMediaSharing: groupChats.allowMediaSharing,
        allowEmojiReactions: groupChats.allowEmojiReactions,
        createdAt: groupChats.createdAt,
        updatedAt: groupChats.updatedAt,
        memberRole: groupChatMembers.role,
        lastReadAt: groupChatMembers.lastReadAt,
      })
      .from(groupChats)
      .innerJoin(groupChatMembers, eq(groupChats.id, groupChatMembers.groupId))
      .where(
        and(
          eq(groupChatMembers.userId, userId),
          eq(groupChatMembers.isActive, true)
        )
      )
      .orderBy(desc(groupChats.lastMessageAt));
    
    return result;
  }

  async addGroupMember(memberData: InsertGroupChatMember): Promise<GroupChatMember> {
    const [newMember] = await db.insert(groupChatMembers).values(memberData).returning();
    
    // Update group member count
    await db.update(groupChats)
      .set({ memberCount: sql`${groupChats.memberCount} + 1` })
      .where(eq(groupChats.id, memberData.groupId));
    
    return newMember;
  }

  async removeGroupMember(groupId: string, userId: string): Promise<boolean> {
    const result = await db
      .update(groupChatMembers)
      .set({ isActive: false })
      .where(
        and(
          eq(groupChatMembers.groupId, groupId),
          eq(groupChatMembers.userId, userId)
        )
      );
    
    if (result.rowCount && result.rowCount > 0) {
      // Update group member count
      await db.update(groupChats)
        .set({ memberCount: sql`${groupChats.memberCount} - 1` })
        .where(eq(groupChats.id, groupId));
      return true;
    }
    
    return false;
  }

  async getGroupMembers(groupId: string): Promise<(GroupChatMember & { user: User })[]> {
    const result = await db
      .select({
        id: groupChatMembers.id,
        groupId: groupChatMembers.groupId,
        userId: groupChatMembers.userId,
        role: groupChatMembers.role,
        canAddMembers: groupChatMembers.canAddMembers,
        canRemoveMembers: groupChatMembers.canRemoveMembers,
        canEditGroup: groupChatMembers.canEditGroup,
        canDeleteMessages: groupChatMembers.canDeleteMessages,
        joinedAt: groupChatMembers.joinedAt,
        lastReadAt: groupChatMembers.lastReadAt,
        isActive: groupChatMembers.isActive,
        encryptedGroupKey: groupChatMembers.encryptedGroupKey,
        keyVersion: groupChatMembers.keyVersion,
        user: users,
      })
      .from(groupChatMembers)
      .innerJoin(users, eq(groupChatMembers.userId, users.id))
      .where(
        and(
          eq(groupChatMembers.groupId, groupId),
          eq(groupChatMembers.isActive, true)
        )
      )
      .orderBy(groupChatMembers.joinedAt);
    
    return result;
  }

  async updateGroupMemberRole(groupId: string, userId: string, role: string, permissions: any): Promise<boolean> {
    const result = await db
      .update(groupChatMembers)
      .set({ 
        role,
        canAddMembers: permissions.canAddMembers || false,
        canRemoveMembers: permissions.canRemoveMembers || false,
        canEditGroup: permissions.canEditGroup || false,
        canDeleteMessages: permissions.canDeleteMessages || false,
      })
      .where(
        and(
          eq(groupChatMembers.groupId, groupId),
          eq(groupChatMembers.userId, userId)
        )
      );
    
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async createGroupMessage(messageData: InsertGroupMessage): Promise<GroupMessage> {
    const [newMessage] = await db.insert(groupMessages).values(messageData).returning();
    
    // Update group's last message timestamp
    await db.update(groupChats)
      .set({ lastMessageAt: new Date() })
      .where(eq(groupChats.id, messageData.groupId));
    
    return newMessage;
  }

  async getGroupMessages(groupId: string, limit: number = 50, before?: string): Promise<(GroupMessage & { sender: User, replyTo?: GroupMessage })[]> {
    let query = db
      .select({
        id: groupMessages.id,
        groupId: groupMessages.groupId,
        senderId: groupMessages.senderId,
        messageType: groupMessages.messageType,
        encryptedContent: groupMessages.encryptedContent,
        initializationVector: groupMessages.initializationVector,
        mediaUrl: groupMessages.mediaUrl,
        mediaType: groupMessages.mediaType,
        mediaSize: groupMessages.mediaSize,
        mediaDuration: groupMessages.mediaDuration,
        thumbnailUrl: groupMessages.thumbnailUrl,
        replyToId: groupMessages.replyToId,
        isEdited: groupMessages.isEdited,
        editedAt: groupMessages.editedAt,
        isDeleted: groupMessages.isDeleted,
        deletedAt: groupMessages.deletedAt,
        keyVersion: groupMessages.keyVersion,
        createdAt: groupMessages.createdAt,
        sender: users,
      })
      .from(groupMessages)
      .innerJoin(users, eq(groupMessages.senderId, users.id))
      .where(
        and(
          eq(groupMessages.groupId, groupId),
          eq(groupMessages.isDeleted, false)
        )
      );
    
    if (before) {
      query = query.where(lt(groupMessages.createdAt, new Date(before)));
    }
    
    const result = await query
      .orderBy(desc(groupMessages.createdAt))
      .limit(limit);
    
    return result;
  }

  async addGroupMessageReaction(reactionData: InsertGroupMessageReaction): Promise<GroupMessageReaction> {
    // Remove existing reaction from same user for same message with same emoji
    await db.delete(groupMessageReactions)
      .where(
        and(
          eq(groupMessageReactions.messageId, reactionData.messageId),
          eq(groupMessageReactions.userId, reactionData.userId),
          eq(groupMessageReactions.emoji, reactionData.emoji)
        )
      );
    
    const [newReaction] = await db.insert(groupMessageReactions).values(reactionData).returning();
    return newReaction;
  }

  async removeGroupMessageReaction(messageId: string, userId: string, emoji: string): Promise<boolean> {
    const result = await db.delete(groupMessageReactions)
      .where(
        and(
          eq(groupMessageReactions.messageId, messageId),
          eq(groupMessageReactions.userId, userId),
          eq(groupMessageReactions.emoji, emoji)
        )
      );
    
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async createMediaUpload(uploadData: InsertMediaUpload): Promise<MediaUpload> {
    const [newUpload] = await db.insert(mediaUploads).values(uploadData).returning();
    return newUpload;
  }

  async getMediaUpload(uploadId: string): Promise<MediaUpload | undefined> {
    const [upload] = await db.select().from(mediaUploads).where(eq(mediaUploads.id, uploadId));
    return upload;
  }

  async updateMediaUploadStatus(uploadId: string, status: string, thumbnailUrl?: string): Promise<boolean> {
    const updateData: any = { processingStatus: status };
    if (thumbnailUrl) {
      updateData.thumbnailUrl = thumbnailUrl;
    }
    
    const result = await db
      .update(mediaUploads)
      .set(updateData)
      .where(eq(mediaUploads.id, uploadId));
    
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async updateGroupMemberLastRead(groupId: string, userId: string): Promise<void> {
    await db.update(groupChatMembers)
      .set({ lastReadAt: new Date() })
      .where(
        and(
          eq(groupChatMembers.groupId, groupId),
          eq(groupChatMembers.userId, userId)
        )
      );
  }

  async checkGroupAdminPermissions(groupId: string, userId: string): Promise<{ isAdmin: boolean, permissions: any }> {
    const [member] = await db
      .select()
      .from(groupChatMembers)
      .where(
        and(
          eq(groupChatMembers.groupId, groupId),
          eq(groupChatMembers.userId, userId),
          eq(groupChatMembers.isActive, true)
        )
      );
    
    if (!member) {
      return { isAdmin: false, permissions: {} };
    }
    
    const isAdmin = member.role === 'creator' || member.role === 'admin';
    
    return {
      isAdmin,
      permissions: {
        canAddMembers: member.canAddMembers,
        canRemoveMembers: member.canRemoveMembers,
        canEditGroup: member.canEditGroup,
        canDeleteMessages: member.canDeleteMessages,
      }
    };
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
