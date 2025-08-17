import { type Band, type InsertBand, type Review, type InsertReview, type Photo, type InsertPhoto, type Tour, type InsertTour, type Message, type InsertMessage, type User, type UpsertUser, users, bands, reviews, photos, tours, messages } from "@shared/schema";
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
    return Array.from(this.bands.values()).sort((a, b) => a.name.localeCompare(b.name));
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
    return bands.filter(band => 
      band.name.toLowerCase().includes(searchTerm) ||
      band.genre.toLowerCase().includes(searchTerm) ||
      band.description.toLowerCase().includes(searchTerm)
    );
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

  // Messages (stub implementations - not used since we use DatabaseStorage)
  async getMessages(): Promise<Message[]> { return []; }
  async getMessage(id: string): Promise<Message | undefined> { return undefined; }
  async getMessagesByCategory(category: string): Promise<Message[]> { return []; }
  async createMessage(message: InsertMessage): Promise<Message> { throw new Error("Not implemented"); }
  async updateMessage(id: string, message: Partial<InsertMessage>): Promise<Message | undefined> { return undefined; }
  async deleteMessage(id: string): Promise<boolean> { return false; }
  async likeMessage(id: string): Promise<Message | undefined> { return undefined; }
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
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
