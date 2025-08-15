import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBandSchema, insertReviewSchema, insertPhotoSchema, insertTourSchema } from "@shared/schema";
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

export async function registerRoutes(app: Express): Promise<Server> {
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
