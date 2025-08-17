import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBandSchema, insertReviewSchema, insertPhotoSchema, insertTourSchema, insertMessageSchema, insertPitMessageSchema, insertPitReplySchema, insertCommentSchema, insertCommentReactionSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./simpleAuth";
import { performGoogleSearch } from "./googleSearch";
import { tourDataService } from "./tourDataService";
import { aiService, type BandRecommendation, type ChatResponse } from "./aiService";
import { EventDiscoveryService } from "./eventDiscoveryService";
import { MultiPlatformEventService } from "./multiPlatformEventService";
import { concertRecommendationService, type ConcertRecommendation, type ConcertRecommendationRequest } from "./concertRecommendationService";
import { ticketmasterService } from "./ticketmasterService";
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
    // Get existing bands and check for duplicates by name
    const existingBands = await storage.getBands();
    const existingBandNames = new Set(existingBands.map(b => b.name.toLowerCase()));
    
    console.log(`Found ${existingBands.length} existing bands in database`);
    
    // Only seed if we have fewer than 5 unique bands
    if (existingBands.length < 5) {
      console.log("Seeding database with initial bands...");
      
      // Create top 10 rock/metal bands if they don't exist
      const bandData = [
        {
          name: "LINKIN PARK",
          genre: "Nu Metal",
          description: "Pioneering nu-metal band with massive Spotify presence (60.4M monthly listeners). Known for their fusion of rock, hip-hop, and electronic elements.",
          imageUrl: null,
          founded: 1996,
          members: ["Mike Shinoda", "Brad Delson", "Dave Farrell", "Joe Hahn", "Rob Bourdon", "Emily Armstrong"],
          albums: ["Hybrid Theory", "Meteora", "Minutes to Midnight", "A Thousand Suns", "Living Things"],
          website: "https://linkinpark.com",
          instagram: "https://instagram.com/linkinpark",
        },
        {
          name: "QUEEN",
          genre: "Rock",
          description: "Legendary British rock band with global appeal (52.8M monthly listeners). Timeless classics that span generations with theatrical performances.",
          imageUrl: null,
          founded: 1970,
          members: ["Freddie Mercury", "Brian May", "Roger Taylor", "John Deacon"],
          albums: ["Queen", "A Night at the Opera", "News of the World", "The Game", "Innuendo"],
          website: "https://queenonline.com",
          instagram: "https://instagram.com/officialqueenmusic",
        },
        {
          name: "AC/DC",
          genre: "Hard Rock",
          description: "Australian hard rock titans with consistent streaming power (37.7M monthly listeners). High-voltage rock and roll since the 1970s.",
          imageUrl: null,
          founded: 1973,
          members: ["Angus Young", "Brian Johnson", "Phil Rudd", "Cliff Williams", "Stevie Young"],
          albums: ["High Voltage", "Highway to Hell", "Back in Black", "For Those About to Rock", "The Razors Edge"],
          website: "https://acdc.com",
          instagram: "https://instagram.com/acdc",
        },
        {
          name: "RED HOT CHILI PEPPERS",
          genre: "Alternative Rock",
          description: "Funk rock pioneers with crossover success (36.7M monthly listeners). Blending rock, funk, and rap with California attitude.",
          imageUrl: null,
          founded: 1982,
          members: ["Anthony Kiedis", "Flea", "Chad Smith", "John Frusciante"],
          albums: ["Blood Sugar Sex Magik", "Californication", "By the Way", "Stadium Arcadium", "Unlimited Love"],
          website: "https://redhotchilipeppers.com",
          instagram: "https://instagram.com/chilipeppers",
        },
        {
          name: "GREEN DAY",
          genre: "Pop Punk",
          description: "Pop-punk legends with mainstream staying power (36.4M monthly listeners). Defined the 90s punk revival and continue to evolve.",
          imageUrl: null,
          founded: 1987,
          members: ["Billie Joe Armstrong", "Mike Dirnt", "Tré Cool"],
          albums: ["Dookie", "Insomniac", "American Idiot", "21st Century Breakdown", "Revolution Radio"],
          website: "https://greenday.com",
          instagram: "https://instagram.com/greenday",
        },
        {
          name: "NIRVANA",
          genre: "Grunge",
          description: "Grunge pioneers with lasting cultural impact (32.9M monthly listeners). Defined alternative rock and the Seattle sound of the 90s.",
          imageUrl: null,
          founded: 1987,
          members: ["Kurt Cobain", "Krist Novoselic", "Dave Grohl"],
          albums: ["Bleach", "Nevermind", "In Utero", "MTV Unplugged in New York"],
          website: "https://nirvana.com",
          instagram: "https://instagram.com/nirvana",
        },
        {
          name: "TWENTY ONE PILOTS",
          genre: "Alternative Rock",
          description: "Modern alternative rock with metal influences (30.9M monthly listeners). Genre-blending duo from Columbus with devoted fanbase.",
          imageUrl: null,
          founded: 2009,
          members: ["Tyler Joseph", "Josh Dun"],
          albums: ["Vessel", "Blurryface", "Trench", "Scaled and Icy", "Clancy"],
          website: "https://twentyonepilots.com",
          instagram: "https://instagram.com/twentyonepilots",
        },
        {
          name: "GUNS N' ROSES",
          genre: "Hard Rock",
          description: "Hard rock icons maintaining streaming relevance (30.4M monthly listeners). Los Angeles rock legends with a rebellious attitude.",
          imageUrl: null,
          founded: 1985,
          members: ["Axl Rose", "Slash", "Duff McKagan", "Dizzy Reed", "Richard Fortus", "Frank Ferrer", "Melissa Reese"],
          albums: ["Appetite for Destruction", "G N' R Lies", "Use Your Illusion I", "Use Your Illusion II", "Chinese Democracy"],
          website: "https://gunsnroses.com",
          instagram: "https://instagram.com/gunsnroses",
        },
        {
          name: "BON JOVI",
          genre: "Arena Rock",
          description: "Arena rock veterans with broad appeal (30.0M monthly listeners). New Jersey rock icons known for anthemic choruses and stadium shows.",
          imageUrl: null,
          founded: 1983,
          members: ["Jon Bon Jovi", "David Bryan", "Tico Torres", "Phil X"],
          albums: ["Bon Jovi", "Slippery When Wet", "New Jersey", "Keep the Faith", "These Days"],
          website: "https://bonjovi.com",
          instagram: "https://instagram.com/bonjovi",
        },
        {
          name: "RADIOHEAD",
          genre: "Alternative Rock",
          description: "Art rock innovators with devoted fanbase (29.7M monthly listeners). Experimental British band pushing the boundaries of rock music.",
          imageUrl: null,
          founded: 1985,
          members: ["Thom Yorke", "Jonny Greenwood", "Colin Greenwood", "Ed O'Brien", "Philip Selway"],
          albums: ["OK Computer", "Kid A", "In Rainbows", "Hail to the Thief", "A Moon Shaped Pool"],
          website: "https://radiohead.com",
          instagram: "https://instagram.com/radiohead",
        }
      ];

      // Only create bands that don't already exist
      for (const band of bandData) {
        if (!existingBandNames.has(band.name.toLowerCase())) {
          await storage.createBand(band);
        }
      }

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
      
      // Add session info for client-side session management
      const sessionInfo = {
        ...user,
        sessionStart: (req.session as any)?.passport?.user?.sessionStart || new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        expiresAt: req.user.expires_at ? new Date(req.user.expires_at * 1000).toISOString() : null,
        rememberMe: !!(req.session?.cookie?.maxAge && req.session.cookie.maxAge > 30 * 24 * 60 * 60 * 1000)
      };
      
      res.json(sessionInfo);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Session management routes
  app.post('/api/auth/refresh-session', isAuthenticated, async (req: any, res) => {
    try {
      // This endpoint just validates the session and refreshes it
      if (req.session) {
        req.session.touch(); // Update session activity
      }
      
      res.json({ 
        message: "Session refreshed", 
        expiresAt: req.user.expires_at ? new Date(req.user.expires_at * 1000).toISOString() : null,
        lastActivity: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error refreshing session:", error);
      res.status(500).json({ message: "Failed to refresh session" });
    }
  });

  app.post('/api/auth/extend-session', isAuthenticated, async (req: any, res) => {
    try {
      const { rememberMe } = req.body;
      
      if (req.session) {
        if (rememberMe) {
          // Extend session to 90 days for remember me
          const extendedTtl = 90 * 24 * 60 * 60 * 1000;
          req.session.cookie.maxAge = extendedTtl;
        } else {
          // Reset to default 30 days
          const defaultTtl = 30 * 24 * 60 * 60 * 1000;
          req.session.cookie.maxAge = defaultTtl;
        }
      }
      
      res.json({ 
        message: rememberMe ? "Remember me enabled" : "Remember me disabled",
        rememberMe: rememberMe
      });
    } catch (error) {
      console.error("Error extending session:", error);
      res.status(500).json({ message: "Failed to extend session" });
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

  // Bands endpoints
  app.get('/api/bands', async (req, res) => {
    try {
      // Explicitly set JSON headers to prevent Vite middleware interference
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      
      const bands = await storage.getBands();
      res.json(bands);
    } catch (error) {
      console.error("Error fetching bands:", error);
      res.status(500).json({ message: "Failed to fetch bands" });
    }
  });

  app.get('/api/bands/:id', async (req, res) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      const { id } = req.params;
      const band = await storage.getBand(id);
      if (!band) {
        return res.status(404).json({ message: "Band not found" });
      }
      res.json(band);
    } catch (error) {
      console.error("Error fetching band:", error);
      res.status(500).json({ message: "Failed to fetch band" });
    }
  });

  app.post('/api/bands', isAuthenticated, async (req: any, res) => {
    try {
      res.setHeader('Content-Type', 'application/json');
      const validatedData = insertBandSchema.parse(req.body);
      const userId = req.user.claims.sub;
      
      const band = await storage.createBandSubmission({ ...validatedData, ownerId: userId });
      res.status(201).json(band);
    } catch (error) {
      console.error("Error creating band:", error);
      res.status(500).json({ message: "Failed to create band" });
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
      const { q: query, section } = req.query;
      
      if (!query || !section) {
        return res.status(400).json({ error: 'Query and section parameters are required' });
      }

      console.log(`Search request: "${query}" in section "${section}"`);
      
      // Perform Google search (will fallback to local if no API keys)
      const googleResults = await performGoogleSearch(query as string, section as string);
      
      res.json({ 
        query: query,
        section: section,
        googleResults: googleResults,
        message: googleResults ? 'Google search results' : 'Using local search fallback',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // The Pit message board routes
  app.get('/api/pit/messages', async (req, res) => {
    try {
      const messages = await storage.getPitMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching pit messages:", error);
      res.status(500).json({ message: "Failed to fetch pit messages" });
    }
  });

  app.post('/api/pit/messages', async (req, res) => {
    try {
      const validatedData = insertPitMessageSchema.parse(req.body);
      const message = await storage.createPitMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating pit message:", error);
      res.status(500).json({ message: "Failed to create pit message" });
    }
  });

  app.get('/api/pit/messages/:messageId/replies', async (req, res) => {
    try {
      const { messageId } = req.params;
      const replies = await storage.getPitReplies(messageId);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching pit replies:", error);
      res.status(500).json({ message: "Failed to fetch pit replies" });
    }
  });

  app.post('/api/pit/messages/:messageId/replies', async (req, res) => {
    try {
      const { messageId } = req.params;
      const validatedData = insertPitReplySchema.parse({ ...req.body, messageId });
      const reply = await storage.createPitReply(validatedData);
      
      // Update reply count
      await storage.incrementPitMessageReplies(messageId);
      
      res.status(201).json(reply);
    } catch (error) {
      console.error("Error creating pit reply:", error);
      res.status(500).json({ message: "Failed to create pit reply" });
    }
  });

  app.post('/api/pit/messages/:messageId/like', async (req, res) => {
    try {
      const { messageId } = req.params;
      await storage.incrementPitMessageLikes(messageId);
      res.json({ message: 'Like added successfully' });
    } catch (error) {
      console.error("Error liking pit message:", error);
      res.status(500).json({ message: "Failed to like pit message" });
    }
  });

  app.post('/api/pit/replies/:replyId/like', async (req, res) => {
    try {
      const { replyId } = req.params;
      await storage.incrementPitReplyLikes(replyId);
      res.json({ message: 'Like added successfully' });
    } catch (error) {
      console.error("Error liking pit reply:", error);
      res.status(500).json({ message: "Failed to like pit reply" });
    }
  });

  // Comment system routes
  app.get('/api/comments/:targetType/:targetId', async (req, res) => {
    try {
      const { targetType, targetId } = req.params;
      const comments = await storage.getComments(targetType, targetId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/comments', async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.put('/api/comments/:commentId', async (req, res) => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const comment = await storage.updateComment(commentId, content);
      res.json(comment);
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({ message: "Failed to update comment" });
    }
  });

  app.delete('/api/comments/:commentId', async (req, res) => {
    try {
      const { commentId } = req.params;
      const { reason } = req.body;
      await storage.deleteComment(commentId, reason || 'Deleted by user');
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  app.post('/api/comments/:commentId/react', async (req, res) => {
    try {
      const { commentId } = req.params;
      const validatedData = insertCommentReactionSchema.parse({ ...req.body, commentId });
      const reaction = await storage.createCommentReaction(validatedData);
      res.status(201).json(reaction);
    } catch (error) {
      console.error("Error creating comment reaction:", error);
      res.status(500).json({ message: "Failed to react to comment" });
    }
  });

  // Event Discovery API endpoints  
  const eventDiscoveryService = new EventDiscoveryService();
  const multiPlatformEventService = new MultiPlatformEventService();

  // Discover events with multi-platform search and AI-powered recommendations
  app.post('/api/events/discover', async (req, res) => {
    try {
      const request = req.body;
      console.log('Event discovery request received:', request);
      
      // Use the new multi-platform service instead of the old Google-based one
      const events = await multiPlatformEventService.discoverEvents(request);
      console.log(`Returning ${events.length} events to client`);
      
      res.json(events);
    } catch (error) {
      console.error('Error discovering events:', error);
      res.status(500).json({ error: 'Failed to discover events' });
    }
  });

  // Get personalized event recommendations using multi-platform search
  app.post('/api/events/personalized', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const request = req.body;
      
      // Add user preferences to request (you can expand this with actual user data from DB)
      const enhancedRequest = {
        ...request,
        favoriteArtists: request.favoriteArtists || ['Metallica', 'Iron Maiden', 'Black Sabbath'],
        preferredGenres: request.preferredGenres || ['metal', 'rock', 'hardcore']
      };
      
      const events = await multiPlatformEventService.discoverEvents(enhancedRequest);
      res.json(events);
    } catch (error) {
      console.error('Error getting personalized events:', error);
      res.status(500).json({ error: 'Failed to get personalized recommendations' });
    }
  });

  // Get detailed insights for a specific event
  app.get('/api/events/:eventId/insights', async (req, res) => {
    try {
      const { eventId } = req.params;
      
      // This is a simplified implementation - in a real app you'd store events in DB
      // For demo purposes, we'll generate insights based on a mock event
      const mockEvent = {
        id: eventId,
        title: 'Concert Event',
        artist: 'Rock Band',
        venue: 'Music Venue',
        date: '2025-09-15',
        time: '20:00',
        location: {
          address: '123 Music St',
          city: 'Rock City',
          state: 'CA',
        },
        price: { min: 50, max: 150, currency: 'USD' },
        ticketUrl: 'https://example.com/tickets',
        description: 'Amazing rock concert',
        genre: 'Rock',
        relevanceScore: 0.9,
        aiRecommendationReason: 'Great match for metal fans'
      };
      
      const insights = await multiPlatformEventService.generateEventInsights(mockEvent);
      res.json(insights);
    } catch (error) {
      console.error('Error getting event insights:', error);
      res.status(500).json({ error: 'Failed to get event insights' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
