import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBandSchema, insertReviewSchema, insertPhotoSchema, insertTourSchema, insertMessageSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
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
    let bandsCreated = false;
    
    if (existingBands.length === 0) {
      console.log("Seeding database with initial bands...");
      bandsCreated = true;
    }

    // Create sample bands
    const metallica = await storage.createBand({
      name: "METALLICA",
      genre: "Thrash Metal",
      description: "Legendary thrash metal pioneers from San Francisco, known for their aggressive sound and powerful live performances.",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      founded: 1981,
      members: ["James Hetfield", "Lars Ulrich", "Kirk Hammett", "Robert Trujillo"],
      albums: ["Kill 'Em All", "Ride the Lightning", "Master of Puppets", "...And Justice for All", "Metallica (Black Album)"],
      website: "https://metallica.com",
      instagram: "https://instagram.com/metallica",
    });

    const ironMaiden = await storage.createBand({
      name: "IRON MAIDEN",
      genre: "Heavy Metal",
      description: "British heavy metal legends with epic storytelling and theatrical live shows that have defined metal for decades.",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      founded: 1975,
      members: ["Bruce Dickinson", "Steve Harris", "Dave Murray", "Adrian Smith", "Janick Gers", "Nicko McBrain"],
      albums: ["Iron Maiden", "The Number of the Beast", "Piece of Mind", "Powerslave", "Somewhere in Time"],
      website: "https://ironmaiden.com",
      instagram: "https://instagram.com/ironmaiden",
    });

    const blackSabbath = await storage.createBand({
      name: "BLACK SABBATH",
      genre: "Doom Metal",
      description: "The godfathers of heavy metal, creating the blueprint for dark, heavy music that influenced generations.",
      imageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      founded: 1968,
      members: ["Ozzy Osbourne", "Tony Iommi", "Geezer Butler", "Bill Ward"],
      albums: ["Black Sabbath", "Paranoid", "Master of Reality", "Vol. 4", "Sabbath Bloody Sabbath"],
      website: "https://blacksabbath.com",
      instagram: "https://instagram.com/blacksabbath",
    });

    // Check if we need to seed tours
    const existingTours = await storage.getTours();
    if (existingTours.length === 0) {
      console.log("Seeding database with initial tours...");
      
      // Get the band IDs (either from just created bands or existing ones)
      const allBands = bandsCreated ? [metallica, ironMaiden, blackSabbath] : await storage.getBands();
      const metallicaBand = allBands.find(b => b.name === "METALLICA");
      const ironMaidenBand = allBands.find(b => b.name === "IRON MAIDEN");  
      const blackSabbathBand = allBands.find(b => b.name === "BLACK SABBATH");

      // Create sample tours
      if (metallicaBand) {
        await storage.createTour({
      bandId: metallicaBand.id,
      tourName: "M72 World Tour",
      venue: "MetLife Stadium",
      city: "East Rutherford",
      country: "USA",
      date: new Date("2025-06-15T19:00:00Z"),
      ticketmasterUrl: "https://www.ticketmaster.com/metallica-tickets/artist/806069",
      seatgeekUrl: "https://seatgeek.com/metallica-tickets",
      price: "$89.50+",
      status: "upcoming"
    });

      }

      if (ironMaidenBand) {
        await storage.createTour({
          bandId: ironMaidenBand.id,
      tourName: "The Future Past Tour",
      venue: "Madison Square Garden",
      city: "New York",
      country: "USA", 
      date: new Date("2025-07-22T20:00:00Z"),
      ticketmasterUrl: "https://www.ticketmaster.com/iron-maiden-tickets/artist/735437",
      seatgeekUrl: "https://seatgeek.com/iron-maiden-tickets",
      price: "$65.00+",
      status: "upcoming"
    });

      }

      if (blackSabbathBand) {
        await storage.createTour({
          bandId: blackSabbathBand.id,
      tourName: "Legacy Tour",
      venue: "Hollywood Bowl",
      city: "Los Angeles", 
      country: "USA",
      date: new Date("2025-08-10T21:00:00Z"),
      ticketmasterUrl: "https://www.ticketmaster.com/black-sabbath-tickets/artist/735520",
      price: "$125.00+",
      status: "upcoming"
        });
      }
    }

    if (bandsCreated || existingTours.length === 0) {
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
