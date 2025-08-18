import { 
  type Band, type InsertBand, 
  type Review, type InsertReview, 
  type Photo, type InsertPhoto, 
  type Tour, type InsertTour, 
  type Message, type InsertMessage, 
  type User, type UpsertUser,
  type PitMessage, type InsertPitMessage,
  type PitReply, type InsertPitReply,
  type Comment, type InsertComment,
  type CommentReaction, type InsertCommentReaction,
  type Conversation, type InsertConversation,
  type DirectMessage, type InsertDirectMessage,
  type MessageEncryptionKey, type InsertMessageEncryptionKey,
  type MessageDeliveryReceipt, type InsertMessageDeliveryReceipt,
  users, bands, reviews, photos, tours, messages, pitMessages, pitReplies, comments, commentReactions,
  conversations, directMessages, messageEncryptionKeys, messageDeliveryReceipts
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations (required for authentication)
  getUser(id: string): Promise<User | undefined>;
  getUserByStagename(stagename: string): Promise<User | undefined>;
  checkStagenameAvailable(stagename: string): Promise<boolean>;
  updateUserStagename(id: string, stagename: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
  getComments(targetType: string, targetId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: string, content: string): Promise<Comment>;
  deleteComment(id: string, reason: string): Promise<void>;
  createCommentReaction(reaction: InsertCommentReaction): Promise<CommentReaction>;

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

  // Secure Direct Messaging
  getConversations(userId: string): Promise<any[]>;
  getConversation(conversationId: string): Promise<any>;
  createConversation(conversation: any): Promise<any>;
  getMessages(conversationId: string): Promise<any[]>;
  createMessage(message: any): Promise<any>;
  markMessageAsRead(messageId: string, userId: string): Promise<void>;
  getEncryptionKeys(userId: string): Promise<any[]>;
  createEncryptionKey(key: any): Promise<any>;
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

  async checkStagenameAvailable(stagename: string): Promise<boolean> {
    const user = await this.getUserByStagename(stagename);
    return !user;
  }

  async updateUserStagename(id: string, stagename: string): Promise<User | undefined> {
    const [user] = await db.update(users)
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

  // Bands
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

  async createBandSubmission(bandData: InsertBand & { ownerId: string }): Promise<Band> {
    const [band] = await db.insert(bands).values({
      ...bandData,
      status: 'pending',
      submittedAt: new Date(),
    }).returning();
    return band;
  }

  async getBandsByOwner(ownerId: string): Promise<Band[]> {
    return await db.select().from(bands).where(eq(bands.ownerId, ownerId)).orderBy(bands.submittedAt);
  }

  async updateBand(id: string, bandUpdate: Partial<InsertBand>): Promise<Band | undefined> {
    const [band] = await db.update(bands).set(bandUpdate).where(eq(bands.id, id)).returning();
    return band;
  }

  async deleteBand(id: string): Promise<boolean> {
    const result = await db.delete(bands).where(eq(bands.id, id));
    return (result.rowCount || 0) > 0;
  }

  async searchBands(query: string): Promise<Band[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return await db.select().from(bands)
      .where(
        sql`LOWER(${bands.name}) LIKE ${searchTerm} OR LOWER(${bands.genre}) LIKE ${searchTerm} OR LOWER(${bands.description}) LIKE ${searchTerm}`
      )
      .orderBy(bands.name);
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
    const searchTerm = `%${query.toLowerCase()}%`;
    const now = new Date();
    
    // Build bands query with all conditions
    let bandsCondition = sql`LOWER(${bands.name}) LIKE ${searchTerm} OR LOWER(${bands.genre}) LIKE ${searchTerm} OR LOWER(${bands.description}) LIKE ${searchTerm}`;
    if (filters.genre && filters.genre !== 'all') {
      bandsCondition = sql`(${bandsCondition}) AND ${bands.genre} = ${filters.genre}`;
    }
    const bandsResult = await db.select().from(bands).where(bandsCondition).orderBy(bands.name);
    
    // Build tours query with all conditions
    let toursCondition = sql`LOWER(${tours.tourName}) LIKE ${searchTerm} OR LOWER(${tours.venue}) LIKE ${searchTerm} OR LOWER(${tours.city}) LIKE ${searchTerm} OR LOWER(${tours.country}) LIKE ${searchTerm}`;
    
    if (filters.country && filters.country !== 'all') {
      const countryTerm = `%${filters.country.toLowerCase()}%`;
      toursCondition = sql`(${toursCondition}) AND LOWER(${tours.country}) LIKE ${countryTerm}`;
    }
    
    if (filters.dateRange && filters.dateRange !== 'all') {
      switch (filters.dateRange) {
        case 'upcoming':
          toursCondition = sql`(${toursCondition}) AND ${tours.date} > ${now}`;
          break;
        case 'thisWeek':
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          toursCondition = sql`(${toursCondition}) AND ${tours.date} >= ${now} AND ${tours.date} <= ${weekFromNow}`;
          break;
        case 'thisMonth':
          const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
          toursCondition = sql`(${toursCondition}) AND ${tours.date} >= ${now} AND ${tours.date} <= ${monthFromNow}`;
          break;
        case 'thisYear':
          const yearEnd = new Date(now.getFullYear(), 11, 31);
          toursCondition = sql`(${toursCondition}) AND ${tours.date} >= ${now} AND ${tours.date} <= ${yearEnd}`;
          break;
      }
    }
    const toursResult = await db.select().from(tours).where(toursCondition).orderBy(tours.date);
    
    // Build reviews query with all conditions
    let reviewsCondition = sql`LOWER(${reviews.title}) LIKE ${searchTerm} OR LOWER(${reviews.content}) LIKE ${searchTerm} OR LOWER(${reviews.targetName}) LIKE ${searchTerm} OR LOWER(${reviews.stagename}) LIKE ${searchTerm}`;
    if (filters.reviewType && filters.reviewType !== 'all') {
      reviewsCondition = sql`(${reviewsCondition}) AND ${reviews.reviewType} = ${filters.reviewType}`;
    }
    const reviewsResult = await db.select().from(reviews).where(reviewsCondition).orderBy(reviews.createdAt);
    
    // Build photos query with all conditions
    let photosCondition = sql`LOWER(${photos.title}) LIKE ${searchTerm} OR LOWER(${photos.description}) LIKE ${searchTerm} OR LOWER(${photos.uploadedBy}) LIKE ${searchTerm}`;
    if (filters.photoCategory && filters.photoCategory !== 'all') {
      photosCondition = sql`(${photosCondition}) AND ${photos.category} = ${filters.photoCategory}`;
    }
    const photosResult = await db.select().from(photos).where(photosCondition).orderBy(photos.createdAt);
    
    return {
      bands: bandsResult,
      tours: toursResult,
      reviews: reviewsResult,
      photos: photosResult
    };
  }

  // Reviews
  async getReviews(): Promise<Review[]> {
    return await db.select().from(reviews).orderBy(reviews.createdAt);
  }

  async getReview(id: string): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }

  async getReviewsByBand(bandId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.bandId, bandId)).orderBy(reviews.createdAt);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  async updateReview(id: string, reviewUpdate: Partial<InsertReview>): Promise<Review | undefined> {
    const [review] = await db.update(reviews).set(reviewUpdate).where(eq(reviews.id, id)).returning();
    return review;
  }

  async deleteReview(id: string): Promise<boolean> {
    const result = await db.delete(reviews).where(eq(reviews.id, id));
    return (result.rowCount || 0) > 0;
  }

  async likeReview(id: string): Promise<Review | undefined> {
    const [review] = await db.update(reviews)
      .set({ likes: sql`${reviews.likes} + 1` })
      .where(eq(reviews.id, id))
      .returning();
    return review;
  }

  // Photos
  async getPhotos(): Promise<Photo[]> {
    return await db.select().from(photos).orderBy(photos.createdAt);
  }

  async getPhoto(id: string): Promise<Photo | undefined> {
    const [photo] = await db.select().from(photos).where(eq(photos.id, id));
    return photo;
  }

  async getPhotosByBand(bandId: string): Promise<Photo[]> {
    return await db.select().from(photos).where(eq(photos.bandId, bandId)).orderBy(photos.createdAt);
  }

  async getPhotosByCategory(category: string): Promise<Photo[]> {
    return await db.select().from(photos).where(eq(photos.category, category)).orderBy(photos.createdAt);
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const [photo] = await db.insert(photos).values(insertPhoto).returning();
    return photo;
  }

  async updatePhoto(id: string, photoUpdate: Partial<InsertPhoto>): Promise<Photo | undefined> {
    const [photo] = await db.update(photos).set(photoUpdate).where(eq(photos.id, id)).returning();
    return photo;
  }

  async deletePhoto(id: string): Promise<boolean> {
    const result = await db.delete(photos).where(eq(photos.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Tours
  async getTours(): Promise<Tour[]> {
    return await db.select().from(tours).orderBy(tours.date);
  }

  async getTour(id: string): Promise<Tour | undefined> {
    const [tour] = await db.select().from(tours).where(eq(tours.id, id));
    return tour;
  }

  async getToursByBand(bandId: string): Promise<Tour[]> {
    return await db.select().from(tours).where(eq(tours.bandId, bandId)).orderBy(tours.date);
  }

  async getUpcomingTours(): Promise<Tour[]> {
    const now = new Date();
    return await db.select().from(tours).where(sql`${tours.date} > ${now}`).orderBy(tours.date);
  }

  async createTour(insertTour: InsertTour): Promise<Tour> {
    const [tour] = await db.insert(tours).values(insertTour).returning();
    return tour;
  }

  async updateTour(id: string, tourUpdate: Partial<InsertTour>): Promise<Tour | undefined> {
    const [tour] = await db.update(tours).set(tourUpdate).where(eq(tours.id, id)).returning();
    return tour;
  }

  async deleteTour(id: string): Promise<boolean> {
    const result = await db.delete(tours).where(eq(tours.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Messages
  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(messages.createdAt);
  }

  async getMessage(id: string): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async getMessagesByCategory(category: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.category, category)).orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async updateMessage(id: string, messageUpdate: Partial<InsertMessage>): Promise<Message | undefined> {
    const [message] = await db.update(messages).set(messageUpdate).where(eq(messages.id, id)).returning();
    return message;
  }

  async deleteMessage(id: string): Promise<boolean> {
    const result = await db.delete(messages).where(eq(messages.id, id));
    return (result.rowCount || 0) > 0;
  }

  async likeMessage(id: string): Promise<Message | undefined> {
    const [message] = await db.update(messages)
      .set({ likes: sql`${messages.likes} + 1` })
      .where(eq(messages.id, id))
      .returning();
    return message;
  }

  // Analytics for background AI
  async getUserActivity(userId: string): Promise<any[]> {
    try {
      // Get user's recent activity patterns
      const userBands = await this.getBandsByOwner(userId);
      const allReviews = await this.getReviews();
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
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
  }

  // Pit message board operations
  async getPitMessages(): Promise<PitMessage[]> {
    try {
      const result = await db.select().from(pitMessages).orderBy(sql`created_at DESC`);
      return result || [];
    } catch (error) {
      console.error("Error fetching pit messages:", error);
      return [];
    }
  }

  async getPitMessage(id: string): Promise<PitMessage | undefined> {
    try {
      const [message] = await db.select().from(pitMessages).where(eq(pitMessages.id, id));
      return message;
    } catch (error) {
      console.error("Error fetching pit message:", error);
      return undefined;
    }
  }

  async createPitMessage(messageData: InsertPitMessage): Promise<PitMessage> {
    try {
      const [message] = await db.insert(pitMessages).values({
        ...messageData,
        id: randomUUID()
      }).returning();
      return message;
    } catch (error) {
      console.error("Error creating pit message:", error);
      throw error;
    }
  }

  async incrementPitMessageLikes(id: string): Promise<void> {
    try {
      await db.update(pitMessages)
        .set({ likes: sql`likes + 1` })
        .where(eq(pitMessages.id, id));
    } catch (error) {
      console.error("Error incrementing pit message likes:", error);
      throw error;
    }
  }

  async incrementPitMessageReplies(id: string): Promise<void> {
    try {
      await db.update(pitMessages)
        .set({ replies: sql`replies + 1` })
        .where(eq(pitMessages.id, id));
    } catch (error) {
      console.error("Error incrementing pit message replies:", error);
      throw error;
    }
  }

  async getPitReplies(messageId: string): Promise<PitReply[]> {
    try {
      const result = await db.select().from(pitReplies)
        .where(eq(pitReplies.messageId, messageId))
        .orderBy(sql`created_at ASC`);
      return result || [];
    } catch (error) {
      console.error("Error fetching pit replies:", error);
      return [];
    }
  }

  async createPitReply(replyData: InsertPitReply): Promise<PitReply> {
    try {
      const [reply] = await db.insert(pitReplies).values({
        ...replyData,
        id: randomUUID()
      }).returning();
      return reply;
    } catch (error) {
      console.error("Error creating pit reply:", error);
      throw error;
    }
  }

  async incrementPitReplyLikes(id: string): Promise<void> {
    try {
      await db.update(pitReplies)
        .set({ likes: sql`likes + 1` })
        .where(eq(pitReplies.id, id));
    } catch (error) {
      console.error("Error incrementing pit reply likes:", error);
      throw error;
    }
  }

  // Comments system implementation
  async getComments(targetType: string, targetId: string): Promise<Comment[]> {
    try {
      const result = await db.select()
        .from(comments)
        .where(sql`${comments.targetType} = ${targetType} AND ${comments.targetId} = ${targetId} AND ${comments.isDeleted} = false`)
        .orderBy(comments.createdAt);
      return result;
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  }

  async createComment(commentData: InsertComment): Promise<Comment> {
    try {
      const [comment] = await db.insert(comments).values({
        ...commentData,
        id: randomUUID()
      }).returning();
      return comment;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  }

  async updateComment(id: string, content: string): Promise<Comment> {
    try {
      const [comment] = await db.update(comments)
        .set({ 
          content, 
          isEdited: true, 
          updatedAt: new Date() 
        })
        .where(eq(comments.id, id))
        .returning();
      return comment;
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  }

  async deleteComment(id: string, reason: string): Promise<void> {
    try {
      await db.update(comments)
        .set({ 
          isDeleted: true, 
          deletedReason: reason,
          updatedAt: new Date()
        })
        .where(eq(comments.id, id));
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }

  async createCommentReaction(reactionData: InsertCommentReaction): Promise<CommentReaction> {
    try {
      // First, check if user already reacted to this comment
      const existingReaction = await db.select()
        .from(commentReactions)
        .where(sql`${commentReactions.commentId} = ${reactionData.commentId} AND ${commentReactions.userId} = ${reactionData.userId}`);
      
      if (existingReaction.length > 0) {
        // Update existing reaction
        const [reaction] = await db.update(commentReactions)
          .set({ reactionType: reactionData.reactionType })
          .where(sql`${commentReactions.commentId} = ${reactionData.commentId} AND ${commentReactions.userId} = ${reactionData.userId}`)
          .returning();
        return reaction;
      } else {
        // Create new reaction
        const [reaction] = await db.insert(commentReactions).values({
          ...reactionData,
          id: randomUUID()
        }).returning();
        
        // Update comment reaction counts
        if (reactionData.reactionType === 'like') {
          await db.update(comments)
            .set({ likes: sql`likes + 1` })
            .where(eq(comments.id, reactionData.commentId));
        } else if (reactionData.reactionType === 'dislike') {
          await db.update(comments)
            .set({ dislikes: sql`dislikes + 1` })
            .where(eq(comments.id, reactionData.commentId));
        }
        
        return reaction;
      }
    } catch (error) {
      console.error("Error creating comment reaction:", error);
      throw error;
    }
  }

  // Real-time messaging system implementation
  async createConversation(conversationData: InsertConversation): Promise<Conversation> {
    try {
      const [conversation] = await db.insert(conversations).values({
        ...conversationData,
        id: randomUUID()
      }).returning();
      return conversation;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    try {
      const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
      return conversation;
    } catch (error) {
      console.error("Error getting conversation:", error);
      return undefined;
    }
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      return await db.select().from(conversations)
        .where(sql`${conversations.participant1Id} = ${userId} OR ${conversations.participant2Id} = ${userId}`)
        .orderBy(sql`${conversations.lastMessageAt} DESC`);
    } catch (error) {
      console.error("Error getting user conversations:", error);
      return [];
    }
  }

  async updateConversationLastMessage(conversationId: string): Promise<void> {
    try {
      await db.update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, conversationId));
    } catch (error) {
      console.error("Error updating conversation last message:", error);
      throw error;
    }
  }

  async createDirectMessage(messageData: InsertDirectMessage): Promise<DirectMessage> {
    try {
      const [message] = await db.insert(directMessages).values({
        ...messageData,
        id: randomUUID()
      }).returning();
      return message;
    } catch (error) {
      console.error("Error creating direct message:", error);
      throw error;
    }
  }

  async getDirectMessage(id: string): Promise<DirectMessage | undefined> {
    try {
      const [message] = await db.select().from(directMessages).where(eq(directMessages.id, id));
      return message;
    } catch (error) {
      console.error("Error getting direct message:", error);
      return undefined;
    }
  }

  async getConversationMessages(conversationId: string, limit: number = 50, offset: number = 0): Promise<DirectMessage[]> {
    try {
      return await db.select().from(directMessages)
        .where(eq(directMessages.conversationId, conversationId))
        .orderBy(sql`${directMessages.createdAt} DESC`)
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error("Error getting conversation messages:", error);
      return [];
    }
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    try {
      await db.update(directMessages)
        .set({ 
          isRead: true, 
          readAt: new Date() 
        })
        .where(eq(directMessages.id, messageId));
      
      // Create read receipt
      await this.createDeliveryReceipt({
        messageId,
        userId,
        status: 'read'
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw error;
    }
  }

  async markMessageAsDelivered(messageId: string, userId: string): Promise<void> {
    try {
      await db.update(directMessages)
        .set({ 
          isDelivered: true, 
          deliveredAt: new Date() 
        })
        .where(eq(directMessages.id, messageId));
      
      // Create delivery receipt
      await this.createDeliveryReceipt({
        messageId,
        userId,
        status: 'delivered'
      });
    } catch (error) {
      console.error("Error marking message as delivered:", error);
      throw error;
    }
  }

  async createUserEncryptionKeys(keysData: InsertMessageEncryptionKey): Promise<MessageEncryptionKey> {
    try {
      // Deactivate old keys
      await db.update(messageEncryptionKeys)
        .set({ isActive: false })
        .where(eq(messageEncryptionKeys.userId, keysData.userId));
      
      // Insert new active keys
      const [keys] = await db.insert(messageEncryptionKeys).values({
        ...keysData,
        id: randomUUID()
      }).returning();
      return keys;
    } catch (error) {
      console.error("Error creating user encryption keys:", error);
      throw error;
    }
  }

  async getUserEncryptionKeys(userId: string): Promise<MessageEncryptionKey | undefined> {
    try {
      const [keys] = await db.select().from(messageEncryptionKeys)
        .where(sql`${messageEncryptionKeys.userId} = ${userId} AND ${messageEncryptionKeys.isActive} = true`)
        .orderBy(sql`${messageEncryptionKeys.createdAt} DESC`)
        .limit(1);
      return keys;
    } catch (error) {
      console.error("Error getting user encryption keys:", error);
      return undefined;
    }
  }

  async updateUserEncryptionKeys(userId: string, keysData: Partial<InsertMessageEncryptionKey>): Promise<MessageEncryptionKey | undefined> {
    try {
      const [keys] = await db.update(messageEncryptionKeys)
        .set(keysData)
        .where(sql`${messageEncryptionKeys.userId} = ${userId} AND ${messageEncryptionKeys.isActive} = true`)
        .returning();
      return keys;
    } catch (error) {
      console.error("Error updating user encryption keys:", error);
      return undefined;
    }
  }

  async createDeliveryReceipt(receiptData: InsertMessageDeliveryReceipt): Promise<MessageDeliveryReceipt> {
    try {
      const [receipt] = await db.insert(messageDeliveryReceipts).values({
        ...receiptData,
        id: randomUUID()
      }).returning();
      return receipt;
    } catch (error) {
      console.error("Error creating delivery receipt:", error);
      throw error;
    }
  }

  async getMessageDeliveryReceipts(messageId: string): Promise<MessageDeliveryReceipt[]> {
    try {
      return await db.select().from(messageDeliveryReceipts)
        .where(eq(messageDeliveryReceipts.messageId, messageId))
        .orderBy(sql`${messageDeliveryReceipts.timestamp} DESC`);
    } catch (error) {
      console.error("Error getting message delivery receipts:", error);
      return [];
    }
  }

  // Missing methods for MemStorage compatibility
  async getUserGroups(): Promise<any[]> { return []; }
  async createUserGroup(group: any): Promise<any> { return { id: randomUUID(), ...group }; }
  async joinGroup(groupId: string, userId: string): Promise<any> { return { groupId, userId }; }
  async getGroupPosts(groupId: string): Promise<any[]> { return []; }
  async createGroupPost(post: any): Promise<any> { return { id: randomUUID(), ...post }; }
  async getMentorProfiles(): Promise<any[]> { return []; }
  async createMentorProfile(profile: any): Promise<any> { return { id: randomUUID(), ...profile }; }
  async requestMentorship(mentorship: any): Promise<any> { return { id: randomUUID(), ...mentorship }; }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
