import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBandSchema, insertReviewSchema, insertPhotoSchema, insertTourSchema, insertMessageSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { googleSearchService, type EnhancedSearchResult } from "./googleSearch";
import { tourDataService } from "./tourDataService";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

async function seedDatabase() {
  try {
    // Check if we already have bands
    const existingBands = await storage.getBands();
    
    if (existingBands.length === 0) {
      console.log("Seeding database with initial bands...");
      
      // Create top 10 rock/metal bands from Spotify (2025)
      await storage.createBand({
      name: "LINKIN PARK",
      genre: "Nu Metal",
      description: "Pioneering nu-metal band with massive Spotify presence (60.4M monthly listeners). Known for their fusion of rock, hip-hop, and electronic elements.",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      founded: 1996,
      members: ["Mike Shinoda", "Brad Delson", "Dave Farrell", "Joe Hahn", "Rob Bourdon", "Emily Armstrong"],
      albums: ["Hybrid Theory", "Meteora", "Minutes to Midnight", "A Thousand Suns", "Living Things"],
      website: "https://linkinpark.com",
      instagram: "https://instagram.com/linkinpark",
    });

    const queen = await storage.createBand({
      name: "QUEEN",
      genre: "Rock",
      description: "Legendary British rock band with global appeal (52.8M monthly listeners). Timeless classics that span generations with theatrical performances.",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      founded: 1970,
      members: ["Freddie Mercury", "Brian May", "Roger Taylor", "John Deacon"],
      albums: ["Queen", "A Night at the Opera", "News of the World", "The Game", "Innuendo"],
      website: "https://queenonline.com",
      instagram: "https://instagram.com/officialqueenmusic",
    });

    const acdc = await storage.createBand({
      name: "AC/DC",
      genre: "Hard Rock",
      description: "Australian hard rock titans with consistent streaming power (37.7M monthly listeners). High-voltage rock and roll since the 1970s.",
      imageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      founded: 1973,
      members: ["Angus Young", "Brian Johnson", "Phil Rudd", "Cliff Williams", "Stevie Young"],
      albums: ["High Voltage", "Highway to Hell", "Back in Black", "For Those About to Rock", "The Razors Edge"],
      website: "https://acdc.com",
      instagram: "https://instagram.com/acdc",
    });

    const redHotChiliPeppers = await storage.createBand({
      name: "RED HOT CHILI PEPPERS",
      genre: "Alternative Rock",
      description: "Funk rock pioneers with crossover success (36.7M monthly listeners). Blending rock, funk, and rap with California attitude.",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      founded: 1982,
      members: ["Anthony Kiedis", "Flea", "Chad Smith", "John Frusciante"],
      albums: ["Blood Sugar Sex Magik", "Californication", "By the Way", "Stadium Arcadium", "Unlimited Love"],
      website: "https://redhotchilipeppers.com",
      instagram: "https://instagram.com/chilipeppers",
    });

    const greenDay = await storage.createBand({
      name: "GREEN DAY",
      genre: "Pop Punk",
      description: "Pop-punk legends with mainstream staying power (36.4M monthly listeners). Defined the 90s punk revival and continue to evolve.",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      founded: 1987,
      members: ["Billie Joe Armstrong", "Mike Dirnt", "Tré Cool"],
      albums: ["Dookie", "Insomniac", "American Idiot", "21st Century Breakdown", "Revolution Radio"],
      website: "https://greenday.com",
      instagram: "https://instagram.com/greenday",
    });

    const nirvana = await storage.createBand({
      name: "NIRVANA",
      genre: "Grunge",
      description: "Grunge pioneers with lasting cultural impact (32.9M monthly listeners). Defined alternative rock and the Seattle sound of the 90s.",
      imageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      founded: 1987,
      members: ["Kurt Cobain", "Krist Novoselic", "Dave Grohl"],
      albums: ["Bleach", "Nevermind", "In Utero", "MTV Unplugged in New York"],
      website: "https://nirvana.com",
      instagram: "https://instagram.com/nirvana",
    });

    const twentyOnePilots = await storage.createBand({
      name: "TWENTY ONE PILOTS",
      genre: "Alternative Rock",
      description: "Modern alternative rock with metal influences (30.9M monthly listeners). Genre-blending duo from Columbus with devoted fanbase.",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      founded: 2009,
      members: ["Tyler Joseph", "Josh Dun"],
      albums: ["Vessel", "Blurryface", "Trench", "Scaled and Icy", "Clancy"],
      website: "https://twentyonepilots.com",
      instagram: "https://instagram.com/twentyonepilots",
    });

    const gunsNRoses = await storage.createBand({
      name: "GUNS N' ROSES",
      genre: "Hard Rock",
      description: "Hard rock icons maintaining streaming relevance (30.4M monthly listeners). Los Angeles rock legends with a rebellious attitude.",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      founded: 1985,
      members: ["Axl Rose", "Slash", "Duff McKagan", "Dizzy Reed", "Richard Fortus", "Frank Ferrer", "Melissa Reese"],
      albums: ["Appetite for Destruction", "G N' R Lies", "Use Your Illusion I", "Use Your Illusion II", "Chinese Democracy"],
      website: "https://gunsnroses.com",
      instagram: "https://instagram.com/gunsnroses",
    });

    const bonJovi = await storage.createBand({
      name: "BON JOVI",
      genre: "Arena Rock",
      description: "Arena rock veterans with broad appeal (30.0M monthly listeners). New Jersey rock icons known for anthemic choruses and stadium shows.",
      imageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      founded: 1983,
      members: ["Jon Bon Jovi", "David Bryan", "Tico Torres", "Phil X"],
      albums: ["Bon Jovi", "Slippery When Wet", "New Jersey", "Keep the Faith", "These Days"],
      website: "https://bonjovi.com",
      instagram: "https://instagram.com/bonjovi",
    });

      await storage.createBand({
        name: "RADIOHEAD",
        genre: "Alternative Rock", 
        description: "Art rock innovators with devoted fanbase (29.7M monthly listeners). Experimental British band pushing the boundaries of rock music.",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        founded: 1985,
        members: ["Thom Yorke", "Jonny Greenwood", "Colin Greenwood", "Ed O'Brien", "Philip Selway"],
        albums: ["OK Computer", "Kid A", "In Rainbows", "Hail to the Thief", "A Moon Shaped Pool"],
        website: "https://radiohead.com",
        instagram: "https://instagram.com/radiohead",
      });

      console.log("Database seeded successfully!");
    }
  } catch (error) {
    console.error("Failed to seed database:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Seed database with initial data
  await seedDatabase();

  // Initialize tour data refresh (run once on startup)
  setTimeout(async () => {
    try {
      await tourDataService.refreshTourDatabase();
      console.log('Initial tour data refresh completed');
    } catch (error) {
      console.error('Initial tour data refresh failed:', error);
    }
  }, 5000); // Wait 5 seconds after startup

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile and account management routes
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user's bands count
      const userBands = await storage.getBandsByOwner(userId);
      
      // Get user's reviews count (would need to add userId to reviews in a real app)
      const allReviews = await storage.getReviews();
      const userReviews = allReviews.filter(review => 
        // For now, match by stagename since we don't have userId in reviews
        userBands.some(band => band.name === review.stagename)
      );
      
      // Get user's photos count (would need to add userId to photos in a real app)
      const allPhotos = await storage.getPhotos();
      const userPhotos = allPhotos.filter(photo => 
        userBands.some(band => band.id === photo.bandId)
      );
      
      const user = await storage.getUser(userId);
      
      res.json({
        bandsSubmitted: userBands.length,
        reviewsWritten: userReviews.length,
        photosUploaded: userPhotos.length,
        memberSince: user?.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user statistics" });
    }
  });

  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, stagename } = req.body;
      
      if (!firstName || !lastName || !stagename) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Check stagename availability if changed
      const currentUser = await storage.getUser(userId);
      if (currentUser?.stagename !== stagename) {
        const available = await storage.checkStagenameAvailable(stagename);
        if (!available) {
          return res.status(409).json({ message: "Stagename already taken" });
        }
      }
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        firstName,
        lastName,
        stagename,
        email: currentUser?.email,
        profileImageUrl: currentUser?.profileImageUrl,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // For now, return default preferences since we don't have a preferences table
      // In a real app, you'd have a user_preferences table
      const defaultPreferences = {
        id: userId,
        userId,
        emailNotifications: true,
        tourAlerts: true,
        reviewNotifications: true,
        bandUpdates: true,
        profileVisibility: "public" as const,
        preferredGenres: [],
        autoApprovePhotos: false,
      };
      
      res.json(defaultPreferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  app.put('/api/user/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = req.body;
      
      // In a real app, you'd save these to a user_preferences table
      // For now, just return the updated preferences
      const updatedPreferences = {
        id: userId,
        userId,
        ...preferences,
      };
      
      res.json(updatedPreferences);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  app.post('/api/user/onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName, stagename, favoriteGenres, notifications } = req.body;
      
      if (!firstName || !lastName || !stagename) {
        return res.status(400).json({ message: "All profile fields are required" });
      }
      
      // Check stagename availability
      const available = await storage.checkStagenameAvailable(stagename);
      if (!available) {
        return res.status(409).json({ message: "Stagename already taken" });
      }
      
      const currentUser = await storage.getUser(userId);
      const updatedUser = await storage.upsertUser({
        id: userId,
        firstName,
        lastName,
        stagename,
        email: currentUser?.email,
        profileImageUrl: currentUser?.profileImageUrl,
      });
      
      // In a real app, you'd also save the favorite genres and notification preferences
      // For now, just return success
      
      res.json({ 
        user: updatedUser, 
        message: "Onboarding completed successfully",
        preferences: {
          favoriteGenres,
          notifications
        }
      });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  app.delete('/api/user/account', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // In a real app, you'd delete all user data:
      // - User record
      // - User's bands
      // - User's reviews
      // - User's photos
      // - User's preferences
      // - User's sessions
      
      // For now, just return success (since we can't actually delete from the auth provider)
      res.json({ message: "Account deletion initiated. You will be logged out shortly." });
    } catch (error) {
      console.error("Error deleting user account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Stagename routes
  app.get('/api/stagename/check/:stagename', async (req, res) => {
    try {
      const { stagename } = req.params;
      if (!stagename || stagename.length < 2) {
        return res.status(400).json({ message: "Stagename must be at least 2 characters" });
      }
      const available = await storage.checkStagenameAvailable(stagename);
      res.json({ available, stagename });
    } catch (error) {
      res.status(500).json({ message: "Failed to check stagename availability" });
    }
  });

  app.put('/api/auth/user/stagename', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { stagename } = req.body;
      
      if (!stagename || stagename.length < 2 || stagename.length > 50) {
        return res.status(400).json({ message: "Stagename must be 2-50 characters" });
      }
      
      // Check if stagename is available
      const available = await storage.checkStagenameAvailable(stagename);
      if (!available) {
        return res.status(409).json({ message: "Stagename already taken" });
      }
      
      const user = await storage.updateUserStagename(userId, stagename);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error updating stagename:", error);
      res.status(500).json({ message: "Failed to update stagename" });
    }
  });

  // Enhanced search endpoint with Google integration
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const genre = req.query.genre as string;
      const photoCategory = req.query.photoCategory as string;
      const reviewType = req.query.reviewType as string;
      const country = req.query.country as string;
      const dateRange = req.query.dateRange as string;
      const includeWeb = req.query.includeWeb !== 'false'; // Default to true
      
      if (!query || query.length < 2) {
        return res.json({ bands: [], tours: [], reviews: [], photos: [], webResults: [] });
      }
      
      // Run both database and Google searches in parallel
      const [dbResults, webResults] = await Promise.all([
        storage.searchAll(query, {
          genre: genre === 'all' ? undefined : genre,
          photoCategory: photoCategory === 'all' ? undefined : photoCategory,
          reviewType: reviewType === 'all' ? undefined : reviewType,
          country: country === 'all' ? undefined : country,
          dateRange: dateRange === 'all' ? undefined : dateRange
        }),
        includeWeb ? getWebSearchResults(query) : Promise.resolve([])
      ]);
      
      // Add upcoming tours for each band in search results
      const bandsWithTours = await Promise.all(
        dbResults.bands.map(async (band) => {
          const upcomingTours = await storage.getToursByBand(band.id);
          const now = new Date();
          const currentTours = upcomingTours.filter(tour => 
            new Date(tour.date) > now && 
            tour.status !== 'cancelled'
          ).slice(0, 3);
          
          return {
            ...band,
            upcomingTours: currentTours
          };
        })
      );
      
      res.json({
        ...dbResults,
        bands: bandsWithTours,
        webResults
      });
    } catch (error) {
      console.error("Error performing search:", error);
      res.status(500).json({ message: "Failed to perform search" });
    }
  });

  // Helper function to get web search results
  async function getWebSearchResults(query: string): Promise<EnhancedSearchResult[]> {
    try {
      const [bandResults, tourResults, newsResults] = await Promise.all([
        googleSearchService.searchMetalBands(query, 3),
        googleSearchService.searchMetalTours(query, 3), 
        googleSearchService.searchMetalNews(query, 3)
      ]);
      
      return [...bandResults, ...tourResults, ...newsResults];
    } catch (error) {
      console.error("Error fetching web search results:", error);
      return [];
    }
  }

  // Google search endpoint for web results only
  app.get("/api/search/web", async (req, res) => {
    try {
      const query = req.query.q as string;
      const type = req.query.type as string || 'general';
      
      if (!query || query.length < 2) {
        return res.json([]);
      }
      
      let results: EnhancedSearchResult[] = [];
      
      switch (type) {
        case 'bands':
          results = await googleSearchService.searchMetalBands(query, 5);
          break;
        case 'tours':
          results = await googleSearchService.searchMetalTours(query, 5);
          break;
        case 'news':
          results = await googleSearchService.searchMetalNews(query, 5);
          break;
        default:
          results = await googleSearchService.searchGeneral(query, 5);
          break;
      }
      
      res.json(results);
    } catch (error) {
      console.error("Error performing web search:", error);
      res.status(500).json({ message: "Failed to perform web search" });
    }
  });

  // Enhanced band search with Google integration
  app.get("/api/bands/search", async (req, res) => {
    try {
      const { q, includeWeb } = req.query;
      const query = q as string;
      const shouldIncludeWeb = includeWeb === 'true';
      
      if (!query || query.trim() === '') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      // Get database results
      const databaseBands = await storage.searchBands(query);
      const bandsWithTours = await Promise.all(
        databaseBands.map(async (band) => {
          const upcomingTours = await storage.getToursByBand(band.id);
          const now = new Date();
          const currentTours = upcomingTours.filter(tour => 
            new Date(tour.date) > now && 
            tour.status !== 'cancelled'
          ).slice(0, 3);
          
          return {
            ...band,
            upcomingTours: currentTours
          };
        })
      );
      
      // Get web results if requested
      let webResults: EnhancedSearchResult[] = [];
      if (shouldIncludeWeb) {
        try {
          webResults = await googleSearchService.searchMetalBands(query, 8);
        } catch (error) {
          console.error('Google search failed:', error);
          // Continue without web results
        }
      }
      
      res.json({
        query,
        databaseResults: bandsWithTours,
        webResults,
        totalDatabaseResults: bandsWithTours.length,
        totalWebResults: webResults.length
      });
    } catch (error) {
      console.error("Error in enhanced band search:", error);
      res.status(500).json({ message: "Failed to search bands" });
    }
  });

  // Bands routes
  app.get("/api/bands", async (req, res) => {
    try {
      const { search } = req.query;
      let bands;
      
      if (search && typeof search === 'string') {
        bands = await storage.searchBands(search);
      } else {
        bands = await storage.getBands();
      }
      
      // Get upcoming tours for each band
      const bandsWithTours = await Promise.all(
        bands.map(async (band) => {
          const upcomingTours = await storage.getToursByBand(band.id);
          const now = new Date();
          const currentTours = upcomingTours.filter(tour => 
            new Date(tour.date) > now && 
            tour.status !== 'cancelled'
          ).slice(0, 3); // Get max 3 upcoming tours
          
          return {
            ...band,
            upcomingTours: currentTours
          };
        })
      );
      
      res.json(bandsWithTours);
    } catch (error) {
      console.error('Error fetching bands with tours:', error);
      res.status(500).json({ message: "Failed to fetch bands" });
    }
  });

  app.get("/api/bands/:id", async (req, res) => {
    try {
      const band = await storage.getBand(req.params.id);
      if (!band) {
        return res.status(404).json({ message: "Band not found" });
      }
      res.json(band);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch band" });
    }
  });

  app.post("/api/bands", async (req, res) => {
    try {
      const parsed = insertBandSchema.parse(req.body);
      const band = await storage.createBand(parsed);
      res.status(201).json(band);
    } catch (error) {
      res.status(400).json({ message: "Invalid band data" });
    }
  });

  // Band submission routes
  app.post("/api/bands/submit", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const parsed = insertBandSchema.parse(req.body);
      const band = await storage.createBandSubmission({
        ...parsed,
        ownerId: userId,
      });
      res.status(201).json(band);
    } catch (error) {
      res.status(400).json({ message: "Invalid band data" });
    }
  });

  app.get("/api/my-bands", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const bands = await storage.getBandsByOwner(userId);
      res.json(bands);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your bands" });
    }
  });

  app.delete("/api/bands/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const bandId = req.params.id;
      
      // Check if user owns this band
      const band = await storage.getBand(bandId);
      if (!band || band.ownerId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this band" });
      }
      
      await storage.deleteBand(bandId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete band" });
    }
  });

  // Reviews routes
  app.get("/api/reviews", async (req, res) => {
    try {
      const { bandId } = req.query;
      let reviews;
      
      if (bandId && typeof bandId === 'string') {
        reviews = await storage.getReviewsByBand(bandId);
      } else {
        reviews = await storage.getReviews();
      }
      
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const parsed = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(parsed);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  app.post("/api/reviews/:id/like", async (req, res) => {
    try {
      const review = await storage.likeReview(req.params.id);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: "Failed to like review" });
    }
  });

  // Photos routes
  app.get("/api/photos", async (req, res) => {
    try {
      const { bandId, category } = req.query;
      let photos;
      
      if (bandId && typeof bandId === 'string') {
        photos = await storage.getPhotosByBand(bandId);
      } else if (category && typeof category === 'string') {
        photos = await storage.getPhotosByCategory(category);
      } else {
        photos = await storage.getPhotos();
      }
      
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  app.post("/api/photos", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // In a real app, you'd upload to cloud storage and get a URL
      const imageUrl = `/uploads/${req.file.filename}`;
      
      const photoData = {
        ...req.body,
        imageUrl,
      };
      
      const parsed = insertPhotoSchema.parse(photoData);
      const photo = await storage.createPhoto(parsed);
      res.status(201).json(photo);
    } catch (error) {
      res.status(400).json({ message: "Invalid photo data" });
    }
  });

  // Tours routes
  app.get("/api/tours", async (req, res) => {
    try {
      const { bandId, upcoming } = req.query;
      let tours;
      
      if (bandId && typeof bandId === 'string') {
        tours = await storage.getToursByBand(bandId);
      } else if (upcoming === 'true') {
        tours = await storage.getUpcomingTours();
      } else {
        tours = await storage.getTours();
      }
      
      res.json(tours);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tours" });
    }
  });

  app.post("/api/tours", async (req, res) => {
    try {
      const parsed = insertTourSchema.parse(req.body);
      const tour = await storage.createTour(parsed);
      res.status(201).json(tour);
    } catch (error) {
      res.status(400).json({ message: "Invalid tour data" });
    }
  });

  // Tour data management routes
  app.post("/api/tours/refresh", async (req, res) => {
    try {
      console.log('Manual tour data refresh requested');
      await tourDataService.refreshTourDatabase();
      const stats = await tourDataService.getTourStats();
      res.json({ 
        message: "Tour database refreshed successfully", 
        stats 
      });
    } catch (error) {
      console.error('Tour refresh error:', error);
      res.status(500).json({ message: "Failed to refresh tour database" });
    }
  });

  app.get("/api/tours/stats", async (req, res) => {
    try {
      const stats = await tourDataService.getTourStats();
      res.json(stats);
    } catch (error) {
      console.error('Tour stats error:', error);
      res.status(500).json({ message: "Failed to get tour statistics" });
    }
  });

  // Get tours with enhanced data including band information
  app.get("/api/tours/enhanced", async (req, res) => {
    try {
      const { upcoming, limit } = req.query;
      let tours;
      
      if (upcoming === 'true') {
        tours = await storage.getUpcomingTours();
      } else {
        tours = await storage.getTours();
      }
      
      // Get band information for each tour
      const toursWithBands = await Promise.all(
        tours.map(async (tour) => {
          const band = await storage.getBand(tour.bandId);
          return {
            ...tour,
            band: band ? {
              id: band.id,
              name: band.name,
              genre: band.genre,
              imageUrl: band.imageUrl
            } : null
          };
        })
      );
      
      // Filter out tours without valid bands and sort by date
      const validTours = toursWithBands
        .filter(tour => tour.band !== null)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Apply limit if specified
      const limitNum = limit ? parseInt(limit as string, 10) : undefined;
      const result = limitNum ? validTours.slice(0, limitNum) : validTours;
      
      res.json(result);
    } catch (error) {
      console.error('Enhanced tours error:', error);
      res.status(500).json({ message: "Failed to fetch enhanced tour data" });
    }
  });

  // Messages routes
  app.get("/api/messages", async (req, res) => {
    try {
      const { category } = req.query;
      let messages;
      
      if (category && typeof category === 'string') {
        messages = await storage.getMessagesByCategory(category);
      } else {
        messages = await storage.getMessages();
      }
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      const messageData = {
        ...req.body,
        authorId: userId,
        authorStagename: user.firstName || user.email || 'Anonymous'
      };
      
      const parsed = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(parsed);
      res.status(201).json(message);
    } catch (error) {
      console.error("Message creation error:", error);
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  app.post("/api/messages/:id/like", async (req, res) => {
    try {
      const message = await storage.likeMessage(req.params.id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to like message" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}
