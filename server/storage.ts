import { type Band, type InsertBand, type Review, type InsertReview, type Photo, type InsertPhoto, type Tour, type InsertTour } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Bands
  getBands(): Promise<Band[]>;
  getBand(id: string): Promise<Band | undefined>;
  createBand(band: InsertBand): Promise<Band>;
  updateBand(id: string, band: Partial<InsertBand>): Promise<Band | undefined>;
  deleteBand(id: string): Promise<boolean>;
  searchBands(query: string): Promise<Band[]>;

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
}

export class MemStorage implements IStorage {
  private bands: Map<string, Band> = new Map();
  private reviews: Map<string, Review> = new Map();
  private photos: Map<string, Photo> = new Map();
  private tours: Map<string, Tour> = new Map();

  constructor() {
    this.seedData();
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
      website: insertBand.website || null
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
}

export const storage = new MemStorage();
