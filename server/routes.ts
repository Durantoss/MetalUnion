import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBandSchema, insertReviewSchema, insertPhotoSchema, insertTourSchema } from "@shared/schema";
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
      
      res.json(bands);
    } catch (error) {
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

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}
